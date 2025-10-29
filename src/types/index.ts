export interface StockAnalysis {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  sentiment: number;
  recommendation: string;
  confidence: number;
}

export interface Alert {
  id: string;
  type: 'price' | 'volume' | 'news' | 'sentiment';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  symbol?: string;
}

export interface ReportGenerationOptions {
  includeESG?: boolean;
  includeSECFilings?: boolean;
  includeNews?: boolean;
  timeframe?: '1d' | '1w' | '1m' | '3m' | '1y';
}

export interface DueDiligenceReportType {
  id: string;
  companyName: string;
  ticker: string;
  executiveSummary: string;
  recommendation: string;
  confidence: number;
  riskRating: string;
  keyFindings: string[];
  generatedAt: Date;
  userId: string;
}

export interface ESGRatings {
  symbol: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  lastUpdated: Date;
}