import { DueDiligenceReportType } from '../types';

/**
 * Model Context Protocol (MCP) implementation for AI Diligence Pro
 * 
 * This module provides structured context for AI model interactions,
 * ensuring consistent and reliable report generation.
 */

// Define the MCP context structure
export interface MCPContext {
  // Metadata about the request
  metadata: {
    requestId: string;
    timestamp: string;
    version: string;
    model: string;
  };
  
  // User context
  user: {
    id?: string;
    preferences?: {
      reportFormat: 'detailed' | 'summary';
      includeCharts: boolean;
      includeTables: boolean;
    };
  };
  
  // Company context
  company: {
    name: string;
    ticker?: string;
    sector?: string;
    industry?: string;
    country?: string;
  };
  
  // Analysis parameters
  parameters: {
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
    focusAreas?: Array<'financial' | 'market' | 'risk' | 'strategic' | 'esg'>;
    timeframe?: 'current' | 'historical' | 'forecast';
    comparisons?: string[]; // List of competitor tickers
  };
  
  // Data sources
  dataSources: {
    financial?: string[];
    news?: string[];
    filings?: string[];
    market?: string[];
    analyst?: string[];
  };
}

// Create a default MCP context
export const createDefaultMCPContext = (
  companyName: string,
  userId?: string,
  preferences?: MCPContext['user']['preferences']
): MCPContext => {
  return {
    metadata: {
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
      version: '1.0',
      model: 'gemini-pro',
    },
    user: {
      id: userId,
      preferences: preferences || {
        reportFormat: 'detailed',
        includeCharts: true,
        includeTables: true,
      },
    },
    company: {
      name: companyName,
    },
    parameters: {
      analysisDepth: 'standard',
      focusAreas: ['financial', 'market', 'risk', 'strategic'],
      timeframe: 'current',
    },
    dataSources: {
      financial: ['Financial Modeling Prep API', 'Alpha Vantage API'],
      news: ['News API'],
      filings: ['SEC Edgar Database'],
      market: ['Market Data API'],
    },
  };
};

// Generate a unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Format the MCP context for API requests
export const formatMCPContextForAPI = (context: MCPContext): string => {
  return JSON.stringify(context, null, 2);
};

// Extract relevant information from MCP context for report generation
export const extractReportParameters = (context: MCPContext): {
  companyName: string;
  analysisDepth: string;
  focusAreas: string[];
  reportFormat: string;
} => {
  return {
    companyName: context.company.name,
    analysisDepth: context.parameters.analysisDepth,
    focusAreas: context.parameters.focusAreas || [],
    reportFormat: context.user.preferences?.reportFormat || 'detailed',
  };
};

// Create MCP prompt for AI model
export const createMCPPrompt = (context: MCPContext): string => {
  const { company, parameters, dataSources } = context;
  
  return `
Generate a comprehensive due diligence report for ${company.name}.

Analysis Parameters:
- Depth: ${parameters.analysisDepth}
- Focus Areas: ${parameters.focusAreas?.join(', ')}
- Timeframe: ${parameters.timeframe}
${parameters.comparisons ? `- Compare with: ${parameters.comparisons.join(', ')}` : ''}

The report should include:
1. Executive Summary with key findings and risk rating
2. Financial Analysis with metrics, trends, strengths, and weaknesses
3. Market Analysis with competitive positioning and SWOT analysis
4. Risk Assessment covering financial, operational, market, and regulatory risks
5. Recent Developments including news, filings, and strategic initiatives

Data Sources to consider:
${Object.entries(dataSources)
  .filter(([_, sources]) => sources && sources.length > 0)
  .map(([type, sources]) => `- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${sources?.join(', ')}`)
  .join('\n')}

Format the response as a structured JSON object following the DueDiligenceReportType schema.
`;
};

// Process AI response and convert to report format
export const processMCPResponse = (
  aiResponse: any,
  context: MCPContext
): DueDiligenceReportType => {
  // If the AI response is already in the correct format, return it
  if (
    aiResponse &&
    aiResponse.companyName &&
    aiResponse.executiveSummary &&
    aiResponse.financialAnalysis &&
    aiResponse.marketAnalysis &&
    aiResponse.riskAssessment &&
    aiResponse.recentDevelopments
  ) {
    return aiResponse as DueDiligenceReportType;
  }
  
  // Otherwise, try to parse and structure the response
  try {
    // This is a simplified implementation - in a real scenario,
    // you would have more robust parsing and validation
    const report: DueDiligenceReportType = {
      companyName: context.company.name,
      timestamp: new Date().toISOString(),
      executiveSummary: {
        overview: extractOverview(aiResponse),
        keyFindings: extractKeyFindings(aiResponse),
        riskRating: extractRiskRating(aiResponse),
        recommendation: extractRecommendation(aiResponse),
      },
      financialAnalysis: {
        metrics: extractFinancialMetrics(aiResponse),
        trends: extractFinancialTrends(aiResponse),
        strengths: extractFinancialStrengths(aiResponse),
        weaknesses: extractFinancialWeaknesses(aiResponse),
      },
      marketAnalysis: {
        position: extractMarketPosition(aiResponse),
        competitors: extractCompetitors(aiResponse),
        marketShare: extractMarketShare(aiResponse),
        swot: {
          strengths: extractSWOTStrengths(aiResponse),
          weaknesses: extractSWOTWeaknesses(aiResponse),
          opportunities: extractSWOTOpportunities(aiResponse),
          threats: extractSWOTThreats(aiResponse),
        },
      },
      riskAssessment: {
        financial: extractFinancialRisks(aiResponse),
        operational: extractOperationalRisks(aiResponse),
        market: extractMarketRisks(aiResponse),
        regulatory: extractRegulatoryRisks(aiResponse),
        esg: extractESGRisks(aiResponse),
      },
      recentDevelopments: {
        news: extractNews(aiResponse),
        filings: extractFilings(aiResponse),
        management: extractManagement(aiResponse),
        strategic: extractStrategic(aiResponse),
      },
    };
    
    return report;
  } catch (error) {
    console.error('Error processing MCP response:', error);
    throw new Error('Failed to process AI response');
  }
};

// Helper functions to extract specific sections from AI response
// These would be implemented with more sophisticated parsing logic in a real application
const extractOverview = (response: any): string => {
  // Implementation would depend on the structure of the AI response
  return typeof response.overview === 'string' 
    ? response.overview 
    : 'Overview not available';
};

const extractKeyFindings = (response: any): string[] => {
  return Array.isArray(response.keyFindings) 
    ? response.keyFindings 
    : ['Key findings not available'];
};

const extractRiskRating = (response: any): 'Low' | 'Medium' | 'High' | 'Demo' => {
  const rating = response.riskRating;
  if (rating === 'Low' || rating === 'Medium' || rating === 'High' || rating === 'Demo') {
    return rating;
  }
  return 'Medium'; // Default
};

const extractRecommendation = (response: any): string => {
  return typeof response.recommendation === 'string' 
    ? response.recommendation 
    : 'Recommendation not available';
};

const extractFinancialMetrics = (response: any): Record<string, string | number> => {
  return response.financialMetrics || {};
};

const extractFinancialTrends = (response: any): string[] => {
  return Array.isArray(response.financialTrends) 
    ? response.financialTrends 
    : ['Financial trends not available'];
};

const extractFinancialStrengths = (response: any): string[] => {
  return Array.isArray(response.financialStrengths) 
    ? response.financialStrengths 
    : ['Financial strengths not available'];
};

const extractFinancialWeaknesses = (response: any): string[] => {
  return Array.isArray(response.financialWeaknesses) 
    ? response.financialWeaknesses 
    : ['Financial weaknesses not available'];
};

const extractMarketPosition = (response: any): string => {
  return typeof response.marketPosition === 'string' 
    ? response.marketPosition 
    : 'Market position not available';
};

const extractCompetitors = (response: any): string[] => {
  return Array.isArray(response.competitors) 
    ? response.competitors 
    : ['Competitors not available'];
};

const extractMarketShare = (response: any): string => {
  return typeof response.marketShare === 'string' 
    ? response.marketShare 
    : 'Market share not available';
};

const extractSWOTStrengths = (response: any): string[] => {
  return Array.isArray(response.swotStrengths) 
    ? response.swotStrengths 
    : ['SWOT strengths not available'];
};

const extractSWOTWeaknesses = (response: any): string[] => {
  return Array.isArray(response.swotWeaknesses) 
    ? response.swotWeaknesses 
    : ['SWOT weaknesses not available'];
};

const extractSWOTOpportunities = (response: any): string[] => {
  return Array.isArray(response.swotOpportunities) 
    ? response.swotOpportunities 
    : ['SWOT opportunities not available'];
};

const extractSWOTThreats = (response: any): string[] => {
  return Array.isArray(response.swotThreats) 
    ? response.swotThreats 
    : ['SWOT threats not available'];
};

const extractFinancialRisks = (response: any): string[] => {
  return Array.isArray(response.financialRisks) 
    ? response.financialRisks 
    : ['Financial risks not available'];
};

const extractOperationalRisks = (response: any): string[] => {
  return Array.isArray(response.operationalRisks) 
    ? response.operationalRisks 
    : ['Operational risks not available'];
};

const extractMarketRisks = (response: any): string[] => {
  return Array.isArray(response.marketRisks) 
    ? response.marketRisks 
    : ['Market risks not available'];
};

const extractRegulatoryRisks = (response: any): string[] => {
  return Array.isArray(response.regulatoryRisks) 
    ? response.regulatoryRisks 
    : ['Regulatory risks not available'];
};

const extractESGRisks = (response: any): string[] => {
  return Array.isArray(response.esgRisks) 
    ? response.esgRisks 
    : ['ESG risks not available'];
};

const extractNews = (response: any): Array<{title: string; url?: string; date: string; source: {name: string}}> => {
  return Array.isArray(response.news) 
    ? response.news 
    : [{
        title: 'News not available',
        date: new Date().toISOString(),
        source: { name: 'Not available' }
      }];
};

const extractFilings = (response: any): Array<{type: string; date: string; description: string; url?: string}> => {
  return Array.isArray(response.filings) 
    ? response.filings 
    : [{
        type: 'Filing not available',
        date: new Date().toISOString(),
        description: 'Not available'
      }];
};

const extractManagement = (response: any): string[] => {
  return Array.isArray(response.management) 
    ? response.management 
    : ['Management information not available'];
};

const extractStrategic = (response: any): string[] => {
  return Array.isArray(response.strategic) 
    ? response.strategic 
    : ['Strategic information not available'];
}; 