// Mock API for local development and fallback
import { DueDiligenceReport, CompanyData, ReportOptions } from './types';
import axios from 'axios';

// Helper functions for generating mock data
const getIndustryCompetitors = (industry?: string) => {
  const industryCompetitors: Record<string, string[]> = {
    'Technology': ['Apple', 'Google', 'Microsoft', 'Amazon', 'Meta'],
    'Auto Manufacturers': ['Tesla', 'Ford', 'General Motors', 'Toyota', 'Volkswagen'],
    'Software': ['Microsoft', 'Oracle', 'Salesforce', 'Adobe', 'SAP'],
    'Consumer Electronics': ['Apple', 'Sony', 'Samsung', 'HP', 'Dell'],
    'Semiconductors': ['NVIDIA', 'AMD', 'Intel', 'TSMC', 'Qualcomm'],
    'Retail': ['Amazon', 'Walmart', 'Target', 'Costco', 'JD.com'],
    'Aerospace & Defense': ['Boeing', 'Lockheed Martin', 'Raytheon', 'General Dynamics', 'Northrop Grumman'],
    'Pharmaceutical': ['CVS Health', 'Walgreens', 'Rite Aid', 'Dr. Reddy\'s', 'Teva'],
    'Banking': ['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup', 'Goldman Sachs']
  };
  
  return industryCompetitors[industry || 'Technology'] || ['Competitor 1', 'Competitor 2', 'Competitor 3', 'Competitor 4', 'Competitor 5'];
};

// API Keys from environment variables
const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const VITE_ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const VITE_SEC_API_KEY = import.meta.env.VITE_SEC_API_KEY;

// Mock data generators
const generateMockReport = (companyName: string, companyData?: CompanyData): DueDiligenceReport => {
  const industry = companyData?.Industry || companyData?.industry || 'Technology';
  const competitors = getIndustryCompetitors(industry);
  
  const mockReport: DueDiligenceReport = {
    companyName,
    ticker: companyData?.Symbol || companyData?.ticker || 'N/A',
    timestamp: new Date().toISOString(),
    companyData: companyData || {
      Name: companyName,
      Industry: industry,
      MarketCapitalization: Math.floor(Math.random() * 1000000000000),
      PERatio: Math.random() * 30 + 10,
      EPS: Math.random() * 10,
      ProfitMargin: Math.random() * 0.3
    },
    executiveSummary: {
      overview: `${companyName} is a ${industry.toLowerCase()} company with significant market presence. The company demonstrates strong fundamentals with competitive positioning in its sector.`,
      keyFindings: [
        'Strong revenue growth trajectory',
        'Competitive market position',
        'Solid financial fundamentals',
        'Growth opportunities in emerging markets'
      ],
      riskRating: 'medium' as const,
      recommendation: 'Buy - Strong fundamentals with growth potential'
    },
    keyFindings: [
      'Strong revenue growth trajectory',
      'Competitive market position',
      'Solid financial fundamentals',
      'Growth opportunities in emerging markets'
    ],
    financialAnalysis: {
      overview: 'The company demonstrates strong financial performance with consistent revenue growth.',
      metrics: {
        'Revenue Growth': '15.2%',
        'Net Margin': '18.5%',
        'ROE': '22.1%',
        'Debt-to-Equity': '0.45'
      },
      trends: [
        'Increasing revenue over the past 5 years',
        'Improving profit margins',
        'Strong cash flow generation'
      ],
      strengths: [
        'Strong balance sheet',
        'Consistent profitability',
        'Growing market share'
      ],
      weaknesses: [
        'High competition',
        'Regulatory pressures',
        'Market volatility sensitivity'
      ]
    },
    marketAnalysis: {
      overview: `${companyName} operates in a competitive ${industry.toLowerCase()} market with several key players.`,
      competitors: competitors,
      swot: {
        strengths: ['Market leadership', 'Strong brand', 'Innovation capabilities'],
        weaknesses: ['High costs', 'Regulatory constraints'],
        opportunities: ['Market expansion', 'New product lines', 'Digital transformation'],
        threats: ['Economic downturn', 'Increased competition', 'Regulatory changes']
      },
      marketPosition: 'Strong market position with competitive advantages'
    },
    riskAssessment: {
      overview: 'The company faces moderate risks typical of the industry.',
      riskFactors: {
        financial: ['Currency fluctuation', 'Interest rate changes'],
        operational: ['Supply chain disruption', 'Key personnel risk'],
        market: ['Competition intensity', 'Market saturation'],
        regulatory: ['Compliance requirements', 'Policy changes']
      },
      riskRating: 'medium' as const
    },
    recentDevelopments: {
      news: [
        {
          title: `${companyName} Reports Strong Q4 Results`,
          description: 'Company exceeded earnings expectations',
          url: '#',
          publishedAt: new Date().toISOString(),
          date: new Date().toISOString(),
          source: { name: 'Financial News' }
        }
      ],
      events: [
        'Q4 earnings report released',
        'New product announcement',
        'Strategic partnership formed'
      ]
    },
    conclusion: `${companyName} presents a solid investment opportunity with strong fundamentals and growth potential. The company's market position and financial performance support a positive outlook.`,
    generatedAt: new Date().toISOString()
  };

  return mockReport;
};

// Main mock API function
export const generateMockDueDiligenceReport = async (
  companyName: string,
  options?: ReportOptions
): Promise<DueDiligenceReport> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Try to fetch real data if APIs are available
    let companyData: CompanyData | undefined;
    
    if (VITE_ALPHA_VANTAGE_API_KEY && options?.ticker) {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${options.ticker}&apikey=${VITE_ALPHA_VANTAGE_API_KEY}`
        );
        if (response.data && !response.data.Note) {
          companyData = response.data;
        }
      } catch (error) {
        console.warn('Failed to fetch real financial data, using mock data');
      }
    }
    
    return generateMockReport(companyName, companyData);
  } catch (error) {
    console.error('Error generating mock report:', error);
    return generateMockReport(companyName);
  }
};