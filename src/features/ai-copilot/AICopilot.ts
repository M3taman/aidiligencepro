import { DueDiligenceReportType, CompanyData } from '../due-diligence/types';
import axios from 'axios';
import { Logger } from '@/utils/logger';
import { withTimeout } from '@/utils/withTimeout';
import { db } from '@/firebase';
import { doc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Create a dedicated logger for AI Copilot
const logger = new Logger('AICopilot');

// Custom error types
export class AICopilotError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AICopilotError';
  }
}

export class VoiceProcessingError extends AICopilotError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'VoiceProcessingError';
  }
}

export class AlertGenerationError extends AICopilotError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'AlertGenerationError';
  }
}

// Define interfaces for voice processing
export interface VoiceProcessingResult {
  originalInput: string;
  transcribedText: string;
  confidence: number;
  language: string;
  detectedIntent?: string;
  entities?: Record<string, string>;
  researchQuery: string;
  timestamp: string;
  duration?: number;
  processingTimeMs?: number;
}

export interface VoiceProcessingOptions {
  language?: string;
  model?: 'standard' | 'enhanced';
  timeout?: number;
  includeEntities?: boolean;
  includeSentiment?: boolean;
  format?: 'wav' | 'mp3' | 'ogg' | 'text';
  cache?: boolean;
}

// Define interfaces for smart alerts
export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertType {
  FINANCIAL = 'financial',
  MARKET = 'market',
  REGULATORY = 'regulatory',
  OPERATIONAL = 'operational',
  ESG = 'esg',
  COMPETITIVE = 'competitive',
  COMPLIANCE = 'compliance'
}

export interface Alert {
  id: string;
  companyName: string;
  ticker?: string;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  details?: string;
  timestamp: string;
  source: string;
  actionRequired?: boolean;
  actionDescription?: string;
  dismissed?: boolean;
  readBy?: string[];
  metadata?: Record<string, any>;
}

export interface AlertGenerationOptions {
  includeTypes?: AlertType[];
  minPriority?: AlertPriority;
  maxAlerts?: number;
  includeDetails?: boolean;
  includeActionItems?: boolean;
  notificationChannels?: ('email' | 'sms' | 'app' | 'slack')[];
  cache?: boolean;
}

/**
 * Converts voice input to a structured research query
 * @param voiceInput Audio input as base64 string or transcribed text
 * @param options Processing options
 * @returns Processed voice input with research query
 */
export async function voiceToResearch(
  voiceInput: string,
  options: VoiceProcessingOptions = {}
): Promise<VoiceProcessingResult> {
  const {
    language = 'en-US',
    model = 'enhanced',
    timeout = 30000,
    includeEntities = true,
    includeSentiment = false,
    format = 'text',
    cache = true
  } = options;

  logger.info(`Processing voice input (format: ${format}, model: ${model})`);
  const startTime = Date.now();

  try {
    // Check cache first if enabled
    if (cache) {
      try {
        const cacheQuery = query(
          collection(db, 'voiceProcessingCache'),
          where('originalInput', '==', voiceInput),
          where('language', '==', language),
          where('model', '==', model),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        const cacheSnapshot = await getDocs(cacheQuery);
        if (!cacheSnapshot.empty) {
          const cachedResult = cacheSnapshot.docs[0].data() as VoiceProcessingResult;
          logger.info('Using cached voice processing result');
          return cachedResult;
        }
      } catch (cacheError) {
        logger.warn('Failed to retrieve from cache', cacheError);
        // Continue with processing, don't fail due to cache issues
      }
    }

    // Step 1: Determine if input is already text or needs transcription
    let transcribedText: string;
    let confidence = 1.0;

    if (format === 'text') {
      // Input is already text, no transcription needed
      transcribedText = voiceInput;
      logger.debug('Input is already text, skipping transcription');
    } else {
      // Input is audio, perform transcription
      logger.debug('Transcribing audio input');
      try {
        const transcriptionResult = await withTimeout(
          transcribeAudio(voiceInput, format, language, model),
          timeout,
          new VoiceProcessingError('Audio transcription timed out')
        );
        transcribedText = transcriptionResult.text;
        confidence = transcriptionResult.confidence;
        logger.debug(`Audio transcribed with ${confidence.toFixed(2)} confidence`);
      } catch (error) {
        logger.error('Audio transcription failed', error);
        // Fallback to treating input as text with warning
        transcribedText = format === 'text' ? voiceInput : 
          `[Transcription failed. Treating as: ${voiceInput.substring(0, 100)}...]`;
        confidence = 0.3;
      }
    }

    // Step 2: Natural language understanding to extract entities and intent
    let entities: Record<string, string> = {};
    let detectedIntent: string | undefined;

    if (includeEntities) {
      try {
        logger.debug('Extracting entities and intent');
        const nluResult = await withTimeout(
          performNLU(transcribedText, language),
          timeout,
          new VoiceProcessingError('NLU processing timed out')
        );
        entities = nluResult.entities;
        detectedIntent = nluResult.intent;
      } catch (error) {
        logger.error('NLU processing failed', error);
        // Continue without entity extraction
      }
    }

    // Step 3: Generate research query based on transcribed text and entities
    let researchQuery: string;
    try {
      logger.debug('Generating research query');
      researchQuery = await withTimeout(
        generateResearchQuery(transcribedText, entities, detectedIntent),
        timeout,
        new VoiceProcessingError('Research query generation timed out')
      );
    } catch (error) {
      logger.error('Research query generation failed', error);
      // Fallback to a simple formatting of the transcribed text
      researchQuery = `Research: ${transcribedText}`;
    }

    // Prepare final result
    const processingTimeMs = Date.now() - startTime;
    const result: VoiceProcessingResult = {
      originalInput: voiceInput,
      transcribedText,
      confidence,
      language,
      detectedIntent,
      entities: Object.keys(entities).length > 0 ? entities : undefined,
      researchQuery,
      timestamp: new Date().toISOString(),
      processingTimeMs
    };

    // Cache result if enabled
    if (cache) {
      try {
        const cacheRef = doc(db, 'voiceProcessingCache', `voice_${Date.now()}`);
        await setDoc(cacheRef, {
          ...result,
          model,
          format
        });
        logger.debug('Cached voice processing result');
      } catch (cacheError) {
        logger.warn('Failed to cache result', cacheError);
        // Non-critical error, continue
      }
    }

    logger.info(`Voice processing completed in ${processingTimeMs}ms`);
    return result;
  } catch (error) {
    const errorMessage = 'Voice to research conversion failed';
    logger.error(errorMessage, error);
    
    if (error instanceof AICopilotError) {
      throw error;
    } else {
      throw new VoiceProcessingError(
        errorMessage,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

/**
 * Generates smart alerts based on the analysis results
 * @param analysis Due diligence report data
 * @param options Alert generation options
 * @returns List of generated alerts
 */
export async function generateSmartAlerts(
  analysis: DueDiligenceReportType,
  options: AlertGenerationOptions = {}
): Promise<Alert[]> {
  const {
    includeTypes = Object.values(AlertType),
    minPriority = AlertPriority.LOW,
    maxAlerts = 10,
    includeDetails = true,
    includeActionItems = true,
    notificationChannels = ['app'],
    cache = true
  } = options;

  logger.info(`Generating smart alerts for ${analysis.companyName}`);
  
  try {
    // Check cache first if enabled
    if (cache) {
      try {
        const cacheQuery = query(
          collection(db, 'alertsCache'),
          where('companyName', '==', analysis.companyName),
          where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()), // Last 24 hours
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        const cacheSnapshot = await getDocs(cacheQuery);
        if (!cacheSnapshot.empty) {
          const cachedAlerts = cacheSnapshot.docs[0].data().alerts as Alert[];
          logger.info(`Using ${cachedAlerts.length} cached alerts`);
          return cachedAlerts;
        }
      } catch (cacheError) {
        logger.warn('Failed to retrieve alerts from cache', cacheError);
        // Continue with processing
      }
    }

    // Array to store all generated alerts
    const alerts: Alert[] = [];

    // 1. Generate financial alerts
    if (includeTypes.includes(AlertType.FINANCIAL)) {
      const financialAlerts = await generateFinancialAlerts(analysis);
      alerts.push(...financialAlerts);
    }

    // 2. Generate market alerts
    if (includeTypes.includes(AlertType.MARKET)) {
      const marketAlerts = await generateMarketAlerts(analysis);
      alerts.push(...marketAlerts);
    }

    // 3. Generate regulatory alerts
    if (includeTypes.includes(AlertType.REGULATORY)) {
      const regulatoryAlerts = await generateRegulatoryAlerts(analysis);
      alerts.push(...regulatoryAlerts);
    }

    // 4. Generate operational alerts
    if (includeTypes.includes(AlertType.OPERATIONAL)) {
      const operationalAlerts = await generateOperationalAlerts(analysis);
      alerts.push(...operationalAlerts);
    }

    // 5. Generate ESG alerts
    if (includeTypes.includes(AlertType.ESG)) {
      const esgAlerts = await generateESGAlerts(analysis);
      alerts.push(...esgAlerts);
    }

    // 6. Generate competitive alerts
    if (includeTypes.includes(AlertType.COMPETITIVE)) {
      const competitiveAlerts = await generateCompetitiveAlerts(analysis);
      alerts.push(...competitiveAlerts);
    }

    // 7. Generate compliance alerts
    if (includeTypes.includes(AlertType.COMPLIANCE)) {
      const complianceAlerts = await generateComplianceAlerts(analysis);
      alerts.push(...complianceAlerts);
    }

    // Filter alerts based on priority
    const priorityValues = {
      [AlertPriority.LOW]: 1,
      [AlertPriority.MEDIUM]: 2,
      [AlertPriority.HIGH]: 3,
      [AlertPriority.CRITICAL]: 4
    };

    const filteredAlerts = alerts.filter(alert => 
      priorityValues[alert.priority] >= priorityValues[minPriority]
    );

    // Sort alerts by priority (highest first) and limit to maxAlerts
    const sortedAlerts = filteredAlerts
      .sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority])
      .slice(0, maxAlerts);
    
    // Enrich alerts with details if needed
    if (!includeDetails) {
      sortedAlerts.forEach(alert => {
        delete alert.details;
      });
    }

    // Add action items if needed
    if (!includeActionItems) {
      sortedAlerts.forEach(alert => {
        delete alert.actionRequired;
        delete alert.actionDescription;
      });
    }

    // Send notifications if channels are specified
    if (notificationChannels.length > 0) {
      try {
        await sendAlertNotifications(sortedAlerts, notificationChannels);
      } catch (notificationError) {
        logger.error('Failed to send alert notifications', notificationError);
        // Continue without failing the entire process
      }
    }

    // Cache results if enabled
    if (cache) {
      try {
        const cacheRef = doc(db, 'alertsCache', `alerts_${analysis.companyName}_${Date.now()}`);
        await setDoc(cacheRef, {
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          timestamp: new Date().toISOString(),
          alerts: sortedAlerts
        });
        logger.debug(`Cached ${sortedAlerts.length} alerts`);
      } catch (cacheError) {
        logger.warn('Failed to cache alerts', cacheError);
        // Non-critical error, continue
      }
    }

    logger.info(`Generated ${sortedAlerts.length} alerts for ${analysis.companyName}`);
    return sortedAlerts;
  } catch (error) {
    const errorMessage = `Alert generation failed for ${analysis.companyName}`;
    logger.error(errorMessage, error);
    
    if (error instanceof AICopilotError) {
      throw error;
    } else {
      throw new AlertGenerationError(
        errorMessage,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

/**
 * Helper interfaces for audio transcription
 */
interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
  duration?: number;
}

/**
 * Transcribe audio data to text using speech recognition
 * @param audioData Audio data as base64 string
 * @param format Audio format (wav, mp3, ogg)
 * @param language Target language
 * @param model Model to use for transcription
 * @returns Transcription result with confidence score
 */
async function transcribeAudio(
  audioData: string,
  format: 'wav' | 'mp3' | 'ogg',
  language: string = 'en-US',
  model: 'standard' | 'enhanced' = 'enhanced'
): Promise<TranscriptionResult> {
  logger.debug(`Transcribing ${format} audio using ${model} model for ${language}`);
  
  try {
    // Try using the OpenAI Whisper API for transcription
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          file: audioData,
          model: model === 'enhanced' ? 'whisper-1' : 'whisper-1',
          language: language.split('-')[0], // OpenAI uses ISO 639-1 language codes
          response_format: 'json'
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      if (response.data && response.data.text) {
        return {
          text: response.data.text,
          confidence: 0.9, // Whisper doesn't provide confidence scores, using a high default
          language
        };
      }
    } catch (whisperError) {
      logger.warn('OpenAI Whisper transcription failed, falling back to Google Speech API', whisperError);
      // Fall back to Google Speech API
    }

    // Fallback to Google Speech-to-Text
    const response = await axios.post(
      'https://speech.googleapis.com/v1/speech:recognize',
      {
        config: {
          encoding: format === 'wav' ? 'LINEAR16' : format === 'mp3' ? 'MP3' : 'OGG_OPUS',
          sampleRateHertz: 16000,
          languageCode: language,
          model: model === 'enhanced' ? 'command_and_search' : 'default',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: false
        },
        audio: {
          content: audioData
        }
      },
      {
        params: {
          key: process.env.GOOGLE_SPEECH_API_KEY
        }
      }
    );

    if (response.data && 
        response.data.results && 
        response.data.results.length > 0 && 
        response.data.results[0].alternatives && 
        response.data.results[0].alternatives.length > 0) {
      
      const result = response.data.results[0].alternatives[0];
      return {
        text: result.transcript,
        confidence: result.confidence || 0.7,
        language
      };
    }
    
    // If we get here, both APIs failed to provide a useful result
    throw new VoiceProcessingError('No transcription result from any API');
  } catch (error) {
    logger.error('Audio transcription failed', error);
    
    // Throw a typed error with the original cause
    throw new VoiceProcessingError(
      'Failed to transcribe audio',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Interface for NLU result
 */
interface NLUResult {
  entities: Record<string, string>;
  intent?: string;
  sentiment?: {
    score: number;
    magnitude: number;
  };
  keywords?: string[];
}

/**
 * Perform Natural Language Understanding on text to extract entities and intent
 * @param text Text to analyze
 * @param language Language of the text
 * @returns NLU result with entities and intent
 */
async function performNLU(
  text: string,
  language: string = 'en-US'
): Promise<NLUResult> {
  logger.debug(`Performing NLU on ${text.length} characters of text`);
  
  try {
    // Try using the OpenAI API for entity extraction
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4', // Using GPT-4 for better accuracy
          messages: [
            {
              role: 'system',
              content: `Extract entities and determine intent from the following text. 
                        Return a JSON object with 'entities' as a key-value object and 'intent' as a string.
                        Entities to look for: company names, ticker symbols, financial metrics, time periods, industries, products, and people.
                        Possible intents: company_research, financial_analysis, market_comparison, risk_assessment, compliance_check, regulatory_update.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      if (response.data && 
          response.data.choices && 
          response.data.choices.length > 0) {
        
        const content = response.data.choices[0].message.content;
        const parsedContent = JSON.parse(content);
        
        return {
          entities: parsedContent.entities || {},
          intent: parsedContent.intent || undefined,
          keywords: parsedContent.keywords || []
        };
      }
    } catch (openaiError) {
      logger.warn('OpenAI NLU failed, falling back to basic extraction', openaiError);
      // Fall back to basic entity extraction
    }

    // Basic fallback NLU using keyword matching
    const entities: Record<string, string> = {};
    let intent: string | undefined;
    
    // Simple ticker symbol detection: 1-5 uppercase letters
    const tickerRegex = /\b[A-Z]{1,5}\b/g;
    const tickers = text.match(tickerRegex);
    if (tickers && tickers.length > 0) {
      entities['ticker'] = tickers[0];
    }
    
    // Simple company name detection: look for "Inc", "Corp", "LLC", etc.
    const companyRegex = /([A-Z][a-z]+ )+(Inc|Corp|LLC|Ltd|Limited|Corporation|Company)/g;
    const companies = text.match(companyRegex);
    if (companies && companies.length > 0) {
      entities['company'] = companies[0];
    }
    
    // Simple metric detection
    const metricKeywords = ['revenue', 'profit', 'margin', 'growth', 'eps', 'pe ratio', 'dividend'];
    metricKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        entities['metric'] = keyword;
      }
    });
    
    // Simple intent detection
    const intentMapping: Record<string, string[]> = {
      'company_research': ['research', 'about', 'information', 'tell me about'],
      'financial_analysis': ['financial', 'metrics', 'performance', 'earnings'],
      'market_comparison': ['comparison', 'compare', 'versus', 'competitors'],
      'risk_assessment': ['risk', 'risks', 'exposure', 'vulnerability'],
      'compliance_check': ['compliance', 'regulation', 'rule', 'requirement'],
      'regulatory_update': ['regulation', 'regulatory', 'sec', 'filing']
    };
    
    for (const [intentKey, keywords] of Object.entries(intentMapping)) {
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword)) {
          intent = intentKey;
          break;
        }
      }
      if (intent) break;
    }
    
    return { 
      entities, 
      intent,
      keywords: Object.values(entities)
    };
  } catch (error) {
    logger.error('NLU processing failed', error);
    
    // Return empty results rather than failing completely
    return { 
      entities: {}, 
      intent: undefined 
    };
  }
}

/**
 * Generate a structured research query from natural language input
 * @param text Transcribed text
 * @param entities Extracted entities
 * @param intent Detected intent
 * @returns Formatted research query for AI processing
 */
async function generateResearchQuery(
  text: string,
  entities: Record<string, string> = {},
  intent?: string
): Promise<string> {
  logger.debug(`Generating research query from text: "${text.substring(0, 50)}..."`);
  
  try {
    // Try to use OpenAI for better query generation
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Convert the following natural language request into a structured research query for financial analysis. 
                        Identify the main focus (company, sector, financial metric), analysis type, and time frame.
                        Format the response as a structured, concise query suitable for a financial data API or search engine.
                        The query should be comprehensive yet focused on the core request.`
            },
            {
              role: 'user',
              content: `TEXT: ${text}
                        ENTITIES: ${JSON.stringify(entities)}
                        INTENT: ${intent || 'unknown'}`
            }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      if (response.data && 
          response.data.choices && 
          response.data.choices.length > 0) {
        
        const content = response.data.choices[0].message.content.trim();
        return content;
      }
    } catch (openaiError) {
      logger.warn('OpenAI query generation failed, falling back to basic formatting', openaiError);
    }
    
    // Fallback to basic query generation
    let query = 'Research';
    
    // Add company or ticker if available
    if (entities['company'] || entities['ticker']) {
      query += ` on ${entities['company'] || entities['ticker']}`;
    }
    
    // Add intent information
    if (intent) {
      const intentMapping: Record<string, string> = {
        'company_research': 'company overview and fundamentals',
        'financial_analysis': 'financial metrics and performance',
        'market_comparison': 'competitor analysis and market position',
        'risk_assessment': 'risk factors and vulnerabilities',
        'compliance_check': 'regulatory compliance status',
        'regulatory_update': 'recent regulatory filings and changes'
      };
      
      query += ` focusing on ${intentMapping[intent] || intent}`;
    } else {
      // Use the original text if no intent was detected
      query += `: ${text}`;
    }
    
    // Add metrics if available
    if (entities['metric']) {
      query += ` with specific focus on ${entities['metric']}`;
    }
    
    return query;
  } catch (error) {
    logger.error('Research query generation failed', error);
    // Return a basic formatted query as fallback
    return `Research query: ${text}`;
  }
}

/**
 * Sends notifications for generated alerts through specified channels
 * @param alerts List of alerts to send notifications for
 * @param channels Notification channels to use
 */
async function sendAlertNotifications(
  alerts: Alert[],
  channels: ('email' | 'sms' | 'app' | 'slack')[]
): Promise<void> {
  logger.debug(`Sending ${alerts.length} alerts through ${channels.join(', ')}`);
  
  try {
    const priorityChannelMap = {
      [AlertPriority.LOW]: ['app'],
      [AlertPriority.MEDIUM]: ['app', 'email'],
      [AlertPriority.HIGH]: ['app', 'email', 'slack'],
      [AlertPriority.CRITICAL]: ['app', 'email', 'slack', 'sms']
    };
    
    // Group alerts by channel for more efficient sending
    const channelAlerts: Record<string, Alert[]> = {};
    
    for (const alert of alerts) {
      // For each alert, determine which channels should be used based on priority
      const effectiveChannels = channels.filter(channel => 
        priorityChannelMap[alert.priority].includes(channel)
      );
      
      // Group by channel
      for (const channel of effectiveChannels) {
        if (!channelAlerts[channel]) {
          channelAlerts[channel] = [];
        }
        channelAlerts[channel].push(alert);
      }
    }
    
    // Process each channel in parallel
    await Promise.all(Object.entries(channelAlerts).map(async ([channel, alertList]) => {
      switch (channel) {
        case 'email':
          await sendEmailAlerts(alertList);
          break;
        case 'sms':
          await sendSMSAlerts(alertList);
          break;
        case 'app':
          await sendAppNotifications(alertList);
          break;
        case 'slack':
          await sendSlackNotifications(alertList);
          break;
      }
    }));
    
    logger.info('Alert notifications sent successfully');
  } catch (error) {
    logger.error('Failed to send alert notifications', error);
    throw new AlertGenerationError(
      'Failed to send alert notifications',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

// Helper functions for notification delivery
async function sendEmailAlerts(alerts: Alert[]): Promise<void> {
  // Implementation would integrate with an email service like SendGrid or Mailchimp
  logger.debug(`Sending ${alerts.length} email alerts`);
  // Placeholder implementation
  return Promise.resolve();
}

async function sendSMSAlerts(alerts: Alert[]): Promise<void> {
  // Implementation would integrate with an SMS service like Twilio
  logger.debug(`Sending ${alerts.length} SMS alerts`);
  // Placeholder implementation
  return Promise.resolve();
}

async function sendAppNotifications(alerts: Alert[]): Promise<void> {
  // Implementation would store notifications in the database for in-app retrieval
  logger.debug(`Creating ${alerts.length} in-app notifications`);
  
  try {
    const batch = db.batch();
    
    for (const alert of alerts) {
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        ...alert,
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    
    await batch.commit();
  } catch (error) {
    logger.error('Failed to create in-app notifications', error);
    throw error;
  }
}

async function sendSlackNotifications(alerts: Alert[]): Promise<void> {
  // Implementation would integrate with Slack API
  logger.debug(`Sending ${alerts.length} Slack notifications`);
  // Placeholder implementation
  return Promise.resolve();
}

// Alert generation functions for different alert types
/**
 * Generate financial alerts based on financial metrics and thresholds
 * @param analysis Due diligence report
 * @returns List of financial alerts
 */
async function generateFinancialAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating financial alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract financial data from the analysis
    const financialData = typeof analysis.financialAnalysis === 'string'
      ? { overview: analysis.financialAnalysis }
      : analysis.financialAnalysis;
    
    // Extract companyData
    const companyData = analysis.companyData || {};
    
    // Check for significant EPS changes
    if (companyData.EPS !== undefined && companyData.QuarterlyEarningsGrowthYOY !== undefined) {
      const epsGrowth = companyData.QuarterlyEarningsGrowthYOY;
      
      if (epsGrowth <= -0.2) {
        // Significant EPS decline (20% or more)
        alerts.push({
          id: `fin_eps_decline_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.FINANCIAL,
          priority: AlertPriority.HIGH,
          message: `Significant EPS decline of ${(epsGrowth * 100).toFixed(2)}% YoY`,
          details: `The company's EPS has declined by ${(epsGrowth * 100).toFixed(2)}% compared to the same quarter last year. Current EPS: ${companyData.EPS}`,
          timestamp: new Date().toISOString(),
          source: 'financial_analysis',
          actionRequired: true,
          actionDescription: 'Review financial statements and earnings call transcripts for context'
        });
      } else if (epsGrowth >= 0.3) {
        // Significant EPS growth (30% or more)
        alerts.push({
          id: `fin_eps_growth_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.FINANCIAL,
          priority: AlertPriority.MEDIUM,
          message: `Strong EPS growth of ${(epsGrowth * 100).toFixed(2)}% YoY`,
          details: `The company's EPS has grown by ${(epsGrowth * 100).toFixed(2)}% compared to the same quarter last year. Current EPS: ${companyData.EPS}`,
          timestamp: new Date().toISOString(),
          source: 'financial_analysis',
          actionRequired: false
        });
      }
    }
    
    // Check for concerning profit margin trends
    if (companyData.ProfitMargin !== undefined) {
      const profitMargin = companyData.ProfitMargin;
      
      if (profitMargin < 0) {
        // Negative profit margin
        alerts.push({
          id: `fin_negative_margin_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.FINANCIAL,
          priority: AlertPriority.HIGH,
          message: `Negative profit margin: ${(profitMargin * 100).toFixed(2)}%`,
          details: `The company is operating at a loss with a profit margin of ${(profitMargin * 100).toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          source: 'financial_analysis',
          actionRequired: true,
          actionDescription: 'Assess cash runway and path to profitability'
        });
      } else if (profitMargin < 0.05) {
        // Low profit margin (less than 5%)
        alerts.push({
          id: `fin_low_margin_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.FINANCIAL,
          priority: AlertPriority.MEDIUM,
          message: `Low profit margin: ${(profitMargin * 100).toFixed(2)}%`,
          details: `The company has a concerning low profit margin of ${(profitMargin * 100).toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          source: 'financial_analysis',
          actionRequired: false
        });
      }
    }
    
    // Check for high P/E ratio
    if (companyData.PERatio !== undefined) {
      const pe = companyData.PERatio;
      const sectorAvgPE = 22; // This would ideally come from sector data
      
      if (pe > sectorAvgPE * 2) {
        // P/E more than double the sector average
        alerts.push({
          id: `fin_high_pe_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.FINANCIAL,
          priority: AlertPriority.MEDIUM,
          message: `High P/E ratio of ${pe.toFixed(2)}`,
          details: `The company's P/E ratio of ${pe.toFixed(2)} is significantly above the sector average of ${sectorAvgPE}`,
          timestamp: new Date().toISOString(),
          source: 'financial_analysis',
          actionRequired: false
        });
      }
    }
    
    // Add more financial checks as needed...
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate financial alerts', error);
    // Return empty array rather than failing
    return [];
  }
}

/**
 * Generate market alerts based on market analysis and trends
 * @param analysis Due diligence report
 * @returns List of market alerts
 */
async function generateMarketAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating market alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract market data from the analysis
    const marketData = typeof analysis.marketAnalysis === 'string'
      ? { overview: analysis.marketAnalysis }
      : analysis.marketAnalysis;
    
    // Extract company data
    const companyData = analysis.companyData || {};
    
    // 1. Market Share Analysis
    if (marketData.marketShare || marketData.position) {
      const marketPosition = marketData.position || marketData.marketShare;
      
      if (typeof marketPosition === 'string' && 
          (marketPosition.toLowerCase().includes('declining') || 
           marketPosition.toLowerCase().includes('decreasing') || 
           marketPosition.toLowerCase().includes('losing'))) {
        
        alerts.push({
          id: `market_share_decline_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.MARKET,
          priority: AlertPriority.HIGH,
          message: `Declining market share detected`,
          details: `The company appears to be losing market share: "${marketPosition}"`,
          timestamp: new Date().toISOString(),
          source: 'market_analysis',
          actionRequired: true,
          actionDescription: 'Review competitive positioning and strategic initiatives'
        });
      }
      
      if (typeof marketPosition === 'string' && 
          (marketPosition.toLowerCase().includes('growing') || 
           marketPosition.toLowerCase().includes('increasing') || 
           marketPosition.toLowerCase().includes('gaining'))) {
        
        alerts.push({
          id: `market_share_growth_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.MARKET,
          priority: AlertPriority.LOW,
          message: `Growing market share detected`,
          details: `The company appears to be gaining market share: "${marketPosition}"`,
          timestamp: new Date().toISOString(),
          source: 'market_analysis',
          actionRequired: false
        });
      }
    }
    
    // 2. Competitor Movement Detection
    if (marketData.competitors) {
      // Check for major competitor movements
      const competitors = Array.isArray(marketData.competitors) 
        ? marketData.competitors 
        : marketData.competitors.split(',').map(c => c.trim());
      
      const competitorStrengthened = competitors.some(comp => {
        if (typeof comp === 'string') {
          return false; // Can't determine strength from just the name
        } else {
          return comp.strengths && 
                 typeof comp.strengths === 'string' && 
                 (comp.strengths.toLowerCase().includes('strengthening') || 
                  comp.strengths.toLowerCase().includes('growing') ||
                  comp.strengths.toLowerCase().includes('expanding'));
        }
      });
      
      if (competitorStrengthened) {
        alerts.push({
          id: `competitor_strengthening_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.MARKET,
          priority: AlertPriority.MEDIUM,
          message: `Competitors gaining strength in the market`,
          details: `One or more competitors appear to be strengthening their market position`,
          timestamp: new Date().toISOString(),
          source: 'market_analysis',
          actionRequired: true,
          actionDescription: 'Analyze competitor strategies and consider competitive response'
        });
      }
    }
    
    // 3. Industry Trend Analysis
    if (marketData.industryOverview || marketData.overview) {
      const industryOverview = marketData.industryOverview || marketData.overview;
      
      // Check for negative industry trends
      if (typeof industryOverview === 'string') {
        const negativeKeywords = [
          'downturn', 'decline', 'shrinking', 'contracting', 'recession',
          'slowdown', 'challenging', 'difficult', 'headwinds'
        ];
        
        const foundNegativeKeywords = negativeKeywords.filter(keyword => 
          industryOverview.toLowerCase().includes(keyword)
        );
        
        if (foundNegativeKeywords.length > 0) {
          alerts.push({
            id: `industry_headwinds_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.MARKET,
            priority: AlertPriority.MEDIUM,
            message: `Industry facing headwinds`,
            details: `The industry appears to be experiencing challenges: ${foundNegativeKeywords.join(', ')}`,
            timestamp: new Date().toISOString(),
            source: 'market_analysis',
            actionRequired: false
          });
        }
        
        // Check for positive industry trends
        const positiveKeywords = [
          'growth', 'expanding', 'booming', 'surge', 'uptrend',
          'accelerating', 'favorable', 'positive', 'opportunity'
        ];
        
        const foundPositiveKeywords = positiveKeywords.filter(keyword => 
          industryOverview.toLowerCase().includes(keyword)
        );
        
        if (foundPositiveKeywords.length > 0) {
          alerts.push({
            id: `industry_tailwinds_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.MARKET,
            priority: AlertPriority.LOW,
            message: `Industry experiencing tailwinds`,
            details: `The industry appears to be experiencing positive trends: ${foundPositiveKeywords.join(', ')}`,
            timestamp: new Date().toISOString(),
            source: 'market_analysis',
            actionRequired: false
          });
        }
      }
    }
    
    // Check SWOT analysis for market-related threats
    if (marketData.swot && marketData.swot.threats) {
      const threats = Array.isArray(marketData.swot.threats) 
        ? marketData.swot.threats 
        : [marketData.swot.threats];
      
      if (threats.length > 0) {
        alerts.push({
          id: `market_threats_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.MARKET,
          priority: AlertPriority.MEDIUM,
          message: `Significant market threats identified`,
          details: `SWOT analysis reveals market threats: ${threats.join('; ')}`,
          timestamp: new Date().toISOString(),
          source: 'market_analysis',
          actionRequired: false
        });
      }
    }
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate market alerts', error);
    // Return empty array rather than failing
    return [];
  }
}

/**
 * Generate regulatory alerts based on regulatory filings and compliance
 * @param analysis Due diligence report
 * @returns List of regulatory alerts
 */
async function generateRegulatoryAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating regulatory alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract risk assessment data from the analysis
    const riskData = typeof analysis.riskAssessment === 'string'
      ? { overview: analysis.riskAssessment }
      : analysis.riskAssessment;
      
    // Extract recent filings data
    const recentDevelopments = analysis.recentDevelopments || {};
    const filings = recentDevelopments.filings || [];
    
    // 1. SEC Filing Deadline Checks
    const today = new Date();
    const tenQDeadline = new Date(today);
    tenQDeadline.setDate(today.getDate() + 45); // 10-Q typically due 45 days after quarter end
    
    const tenKDeadline = new Date(today);
    tenKDeadline.setDate(today.getDate() + 90); // 10-K typically due 90 days after fiscal year end
    
    // Check for upcoming filing deadlines
    const upcomingFiling = filings.find(filing => {
      if (!filing.date || !filing.type) return false;
      
      const filingDate = new Date(filing.date);
      return (
        (filing.type.includes('10-Q') && filingDate <= tenQDeadline) ||
        (filing.type.includes('10-K') && filingDate <= tenKDeadline)
      );
    });
    
    if (upcomingFiling) {
      alerts.push({
        id: `sec_filing_deadline_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.REGULATORY,
        priority: AlertPriority.MEDIUM,
        message: `Upcoming SEC filing deadline`,
        details: `${upcomingFiling.type} filing due on or around ${upcomingFiling.date}`,
        timestamp: new Date().toISOString(),
        source: 'regulatory_analysis',
        actionRequired: true,
        actionDescription: 'Monitor for filing completion and review contents upon release'
      });
    }
    
    // 2. Compliance Violation Detection
    if (riskData.regulatory || riskData.regulatoryRisks) {
      const regulatoryRisks = riskData.regulatory || riskData.regulatoryRisks;
      
      if (typeof regulatoryRisks === 'string') {
        const violationKeywords = [
          'violation', 'non-compliance', 'penalty', 'fine', 'sanction',
          'enforcement', 'investigation', 'inquiry', 'subpoena', 'lawsuit'
        ];
        
        const foundViolationKeywords = violationKeywords.filter(keyword => 
          regulatoryRisks.toLowerCase().includes(keyword)
        );
        
        if (foundViolationKeywords.length > 0) {
          alerts.push({
            id: `compliance_violation_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.REGULATORY,
            priority: AlertPriority.HIGH,
            message: `Potential compliance violations detected`,
            details: `The company may be facing regulatory issues: ${foundViolationKeywords.join(', ')}`,
            timestamp: new Date().toISOString(),
            source: 'regulatory_analysis',
            actionRequired: true,
            actionDescription: 'Investigate compliance issues and potential financial impact'
          });
        }
      } else if (Array.isArray(riskData.riskFactors?.regulatory)) {
        const regulatoryRiskFactors = riskData.riskFactors.regulatory;
        
        const complianceIssues = regulatoryRiskFactors.filter(risk => 
          typeof risk === 'string' && 
          (risk.toLowerCase().includes('violation') || 
           risk.toLowerCase().includes('compliance') ||
           risk.toLowerCase().includes('penalty'))
        );
        
        if (complianceIssues.length > 0) {
          alerts.push({
            id: `regulatory_risk_factors_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.REGULATORY,
            priority: AlertPriority.HIGH,
            message: `Regulatory risk factors identified`,
            details: `Identified regulatory risk factors: ${complianceIssues.join('; ')}`,
            timestamp: new Date().toISOString(),
            source: 'regulatory_analysis',
            actionRequired: true,
            actionDescription: 'Review regulatory risk factors and compliance measures'
          });
        }
      }
    }
    
    // 3. Regulatory Change Monitoring
    const recentNews = recentDevelopments.news || [];
    const regulatoryNewsKeywords = [
      'regulation', 'regulatory', 'compliance', 'SEC', 'Federal Reserve',
      'FDA', 'EPA', 'FTC', 'Department of Justice', 'rule', 'legislation'
    ];
    
    const regulatoryNews = recentNews.filter(news => {
      if (!news.title && !news.description) return false;
      
      const titleMatches = news.title && 
        regulatoryNewsKeywords.some(keyword => 
          news.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
      const descriptionMatches = news.description && 
        regulatoryNewsKeywords.some(keyword => 
          news.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
      return titleMatches || descriptionMatches;
    });
    
    if (regulatoryNews.length > 0) {
      alerts.push({
        id: `regulatory_news_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.REGULATORY,
        priority: AlertPriority.MEDIUM,
        message: `Recent regulatory news detected`,
        details: `${regulatoryNews.length} recent news items related to regulatory matters:\n${
          regulatoryNews.map(news => `- ${news.title}`).join('\n')
        }`,
        timestamp: new Date().toISOString(),
        source: 'regulatory_analysis',
        actionRequired: true,
        actionDescription: 'Review regulatory news for potential impact on operations'
      });
    }
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate regulatory alerts', error);
    // Return empty array rather than failing
    return [];
  }
}

/**
 * Generate operational alerts based on operational metrics and efficiency
 * @param analysis Due diligence report
 * @returns List of operational alerts
 */
async function generateOperationalAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating operational alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract risk assessment data from the analysis
    const riskData = typeof analysis.riskAssessment === 'string'
      ? { overview: analysis.riskAssessment }
      : analysis.riskAssessment;
    
    // Extract company data
    const companyData = analysis.companyData || {};
    
    // 1. Supply Chain Monitoring
    if (riskData.operational || riskData.operationalRisks) {
      const operationalRisks = riskData.operational || riskData.operationalRisks;
      
      if (typeof operationalRisks === 'string') {
        const supplyChainKeywords = [
          'supply chain', 'supplier', 'inventory', 'logistics', 'distribution',
          'manufacturing', 'production', 'disruption', 'shortage', 'delay'
        ];
        
        const foundSupplyChainIssues = supplyChainKeywords.filter(keyword => 
          operationalRisks.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (foundSupplyChainIssues.length > 0) {
          alerts.push({
            id: `supply_chain_issues_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.OPERATIONAL,
            priority: AlertPriority.HIGH,
            message: `Potential supply chain issues detected`,
            details: `Supply chain related concerns identified: ${foundSupplyChainIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            source: 'operational_analysis',
            actionRequired: true,
            actionDescription: 'Evaluate supply chain resilience and contingency plans'
          });
        }
      } else if (Array.isArray(riskData.riskFactors?.operational)) {
        const operationalRiskFactors = riskData.riskFactors.operational;
        
        const supplyChainIssues = operationalRiskFactors.filter(risk => 
          typeof risk === 'string' && 
          (risk.toLowerCase().includes('supply') || 
           risk.toLowerCase().includes('inventory') ||
           risk.toLowerCase().includes('manufacturing'))
        );
        
        if (supplyChainIssues.length > 0) {
          alerts.push({
            id: `supply_chain_risk_factors_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.OPERATIONAL,
            priority: AlertPriority.MEDIUM,
            message: `Supply chain risk factors identified`,
            details: `Identified supply chain risk factors: ${supplyChainIssues.join('; ')}`,
            timestamp: new Date().toISOString(),
            source: 'operational_analysis',
            actionRequired: false
          });
        }
      }
    }
    
    // 2. Operational Efficiency Metrics
    // Check for employee efficiency metrics
    if (companyData.employees !== undefined && companyData.marketCap !== undefined) {
      const revenuePerEmployee = companyData.marketCap / companyData.employees;
      const industryAverageRevenuePerEmployee = 500000; // Example threshold - would be industry-specific
      
      if (revenuePerEmployee < industryAverageRevenuePerEmployee * 0.7) {
        // Revenue per employee significantly below industry average
        alerts.push({
          id: `low_employee_efficiency_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.OPERATIONAL,
          priority: AlertPriority.MEDIUM,
          message: `Below-average operational efficiency`,
          details: `Revenue per employee ($${Math.round(revenuePerEmployee).toLocaleString()}) is significantly below industry average ($${industryAverageRevenuePerEmployee.toLocaleString()})`,
          timestamp: new Date().toISOString(),
          source: 'operational_analysis',
          actionRequired: false
        });
      }
    }
    
    // 3. Resource Utilization Checks
    // This would typically be more granular operational data
    // For this implementation, we'll check for any mentions in the risk assessment
    
    if (riskData.overview) {
      const resourceUtilizationKeywords = [
        'utilization', 'capacity', 'efficiency', 'waste', 'overhead',
        'productivity', 'underutilized', 'excess capacity', 'idle'
      ];
      
      const foundResourceIssues = resourceUtilizationKeywords.filter(keyword => 
        typeof riskData.overview === 'string' && 
        riskData.overview.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundResourceIssues.length > 0) {
        alerts.push({
          id: `resource_utilization_issues_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.OPERATIONAL,
          priority: AlertPriority.LOW,
          message: `Resource utilization concerns identified`,
          details: `Potential resource utilization issues: ${foundResourceIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          source: 'operational_analysis',
          actionRequired: false
        });
      }
    }
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate operational alerts', error);
    // Return empty array rather than failing
    return [];
  }
}

/**
 * Generate ESG (Environmental, Social, Governance) alerts
 * @param analysis Due diligence report
 * @returns List of ESG alerts
 */
async function generateESGAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating ESG alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract risk assessment data from the analysis
    const riskData = typeof analysis.riskAssessment === 'string'
      ? { overview: analysis.riskAssessment }
      : analysis.riskAssessment;
    
    // Extract recent news for ESG issues
    const recentDevelopments = analysis.recentDevelopments || {};
    const recentNews = recentDevelopments.news || [];
    
    // 1. Environmental Impact Monitoring
    const environmentalKeywords = [
      'emissions', 'carbon', 'climate', 'pollution', 'environmental',
      'sustainability', 'renewable', 'waste', 'recycling', 'energy efficiency'
    ];
    
    // Check risk assessment for environmental issues
    if (riskData.overview && typeof riskData.overview === 'string') {
      const foundEnvironmentalIssues = environmentalKeywords.filter(keyword => 
        riskData.overview.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundEnvironmentalIssues.length > 0) {
        alerts.push({
          id: `environmental_issues_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.ESG,
          priority: AlertPriority.MEDIUM,
          message: `Environmental concerns identified`,
          details: `Environmental issues in risk assessment: ${foundEnvironmentalIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          source: 'esg_analysis',
          actionRequired: false
        });
      }
    }
    
    // Check recent news for environmental issues
    const environmentalNews = recentNews.filter(news => {
      if (!news.title && !news.description) return false;
      
      const titleMatches = news.title && 
        environmentalKeywords.some(keyword => 
          news.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
      const descriptionMatches = news.description && 
        environmentalKeywords.some(keyword => 
          news.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
      return titleMatches || descriptionMatches;
    });
    
    if (environmentalNews.length > 0) {
      alerts.push({
        id: `environmental_news_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.ESG,
        priority: AlertPriority.MEDIUM,
        message: `Recent environmental news detected`,
        details: `${environmentalNews.length} recent news items related to environmental matters:\n${
          environmentalNews.map(news => `- ${news.title}`).join('\n')
        }`,
        timestamp: new Date().toISOString(),
        source: 'esg_analysis',
        actionRequired: true,
        actionDescription: 'Review environmental news for potential impact on reputation and compliance'
      });
    }
    
    // 2. Social Responsibility Metrics
    const socialKeywords = [
      'diversity', 'inclusion', 'workforce', 'gender', 'equality',
      'community', 'labor', 'human rights', 'social impact', 'working conditions',
      'fair trade', 'employee', 'discrimination', 'harassment'
    ];
    
    // Check risk assessment for social issues
    if (riskData.overview && typeof riskData.overview === 'string') {
      const foundSocialIssues = socialKeywords.filter(keyword => 
        riskData.overview.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundSocialIssues.length > 0) {
        alerts.push({
          id: `social_issues_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.ESG,
          priority: AlertPriority.MEDIUM,
          message: `Social responsibility concerns identified`,
          details: `Social issues in risk assessment: ${foundSocialIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          source: 'esg_analysis',
          actionRequired: false
        });
      }
    }
    
    // Check recent news for social issues
    const socialNews = recentNews.filter(news => {
      if (!news.title && !news.description) return false;
      
      const titleMatches = news.title && 
        socialKeywords.some(keyword => 
          news.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
      const descriptionMatches = news.description && 
        socialKeywords.some(keyword => 
          news.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
      return titleMatches || descriptionMatches;
    });
    
    if (socialNews.length > 0) {
      alerts.push({
        id: `social_news_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.ESG,
        priority: AlertPriority.MEDIUM,
        message: `Recent social responsibility news detected`,
        details: `${socialNews.length} recent news items related to social matters:\n${
          socialNews.map(news => `- ${news.title}`).join('\n')
        }`,
        timestamp: new Date().toISOString(),
        source: 'esg_analysis',
        actionRequired: true,
        actionDescription: 'Review social news for potential impact on reputation and compliance'
      });
    }
    
    // 3. Governance Issue Detection
    const governanceKeywords = [
      'governance', 'board', 'executive', 'compensation', 'shareholder',
      'voting', 'disclosure', 'transparency', 'ethics', 'corruption',
      'bribery', 'insider', 'conflict of interest', 'whistleblower', 'audit committee'
    ];
    
    // Check risk assessment for governance issues
    if (riskData.overview && typeof riskData.overview === 'string') {
      const foundGovernanceIssues = governanceKeywords.filter(keyword => 
        riskData.overview.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundGovernanceIssues.length > 0) {
        alerts.push({
          id: `governance_issues_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.ESG,
          priority: AlertPriority.HIGH,
          message: `Governance concerns identified`,
          details: `Governance issues in risk assessment: ${foundGovernanceIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          source: 'esg_analysis',
          actionRequired: true,
          actionDescription: 'Review governance practices and potential compliance implications'
        });
      }
    }
    
    // Check recent news for governance issues
    const governanceNews = recentNews.filter(news => {
      if (!news.title && !news.description) return false;
      
      const titleMatches = news.title && 
        governanceKeywords.some(keyword => 
          news.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
      const descriptionMatches = news.description && 
        governanceKeywords.some(keyword => 
          news.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
      return titleMatches || descriptionMatches;
    });
    
    if (governanceNews.length > 0) {
      alerts.push({
        id: `governance_news_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.ESG,
        priority: AlertPriority.HIGH,
        message: `Recent governance news detected`,
        details: `${governanceNews.length} recent news items related to governance matters:\n${
          governanceNews.map(news => `- ${news.title}`).join('\n')
        }`,
        timestamp: new Date().toISOString(),
        source: 'esg_analysis',
        actionRequired: true,
        actionDescription: 'Review governance news for potential impact on company oversight and compliance'
      });
    }
    
    // 4. Overall ESG Risk Scoring
    // Calculate a basic ESG risk score based on findings
    const environmentalIssuesCount = environmentalNews.length + 
      (riskData.overview && typeof riskData.overview === 'string' ? 
        environmentalKeywords.filter(k => riskData.overview.toLowerCase().includes(k.toLowerCase())).length : 0);
    
    const socialIssuesCount = socialNews.length + 
      (riskData.overview && typeof riskData.overview === 'string' ? 
        socialKeywords.filter(k => riskData.overview.toLowerCase().includes(k.toLowerCase())).length : 0);
    
    const governanceIssuesCount = governanceNews.length + 
      (riskData.overview && typeof riskData.overview === 'string' ? 
        governanceKeywords.filter(k => riskData.overview.toLowerCase().includes(k.toLowerCase())).length : 0);
    
    const totalEsgIssues = environmentalIssuesCount + socialIssuesCount + governanceIssuesCount;
    
    if (totalEsgIssues > 5) {
      alerts.push({
        id: `esg_risk_score_high_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.ESG,
        priority: AlertPriority.HIGH,
        message: `High overall ESG risk detected`,
        details: `Significant ESG issues found: Environmental (${environmentalIssuesCount}), Social (${socialIssuesCount}), Governance (${governanceIssuesCount})`,
        timestamp: new Date().toISOString(),
        source: 'esg_analysis',
        actionRequired: true,
        actionDescription: 'Conduct comprehensive ESG risk assessment and develop mitigation strategies'
      });
    } else if (totalEsgIssues > 2) {
      alerts.push({
        id: `esg_risk_score_medium_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.ESG,
        priority: AlertPriority.MEDIUM,
        message: `Moderate overall ESG risk detected`,
        details: `Notable ESG issues found: Environmental (${environmentalIssuesCount}), Social (${socialIssuesCount}), Governance (${governanceIssuesCount})`,
        timestamp: new Date().toISOString(),
        source: 'esg_analysis',
        actionRequired: false
      });
    }
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate ESG alerts', error);
    // Return empty array rather than failing
    return [];
  }
}

/**
 * Generate competitive alerts based on market position and competitor actions
 * @param analysis Due diligence report
 * @returns List of competitive alerts
 */
async function generateCompetitiveAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating competitive alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract market data from the analysis
    const marketData = typeof analysis.marketAnalysis === 'string'
      ? { overview: analysis.marketAnalysis }
      : analysis.marketAnalysis;
    
    // Extract recent developments
    const recentDevelopments = analysis.recentDevelopments || {};
    const recentNews = recentDevelopments.news || [];
    
    // 1. Market Position Analysis
    if (marketData.competitiveAdvantages || marketData.marketPosition) {
      const positionInfo = marketData.competitiveAdvantages || marketData.marketPosition;
      
      // Check for weakening competitive position
      if (typeof positionInfo === 'string' && 
          (positionInfo.toLowerCase().includes('eroding') || 
           positionInfo.toLowerCase().includes('weakening') || 
           positionInfo.toLowerCase().includes('losing') ||
           positionInfo.toLowerCase().includes('threat'))) {
        
        alerts.push({
          id: `weakening_position_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.COMPETITIVE,
          priority: AlertPriority.HIGH,
          message: `Weakening competitive position detected`,
          details: `The company's competitive position may be deteriorating: "${positionInfo.substring(0, 150)}..."`,
          timestamp: new Date().toISOString(),
          source: 'competitive_analysis',
          actionRequired: true,
          actionDescription: 'Review competitive positioning and strategic differentiators'
        });
      }
      
      // Check for strengthening competitive position
      if (typeof positionInfo === 'string' && 
          (positionInfo.toLowerCase().includes('strong') || 
           positionInfo.toLowerCase().includes('improving') || 
           positionInfo.toLowerCase().includes('advantage') ||
           positionInfo.toLowerCase().includes('moat'))) {
        
        alerts.push({
          id: `strong_position_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.COMPETITIVE,
          priority: AlertPriority.LOW,
          message: `Strong competitive position detected`,
          details: `The company appears to have strong competitive advantages: "${positionInfo.substring(0, 150)}..."`,
          timestamp: new Date().toISOString(),
          source: 'competitive_analysis',
          actionRequired: false
        });
      }
    }
    
    // 2. Competitor Action Monitoring
    
    // Look for news about key competitors
    if (marketData.competitors) {
      const competitors = Array.isArray(marketData.competitors) 
        ? marketData.competitors 
        : typeof marketData.competitors === 'string'
          ? marketData.competitors.split(',').map(c => c.trim())
          : [];
      
      // Convert competitor objects to names if needed
      const competitorNames = competitors.map(comp => {
        if (typeof comp === 'string') return comp;
        return comp.name || '';
      }).filter(name => name.length > 0);
      
      // Look for news about these competitors
      if (competitorNames.length > 0) {
        const competitorNews = recentNews.filter(news => {
          if (!news.title && !news.description) return false;
          
          return competitorNames.some(compName => 
            (news.title && news.title.toLowerCase().includes(compName.toLowerCase())) ||
            (news.description && news.description.toLowerCase().includes(compName.toLowerCase()))
          );
        });
        
        if (competitorNews.length > 0) {
          alerts.push({
            id: `competitor_news_${Date.now()}`,
            companyName: analysis.companyName,
            ticker: analysis.ticker,
            type: AlertType.COMPETITIVE,
            priority: AlertPriority.MEDIUM,
            message: `Recent competitor activity detected`,
            details: `${competitorNews.length} recent news items about competitors:\n${
              competitorNews.map(news => `- ${news.title}`).join('\n')
            }`,
            timestamp: new Date().toISOString(),
            source: 'competitive_analysis',
            actionRequired: true,
            actionDescription: 'Review competitor activities and assess potential impact on market position'
          });
        }
      }
    }
    
    // 3. Strategic Risk Assessment
    // Check SWOT analysis for competitive threats
    if (marketData.swot && marketData.swot.threats) {
      const threats = Array.isArray(marketData.swot.threats) 
        ? marketData.swot.threats 
        : [marketData.swot.threats];
      
      // Filter for competitive threats
      const competitiveThreats = threats.filter(threat => 
        typeof threat === 'string' && (
          threat.toLowerCase().includes('competitor') ||
          threat.toLowerCase().includes('competition') ||
          threat.toLowerCase().includes('market share') ||
          threat.toLowerCase().includes('disrupt') ||
          threat.toLowerCase().includes('substitute') ||
          threat.toLowerCase().includes('new entrant') ||
          threat.toLowerCase().includes('price pressure')
        )
      );
      
      if (competitiveThreats.length > 0) {
        alerts.push({
          id: `competitive_threats_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.COMPETITIVE,
          priority: AlertPriority.HIGH,
          message: `Strategic competitive threats identified`,
          details: `SWOT analysis reveals competitive threats: ${competitiveThreats.join('; ')}`,
          timestamp: new Date().toISOString(),
          source: 'competitive_analysis',
          actionRequired: true,
          actionDescription: 'Develop strategic responses to competitive threats'
        });
      }
    }
    
    // 4. Market Share Movement Detection
    // Check for specific market share data and trends
    if (marketData.marketShare || marketData.position) {
      const marketShareInfo = marketData.marketShare || marketData.position;
      
      if (typeof marketShareInfo === 'string') {
        // Parse and extract any percentages mentioned
        const percentageRegex = /(\d+(\.\d+)?)%/g;
        const percentages = [];
        let match;
        
        while ((match = percentageRegex.exec(marketShareInfo)) !== null) {
          percentages.push(parseFloat(match[1]));
        }
        
        // Check if there are comparisons like "down from X%" or "up from X%"
        const downTrendMatch = marketShareInfo.match(/down\s+from\s+(\d+(\.\d+)?)%/i);
        const upTrendMatch = marketShareInfo.match(/up\s+from\s+(\d+(\.\d+)?)%/i);
        
        if (downTrendMatch && percentages.length > 0) {
          const previousShare = parseFloat(downTrendMatch[1]);
          const currentShare = percentages[0];
          const decrease = previousShare - currentShare;
          
          if (decrease > 2) { // Significant market share loss (more than 2 percentage points)
            alerts.push({
              id: `market_share_loss_${Date.now()}`,
              companyName: analysis.companyName,
              ticker: analysis.ticker,
              type: AlertType.COMPETITIVE,
              priority: AlertPriority.HIGH,
              message: `Significant market share loss detected`,
              details: `Market share decreased by ${decrease.toFixed(1)} percentage points (from ${previousShare}% to ${currentShare}%)`,
              timestamp: new Date().toISOString(),
              source: 'competitive_analysis',
              actionRequired: true,
              actionDescription: 'Analyze causes of market share loss and develop recovery strategy'
            });
          }
        } else if (upTrendMatch && percentages.length > 0) {
          const previousShare = parseFloat(upTrendMatch[1]);
          const currentShare = percentages[0];
          const increase = currentShare - previousShare;
          
          if (increase > 2) { // Significant market share gain (more than 2 percentage points)
            alerts.push({
              id: `market_share_gain_${Date.now()}`,
              companyName: analysis.companyName,
              ticker: analysis.ticker,
              type: AlertType.COMPETITIVE,
              priority: AlertPriority.LOW,
              message: `Significant market share gain detected`,
              details: `Market share increased by ${increase.toFixed(1)} percentage points (from ${previousShare}% to ${currentShare}%)`,
              timestamp: new Date().toISOString(),
              source: 'competitive_analysis',
              actionRequired: false
            });
          }
        }
      }
    }
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate competitive alerts', error);
    // Return empty array rather than failing
    return [];
  }
}

/**
 * Generate compliance alerts based on regulatory requirements and internal policies
 * @param analysis Due diligence report
 * @returns List of compliance alerts
 */
async function generateComplianceAlerts(analysis: DueDiligenceReportType): Promise<Alert[]> {
  logger.debug(`Generating compliance alerts for ${analysis.companyName}`);
  const alerts: Alert[] = [];
  
  try {
    // Extract risk assessment data from the analysis
    const riskData = typeof analysis.riskAssessment === 'string'
      ? { overview: analysis.riskAssessment }
      : analysis.riskAssessment;
    
    // Extract recent developments
    const recentDevelopments = analysis.recentDevelopments || {};
    const recentNews = recentDevelopments.news || [];
    const filings = recentDevelopments.filings || [];
    
    // 1. Regulatory Compliance Checks
    // Identify industry-specific and general regulatory requirements
    const sector = analysis.companyData?.Sector || analysis.companyData?.sector;
    
    // Industry-specific compliance keywords
    let industrySpecificKeywords: string[] = [];
    
    if (sector) {
      switch(sector.toLowerCase()) {
        case 'healthcare':
        case 'health care':
          industrySpecificKeywords = [
            'HIPAA', 'FDA', 'clinical trials', 'patient data', 'medical device',
            'healthcare regulation', 'Medicare', 'Medicaid', 'Affordable Care Act'
          ];
          break;
        case 'financial':
        case 'financial services':
        case 'finance':
        case 'banking':
          industrySpecificKeywords = [
            'Dodd-Frank', 'Basel', 'FINRA', 'Federal Reserve', 'FDIC', 'OCC',
            'KYC', 'AML', 'anti-money laundering', 'capital requirements'
          ];
          break;
        case 'energy':
        case 'utilities':
          industrySpecificKeywords = [
            'EPA', 'FERC', 'emissions', 'clean air', 'clean water', 'nuclear',
            'renewable portfolio', 'carbon', 'fracking'
          ];
          break;
        case 'technology':
        case 'information technology':
          industrySpecificKeywords = [
            'GDPR', 'CCPA', 'privacy', 'data protection', 'cybersecurity',
            'FTC', 'antitrust', 'intellectual property'
          ];
          break;
        default:
          // General keywords for any industry
          industrySpecificKeywords = [];
      }
    }
    
    // General compliance keywords
    const generalComplianceKeywords = [
      'SEC', 'compliance', 'regulation', 'fine', 'penalty', 'lawsuit',
      'investigation', 'audit', 'disclosure', 'governance', 'ethics',
      'whistleblower', 'Sarbanes-Oxley', 'SOX', 'internal controls'
    ];
    
    // Combine keywords
    const complianceKeywords = [...generalComplianceKeywords, ...industrySpecificKeywords];
    
    // Check risk assessment for compliance issues
    if (riskData.overview && typeof riskData.overview === 'string') {
      const foundComplianceIssues = complianceKeywords.filter(keyword => 
        riskData.overview.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundComplianceIssues.length > 0) {
        alerts.push({
          id: `compliance_issues_${Date.now()}`,
          companyName: analysis.companyName,
          ticker: analysis.ticker,
          type: AlertType.COMPLIANCE,
          priority: AlertPriority.HIGH,
          message: `Potential compliance issues identified`,
          details: `Compliance keywords found in risk assessment: ${foundComplianceIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          source: 'compliance_analysis',
          actionRequired: true,
          actionDescription: 'Review compliance issues and ensure appropriate controls are in place'
        });
      }
    }
    
    // 2. Policy Violation Detection
    // Check recent news for potential policy violations
    const policyViolationKeywords = [
      'policy violation', 'misconduct', 'ethics', 'code of conduct',
      'inappropriate', 'harassment', 'discrimination', 'insider trading',
      'conflict of interest', 'bribery', 'corruption', 'fraud', 'embezzlement'
    ];
    
    const policyNews = recentNews.filter(news => {
      if (!news.title && !news.description) return false;
      
      const titleMatches = news.title && 
        policyViolationKeywords.some(keyword => 
          news.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
      const descriptionMatches = news.description && 
        policyViolationKeywords.some(keyword => 
          news.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
      return titleMatches || descriptionMatches;
    });
    
    if (policyNews.length > 0) {
      alerts.push({
        id: `policy_violation_news_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.COMPLIANCE,
        priority: AlertPriority.HIGH,
        message: `Potential policy violations reported`,
        details: `${policyNews.length} recent news items related to policy violations:\n${
          policyNews.map(news => `- ${news.title}`).join('\n')
        }`,
        timestamp: new Date().toISOString(),
        source: 'compliance_analysis',
        actionRequired: true,
        actionDescription: 'Investigate potential policy violations and take appropriate corrective actions'
      });
    }
    
    // 3. Audit Requirement Monitoring
    // Check for SEC filings that mention audit or internal controls
    const auditFilings = filings.filter(filing => 
      filing.description && (
        filing.description.toLowerCase().includes('audit') ||
        filing.description.toLowerCase().includes('internal control') ||
        filing.description.toLowerCase().includes('accounting') ||
        filing.description.toLowerCase().includes('financial reporting')
      )
    );
    
    if (auditFilings.length > 0) {
      alerts.push({
        id: `audit_filings_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.COMPLIANCE,
        priority: AlertPriority.MEDIUM,
        message: `Audit or internal control filings detected`,
        details: `${auditFilings.length} recent filings related to audit or internal controls:\n${
          auditFilings.map(filing => `- ${filing.type || ''}: ${filing.description || ''} (${filing.date})`).join('\n')
        }`,
        timestamp: new Date().toISOString(),
        source: 'compliance_analysis',
        actionRequired: true,
        actionDescription: 'Review audit findings and ensure all identified issues have been addressed'
      });
    }
    
    // 4. Audit Requirements and Monitoring
    // Check if company is approaching a quarterly or annual reporting deadline
    const today = new Date();
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    // Check if any fiscal quarter or year end is approaching within 3 months
    const fiscalQuarterEndDate = new Date(today);
    const currentMonth = today.getMonth();
    const possibleQuarterEndMonths = [2, 5, 8, 11]; // March, June, September, December (0-based)
    
    // Find the next quarter end
    const nextQuarterEndMonth = possibleQuarterEndMonths.find(month => month >= currentMonth) || possibleQuarterEndMonths[0];
    fiscalQuarterEndDate.setMonth(nextQuarterEndMonth, 0); // Last day of the month
    
    if ((fiscalQuarterEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 30) {
      // Quarter end is within 30 days
      alerts.push({
        id: `quarterly_audit_prep_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.COMPLIANCE,
        priority: AlertPriority.MEDIUM,
        message: `Approaching fiscal quarter end`,
        details: `The company is approaching the end of a fiscal quarter on ${fiscalQuarterEndDate.toISOString().split('T')[0]}. Ensure all quarterly compliance checks are prepared.`,
        timestamp: new Date().toISOString(),
        source: 'compliance_analysis',
        actionRequired: true,
        actionDescription: 'Prepare for quarterly compliance and financial reporting requirements'
      });
    }
    
    // 5. Compliance Risk Assessment
    // Calculate a compliance risk score based on various factors
    let complianceRiskScore = 0;
    
    // Add to risk score based on sector (some sectors have higher regulatory burden)
    if (sector) {
      const highRiskSectors = ['healthcare', 'health care', 'financial', 'banking', 'energy', 'utilities'];
      if (highRiskSectors.includes(sector.toLowerCase())) {
        complianceRiskScore += 2;
      }
    }
    
    // Add to risk score based on compliance issues found
    if (riskData.overview && typeof riskData.overview === 'string') {
      const complianceIssuesCount = complianceKeywords.filter(keyword => 
        riskData.overview.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      
      complianceRiskScore += Math.min(complianceIssuesCount, 3); // Cap at 3 points
    }
    
    // Add to risk score based on policy violation news
    complianceRiskScore += Math.min(policyNews.length, 3); // Cap at 3 points
    
    // Add to risk score based on audit-related filings
    complianceRiskScore += Math.min(auditFilings.length, 2); // Cap at 2 points
    
    // Generate compliance risk alert if score is high enough
    if (complianceRiskScore >= 5) {
      alerts.push({
        id: `high_compliance_risk_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.COMPLIANCE,
        priority: AlertPriority.HIGH,
        message: `High compliance risk detected`,
        details: `The company has a high compliance risk score (${complianceRiskScore}/10) based on sector, identified issues, and recent developments.`,
        timestamp: new Date().toISOString(),
        source: 'compliance_analysis',
        actionRequired: true,
        actionDescription: 'Conduct comprehensive compliance risk assessment and develop mitigation plan'
      });
    } else if (complianceRiskScore >= 3) {
      alerts.push({
        id: `moderate_compliance_risk_${Date.now()}`,
        companyName: analysis.companyName,
        ticker: analysis.ticker,
        type: AlertType.COMPLIANCE,
        priority: AlertPriority.MEDIUM,
        message: `Moderate compliance risk detected`,
        details: `The company has a moderate compliance risk score (${complianceRiskScore}/10) based on sector, identified issues, and recent developments.`,
        timestamp: new Date().toISOString(),
        source: 'compliance_analysis',
        actionRequired: false
      });
    }
    
    return alerts;
  } catch (error) {
    logger.error('Failed to generate compliance alerts', error);
    // Return empty array rather than failing
    return [];
  }
}
