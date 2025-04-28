import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Logger } from '@/utils/logger';
import { DueDiligenceReportType } from '../due-diligence/types';

// Initialize pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { fetchMarketData } from '@/lib/api';
import { generateRule206Checklist } from '../compliance/ComplianceAutomation';
import { generateOneClickReport } from '../client-reporting/ClientReporting';
import { performPeerGroupBenchmarking, monitorShortInterest } from '../competitive-intelligence/CompetitiveIntelligence';
import { connectToSchwab, connectToFidelity, connectToBloombergTerminal, connectToSalesforce, connectToSlack } from '../workflow-integrations/WorkflowIntegrations';
import { encryptData, useTLS1_3, implementRoleBasedAccessControls, restrictIPAddresses, ensureSOC2TypeIIReadiness } from '../security/Security';
import { voiceToResearch, generateSmartAlerts } from '../ai-copilot/AICopilot';
import { withTimeout } from '@/utils/withTimeout';

// Create a dedicated logger for SEC Analyzer
const logger = new Logger('SECAnalyzer');

// Define custom error types for better error handling
export class SECAnalyzerError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'SECAnalyzerError';
  }
}

export class PDFProcessingError extends SECAnalyzerError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'PDFProcessingError';
  }
}

export class APIRequestError extends SECAnalyzerError {
  constructor(message: string, public statusCode?: number, cause?: Error) {
    super(message, cause);
    this.name = 'APIRequestError';
  }
}

export class DataProcessingError extends SECAnalyzerError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DataProcessingError';
  }
}

// Define analysis result type for better type safety
export interface SECAnalysisResult {
  companyTicker: string;
  pdfUrl: string;
  timestamp: string;
  report: DueDiligenceReportType;
  complianceChecklist?: any;
  oneClickReport?: any;
  peerGroupBenchmarking?: any;
  shortInterestMonitoring?: any;
  schwabConnection?: any;
  fidelityConnection?: any;
  bloombergTerminalConnection?: any;
  salesforceConnection?: any;
  slackConnection?: any;
  encryptedData?: string;
  tls1_3?: boolean;
  roleBasedAccessControls?: any;
  ipRestrictions?: any;
  soc2TypeIIReadiness?: any;
  voiceResearchQuery?: any;
  smartAlerts?: any;
  processingStats?: {
    startTime: number;
    endTime: number;
    totalPages: number;
    processedPages: number;
    memoryUsage: {
      beforeProcessing: NodeJS.MemoryUsage;
      afterProcessing: NodeJS.MemoryUsage;
    };
  };
}

// Utility for retry logic with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
    onRetry = () => {}
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt >= retries || !shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Calculate exponential backoff delay (with jitter)
      const delay = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
      );
      
      onRetry(lastError, attempt + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen due to the throw in the catch block
  throw lastError!;
}

/**
 * Analyzes an SEC filing PDF and generates a comprehensive due diligence report
 * @param pdfUrl URL to the SEC filing PDF
 * @param companyTicker Company ticker symbol
 * @param options Additional options for processing
 * @returns Processed analysis with all data points
 */
export async function analyzeSECFiling(
  pdfUrl: string, 
  companyTicker: string,
  options: {
    timeout?: number;
    retries?: number;
    cacheResults?: boolean;
    maxPages?: number;
    chunkSize?: number;
  } = {}
): Promise<SECAnalysisResult> {
  const {
    timeout = 60000,
    retries = 3,
    cacheResults = true,
    maxPages = Infinity,
    chunkSize = 20 // Default chunk size for memory-efficient processing
  } = options;
  
  // Track processing statistics for performance monitoring
  const startTime = Date.now();
  const memoryBefore = process.memoryUsage();
  
  // Store cleanup functions to ensure all resources are released properly
  const cleanupFunctions: Array<() => void> = [];
  
  try {
    logger.info(`Starting SEC filing analysis for ${companyTicker} using ${pdfUrl}`);
    
    // 1. Fetch PDF with retry logic
    logger.debug('Fetching PDF document');
    const pdfBuffer = await withRetry(
      async () => {
        const response = await withTimeout(
          axios.get(pdfUrl, { responseType: 'arraybuffer' }),
          timeout,
          new Error(`PDF fetch timeout after ${timeout}ms`)
        );
        
        if (response.status !== 200) {
          throw new APIRequestError(
            `Failed to fetch PDF: HTTP ${response.status}`,
            response.status
          );
        }
        
        return response.data;
      },
      {
        retries,
        onRetry: (error, attempt) => {
          logger.warn(`PDF fetch attempt ${attempt} failed: ${error.message}. Retrying...`);
        },
        shouldRetry: (error) => {
          if (error instanceof APIRequestError) {
            // Only retry 5xx errors or network errors, not 4xx
            return !error.statusCode || error.statusCode >= 500;
          }
          return true;
        }
      }
    );
    
    // 2. Extract full text using pdfjs with improved error handling and memory management
    logger.debug('Extracting text from PDF');
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    
    // Add cleanup function to destroy the worker
    cleanupFunctions.push(() => {
      loadingTask.destroy();
    });
    
    const pdf = await withTimeout(
      loadingTask.promise,
      timeout,
      new PDFProcessingError('PDF loading timeout')
    );
    
    logger.info(`PDF loaded: ${pdf.numPages} pages found`);
    
    // Calculate the actual number of pages to process
    const pagesToProcess = Math.min(pdf.numPages, maxPages);
    let fullText = '';
    
    // Process in chunks to avoid memory issues
    for (let i = 1; i <= pagesToProcess; i += chunkSize) {
      const endPage = Math.min(i + chunkSize - 1, pagesToProcess);
      logger.debug(`Processing pages ${i} to ${endPage}`);
      
      try {
        const pages = await Promise.all(
          Array.from({ length: endPage - i + 1 }, (_, idx) => {
            const pageNum = i + idx;
            return withRetry(
              async () => {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                
                // Clean up page resources after extraction
                page.cleanup();
                
                return content.items.map(item => (item as TextItem).str).join(' ');
              },
              {
                retries: 2, // Fewer retries for individual page processing
                onRetry: (error, attempt) => {
                  logger.warn(`Page ${pageNum} processing attempt ${attempt} failed: ${error.message}`);
                }
              }
            );
          })
        );
        
        // Extract and process text from each page
        for (const pageText of pages) {
          const textItems = pageText.split(' ').filter(Boolean);
          fullText += textItems.join(' ') + ' ';
        }
        
        // Force garbage collection between chunks if available
        if (global.gc) {
          global.gc();
        }
      } catch (error) {
        logger.error(`Error processing pages ${i} to ${endPage}:`, error);
        throw new PDFProcessingError(
          `Failed to process pages ${i} to ${endPage}`,
          error instanceof Error ? error : undefined
        );
      }
    }

    // 3. Get financial data from Alpha Vantage with retry logic and fallback
    logger.debug('Fetching financial data');
    let financialData;
    try {
      financialData = await withRetry(
        () => fetchMarketData(companyTicker),
        {
          retries,
          onRetry: (error, attempt) => {
            logger.warn(`Financial data fetch attempt ${attempt} failed: ${error.message}`);
          }
        }
      );
    } catch (error) {
      logger.error('Failed to fetch financial data, using cached data if available', error);
      // Attempt to use cached data as fallback
      try {
        const cachedDataRef = doc(db, 'cachedFinancialData', companyTicker);
        const snapshot = await db.getDoc(cachedDataRef);
        if (snapshot.exists()) {
          financialData = snapshot.data();
          logger.info('Successfully retrieved cached financial data');
        } else {
          // If no cached data, create basic placeholder data
          financialData = {
            symbol: companyTicker,
            lastUpdated: 'Unavailable',
            price: null,
            marketCap: null,
            status: 'data_unavailable'
          };
        }
      } catch (cacheFetchError) {
        logger.error('Failed to retrieve cached financial data', cacheFetchError);
        financialData = {
          symbol: companyTicker,
          lastUpdated: 'Unavailable',
          price: null,
          marketCap: null,
          status: 'data_unavailable'
        };
      }
    }

    // 4. AI Analysis with full context and improved error handling
    logger.debug('Sending data for AI analysis');
    let result;
    try {
      const backendResponse = await withRetry(
        async () => {
          return await withTimeout(
            axios.post('/api/generateDueDiligence', {
              companyName: companyTicker,
              pdfUrl,
              financialData,
              fullText
            }, {
              headers: { 'Content-Type': 'application/json' }
            }),
            timeout,
            new APIRequestError('AI analysis request timeout')
          );
        },
        {
          retries,
          onRetry: (error, attempt) => {
            logger.warn(`AI analysis attempt ${attempt} failed: ${error.message}. Retrying...`);
          },
          shouldRetry: (error) => {
            // Only retry server errors or network issues, not client errors
            if (error instanceof AxiosError && error.response) {
              return error.response.status >= 500;
            }
            return true;
          }
        }
      );
      
      // Validate response
      if (!backendResponse.data || backendResponse.status !== 200) {
        throw new APIRequestError(
          `AI analysis failed with status ${backendResponse.status}`,
          backendResponse.status
        );
      }
      
      // Process the response data
      result = backendResponse.data.data || {};
      
      // Cache the results if enabled
      if (cacheResults) {
        try {
          const cacheRef = doc(db, 'aiAnalysisCache', `${companyTicker}_${new Date().toISOString().split('T')[0]}`);
          await setDoc(cacheRef, {
            companyTicker,
            pdfUrl,
            result,
            timestamp: new Date().toISOString()
          });
          logger.info('Cached AI analysis results successfully');
        } catch (cacheError) {
          logger.error('Failed to cache AI analysis results', cacheError);
          // Non-critical error, continue execution
        }
      }
    } catch (error) {
      logger.error('AI analysis failed', error);
      
      // Try to use cached results if available
      try {
        const cachedResultsQuery = await db.collection('aiAnalysisCache')
          .where('companyTicker', '==', companyTicker)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
          
        if (!cachedResultsQuery.empty) {
          const cachedData = cachedResultsQuery.docs[0].data();
          result = cachedData.result;
          logger.info('Using cached AI analysis results');
        } else {
          throw new DataProcessingError('AI analysis failed and no cached results available', 
            error instanceof Error ? error : new Error(String(error)));
        }
      } catch (cacheFetchError) {
        // If both original request and cache fetch fail, throw the original error
        throw new DataProcessingError(
          'AI analysis failed and could not retrieve cached results',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    // Validate result before proceeding
    if (!result) {
      throw new DataProcessingError('No valid analysis result was generated');
    }

    // 5. Generate compliance checklist with error handling
    logger.debug('Generating compliance checklist');
    let complianceChecklist;
    try {
      complianceChecklist = await withTimeout(
        generateRule206Checklist(result),
        timeout,
        new Error('Compliance checklist generation timeout')
      );
    } catch (error) {
      logger.error('Failed to generate compliance checklist', error);
      complianceChecklist = { error: 'Failed to generate compliance checklist' };
    }

    // 6. Generate one-click report with error handling
    logger.debug('Generating one-click report');
    let oneClickReport;
    try {
      oneClickReport = await withTimeout(
        generateOneClickReport(result),
        timeout,
        new Error('One-click report generation timeout')
      );
    } catch (error) {
      logger.error('Failed to generate one-click report', error);
      oneClickReport = { error: 'Failed to generate one-click report' };
    }

    // 7. Perform peer group benchmarking with error handling
    logger.debug('Performing peer group benchmarking');
    let peerGroupBenchmarking;
    try {
      peerGroupBenchmarking = await withTimeout(
        performPeerGroupBenchmarking(result),
        timeout,
        new Error('Peer group benchmarking timeout')
      );
    } catch (error) {
      logger.error('Failed to perform peer group benchmarking', error);
      peerGroupBenchmarking = { error: 'Failed to perform peer group benchmarking' };
    }

    // 8. Monitor short interest with error handling
    logger.debug('Monitoring short interest');
    let shortInterestMonitoring;
    try {
      shortInterestMonitoring = await withTimeout(
        monitorShortInterest(result),
        timeout,
        new Error('Short interest monitoring timeout')
      );
    } catch (error) {
      logger.error('Failed to monitor short interest', error);
      shortInterestMonitoring = { error: 'Failed to monitor short interest' };
    }

    // 9. Connect to external systems with error handling
    logger.debug('Connecting to external systems');
    let schwabConnection, fidelityConnection, bloombergTerminalConnection, 
        salesforceConnection, slackConnection;
    
    try {
      schwabConnection = await withTimeout(
        connectToSchwab(result),
        timeout,
        new Error('Schwab connection timeout')
      );
    } catch (error) {
      logger.error('Failed to connect to Schwab', error);
      schwabConnection = { error: 'Failed to connect to Schwab' };
    }
    
    try {
      fidelityConnection = await withTimeout(
        connectToFidelity(result),
        timeout,
        new Error('Fidelity connection timeout')
      );
    } catch (error) {
      logger.error('Failed to connect to Fidelity', error);
      fidelityConnection = { error: 'Failed to connect to Fidelity' };
    }
    
    try {
      bloombergTerminalConnection = await withTimeout(
        connectToBloombergTerminal(result),
        timeout,
        new Error('Bloomberg Terminal connection timeout')
      );
    } catch (error) {
      logger.error('Failed to connect to Bloomberg Terminal', error);
      bloombergTerminalConnection = { error: 'Failed to connect to Bloomberg Terminal' };
    }
    
    try {
      salesforceConnection = await withTimeout(
        connectToSalesforce(result),
        timeout,
        new Error('Salesforce connection timeout')
      );
    } catch (error) {
      logger.error('Failed to connect to Salesforce', error);
      salesforceConnection = { error: 'Failed to connect to Salesforce' };
    }
    
    try {
      slackConnection = await withTimeout(
        connectToSlack(result),
        timeout,
        new Error('Slack connection timeout')
      );
    } catch (error) {
      logger.error('Failed to connect to Slack', error);
      slackConnection = { error: 'Failed to connect to Slack' };
    }

    // 10. Apply security measures with error handling
    logger.debug('Applying security measures');
    let encryptedData, tls1_3, roleBasedAccessControls, ipRestrictions, soc2TypeIIReadiness;
    
    try {
      encryptedData = await withTimeout(
        encryptData(JSON.stringify(result)),
        timeout,
        new Error('Data encryption timeout')
      );
    } catch (error) {
      logger.error('Failed to encrypt data', error);
      encryptedData = { error: 'Failed to encrypt data' };
    }
    
    try {
      tls1_3 = await withTimeout(
        useTLS1_3(),
        timeout,
        new Error('TLS 1.3 setup timeout')
      );
    } catch (error) {
      logger.error('Failed to setup TLS 1.3', error);
      tls1_3 = { error: 'Failed to setup TLS 1.3' };
    }
    
    try {
      roleBasedAccessControls = await withTimeout(
        implementRoleBasedAccessControls(),
        timeout,
        new Error('Role-based access controls implementation timeout')
      );
    } catch (error) {
      logger.error('Failed to implement role-based access controls', error);
      roleBasedAccessControls = { error: 'Failed to implement role-based access controls' };
    }
    
    try {
      ipRestrictions = await withTimeout(
        restrictIPAddresses(),
        timeout,
        new Error('IP restriction implementation timeout')
      );
    } catch (error) {
      logger.error('Failed to implement IP restrictions', error);
      ipRestrictions = { error: 'Failed to implement IP restrictions' };
    }
    
    try {
      soc2TypeIIReadiness = await withTimeout(
        ensureSOC2TypeIIReadiness(),
        timeout,
        new Error('SOC2 Type II readiness check timeout')
      );
    } catch (error) {
      logger.error('Failed to check SOC2 Type II readiness', error);
      soc2TypeIIReadiness = { error: 'Failed to check SOC2 Type II readiness' };
    }

    // 11. Generate AI copilot features with error handling
    logger.debug('Generating AI copilot features');
    let voiceResearchQuery, smartAlerts;
    
    try {
      voiceResearchQuery = await withTimeout(
        voiceToResearch(`Analyze SEC filing for ${companyTicker}`),
        timeout,
        new Error('Voice to research conversion timeout')
      );
    } catch (error) {
      logger.error('Failed to convert voice to research', error);
      voiceResearchQuery = { error: 'Failed to convert voice to research' };
    }
    
    try {
      smartAlerts = await withTimeout(
        generateSmartAlerts(result),
        timeout,
        new Error('Smart alerts generation timeout')
      );
    } catch (error) {
      logger.error('Failed to generate smart alerts', error);
      smartAlerts = { error: 'Failed to generate smart alerts' };
    }

    // 12. Store in Firestore
    const reportRef = doc(db, 'reports', `${companyTicker}_${Date.now()}`);
    await setDoc(reportRef, {
      ...result,
      companyTicker,
      timestamp: new Date().toISOString(),
      rawText: fullText.substring(0, 10000), // Store first 10k chars
      complianceChecklist,
      oneClickReport,
      peerGroupBenchmarking,
      shortInterestMonitoring,
      schwabConnection,
      fidelityConnection,
      bloombergTerminalConnection,
      salesforceConnection,
      slackConnection,
      encryptedData,
      tls1_3,
      roleBasedAccessControls,
      ipRestrictions,
      soc2TypeIIReadiness,
      voiceResearchQuery,
      smartAlerts
    });

    // Capture final memory stats
    const memoryAfter = process.memoryUsage();
    const endTime = Date.now();
    
    // Prepare the final result with all components
    const finalResult: SECAnalysisResult = {
      companyTicker,
      pdfUrl,
      timestamp: new Date().toISOString(),
      report: result,
      complianceChecklist,
      oneClickReport,
      peerGroupBenchmarking,
      shortInterestMonitoring,
      schwabConnection,
      fidelityConnection,
      bloombergTerminalConnection,
      salesforceConnection,
      slackConnection,
      encryptedData,
      tls1_3,
      roleBasedAccessControls,
      ipRestrictions,
      soc2TypeIIReadiness,
      voiceResearchQuery,
      smartAlerts,
      processingStats: {
        startTime,
        endTime,
        totalPages: pdf.numPages,
        processedPages: pagesToProcess,
        memoryUsage: {
          beforeProcessing: memoryBefore,
          afterProcessing: memoryAfter
        }
      }
    };
    
    logger.info(`SEC analysis for ${companyTicker} completed successfully in ${(endTime - startTime) / 1000} seconds`);
    return finalResult;
  } catch (error) {
    logger.error('SEC analysis failed:', error);
    
    // Attempt to return a partial result if available
    if (result) {
      logger.info('Returning partial results despite error');
      return {
        companyTicker,
        pdfUrl,
        timestamp: new Date().toISOString(),
        report: result,
        processingStats: {
          error: error instanceof Error ? error.message : String(error)
        }
      } as SECAnalysisResult;
    }
    
    // Re-throw as a typed error
    if (error instanceof SECAnalyzerError) {
      throw error;
    } else {
      throw new SECAnalyzerError('SEC analysis failed', 
        error instanceof Error ? error : new Error(String(error)));
    }
  } finally {
    // Execute all cleanup functions
    logger.debug('Executing cleanup functions');
    for (const cleanup of cleanupFunctions) {
      try {
        cleanup();
      } catch (cleanupError) {
        logger.error('Cleanup function failed', cleanupError);
        // Continue with other cleanup functions even if one fails
      }
    }
    
    // Force garbage collection if available
    try {
      if (global.gc) {
        global.gc();
        logger.debug('Manual garbage collection executed');
      }
    } catch (gcError) {
      logger.error('Manual garbage collection failed', gcError);
    }
  }
}
