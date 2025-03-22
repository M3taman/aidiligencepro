export interface CompanyData {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  ProfitMargin: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  WeekHigh52: string;
  WeekLow52: string;
  DayMovingAverage50: string;
  DayMovingAverage200: string;
  SharesOutstanding: string;
  SharesFloat: string;
  SharesShort: string;
  SharesShortPriorMonth: string;
  ShortRatio: string;
  ShortPercentOutstanding: string;
  ShortPercentFloat: string;
  PercentInsiders: string;
  PercentInstitutions: string;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  date: string;
  source: {
    name: string;
  };
}

export interface SECFiling {
  type: string;
  filingDate: string;
  date: string;
  description: string;
  url: string;
}

/**
 * Options for report generation
 */
export interface ReportGenerationOptions {
  analysisDepth?: 'basic' | 'standard' | 'comprehensive';
  focusAreas?: Array<'financial' | 'market' | 'risk' | 'strategic' | 'esg'>;
  reportFormat?: 'detailed' | 'summary';
  includeCharts?: boolean;
  includeTables?: boolean;
  isDemo?: boolean;
}

/**
 * Structure for a due diligence report
 */
export interface DueDiligenceReportType {
  companyName: string;
  ticker?: string;
  executiveSummary: string;
  keyFindings: string[];
  financialAnalysis: {
    overview: string;
    metrics: Record<string, any>;
    trends: string;
    ratios?: Record<string, number>;
  };
  marketAnalysis: {
    overview: string;
    competitors: string[];
    swot?: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    marketPosition?: string;
  };
  riskAssessment: {
    overview: string;
    riskFactors: {
      financial: string[];
      operational: string[];
      market: string[];
      regulatory: string[];
      esg?: string[];
    };
    riskRating: 'low' | 'medium' | 'high';
  };
  recentDevelopments?: {
    news: Array<{
      title: string;
      date: string;
      summary: string;
      url?: string;
    }>;
    events?: string[];
  };
  conclusion: string;
  generatedAt: string;
  metadata?: {
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
    focusAreas: string[];
    dataSources: string[];
  };
}

export interface ReportGenerationStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export interface ReportFormat {
  type: 'detailed' | 'summary';
  includeCharts: boolean;
  includeTables: boolean;
} 