import { onRequest } from "firebase-functions/v2/https";
import cors from 'cors';
import admin from './firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from "firebase-functions/params";
import { validateAuth } from './middleware/auth';
import { Logger } from '../utils/logger';

// Initialize logger
const logger = new Logger('DueDiligenceFunction');

// Dynamic import for node-fetch
const fetch = async (...args: [any, any?]) => {
  const { default: fetchFn } = await import('node-fetch');
  return fetchFn(...args);
};

// Custom error classes for better error handling
class DueDiligenceError extends Error {
  constructor(
    message: string, 
    public code: 'auth_error' | 'validation_error' | 'rate_limit' | 'api_error' | 'parsing_error' | 'internal_error',
    public statusCode: number,
    public cause?: Error
  ) {
    super(message);
    this.name = 'DueDiligenceError';
  }
}

// Define secrets
const AIML_API_KEY = defineSecret("AIML_API_KEY");
const ALPHA_VANTAGE_API_KEY = defineSecret("ALPHA_VANTAGE_API_KEY");
const NEWS_API_KEY = defineSecret("NEWS_API_KEY");
const SEC_API_KEY = defineSecret("SEC_API_KEY");

// Firebase Admin initialized in shared module

// API configuration
const AIML_API_URL = 'https://api.aiml.com/v1/chat/completions';

// CORS middleware
const corsHandler = cors({
  origin: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Comprehensive Due Diligence Response interface aligned with DueDiligenceReportType
interface CompanyData {
  Symbol?: string;
  AssetType?: string;
  Name?: string;
  Description?: string;
  Exchange?: string;
  Currency?: string;
  Country?: string;
  Sector?: string;
  Industry?: string;
  MarketCapitalization?: number;
  EBITDA?: number;
  PERatio?: number;
  PEGRatio?: number;
  BookValue?: number;
  DividendPerShare?: number;
  DividendYield?: number;
  EPS?: number;
  ProfitMargin?: number;
  QuarterlyEarningsGrowthYOY?: number;
  QuarterlyRevenueGrowthYOY?: number;
  AnalystTargetPrice?: number;
  TrailingPE?: number;
  ForwardPE?: number;
  PriceToSalesRatioTTM?: number;
  PriceToBookRatio?: number;
  EVToRevenue?: number;
  EVToEBITDA?: number;
  Beta?: number;
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  '50DayMovingAverage'?: number;
  '200DayMovingAverage'?: number;
  SharesOutstanding?: number;
  DividendDate?: string;
  ExDividendDate?: string;
  ticker?: string;
  exchange?: string;
  industry?: string;
  sector?: string;
  marketCap?: number;
  employees?: number;
  founded?: number;
  ceo?: string;
  headquarters?: string;
  website?: string;
  region?: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  date: string;
  source: {
    name: string;
  };
  summary?: string;
}

interface SECFiling {
  type: string;
  filingDate: string;
  date: string;
  description: string;
  url: string;
}

type StringOrStringArray = string | string[];

interface ExecutiveSummaryType {
  overview: string;
  keyFindings?: StringOrStringArray;
  riskRating?: string;
  recommendation?: string;
}

interface FinancialAnalysisType {
  overview: string;
  metrics: Record<string, any>;
  trends: string | string[];
  ratios?: Record<string, number>;
  strengths?: StringOrStringArray;
  weaknesses?: StringOrStringArray;
  revenueGrowth?: string;
  profitabilityMetrics?: string;
  balanceSheetAnalysis?: string;
  cashFlowAnalysis?: string;
}

interface MarketAnalysisType {
  overview: string;
  competitors: string[] | Array<{
    name: string;
    strengths?: string;
    weaknesses?: string;
  }>;
  swot?: {
    strengths: string | string[];
    weaknesses: string | string[];
    opportunities: string | string[];
    threats: string | string[];
  };
  marketPosition?: string;
  position?: string;
  industryOverview?: string;
  competitiveLandscape?: string;
  marketShare?: string;
  competitiveAdvantages?: string;
}

interface RiskAssessmentType {
  overview: string;
  riskFactors: {
    financial: string[];
    operational: string[];
    market: string[];
    regulatory: string[];
    esg?: string[];
  };
  riskRating: 'low' | 'medium' | 'high';
  financial?: string;
  operational?: string;
  market?: string;
  regulatory?: string;
  esgConsiderations?: string;
  financialRisks?: string;
  operationalRisks?: string;
  marketRisks?: string;
  regulatoryRisks?: string;
}

interface RecentDevelopmentsType {
  news: NewsItem[];
  events?: string[];
  filings?: Array<{
    title?: string;
    type?: string;
    date: string;
    description?: string;
    url?: string;
  }>;
  strategic?: StringOrStringArray | Array<{
    title: string;
    date: string;
    summary?: string;
    description?: string;
  }>;
  management?: string[];
}

// Due Diligence Response interface
interface DueDiligenceResponse {
  companyName: string;
  ticker?: string;
  timestamp: string;
  companyData: CompanyData;
  executiveSummary: string | ExecutiveSummaryType;
  keyFindings?: string[];
  financialAnalysis: string | FinancialAnalysisType;
  marketAnalysis: string | MarketAnalysisType;
  riskAssessment: string | RiskAssessmentType;
  recentDevelopments?: RecentDevelopmentsType;
  conclusion?: string;
  generatedAt?: string;
  metadata?: {
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
    focusAreas: string[];
    dataSources: string[];
  };
}

// Parse error handling
class ParseError extends Error {
  constructor(message: string, public section?: string, public cause?: Error) {
    super(message);
    this.name = 'ParseError';
  }
}

// Parse AI response into structured format
function parseAIResponse(text: string, companyName: string, companyData: CompanyData): DueDiligenceResponse {
  logger.debug('Parsing AI response for company: ' + companyName);
  
  try {
    // Attempt to parse the entire text as JSON first
    try {
      const parsedJson = JSON.parse(text);
      // Basic validation to check if it's a potentially valid DueDiligenceResponse
      if (parsedJson.companyName && parsedJson.executiveSummary) {
        logger.info('Successfully parsed the entire AI response as JSON.');
        return validateAndEnhanceResponse(parsedJson, companyName, companyData);
      } else {
        logger.warn('Parsed JSON lacks required fields, falling back to section parsing.');
      }
    } catch (e) {
      logger.warn('Failed to parse entire response as JSON, attempting to extract from markdown or use section parsing.', e);
      // Fallback to checking for JSON within markdown or resorting to section parsing
      try {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                          text.match(/(\{[\s\S]*\})/); // More general JSON object match

        if (jsonMatch) {
          const jsonContent = jsonMatch[1] || jsonMatch[0]; // Use group 1 if available, else the whole match
          const parsedResponse = JSON.parse(jsonContent);
          logger.info('Successfully parsed AI response as JSON from markdown block.');
          return validateAndEnhanceResponse(parsedResponse, companyName, companyData);
        } else {
          logger.info('No JSON markdown block found, proceeding with section-based parsing.');
        }
      } catch (jsonError) {
        logger.warn('JSON parsing from markdown block failed, falling back to section parsing.', jsonError);
      }
    }
    
    // If JSON parsing fails or is not applicable, attempt section-by-section parsing
    logger.info('Using fallback regex-based parsing for AI response.');
    
    // Initialize structured response
    const response: DueDiligenceResponse = {
      companyName,
      ticker: companyData.Symbol || companyData.ticker,
      timestamp: new Date().toISOString(),
      companyData,
      executiveSummary: { overview: '' },
      financialAnalysis: { overview: '', metrics: {}, trends: [] },
      marketAnalysis: { overview: '', competitors: [] },
      riskAssessment: { 
        overview: '', 
        riskFactors: {
          financial: [],
          operational: [],
          market: [],
          regulatory: []
        },
        riskRating: 'medium'
      },
      generatedAt: new Date().toISOString(),
      metadata: {
        analysisDepth: 'standard',
        focusAreas: ['financial', 'market', 'risk'],
        dataSources: ['AI Analysis']
      }
    };
    
    // Extract sections using regex patterns
    // Executive Summary
    const execSummaryMatch = text.match(/Executive\s+Summary[\s\S]*?(?=Financial\s+Analysis|Market\s+Analysis|Risk\s+Assessment|Recent\s+Developments|Conclusion|$)/i);
    if (execSummaryMatch) {
      const execSummaryText = execSummaryMatch[0].replace(/Executive\s+Summary[:\s]*/i, '').trim();
      
      // Look for key findings
      const keyFindingsMatch = execSummaryText.match(/Key\s+Findings[:\s]*([\s\S]*?)(?=Risk\s+Rating|Recommendation|$)/i);
      const recommendationMatch = execSummaryText.match(/Recommendation[:\s]*([\s\S]*?)(?=$)/i);
      const riskRatingMatch = execSummaryText.match(/Risk\s+Rating[:\s]*([A-Za-z]+)/i);
      
      // Extract overview (everything before Key Findings if present)
      const overviewMatch = execSummaryText.match(/^([\s\S]*?)(?=Key\s+Findings|$)/i);
      
      const executiveSummary: ExecutiveSummaryType = {
        overview: overviewMatch ? overviewMatch[1].trim() : execSummaryText
      };
      
      if (keyFindingsMatch) {
        // Parse key findings as bullet points or numbered list
        const keyFindings = keyFindingsMatch[1].split(/\n[•\-\*\d.]\s+/).filter(Boolean).map(item => item.trim());
        if (keyFindings.length > 0) {
          executiveSummary.keyFindings = keyFindings;
          response.keyFindings = keyFindings;
        }
      }
      
      if (recommendationMatch) {
        executiveSummary.recommendation = recommendationMatch[1].trim();
      }
      
      if (riskRatingMatch) {
        const rating = riskRatingMatch[1].toLowerCase();
        executiveSummary.riskRating = rating;
        // Also set in risk assessment section
        if (typeof response.riskAssessment === 'object') {
          response.riskAssessment.riskRating = rating.includes('high') ? 'high' : 
                                              rating.includes('low') ? 'low' : 'medium';
        }
      }
      
      response.executiveSummary = executiveSummary;
    } else {
      logger.warn('Executive Summary section not found');
    }
    
    // Financial Analysis
    const financialMatch = text.match(/Financial\s+Analysis[\s\S]*?(?=Market\s+Analysis|Risk\s+Assessment|Recent\s+Developments|Conclusion|$)/i);
    if (financialMatch) {
      const financialText = financialMatch[0].replace(/Financial\s+Analysis[:\s]*/i, '').trim();
      
      // Extract metrics, strengths, weaknesses
      const metricsMatch = financialText.match(/Key\s+Metrics[:\s]*([\s\S]*?)(?=Trends|Strengths|Weaknesses|$)/i);
      const trendsMatch = financialText.match(/Trends[:\s]*([\s\S]*?)(?=Strengths|Weaknesses|$)/i);
      const strengthsMatch = financialText.match(/Strengths[:\s]*([\s\S]*?)(?=Weaknesses|$)/i);
      const weaknessesMatch = financialText.match(/Weaknesses[:\s]*([\s\S]*?)(?=$)/i);
      const ratiosMatch = financialText.match(/Ratios[:\s]*([\s\S]*?)(?=Balance\s+Sheet|$)/i);
      const balanceSheetMatch = financialText.match(/Balance\s+Sheet[:\s]*([\s\S]*?)(?=Cash\s+Flow|$)/i);
      const cashFlowMatch = financialText.match(/Cash\s+Flow[:\s]*([\s\S]*?)(?=$)/i);
      
      // Extract overview (first paragraph or sentence)
      const overviewMatch = financialText.match(/^(.*?)(?=\n\n|\n[A-Z]|Key\s+Metrics|$)/i);
      
      const financialAnalysis: FinancialAnalysisType = {
        overview: overviewMatch ? overviewMatch[1].trim() : financialText.substring(0, 200),
        metrics: {},
        trends: []
      };
      
      // Process metrics
      if (metricsMatch) {
        const metricsText = metricsMatch[1].trim();
        const metricLines = metricsText.split('\n').filter(Boolean);
        
        // Extract key-value pairs like "Metric Name: Value"
        metricLines.forEach(line => {
          const match = line.match(/^[•\-\*]?\s*([^:]+):\s*(.+)$/);
          if (match) {
            const [, metricName, metricValue] = match;
            financialAnalysis.metrics[metricName.trim()] = metricValue.trim();
          }
        });
      }
      
      // Process trends
      if (trendsMatch) {
        const trendsText = trendsMatch[1].trim();
        // Check if trends are bullet points or paragraph
        const trendsLines = trendsText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (trendsLines.length > 1) {
          // Bullet points
          financialAnalysis.trends = trendsLines.map(line => line.trim());
        } else {
          // Single paragraph
          financialAnalysis.trends = trendsText;
        }
      }
      
      // Process strengths
      if (strengthsMatch) {
        const strengthsText = strengthsMatch[1].trim();
        const strengthsLines = strengthsText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (strengthsLines.length > 1) {
          financialAnalysis.strengths = strengthsLines.map(line => line.trim());
        } else {
          financialAnalysis.strengths = strengthsText;
        }
      }
      
      // Process weaknesses
      if (weaknessesMatch) {
        const weaknessesText = weaknessesMatch[1].trim();
        const weaknessesLines = weaknessesText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (weaknessesLines.length > 1) {
          financialAnalysis.weaknesses = weaknessesLines.map(line => line.trim());
        } else {
          financialAnalysis.weaknesses = weaknessesText;
        }
      }
      
      // Process ratios
      if (ratiosMatch) {
        const ratiosText = ratiosMatch[1].trim();
        const ratioLines = ratiosText.split('\n').filter(Boolean);
        
        const ratios: Record<string, number> = {};
        ratioLines.forEach(line => {
          const match = line.match(/^[•\-\*]?\s*([^:]+):\s*([\d.]+)%?/);
          if (match) {
            const [, ratioName, ratioValue] = match;
            // Convert to number, removing any % sign
            ratios[ratioName.trim()] = parseFloat(ratioValue.trim());
          }
        });
        
        if (Object.keys(ratios).length > 0) {
          financialAnalysis.ratios = ratios;
        }
      }
      
      // Add balance sheet analysis
      if (balanceSheetMatch) {
        financialAnalysis.balanceSheetAnalysis = balanceSheetMatch[1].trim();
      }
      
      // Add cash flow analysis
      if (cashFlowMatch) {
        financialAnalysis.cashFlowAnalysis = cashFlowMatch[1].trim();
      }
      
      response.financialAnalysis = financialAnalysis;
    } else {
      logger.warn('Financial Analysis section not found');
    }
    
    // Market Analysis
    const marketMatch = text.match(/Market\s+Analysis[\s\S]*?(?=Risk\s+Assessment|Recent\s+Developments|Conclusion|$)/i);
    if (marketMatch) {
      const marketText = marketMatch[0].replace(/Market\s+Analysis[:\s]*/i, '').trim();
      
      // Extract competitors, SWOT, market position
      const competitorsMatch = marketText.match(/Competitors[:\s]*([\s\S]*?)(?=SWOT|Market\s+Position|Competitive\s+Landscape|Industry\s+Overview|$)/i);
      const swotMatch = marketText.match(/SWOT\s+Analysis[:\s]*([\s\S]*?)(?=Market\s+Position|Competitive\s+Landscape|Industry\s+Overview|$)/i);
      const marketPositionMatch = marketText.match(/Market\s+Position[:\s]*([\s\S]*?)(?=Competitive\s+Landscape|Industry\s+Overview|$)/i);
      const competitiveLandscapeMatch = marketText.match(/Competitive\s+Landscape[:\s]*([\s\S]*?)(?=Industry\s+Overview|$)/i);
      const industryOverviewMatch = marketText.match(/Industry\s+Overview[:\s]*([\s\S]*?)(?=$)/i);
      
      // Extract overview (first paragraph or sentence)
      const overviewMatch = marketText.match(/^(.*?)(?=\n\n|\n[A-Z]|Competitors|SWOT|$)/i);
      
      const marketAnalysis: MarketAnalysisType = {
        overview: overviewMatch ? overviewMatch[1].trim() : marketText.substring(0, 200),
        competitors: []
      };
      
      // Process competitors
      if (competitorsMatch) {
        const competitorsText = competitorsMatch[1].trim();
        
        // Check for structured competitor list with strengths/weaknesses
        const structuredCompetitors = competitorsText.match(/([^:]+):\s*Strengths[:\s]*([\s\S]*?)Weaknesses[:\s]*([\s\S]*?)(?=\n\n[^:]+:|\n[^:]+:|$)/g);
        
        if (structuredCompetitors && structuredCompetitors.length > 0) {
          // Parse structured competitors
          const competitors = [];
          
          for (const comp of structuredCompetitors) {
            const nameMatch = comp.match(/^([^:]+):/);
            const strengthsMatch = comp.match(/Strengths[:\s]*([\s\S]*?)(?=Weaknesses)/i);
            const weaknessesMatch = comp.match(/Weaknesses[:\s]*([\s\S]*?)(?=$)/i);
            
            if (nameMatch) {
              competitors.push({
                name: nameMatch[1].trim(),
                strengths: strengthsMatch ? strengthsMatch[1].trim() : undefined,
                weaknesses: weaknessesMatch ? weaknessesMatch[1].trim() : undefined
              });
            }
          }
          
          marketAnalysis.competitors = competitors;
        } else {
          // Try to parse as simple list
          const competitorsList = competitorsText.split(/\n[•\-\*]\s+/).filter(Boolean);
          if (competitorsList.length > 1) {
            marketAnalysis.competitors = competitorsList.map(comp => comp.trim());
          } else {
            // Comma-separated list
            marketAnalysis.competitors = competitorsText.split(',').map(comp => comp.trim());
          }
        }
      }
      
      // Process SWOT
      if (swotMatch) {
        const swotText = swotMatch[1].trim();
        
        const strengthsMatch = swotText.match(/Strengths[:\s]*([\s\S]*?)(?=Weaknesses)/i);
        const weaknessesMatch = swotText.match(/Weaknesses[:\s]*([\s\S]*?)(?=Opportunities)/i);
        const opportunitiesMatch = swotText.match(/Opportunities[:\s]*([\s\S]*?)(?=Threats)/i);
        const threatsMatch = swotText.match(/Threats[:\s]*([\s\S]*?)(?=$)/i);
        
        const swot: MarketAnalysisType['swot'] = {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        };
        
        // Parse strengths
        if (strengthsMatch) {
          const strengthsText = strengthsMatch[1].trim();
          const strengthsList = strengthsText.split(/\n[•\-\*]\s+/).filter(Boolean);
          swot.strengths = strengthsList.length > 1 ? strengthsList.map(s => s.trim()) : strengthsText;
        }
        
        // Parse weaknesses
        if (weaknessesMatch) {
          const weaknessesText = weaknessesMatch[1].trim();
          const weaknessesList = weaknessesText.split(/\n[•\-\*]\s+/).filter(Boolean);
          swot.weaknesses = weaknessesList.length > 1 ? weaknessesList.map(w => w.trim()) : weaknessesText;
        }
        
        // Parse opportunities
        if (opportunitiesMatch) {
          const opportunitiesText = opportunitiesMatch[1].trim();
          const opportunitiesList = opportunitiesText.split(/\n[•\-\*]\s+/).filter(Boolean);
          swot.opportunities = opportunitiesList.length > 1 ? opportunitiesList.map(o => o.trim()) : opportunitiesText;
        }
        
        // Parse threats
        if (threatsMatch) {
          const threatsText = threatsMatch[1].trim();
          const threatsList = threatsText.split(/\n[•\-\*]\s+/).filter(Boolean);
          swot.threats = threatsList.length > 1 ? threatsList.map(t => t.trim()) : threatsText;
        }
        
        marketAnalysis.swot = swot;
      }
      
      // Process market position
      if (marketPositionMatch) {
        marketAnalysis.marketPosition = marketPositionMatch[1].trim();
      }
      
      // Process competitive landscape
      if (competitiveLandscapeMatch) {
        marketAnalysis.competitiveLandscape = competitiveLandscapeMatch[1].trim();
      }
      
      // Process industry overview
      if (industryOverviewMatch) {
        marketAnalysis.industryOverview = industryOverviewMatch[1].trim();
      }
      
      response.marketAnalysis = marketAnalysis;
    } else {
      logger.warn('Market Analysis section not found');
    }
    
    // Risk Assessment
    const riskMatch = text.match(/Risk\s+Assessment[\s\S]*?(?=Recent\s+Developments|Conclusion|$)/i);
    if (riskMatch) {
      const riskText = riskMatch[0].replace(/Risk\s+Assessment[:\s]*/i, '').trim();
      
      // Extract risk factors and rating
      const financialRisksMatch = riskText.match(/Financial\s+Risks[:\s]*([\s\S]*?)(?=Operational\s+Risks|Market\s+Risks|Regulatory\s+Risks|ESG\s+Considerations|Risk\s+Rating|$)/i);
      const operationalRisksMatch = riskText.match(/Operational\s+Risks[:\s]*([\s\S]*?)(?=Market\s+Risks|Regulatory\s+Risks|ESG\s+Considerations|Financial\s+Risks|Risk\s+Rating|$)/i);
      const marketRisksMatch = riskText.match(/Market\s+Risks[:\s]*([\s\S]*?)(?=Regulatory\s+Risks|ESG\s+Considerations|Financial\s+Risks|Operational\s+Risks|Risk\s+Rating|$)/i);
      const regulatoryRisksMatch = riskText.match(/Regulatory\s+Risks[:\s]*([\s\S]*?)(?=ESG\s+Considerations|Financial\s+Risks|Operational\s+Risks|Market\s+Risks|Risk\s+Rating|$)/i);
      const esgConsiderationsMatch = riskText.match(/ESG\s+Considerations[:\s]*([\s\S]*?)(?=Financial\s+Risks|Operational\s+Risks|Market\s+Risks|Regulatory\s+Risks|Risk\s+Rating|$)/i);
      const riskRatingMatch = riskText.match(/Risk\s+Rating[:\s]*([A-Za-z]+)/i);
      
      // Extract overview (first paragraph or sentence)
      const overviewMatch = riskText.match(/^(.*?)(?=\n\n|\n[A-Z]|Financial\s+Risks|Operational\s+Risks|Market\s+Risks|Regulatory\s+Risks|ESG\s+Considerations|Risk\s+Rating|$)/i);
      
      const riskAssessment: RiskAssessmentType = {
        overview: overviewMatch ? overviewMatch[1].trim() : riskText.substring(0, 200),
        riskFactors: {
          financial: [],
          operational: [],
          market: [],
          regulatory: []
        },
        riskRating: 'medium' // Default
      };
      
      // Process financial risks
      if (financialRisksMatch) {
        const financialRisksText = financialRisksMatch[1].trim();
        riskAssessment.financialRisks = financialRisksText;
        
        // Extract bullet points if present
        const financialRisksList = financialRisksText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (financialRisksList.length > 1) {
          riskAssessment.riskFactors.financial = financialRisksList.map(risk => risk.trim());
        } else {
          // If not bullet points, use sentences as separate risks
          riskAssessment.riskFactors.financial = financialRisksText
            .split(/(?<=\.)\s+/)
            .filter(sentence => sentence.trim().length > 10)
            .map(sentence => sentence.trim());
        }
      }
      
      // Process operational risks
      if (operationalRisksMatch) {
        const operationalRisksText = operationalRisksMatch[1].trim();
        riskAssessment.operationalRisks = operationalRisksText;
        
        // Extract bullet points if present
        const operationalRisksList = operationalRisksText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (operationalRisksList.length > 1) {
          riskAssessment.riskFactors.operational = operationalRisksList.map(risk => risk.trim());
        } else {
          // If not bullet points, use sentences as separate risks
          riskAssessment.riskFactors.operational = operationalRisksText
            .split(/(?<=\.)\s+/)
            .filter(sentence => sentence.trim().length > 10)
            .map(sentence => sentence.trim());
        }
      }
      
      // Process market risks
      if (marketRisksMatch) {
        const marketRisksText = marketRisksMatch[1].trim();
        riskAssessment.marketRisks = marketRisksText;
        
        // Extract bullet points if present
        const marketRisksList = marketRisksText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (marketRisksList.length > 1) {
          riskAssessment.riskFactors.market = marketRisksList.map(risk => risk.trim());
        } else {
          // If not bullet points, use sentences as separate risks
          riskAssessment.riskFactors.market = marketRisksText
            .split(/(?<=\.)\s+/)
            .filter(sentence => sentence.trim().length > 10)
            .map(sentence => sentence.trim());
        }
      }
      
      // Process regulatory risks
      if (regulatoryRisksMatch) {
        const regulatoryRisksText = regulatoryRisksMatch[1].trim();
        riskAssessment.regulatoryRisks = regulatoryRisksText;
        
        // Extract bullet points if present
        const regulatoryRisksList = regulatoryRisksText.split(/\n[•\-\*]\s+/).filter(Boolean);
        if (regulatoryRisksList.length > 1) {
          riskAssessment.riskFactors.regulatory = regulatoryRisksList.map(risk => risk.trim());
        } else {
          // If not bullet points, use sentences as separate risks
          riskAssessment.riskFactors.regulatory = regulatoryRisksText
            .split(/(?<=\.)\s+/)
            .filter(sentence => sentence.trim().length > 10)
            .map(sentence => sentence.trim());
        }
      }
      
      // Process ESG considerations
      if (esgConsiderationsMatch) {
        const esgConsiderationsText = esgConsiderationsMatch[1].trim();
        riskAssessment.esgConsiderations = esgConsiderationsText;
        
        // Add ESG risks if not already present
        if (!riskAssessment.riskFactors.esg) {
          const esgRisksList = esgConsiderationsText.split(/\n[•\-\*]\s+/).filter(Boolean);
          if (esgRisksList.length > 1) {
            riskAssessment.riskFactors.esg = esgRisksList.map(risk => risk.trim());
          } else {
            // If not bullet points, use sentences as separate risks
            riskAssessment.riskFactors.esg = esgConsiderationsText
              .split(/(?<=\.)\s+/)
              .filter(sentence => sentence.trim().length > 10)
              .map(sentence => sentence.trim());
          }
        }
      }
      
      // Process risk rating
      if (riskRatingMatch) {
        const ratingText = riskRatingMatch[1].toLowerCase();
        if (ratingText.includes('high')) {
          riskAssessment.riskRating = 'high';
        } else if (ratingText.includes('low')) {
          riskAssessment.riskRating = 'low';
        } else {
          riskAssessment.riskRating = 'medium';
        }
      } else {
        // Infer risk rating from the text if not explicitly stated
        let riskLevel = 0;
        
        // Count high-risk keywords
        const highRiskKeywords = ['significant', 'severe', 'critical', 'major', 'high', 'substantial'];
        const lowRiskKeywords = ['minimal', 'minor', 'low', 'manageable', 'limited', 'negligible'];
        
        for (const keyword of highRiskKeywords) {
          if (riskText.toLowerCase().includes(keyword)) riskLevel++;
        }
        
        for (const keyword of lowRiskKeywords) {
          if (riskText.toLowerCase().includes(keyword)) riskLevel--;
        }
        
        // Count risk factors - more factors often indicate higher risk
        const totalRiskFactors = (
          riskAssessment.riskFactors.financial.length +
          riskAssessment.riskFactors.operational.length +
          riskAssessment.riskFactors.market.length +
          riskAssessment.riskFactors.regulatory.length
        );
        
        if (totalRiskFactors > 15) riskLevel += 2;
        else if (totalRiskFactors > 10) riskLevel += 1;
        
        // Assign risk rating based on score
        if (riskLevel > 2) {
          riskAssessment.riskRating = 'high';
        } else if (riskLevel < -1) {
          riskAssessment.riskRating = 'low';
        } else {
          riskAssessment.riskRating = 'medium';
        }
      }
      
      response.riskAssessment = riskAssessment;
    } else {
      logger.warn('Risk Assessment section not found');
    }
    
    // Recent Developments
    const developmentsMatch = text.match(/Recent\s+Developments[\s\S]*?(?=Conclusion|$)/i);
    if (developmentsMatch) {
      const developmentsText = developmentsMatch[0].replace(/Recent\s+Developments[:\s]*/i, '').trim();
      
      // Extract news, filings, and strategic events
      const newsMatch = developmentsText.match(/News[:\s]*([\s\S]*?)(?=Filings|Strategic\s+Developments|Management\s+Changes|$)/i);
      const filingsMatch = developmentsText.match(/Filings[:\s]*([\s\S]*?)(?=News|Strategic\s+Developments|Management\s+Changes|$)/i);
      const strategicMatch = developmentsText.match(/Strategic\s+Developments[:\s]*([\s\S]*?)(?=News|Filings|Management\s+Changes|$)/i);
      const managementMatch = developmentsText.match(/Management\s+Changes[:\s]*([\s\S]*?)(?=News|Filings|Strategic\s+Developments|$)/i);
      
      const recentDevelopments: RecentDevelopmentsType = {
        news: [],
        events: [],
        filings: []
      };
      
      // Process news items
      if (newsMatch) {
        const newsText = newsMatch[1].trim();
        const newsItems = newsText.split(/\n[•\-\*]\s+/).filter(Boolean);
        
        if (newsItems.length > 0) {
          recentDevelopments.news = newsItems.map(item => {
            // Try to extract title, date, and description
            const titleMatch = item.match(/^([^(]+?)(?:\s*\(([^)]+)\))?\s*(?::|–|-)?\s*(.*)/);
            
            if (titleMatch) {
              const [, title, date, description] = titleMatch;
              return {
                title: title.trim(),
                description: description ? description.trim() : '',
                url: '',
                publishedAt: date ? date.trim() : '',
                date: date ? date.trim() : '',
                source: { name: 'AI Analysis' }
              };
            }
            
            // Fallback if parsing fails
            return {
              title: item.trim(),
              description: '',
              url: '',
              publishedAt: '',
              date: '',
              source: { name: 'AI Analysis' }
            };
          });
        }
      }
      
      // Process filings
      if (filingsMatch) {
        const filingsText = filingsMatch[1].trim();
        const filingItems = filingsText.split(/\n[•\-\*]\s+/).filter(Boolean);
        
        if (filingItems.length > 0) {
          recentDevelopments.filings = filingItems.map(item => {
            // Try to extract type, date, and description
            const filingMatch = item.match(/^([^(]+?)(?:\s*\(([^)]+)\))?\s*(?::|–|-)?\s*(.*)/);
            
            if (filingMatch) {
              const [, type, date, description] = filingMatch;
              return {
                type: type.trim(),
                date: date ? date.trim() : new Date().toISOString().split('T')[0],
                description: description ? description.trim() : '',
                url: ''
              };
            }
            
            // Fallback if parsing fails
            return {
              type: 'Unknown Filing',
              date: new Date().toISOString().split('T')[0],
              description: item.trim(),
              url: ''
            };
          });
        }
      }
      
      // Process strategic developments
      if (strategicMatch) {
        const strategicText = strategicMatch[1].trim();
        const strategicItems = strategicText.split(/\n[•\-\*]\s+/).filter(Boolean);
        
        if (strategicItems.length > 0) {
          // Check if items look structured enough to be objects
          const hasStructuredFormat = strategicItems.some(item => 
            item.includes('(') && item.includes(')') && (item.includes(':') || item.includes('-') || item.includes('–'))
          );
          
          if (hasStructuredFormat) {
            // Parse as structured objects
            const structuredStrategic = strategicItems.map(item => {
              const titleMatch = item.match(/^([^(]+?)(?:\s*\(([^)]+)\))?\s*(?::|–|-)?\s*(.*)/);
              
              if (titleMatch) {
                const [, title, date, description] = titleMatch;
                return {
                  title: title.trim(),
                  date: date ? date.trim() : new Date().toISOString().split('T')[0],
                  description: description ? description.trim() : '',
                  summary: description ? description.substring(0, 100).trim() + (description.length > 100 ? '...' : '') : ''
                };
              }
              
              // Fallback
              return {
                title: item.trim(),
                date: new Date().toISOString().split('T')[0],
                description: '',
                summary: ''
              };
            });
            
            recentDevelopments.strategic = structuredStrategic;
          } else {
            // Parse as simple string array
            recentDevelopments.strategic = strategicItems.map(item => item.trim());
          }
        }
      }
      
      // Process management changes
      if (managementMatch) {
        const managementText = managementMatch[1].trim();
        const managementItems = managementText.split(/\n[•\-\*]\s+/).filter(Boolean);
        
        if (managementItems.length > 0) {
          recentDevelopments.management = managementItems.map(item => item.trim());
        }
      }
      
      // Add events from all sections for easy access
      const allEvents: string[] = [];
      
      // Add significant news as events
      recentDevelopments.news.forEach(news => {
        if (news.title) {
          allEvents.push(`News: ${news.title}${news.date ? ` (${news.date})` : ''}`);
        }
      });
      
      // Add filings as events
      if (recentDevelopments.filings) {
        recentDevelopments.filings.forEach(filing => {
          if (filing.type) {
            allEvents.push(`Filing: ${filing.type}${filing.date ? ` (${filing.date})` : ''}`);
          }
        });
      }
      
      // Add strategic developments as events
      if (recentDevelopments.strategic) {
        if (Array.isArray(recentDevelopments.strategic)) {
          if (typeof recentDevelopments.strategic[0] === 'string') {
            // String array
            recentDevelopments.strategic.forEach(item => {
              allEvents.push(`Strategic: ${item}`);
            });
          } else {
            // Object array
            (recentDevelopments.strategic as Array<{title: string, date: string}>).forEach(item => {
              allEvents.push(`Strategic: ${item.title}${item.date ? ` (${item.date})` : ''}`);
            });
          }
        } else {
          // Single string
          allEvents.push(`Strategic: ${recentDevelopments.strategic}`);
        }
      }
      
      // Add management changes as events
      if (recentDevelopments.management) {
        recentDevelopments.management.forEach(item => {
          allEvents.push(`Management: ${item}`);
        });
      }
      
      if (allEvents.length > 0) {
        recentDevelopments.events = allEvents;
      }
      
      response.recentDevelopments = recentDevelopments;
    } else {
      logger.warn('Recent Developments section not found');
    }
    
    // Extract conclusion if present
    const conclusionMatch = text.match(/Conclusion[:\s]*([\s\S]*?)(?=$)/i);
    if (conclusionMatch) {
      response.conclusion = conclusionMatch[1].trim();
    }
    
    return response;
  } catch (error) {
    logger.error('Error parsing AI response', error);
    
    // Create a minimal valid response
    const fallbackResponse: DueDiligenceResponse = {
      companyName,
      ticker: companyData.Symbol || companyData.ticker,
      timestamp: new Date().toISOString(),
      companyData,
      executiveSummary: { 
        overview: `Due diligence report for ${companyName}. Error occurred during parsing.`,
        keyFindings: ['Error processing response', error instanceof Error ? error.message : String(error)]
      },
      financialAnalysis: { overview: 'Financial analysis unavailable due to processing error.', metrics: {}, trends: [] },
      marketAnalysis: { overview: 'Market analysis unavailable due to processing error.', competitors: [] },
      riskAssessment: { 
        overview: 'Risk assessment unavailable due to processing error.', 
        riskFactors: {
          financial: [],
          operational: [],
          market: [],
          regulatory: []
        },
        riskRating: 'medium'
      },
      generatedAt: new Date().toISOString()
    };
    
    return fallbackResponse;
  }
}

/**
 * Validate and enhance a parsed response object
 * @param parsedResponse The parsed response from AI
 * @param companyName Company name
 * @param companyData Company data
 * @returns Enhanced and validated response
 */
function validateAndEnhanceResponse(
  parsedResponse: any, 
  companyName: string, 
  companyData: CompanyData
): DueDiligenceResponse {
  logger.debug('Validating and enhancing parsed response');
  
  // Start with a basic valid response object
  const validatedResponse: DueDiligenceResponse = {
    companyName: companyName,
    ticker: companyData.Symbol || companyData.ticker,
    timestamp: new Date().toISOString(),
    companyData: companyData,
    executiveSummary: { overview: '' },
    financialAnalysis: { overview: '', metrics: {}, trends: [] },
    marketAnalysis: { overview: '', competitors: [] },
    riskAssessment: { 
      overview: '', 
      riskFactors: {
        financial: [],
        operational: [],
        market: [],
        regulatory: []
      },
      riskRating: 'medium'
    },
    generatedAt: new Date().toISOString(),
    metadata: {
      analysisDepth: 'standard',
      focusAreas: ['financial', 'market', 'risk'],
      dataSources: ['AI Analysis']
    }
  };
  
  try {
    // 1. Enhance with company data
    if (parsedResponse.companyData) {
      // Merge provided companyData with any additional data from the response
      validatedResponse.companyData = {
        ...companyData,
        ...parsedResponse.companyData
      };
    }
    
    // 2. Add or enhance executive summary
    if (parsedResponse.executiveSummary) {
      if (typeof parsedResponse.executiveSummary === 'string') {
        validatedResponse.executiveSummary = {
          overview: parsedResponse.executiveSummary
        };
      } else {
        validatedResponse.executiveSummary = {
          overview: parsedResponse.executiveSummary.overview || `Overview for ${companyName}`,
          keyFindings: parsedResponse.executiveSummary.keyFindings,
          riskRating: parsedResponse.executiveSummary.riskRating,
          recommendation: parsedResponse.executiveSummary.recommendation
        };
      }
    }
    
    // 3. Add key findings if provided
    if (parsedResponse.keyFindings && Array.isArray(parsedResponse.keyFindings)) {
      validatedResponse.keyFindings = parsedResponse.keyFindings;
    }
    
    // 4. Add or enhance financial analysis
    if (parsedResponse.financialAnalysis) {
      if (typeof parsedResponse.financialAnalysis === 'string') {
        validatedResponse.financialAnalysis = {
          overview: parsedResponse.financialAnalysis,
          metrics: {},
          trends: []
        };
      } else {
        validatedResponse.financialAnalysis = {
          overview: parsedResponse.financialAnalysis.overview || 'Financial overview not available',
          metrics: parsedResponse.financialAnalysis.metrics || {},
          trends: parsedResponse.financialAnalysis.trends || [],
          ratios: parsedResponse.financialAnalysis.ratios,
          strengths: parsedResponse.financialAnalysis.strengths,
          weaknesses: parsedResponse.financialAnalysis.weaknesses,
          revenueGrowth: parsedResponse.financialAnalysis.revenueGrowth,
          profitabilityMetrics: parsedResponse.financialAnalysis.profitabilityMetrics,
          balanceSheetAnalysis: parsedResponse.financialAnalysis.balanceSheetAnalysis,
          cashFlowAnalysis: parsedResponse.financialAnalysis.cashFlowAnalysis
        };
      }
    }
    
    // 5. Add or enhance market analysis
    if (parsedResponse.marketAnalysis) {
      if (typeof parsedResponse.marketAnalysis === 'string') {
        validatedResponse.marketAnalysis = {
          overview: parsedResponse.marketAnalysis,
          competitors: []
        };
      } else {
        validatedResponse.marketAnalysis = {
          overview: parsedResponse.marketAnalysis.overview || 'Market overview not available',
          competitors: parsedResponse.marketAnalysis.competitors || [],
          swot: parsedResponse.marketAnalysis.swot,
          marketPosition: parsedResponse.marketAnalysis.marketPosition,
          position: parsedResponse.marketAnalysis.position,
          industryOverview: parsedResponse.marketAnalysis.industryOverview,
          competitiveLandscape: parsedResponse.marketAnalysis.competitiveLandscape,
          marketShare: parsedResponse.marketAnalysis.marketShare,
          competitiveAdvantages: parsedResponse.marketAnalysis.competitiveAdvantages
        };
      }
    }
    
    // 6. Add or enhance risk assessment
    if (parsedResponse.riskAssessment) {
      if (typeof parsedResponse.riskAssessment === 'string') {
        validatedResponse.riskAssessment = {
          overview: parsedResponse.riskAssessment,
          riskFactors: {
            financial: [],
            operational: [],
            market: [],
            regulatory: []
          },
          riskRating: 'medium'
        };
      } else {
        // Ensure valid risk rating
        let riskRating: 'low' | 'medium' | 'high' = 'medium';
        if (parsedResponse.riskAssessment.riskRating) {
          const rating = parsedResponse.riskAssessment.riskRating.toLowerCase();
          if (rating === 'low' || rating === 'high') {
            riskRating = rating as 'low' | 'high';
          }
        }
        
        validatedResponse.riskAssessment = {
          overview: parsedResponse.riskAssessment.overview || 'Risk overview not available',
          riskFactors: {
            financial: Array.isArray(parsedResponse.riskAssessment.riskFactors?.financial) 
              ? parsedResponse.riskAssessment.riskFactors.financial 
              : [],
            operational: Array.isArray(parsedResponse.riskAssessment.riskFactors?.operational) 
              ? parsedResponse.riskAssessment.riskFactors.operational 
              : [],
            market: Array.isArray(parsedResponse.riskAssessment.riskFactors?.market) 
              ? parsedResponse.riskAssessment.riskFactors.market 
              : [],
            regulatory: Array.isArray(parsedResponse.riskAssessment.riskFactors?.regulatory) 
              ? parsedResponse.riskAssessment.riskFactors.regulatory 
              : [],
            esg: Array.isArray(parsedResponse.riskAssessment.riskFactors?.esg) 
              ? parsedResponse.riskAssessment.riskFactors.esg 
              : undefined
          },
          riskRating,
          financial: parsedResponse.riskAssessment.financial,
          operational: parsedResponse.riskAssessment.operational,
          market: parsedResponse.riskAssessment.market,
          regulatory: parsedResponse.riskAssessment.regulatory,
          esgConsiderations: parsedResponse.riskAssessment.esgConsiderations,
          financialRisks: parsedResponse.riskAssessment.financialRisks,
          operationalRisks: parsedResponse.riskAssessment.operationalRisks,
          marketRisks: parsedResponse.riskAssessment.marketRisks,
          regulatoryRisks: parsedResponse.riskAssessment.regulatoryRisks
        };
      }
    }
    
    // 7. Add or enhance recent developments
    if (parsedResponse.recentDevelopments) {
      const recentDevelopments: RecentDevelopmentsType = {
        news: [],
        events: [],
        filings: []
      };
      
      // Process news
      if (Array.isArray(parsedResponse.recentDevelopments.news)) {
        recentDevelopments.news = parsedResponse.recentDevelopments.news.map((news: any) => {
          return {
            title: news.title || 'Untitled News',
            description: news.description || '',
            url: news.url || '',
            publishedAt: news.publishedAt || news.date || new Date().toISOString(),
            date: news.date || news.publishedAt || new Date().toISOString(),
            source: news.source || { name: 'AI Analysis' },
            summary: news.summary
          };
        });
      }
      
      // Process events
      if (Array.isArray(parsedResponse.recentDevelopments.events)) {
        recentDevelopments.events = parsedResponse.recentDevelopments.events;
      }
      
      // Process filings
      if (Array.isArray(parsedResponse.recentDevelopments.filings)) {
        recentDevelopments.filings = parsedResponse.recentDevelopments.filings.map((filing: any) => {
          return {
            type: filing.type || filing.title || 'Unknown Filing',
            date: filing.date || new Date().toISOString().split('T')[0],
            description: filing.description || '',
            url: filing.url || '',
            title: filing.title
          };
        });
      }
      
      // Process strategic developments
      if (parsedResponse.recentDevelopments.strategic) {
        recentDevelopments.strategic = parsedResponse.recentDevelopments.strategic;
      }
      
      // Process management changes
      if (Array.isArray(parsedResponse.recentDevelopments.management)) {
        recentDevelopments.management = parsedResponse.recentDevelopments.management;
      }
      
      validatedResponse.recentDevelopments = recentDevelopments;
    }
    
    // 8. Add conclusion if present
    if (parsedResponse.conclusion) {
      validatedResponse.conclusion = parsedResponse.conclusion;
    }
    
    // 9. Add or enhance metadata
    if (parsedResponse.metadata) {
      const validDepths = ['basic', 'standard', 'comprehensive'];
      const analysisDepth = validDepths.includes(parsedResponse.metadata.analysisDepth) 
        ? parsedResponse.metadata.analysisDepth 
        : 'standard';
        
      validatedResponse.metadata = {
        analysisDepth: analysisDepth as 'basic' | 'standard' | 'comprehensive',
        focusAreas: Array.isArray(parsedResponse.metadata.focusAreas) 
          ? parsedResponse.metadata.focusAreas 
          : ['financial', 'market', 'risk'],
        dataSources: Array.isArray(parsedResponse.metadata.dataSources) 
          ? parsedResponse.metadata.dataSources 
          : ['AI Analysis']
      };
    }
    
    // 10. Add generation timestamp
    validatedResponse.generatedAt = parsedResponse.generatedAt || new Date().toISOString();
    
    return validatedResponse;
  } catch (error) {
    logger.error('Error validating AI response', error);
    
    // Return the basic valid response if validation fails
    return validatedResponse;
  }
}

/**
 * Helper to call AIML API with robust error handling and rate limiting
 * @param prompt The prompt to send to the AI
 * @param apiKey API key for authentication
 * @returns Generated content from AI
 */
async function generateAIMLContent(
  prompt: string, 
  apiKey: string, 
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    retries?: number;
    timeout?: number;
  } = {}
): Promise<string> {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 4096,
    retries = 3,
    timeout = 60000
  } = options;
  
  // Implement retry logic
  let lastError: Error | null = null;
  let waitTime = 1000; // Start with 1s delay
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(AIML_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : waitTime;
        logger.warn(`Rate limited. Retrying after ${delay / 1000}s`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Double the wait time for next attempt (exponential backoff)
        waitTime = Math.min(waitTime * 2, 30000); // Cap at 30s
        continue;
      }
      
      const data = await response.json() as any;
      
      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }
      
      if (!data.choices || !data.choices.length || !data.choices[0].message?.content) {
        throw new Error('Invalid response format from AI API');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if it's a timeout abort or a validation error
      if (error instanceof DOMException && error.name === 'AbortError') {
        logger.error('Request timeout', error);
        throw new Error(`Request timed out after ${timeout / 1000}s`);
      }
      
      if (attempt >= retries) {
        logger.error(`Failed after ${retries} attempts`, error);
        break;
      }
      
      // Exponential backoff
      waitTime = Math.min(waitTime * 2, 30000); // Cap at 30s
      logger.warn(`Attempt ${attempt + 1} failed. Retrying in ${waitTime / 1000}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Failed to generate content after multiple attempts');
}

// Helper function to fetch Alpha Vantage data
async function fetchAlphaVantageData(ticker: string, apiKey: string): Promise<CompanyData | null> {
  logger.info(`Fetching financial data for ${ticker}`);
  if (!apiKey) {
    logger.warn('Missing Alpha Vantage API key. Skipping financial data fetch.');
    return null; // Or throw new Error('Missing Alpha Vantage API key');
  }
  const alphaVantageUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
  const response = await fetch(alphaVantageUrl);
  const data = await response.json() as any;

  if (data && !data.Note && !data['Error Message']) {
    logger.info(`Successfully retrieved financial data for ${ticker}`);
    return data as CompanyData;
  } else {
    logger.warn(`Failed to retrieve financial data from Alpha Vantage for ${ticker}: ${JSON.stringify(data)}`);
    // Optionally throw an error to be caught by Promise.allSettled if this data is critical
    // throw new Error(`Alpha Vantage API error for ${ticker}: ${JSON.stringify(data.Note || data['Error Message'] || 'Unknown error')}`);
    return null; // Continue if data is not strictly critical
  }
}

// Helper function to fetch SEC filings data
async function fetchSecFilingsData(ticker: string | undefined, apiKey: string): Promise<string | null> {
  if (!ticker) {
    logger.info('No ticker provided, skipping SEC filing analysis.');
    return null;
  }
  if (!apiKey) {
    logger.warn('Missing SEC API key, skipping SEC filing analysis.');
    return null; // Or throw new Error('Missing SEC API key');
  }

  logger.info(`Fetching recent SEC filings for ${ticker}`);
  const secApiUrl = `https://api.sec-api.io/filings?ticker=${ticker}&limit=5&type=10-K,10-Q&secApiKey=${apiKey}`;
  const secResponse = await fetch(secApiUrl);
  const secData = await secResponse.json() as any;

  if (secData && secData.filings && secData.filings.length > 0) {
    logger.info(`Found ${secData.filings.length} SEC filings for ${ticker}`);
    const mostRecentFiling = secData.filings[0];
    if (mostRecentFiling.linkToFilingDetails) {
      logger.info(`Fetching text from ${mostRecentFiling.formType} filing dated ${mostRecentFiling.filedAt} for ${ticker}`);
      try {
        const filingResponse = await fetch(mostRecentFiling.linkToFilingDetails);
        const filingHtml = await filingResponse.text();
        const textContent = filingHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        logger.info(`Successfully extracted ${textContent.length} characters from SEC filing for ${ticker}`);
        return textContent.substring(0, 10000); // Limit size
      } catch (filingError) {
        logger.error(`Error fetching SEC filing content for ${ticker}:`, filingError);
        // Optionally throw an error
        // throw new Error(`Failed to fetch SEC filing content for ${ticker}: ${filingError}`);
        return null; // Continue if data is not strictly critical
      }
    } else {
      logger.warn(`No linkToFilingDetails for the most recent filing for ${ticker}.`);
      return null;
    }
  } else {
    logger.warn(`No SEC filings found for ${ticker}. Response: ${JSON.stringify(secData)}`);
    return null;
  }
}


// Main function handler
async function handleDueDiligenceRequest(req: any, res: any) {
  // Initialize local storage for cleanup and partial data
  res.locals = {
    cleanup: null,
    partialData: null,
    startTime: Date.now()
  };
  
  try {
    // API Key Availability Checks
    if (!AIML_API_KEY.value()) {
      throw new DueDiligenceError(
        "Configuration error: Missing AIML_API_KEY. Report generation cannot proceed.",
        'internal_error',
        500
      );
    }
    if (!ALPHA_VANTAGE_API_KEY.value()) {
      throw new DueDiligenceError(
        "Configuration error: Missing ALPHA_VANTAGE_API_KEY. Report generation cannot proceed.",
        'internal_error',
        500
      );
    }
    if (!SEC_API_KEY.value()) {
      throw new DueDiligenceError(
        "Configuration error: Missing SEC_API_KEY. Report generation cannot proceed.",
        'internal_error',
        500
      );
    }

    // Validate authentication
    try {
      await validateAuth(req, res);
    } catch (authError) {
      throw new DueDiligenceError(
        'Authentication failed. Please provide valid credentials.',
        'auth_error',
        401,
        authError instanceof Error ? authError : new Error(String(authError))
      );
    }

    // Validate request data
    // Validate request data
    const data = req.body;
    if (!data || typeof data !== 'object') {
      throw new DueDiligenceError(
        'Invalid request body. Expected JSON object.',
        'validation_error',
        400,
        new Error('Request body is not a valid JSON object')
      );
    }
    
    if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim().length === 0) {
      throw new DueDiligenceError(
        'Company name is required',
        'validation_error',
        400,
        new Error('Missing or invalid company name')
      );
    }
    // Prepare company data for analysis
    const companyData: CompanyData = {
      Name: data.companyName,
      ticker: data.ticker,
      ...(data.financialData || {})
    };
    
    // Sanitize company name and ticker to prevent injection
    const sanitizedCompanyName = companyData.Name.replace(/[^\w\s\-\.,&]/g, '').trim();
    const sanitizedTicker = companyData.ticker ? companyData.ticker.replace(/[^\w\-\.]/g, '').trim() : undefined;
    
    if (sanitizedCompanyName !== companyData.Name) {
      logger.warn(`Company name was sanitized from "${companyData.Name}" to "${sanitizedCompanyName}"`);
      companyData.Name = sanitizedCompanyName;
    }
    
    if (sanitizedTicker !== companyData.ticker && companyData.ticker) {
      logger.warn(`Ticker was sanitized from "${companyData.ticker}" to "${sanitizedTicker}"`);
      companyData.ticker = sanitizedTicker;
    }
    
    // Check for rate limiting
    const userId = req.headers.authorization || req.ip || 'anonymous';
    const db = getFirestore();
    
    // Get recent requests from this user (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequestsQuery = await db.collection('reportHistory')
      .where('userId', '==', userId)
      .where('timestamp', '>=', oneHourAgo.toISOString())
      .get();
    
    // Apply rate limiting: 10 requests per hour for anonymous, 30 for authenticated
    const isAuthenticated = !!req.headers.authorization;
    const requestLimit = isAuthenticated ? 30 : 10;
    
    if (recentRequestsQuery.size >= requestLimit) {
      logger.warn(`Rate limit exceeded for user ${userId}: ${recentRequestsQuery.size} requests in the last hour`);
      throw new DueDiligenceError(
        'Rate limit exceeded',
        'rate_limit',
        429,
        new Error(`You can only make ${requestLimit} requests per hour. Please try again later.`)
      );
    }
    
    // Add a cleanup function to release the rate limit on error if needed
    const originalCleanup = res.locals.cleanup;
    res.locals.cleanup = async () => {
      if (originalCleanup) await originalCleanup();
      // If needed, we could implement rate limit release logic here
    };
    
    // First check if we have a recent report for this company
    if (data.allowCached !== false) { // Default to allowing cached reports unless explicitly disabled
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const cachedReportQuery = await db.collection('reportHistory')
        .where('companyName', '==', sanitizedCompanyName)
        .where('timestamp', '>=', threeDaysAgo.toISOString())
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!cachedReportQuery.empty) {
        const cachedReport = cachedReportQuery.docs[0].data();
        logger.info(`Returning cached report for ${sanitizedCompanyName} from ${cachedReport.timestamp}`);
        
        // Update the access timestamp
        await db.collection('reportHistory').add({
          companyName: sanitizedCompanyName,
          timestamp: new Date().toISOString(),
          reportId: cachedReportQuery.docs[0].id,
          type: 'cache_access',
          userId
        });
        
        res.json({ 
          data: cachedReport.report,
          cached: true,
          cachedAt: cachedReport.timestamp
        });
        return;
      }
    }
    
    // Fetch financial data and SEC filings concurrently
    let secFilingText: string | null = '';
    const alphaVantageKey = ALPHA_VANTAGE_API_KEY.value();
    const secApiKey = SEC_API_KEY.value();

    // Only fetch if data is not already provided or if SEC filings are requested
    const fetchDataPromises = [];
    if (!data.financialData || Object.keys(data.financialData).length === 0) {
      fetchDataPromises.push(fetchAlphaVantageData(sanitizedTicker || sanitizedCompanyName, alphaVantageKey));
    } else {
      fetchDataPromises.push(Promise.resolve(null)); // Resolve immediately if data is present
    }

    if (sanitizedTicker && (data.includeSECFilings !== false)) {
      fetchDataPromises.push(fetchSecFilingsData(sanitizedTicker, secApiKey));
    } else {
      fetchDataPromises.push(Promise.resolve(null)); // Resolve immediately if not needed
    }

    const [alphaVantageResult, secApiResult] = await Promise.allSettled(fetchDataPromises);

    if (alphaVantageResult.status === 'fulfilled' && alphaVantageResult.value) {
      Object.assign(companyData, alphaVantageResult.value);
      logger.info(`Successfully retrieved and assigned financial data for ${sanitizedCompanyName}`);
    } else if (alphaVantageResult.status === 'rejected') {
      logger.warn(`Failed to retrieve financial data for ${sanitizedCompanyName}:`, alphaVantageResult.reason);
    }

    if (secApiResult.status === 'fulfilled' && secApiResult.value) {
      secFilingText = secApiResult.value;
      logger.info(`Successfully retrieved and assigned SEC filing text for ${sanitizedTicker}`);
    } else if (secApiResult.status === 'rejected') {
      logger.warn(`Failed to retrieve SEC filings for ${sanitizedTicker || 'N/A'}:`, secApiResult.reason);
    }
    
    // Prepare the AI prompt with all collected data
    const aimlKey = AIML_API_KEY.value();
    if (!aimlKey) {
      throw new Error('Missing AIML API key');
    }
    
    // Create an enhanced prompt with available data
    const promptSections = [];
    promptSections.push(`Generate a comprehensive due diligence report for the company: ${sanitizedCompanyName}${sanitizedTicker ? ` (${sanitizedTicker})` : ''}.`);
    
    // Add requirements
    promptSections.push(`The report must include the following sections:
1. Executive Summary - Including key findings, risk rating, and recommendation
2. Financial Analysis - Including key metrics, trends, strengths and weaknesses
3. Market Analysis - Including competitors, SWOT analysis, and market position
4. Risk Assessment - Including financial, operational, market, and regulatory risks
5. Recent Developments - Including news, filings, and strategic developments
6. Conclusion - Summarizing the overall investment thesis`);
    
    // Add company data context
    if (Object.keys(companyData).length > 2) { // More than just Name and ticker
      promptSections.push(`Company Data:\n${JSON.stringify(companyData, null, 2)}`);
    }
    
    // Add SEC filing context if available
    if (secFilingText) {
      promptSections.push(`Recent SEC Filing Excerpt:\n${secFilingText.substring(0, 2000)}...`);
    }
    
    // Add format instruction
    promptSections.push(`Please format your entire response as a single JSON object. The JSON object should strictly follow this TypeScript interface:
interface DueDiligenceResponse {
  companyName: string;
  ticker?: string;
  timestamp: string;
  companyData: CompanyData;
  executiveSummary: ExecutiveSummaryType | string;
  keyFindings?: string[];
  financialAnalysis: FinancialAnalysisType | string;
  marketAnalysis: MarketAnalysisType | string;
  riskAssessment: RiskAssessmentType | string;
  recentDevelopments?: RecentDevelopmentsType;
  conclusion?: string;
  generatedAt?: string;
  metadata?: {
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
    focusAreas: string[];
    dataSources: string[];
  };
}

interface CompanyData {
  Symbol?: string;
  AssetType?: string;
  Name?: string;
  Description?: string;
  Exchange?: string;
  Currency?: string;
  Country?: string;
  Sector?: string;
  Industry?: string;
  MarketCapitalization?: number;
  EBITDA?: number;
  PERatio?: number;
  PEGRatio?: number;
  BookValue?: number;
  DividendPerShare?: number;
  DividendYield?: number;
  EPS?: number;
  ProfitMargin?: number;
  QuarterlyEarningsGrowthYOY?: number;
  QuarterlyRevenueGrowthYOY?: number;
  AnalystTargetPrice?: number;
  TrailingPE?: number;
  ForwardPE?: number;
  PriceToSalesRatioTTM?: number;
  PriceToBookRatio?: number;
  EVToRevenue?: number;
  EVToEBITDA?: number;
  Beta?: number;
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  '50DayMovingAverage'?: number;
  '200DayMovingAverage'?: number;
  SharesOutstanding?: number;
  DividendDate?: string;
  ExDividendDate?: string;
  ticker?: string;
  exchange?: string;
  industry?: string;
  sector?: string;
  marketCap?: number;
  employees?: number;
  founded?: number;
  ceo?: string;
  headquarters?: string;
  website?: string;
  region?: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  date: string;
  source: {
    name: string;
  };
  summary?: string;
}

interface SECFiling {
  type: string;
  filingDate: string;
  date: string;
  description: string;
  url: string;
}

type StringOrStringArray = string | string[];

interface ExecutiveSummaryType {
  overview: string;
  keyFindings?: StringOrStringArray;
  riskRating?: string;
  recommendation?: string;
}

interface FinancialAnalysisType {
  overview: string;
  metrics: Record<string, any>;
  trends: string | string[];
  ratios?: Record<string, number>;
  strengths?: StringOrStringArray;
  weaknesses?: StringOrStringArray;
  revenueGrowth?: string;
  profitabilityMetrics?: string;
  balanceSheetAnalysis?: string;
  cashFlowAnalysis?: string;
}

interface MarketAnalysisType {
  overview: string;
  competitors: string[] | Array<{
    name: string;
    strengths?: string;
    weaknesses?: string;
  }>;
  swot?: {
    strengths: string | string[];
    weaknesses: string | string[];
    opportunities: string | string[];
    threats: string | string[];
  };
  marketPosition?: string;
  position?: string;
  industryOverview?: string;
  competitiveLandscape?: string;
  marketShare?: string;
  competitiveAdvantages?: string;
}

interface RiskAssessmentType {
  overview: string;
  riskFactors: {
    financial: string[];
    operational: string[];
    market: string[];
    regulatory: string[];
    esg?: string[];
  };
  riskRating: 'low' | 'medium' | 'high';
  financial?: string;
  operational?: string;
  market?: string;
  regulatory?: string;
  esgConsiderations?: string;
  financialRisks?: string;
  operationalRisks?: string;
  marketRisks?: string;
  regulatoryRisks?: string;
}

interface RecentDevelopmentsType {
  news: NewsItem[];
  events?: string[];
  filings?: Array<{
    title?: string;
    type?: string;
    date: string;
    description?: string;
    url?: string;
  }>;
  strategic?: StringOrStringArray | Array<{
    title: string;
    date: string;
    summary?: string;
    description?: string;
  }>;
  management?: string[];
}
Ensure all string content is properly escaped within the JSON.
`);
    
    // Put all sections together
    const prompt = promptSections.join('\n\n');
    logger.debug(`Generated prompt with ${prompt.length} characters`);
    
    // Get the AI response
    logger.info(`Generating AI content for ${sanitizedCompanyName}`);
    const aiText = await generateAIMLContent(prompt, aimlKey, {
      model: data.model || 'gpt-4',
      temperature: data.temperature || 0.7,
      maxTokens: 4096,
      retries: 2,
      timeout: 120000 // 2 minutes
    });
    
    // Parse the AI response into structured format
    logger.info(`Parsing AI response for ${sanitizedCompanyName}`);
    let report;
    try {
      report = parseAIResponse(aiText, sanitizedCompanyName, companyData);
    } catch (parsingError) {
      // Store the raw response for diagnostics
      res.locals.partialData = { 
        aiText, 
        companyName: sanitizedCompanyName, 
        companyData,
        parsingError: parsingError instanceof Error ? parsingError.message : String(parsingError)
      };
      
      throw new DueDiligenceError(
        'Failed to parse AI response',
        'parsing_error',
        500,
        parsingError instanceof Error ? parsingError : new Error(String(parsingError))
      );
    }
    
    // Store the generated report
    const reportRef = await db.collection('reportHistory').add({
      companyName: sanitizedCompanyName,
      ticker: sanitizedTicker,
      timestamp: new Date().toISOString(),
      report,
      rawResponse: aiText.substring(0, 10000), // Store first 10k chars for debugging
      userId,
      type: 'generation',
      prompt: data.includePromptInResponse ? prompt : undefined
    });
    
    // Prepare the response
    const responseData = {
      data: report,
      reportId: reportRef.id,
      cached: false
    };
    
    // Include the prompt in the response if requested
    if (data.includePromptInResponse) {
      responseData.prompt = prompt;
    }
    
    res.json(responseData);
  } catch (error) {
    // Categorize and handle different error types
    let responseError: DueDiligenceError;
    
    if (error instanceof DueDiligenceError) {
      responseError = error;
    } else if (error instanceof Error && error.message.includes('authentication')) {
      responseError = new DueDiligenceError(
        'Authentication failed', 
        'auth_error', 
        401, 
        error
      );
    } else if (error instanceof Error && error.message.includes('Rate limit')) {
      responseError = new DueDiligenceError(
        'Rate limit exceeded', 
        'rate_limit', 
        429, 
        error
      );
    } else if (error instanceof Error && (
        error.message.includes('API key') || 
        error.message.includes('fetch') || 
        error.message.includes('timed out')
    )) {
      responseError = new DueDiligenceError(
        'External API error', 
        'api_error', 
        502, 
        error
      );
    } else if (error instanceof Error && error.message.includes('parsing')) {
      responseError = new DueDiligenceError(
        'Error processing AI response', 
        'parsing_error', 
        500, 
        error
      );
    } else {
      // Generic internal error
      responseError = new DueDiligenceError(
        'Internal server error', 
        'internal_error', 
        500, 
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // Log the error with context
    logger.error(`[${responseError.code}] Error generating due diligence report:`, responseError);
    
    // Send telemetry (in a production environment, this would connect to a monitoring service)
    try {
      await db.collection('errorTelemetry').add({
        timestamp: new Date().toISOString(),
        errorCode: responseError.code,
        errorMessage: responseError.message,
        stackTrace: responseError.cause?.stack,
        endpoint: 'generateDueDiligence',
        companyRequested: req.body?.companyName,
        userId: req.headers.authorization || req.ip || 'anonymous'
      });
    } catch (telemetryError) {
      logger.error('Failed to record error telemetry', telemetryError);
      // Don't fail if telemetry fails
    }
    
    // Return appropriate error response
    res.status(responseError.statusCode).json({
      error: responseError.message,
      code: responseError.code,
      details: responseError.cause instanceof Error ? responseError.cause.message : String(responseError.cause)
    });
  } finally {
    // Cleanup resources and ensure rate limiting is properly handled
    try {
      // If a partial report was generated, store it for diagnostics
      const partialData = res.locals.partialData;
      if (partialData) {
        await db.collection('partialReports').add({
          timestamp: new Date().toISOString(),
          companyName: req.body?.companyName,
          partialData,
          userId: req.headers.authorization || req.ip || 'anonymous'
        });
        logger.info('Saved partial report data for diagnostics');
      }
      
      // Release any held resources
      if (res.locals.cleanup && typeof res.locals.cleanup === 'function') {
        res.locals.cleanup();
      }
    } catch (cleanupError) {
      logger.error('Error during cleanup', cleanupError);
      // Don't rethrow cleanup errors
    }
  }
}

// Exported Firebase Function
export const generateDueDiligence = onRequest(
  {
    memory: "1GiB",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 10,
    invoker: "public",
    secrets: [AIML_API_KEY, ALPHA_VANTAGE_API_KEY, NEWS_API_KEY, SEC_API_KEY]
  },
  (req, res) => corsHandler(req, res, () => handleDueDiligenceRequest(req, res))
);

// Export other APIs
export { apiProxy } from './apiProxy';
