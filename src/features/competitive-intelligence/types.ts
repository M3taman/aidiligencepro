export interface CompetitiveAnalysisData {
  benchmarks: Record<string, {
    revenueGrowth: number;
    profitMargin: number;
    marketShare: number;
  }>;
  shortInterest: {
    timeline: string[];
    percentages: number[];
  };
  advantageScores: {
    company: number[];
    industryAvg: number[];
  };
  marketPosition: {
    x: number;
    y: number;
  }[];
}

export interface CompetitiveAnalysisProps {
  companyId: string;
  timeRange: '1M' | '3M' | '6M' | '1Y' | '3Y';
  peerGroup: string[];
}
