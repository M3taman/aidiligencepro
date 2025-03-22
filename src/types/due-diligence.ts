export interface DueDiligenceResponse {
  companyName: string;
  timestamp: string;
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    riskRating: 'Low' | 'Medium' | 'High';
    recommendation: string;
  };
  financialAnalysis: {
    metrics: Record<string, string | number>;
    trends: string[];
    strengths: string[];
    weaknesses: string[];
  };
  marketAnalysis: {
    position: string;
    competitors: string[];
    marketShare: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
  };
  riskAssessment: {
    financial: string[];
    operational: string[];
    market: string[];
    regulatory: string[];
    esg: string[];
  };
  recentDevelopments: {
    news: {
      title: string;
      url: string;
      date: string;
      source: string;
    }[];
    filings: {
      type: string;
      date: string;
      description: string;
      url: string;
    }[];
    management: string[];
    strategic: string[];
  };
} 