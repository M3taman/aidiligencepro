export interface CompanyData {
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

export interface NewsItem {
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
  format?: {
    includeCharts: boolean;
    includeTables: boolean;
  };
  isDemo?: boolean;
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

/**
 * Structure for a due diligence report
 */
export interface DueDiligenceReportType {
  companyName: string;
  ticker?: string;
  timestamp?: number;
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

export interface ReportOptions {
  sections?: {
    includeFinancial?: boolean;
    includeMarket?: boolean;
    includeRisk?: boolean;
    includeRecent?: boolean;
  };
  format?: {
    includeCharts?: boolean;
    includeTables?: boolean;
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
