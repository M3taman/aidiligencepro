// Mock API for local development
import { DueDiligenceReportType } from './types';

// Sample mock data for a due diligence report
const mockReportData: Record<string, DueDiligenceReportType> = {
  'apple': {
    companyName: 'Apple Inc.',
    timestamp: new Date().toISOString(),
    executiveSummary: {
      overview: 'Apple Inc. is a global technology company that designs, manufactures, and sells smartphones, personal computers, tablets, wearables, and accessories.',
      keyFindings: 'Strong financial position with significant cash reserves. Continued innovation in product lines. Services segment showing strong growth.',
      riskRating: 'Low',
      recommendation: 'Buy'
    },
    financialAnalysis: {
      revenueGrowth: 'Steady growth at 6% annually',
      profitabilityMetrics: 'Industry-leading margins at 21.5% net profit',
      balanceSheetAnalysis: 'Strong balance sheet with $200B in cash and investments',
      cashFlowAnalysis: 'Consistent positive free cash flow of $90B annually',
      peerComparison: 'Outperforms peers in most financial metrics'
    },
    marketAnalysis: {
      industryOverview: 'Technology hardware and services industry continues to grow',
      competitiveLandscape: 'Major competitors include Samsung, Google, and Microsoft',
      swot: {
        strengths: 'Brand recognition, ecosystem integration, premium pricing power',
        weaknesses: 'Reliance on iPhone sales, high product prices',
        opportunities: 'Expansion in services, wearables market growth',
        threats: 'Increasing competition, regulatory scrutiny'
      },
      marketShare: '15% of global smartphone market',
      competitiveAdvantages: 'Integrated ecosystem, brand loyalty, design excellence'
    },
    riskAssessment: {
      financialRisks: 'Currency fluctuations, tax policy changes',
      operationalRisks: 'Supply chain disruptions, manufacturing concentration in Asia',
      marketRisks: 'Smartphone market saturation, competitive pressure',
      regulatoryRisks: 'Antitrust investigations, privacy regulations',
      esgConsiderations: 'Strong environmental initiatives, supply chain labor concerns'
    },
    recentDevelopments: {
      news: [
        {
          title: 'Apple Announces New iPhone 15 Pro with Advanced AI Features',
          description: 'The new iPhone 15 Pro includes advanced AI capabilities and improved camera system.',
          url: 'https://example.com/apple-iphone15',
          publishedAt: '2023-09-12T14:30:00Z',
          source: { name: 'Tech News Daily' },
          date: '2023-09-12'
        },
        {
          title: 'Apple Services Revenue Reaches New Record',
          description: 'Apple\'s services segment continues to grow, reaching $20 billion in quarterly revenue.',
          url: 'https://example.com/apple-services',
          publishedAt: '2023-08-03T10:15:00Z',
          source: { name: 'Financial Times' },
          date: '2023-08-03'
        }
      ],
      filings: [
        {
          type: '10-Q',
          filingDate: '2023-07-28',
          description: 'Quarterly report for period ending June 30, 2023',
          url: 'https://www.sec.gov/example/apple-10q',
          date: '2023-07-28'
        },
        {
          type: '8-K',
          filingDate: '2023-06-15',
          description: 'Current report announcing stock buyback program',
          url: 'https://www.sec.gov/example/apple-8k',
          date: '2023-06-15'
        }
      ],
      strategicInitiatives: [
        'Expansion of services ecosystem',
        'Investment in augmented reality technology',
        'Carbon neutrality goal by 2030'
      ]
    },
    companyData: {
      Symbol: 'AAPL',
      AssetType: 'Common Stock',
      Name: 'Apple Inc.',
      Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
      Exchange: 'NASDAQ',
      Currency: 'USD',
      Country: 'USA',
      Sector: 'Technology',
      Industry: 'Consumer Electronics',
      MarketCapitalization: '2800000000000',
      EBITDA: '125000000000',
      PERatio: '30.5',
      PEGRatio: '2.5',
      DividendYield: '0.5',
      EPS: '6.15',
      RevenuePerShareTTM: '24.30',
      ProfitMargin: '0.215',
      OperatingMarginTTM: '0.30',
      ReturnOnAssetsTTM: '0.20',
      ReturnOnEquityTTM: '0.45',
      RevenueTTM: '385000000000',
      GrossProfitTTM: '170000000000',
      DilutedEPSTTM: '6.15',
      QuarterlyEarningsGrowthYOY: '0.05',
      QuarterlyRevenueGrowthYOY: '0.06',
      AnalystTargetPrice: '210',
      TrailingPE: '30.5',
      ForwardPE: '28.2',
      PriceToSalesRatioTTM: '7.3',
      PriceToBookRatio: '45.5',
      EVToRevenue: '7.5',
      EVToEBITDA: '22.5',
      Beta: '1.2',
      WeekHigh52: '215.50',
      WeekLow52: '155.20',
      DayMovingAverage50: '195.30',
      DayMovingAverage200: '180.50',
      SharesOutstanding: '16000000000',
      SharesFloat: '15800000000',
      SharesShort: '120000000',
      SharesShortPriorMonth: '125000000',
      ShortRatio: '1.2',
      ShortPercentOutstanding: '0.75',
      ShortPercentFloat: '0.76',
      PercentInsiders: '0.07',
      PercentInstitutions: '0.72',
      ForwardAnnualDividendRate: '0.92',
      ForwardAnnualDividendYield: '0.005',
      PayoutRatio: '0.15',
      DividendDate: '2023-08-17',
      ExDividendDate: '2023-08-10',
      LastSplitFactor: '4:1',
      LastSplitDate: '2020-08-31'
    }
  },
  'microsoft': {
    companyName: 'Microsoft Corporation',
    timestamp: new Date().toISOString(),
    executiveSummary: {
      overview: 'Microsoft Corporation is a global technology company that develops, licenses, and supports software, services, devices, and solutions worldwide.',
      keyFindings: 'Strong cloud business growth with Azure. Diversified revenue streams. Solid financial performance.',
      riskRating: 'Low',
      recommendation: 'Buy'
    },
    financialAnalysis: {
      revenueGrowth: 'Robust growth at 15% annually',
      profitabilityMetrics: 'Strong margins at 35% operating margin',
      balanceSheetAnalysis: 'Excellent balance sheet with $130B in cash and investments',
      cashFlowAnalysis: 'Strong free cash flow of $60B annually',
      peerComparison: 'Leading performance among enterprise software companies'
    },
    marketAnalysis: {
      industryOverview: 'Cloud computing and enterprise software markets growing rapidly',
      competitiveLandscape: 'Major competitors include Amazon, Google, and Oracle',
      swot: {
        strengths: 'Enterprise relationships, cloud infrastructure, diversified business',
        weaknesses: 'Consumer hardware challenges, search market share',
        opportunities: 'AI integration, gaming expansion, cloud growth',
        threats: 'Cloud competition, regulatory concerns, cybersecurity threats'
      },
      marketShare: '20% of global cloud infrastructure market',
      competitiveAdvantages: 'Enterprise relationships, integrated product suite, R&D capabilities'
    },
    riskAssessment: {
      financialRisks: 'Currency fluctuations, tax policy changes',
      operationalRisks: 'Cybersecurity threats, talent acquisition challenges',
      marketRisks: 'Cloud competition, technological disruption',
      regulatoryRisks: 'Antitrust concerns, data privacy regulations',
      esgConsiderations: 'Carbon negative commitment, diversity initiatives, governance structure'
    },
    recentDevelopments: {
      news: [
        {
          title: 'Microsoft Expands AI Capabilities in Azure',
          description: 'Microsoft announced new AI features for its Azure cloud platform.',
          url: 'https://example.com/microsoft-azure-ai',
          publishedAt: '2023-09-05T09:45:00Z',
          source: { name: 'Cloud Computing News' },
          date: '2023-09-05'
        },
        {
          title: 'Microsoft Gaming Division Reports Strong Growth',
          description: 'Microsoft\'s gaming revenue increased 20% following Activision Blizzard acquisition.',
          url: 'https://example.com/microsoft-gaming',
          publishedAt: '2023-08-15T16:30:00Z',
          source: { name: 'Gaming Industry Today' },
          date: '2023-08-15'
        }
      ],
      filings: [
        {
          type: '10-K',
          filingDate: '2023-07-30',
          description: 'Annual report for fiscal year ending June 30, 2023',
          url: 'https://www.sec.gov/example/microsoft-10k',
          date: '2023-07-30'
        },
        {
          type: '8-K',
          filingDate: '2023-06-08',
          description: 'Current report announcing executive changes',
          url: 'https://www.sec.gov/example/microsoft-8k',
          date: '2023-06-08'
        }
      ],
      strategicInitiatives: [
        'Expansion of Azure cloud services',
        'Integration of AI across product lines',
        'Gaming ecosystem development'
      ]
    },
    companyData: {
      Symbol: 'MSFT',
      AssetType: 'Common Stock',
      Name: 'Microsoft Corporation',
      Description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
      Exchange: 'NASDAQ',
      Currency: 'USD',
      Country: 'USA',
      Sector: 'Technology',
      Industry: 'Software—Infrastructure',
      MarketCapitalization: '2500000000000',
      EBITDA: '100000000000',
      PERatio: '35.2',
      PEGRatio: '2.1',
      DividendYield: '0.8',
      EPS: '9.21',
      RevenuePerShareTTM: '28.40',
      ProfitMargin: '0.36',
      OperatingMarginTTM: '0.42',
      ReturnOnAssetsTTM: '0.18',
      ReturnOnEquityTTM: '0.40',
      RevenueTTM: '210000000000',
      GrossProfitTTM: '140000000000',
      DilutedEPSTTM: '9.21',
      QuarterlyEarningsGrowthYOY: '0.15',
      QuarterlyRevenueGrowthYOY: '0.12',
      AnalystTargetPrice: '380',
      TrailingPE: '35.2',
      ForwardPE: '30.5',
      PriceToSalesRatioTTM: '12.1',
      PriceToBookRatio: '15.2',
      EVToRevenue: '11.8',
      EVToEBITDA: '25.1',
      Beta: '0.9',
      WeekHigh52: '380.50',
      WeekLow52: '280.10',
      DayMovingAverage50: '350.20',
      DayMovingAverage200: '320.40',
      SharesOutstanding: '7500000000',
      SharesFloat: '7400000000',
      SharesShort: '50000000',
      SharesShortPriorMonth: '55000000',
      ShortRatio: '1.0',
      ShortPercentOutstanding: '0.67',
      ShortPercentFloat: '0.68',
      PercentInsiders: '0.04',
      PercentInstitutions: '0.75',
      ForwardAnnualDividendRate: '2.72',
      ForwardAnnualDividendYield: '0.008',
      PayoutRatio: '0.28',
      DividendDate: '2023-09-14',
      ExDividendDate: '2023-08-16',
      LastSplitFactor: '2:1',
      LastSplitDate: '2003-02-18'
    }
  },
  // Add more companies as needed
};

// Default fallback report for companies not in our mock data
const defaultReport: DueDiligenceReportType = {
  companyName: '',
  timestamp: new Date().toISOString(),
  executiveSummary: {
    overview: 'This company operates in its respective industry with various products and services.',
    keyFindings: 'Limited data available for comprehensive analysis.',
    riskRating: 'Medium',
    recommendation: 'Hold'
  },
  financialAnalysis: {
    revenueGrowth: 'Data not available',
    profitabilityMetrics: 'Data not available',
    balanceSheetAnalysis: 'Data not available',
    cashFlowAnalysis: 'Data not available',
    peerComparison: 'Data not available'
  },
  marketAnalysis: {
    industryOverview: 'The company operates in its respective industry.',
    competitiveLandscape: 'Various competitors exist in the market.',
    swot: {
      strengths: 'To be determined based on further research',
      weaknesses: 'To be determined based on further research',
      opportunities: 'To be determined based on further research',
      threats: 'To be determined based on further research'
    },
    marketShare: 'Data not available',
    competitiveAdvantages: 'To be determined based on further research'
  },
  riskAssessment: {
    financialRisks: 'Standard industry financial risks apply',
    operationalRisks: 'Standard operational risks apply',
    marketRisks: 'Market volatility and competition',
    regulatoryRisks: 'Industry-specific regulations may apply',
    esgConsiderations: 'ESG profile requires further research'
  },
  recentDevelopments: {
    news: [
      {
        title: 'No recent significant news available',
        description: 'Further research recommended for recent developments',
        url: 'https://example.com',
        publishedAt: new Date().toISOString(),
        source: { name: 'Mock Data' },
        date: new Date().toLocaleDateString()
      }
    ],
    filings: [
      {
        type: 'N/A',
        filingDate: 'N/A',
        description: 'No recent filings data available',
        url: 'https://example.com',
        date: 'N/A'
      }
    ],
    strategicInitiatives: [
      'Data not available'
    ]
  },
  companyData: {
    Symbol: '',
    AssetType: 'Common Stock',
    Name: '',
    Description: 'Company description not available',
    Exchange: '',
    Currency: 'USD',
    Country: '',
    Sector: '',
    Industry: '',
    MarketCapitalization: '0',
    EBITDA: '0',
    PERatio: '0',
    PEGRatio: '0',
    DividendYield: '0',
    EPS: '0',
    RevenuePerShareTTM: '0',
    ProfitMargin: '0',
    OperatingMarginTTM: '0',
    ReturnOnAssetsTTM: '0',
    ReturnOnEquityTTM: '0',
    RevenueTTM: '0',
    GrossProfitTTM: '0',
    DilutedEPSTTM: '0',
    QuarterlyEarningsGrowthYOY: '0',
    QuarterlyRevenueGrowthYOY: '0',
    AnalystTargetPrice: '0',
    TrailingPE: '0',
    ForwardPE: '0',
    PriceToSalesRatioTTM: '0',
    PriceToBookRatio: '0',
    EVToRevenue: '0',
    EVToEBITDA: '0',
    Beta: '0',
    WeekHigh52: '0',
    WeekLow52: '0',
    DayMovingAverage50: '0',
    DayMovingAverage200: '0',
    SharesOutstanding: '0',
    SharesFloat: '0',
    SharesShort: '0',
    SharesShortPriorMonth: '0',
    ShortRatio: '0',
    ShortPercentOutstanding: '0',
    ShortPercentFloat: '0',
    PercentInsiders: '0',
    PercentInstitutions: '0',
    ForwardAnnualDividendRate: '0',
    ForwardAnnualDividendYield: '0',
    PayoutRatio: '0',
    DividendDate: '',
    ExDividendDate: '',
    LastSplitFactor: '',
    LastSplitDate: ''
  }
};

/**
 * Generates a mock due diligence report for testing and demo purposes
 * @param companyName The name of the company to generate a report for
 * @returns A mock due diligence report
 */
export async function generateMockDueDiligenceReport(companyName: string): Promise<DueDiligenceReportType> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data based on company name
  return {
    companyName: companyName,
    timestamp: new Date().toISOString(),
    executiveSummary: {
      overview: `${companyName} is a leading company in its industry with strong financial performance and market position. The company has shown consistent growth over the past years and maintains a competitive edge through innovation and strategic partnerships.`,
      keyFindings: [
        `${companyName} has demonstrated strong revenue growth of approximately 15% year-over-year`,
        "Healthy profit margins compared to industry averages",
        "Solid balance sheet with manageable debt levels",
        "Expanding market share in key regions",
        "Potential regulatory challenges in emerging markets"
      ],
      riskRating: "Medium",
      recommendation: "Consider investment with moderate position sizing due to current market conditions"
    },
    financialAnalysis: {
      metrics: {
        "Revenue Growth": "+15.2%",
        "Profit Margin": "22.4%",
        "Debt-to-Equity": "0.42",
        "Current Ratio": "2.1",
        "Return on Equity": "18.7%",
        "P/E Ratio": "24.3"
      },
      trends: [
        "Consistent revenue growth over the past 5 years",
        "Improving profit margins due to operational efficiencies",
        "Increasing R&D investment as percentage of revenue",
        "Stable dividend payments with moderate growth"
      ],
      strengths: [
        "Strong cash flow generation",
        "Diversified revenue streams",
        "Effective cost management",
        "Strategic acquisition strategy"
      ],
      weaknesses: [
        "Exposure to currency fluctuations",
        "Increasing competition in core markets",
        "Rising raw material costs",
        "Dependence on key suppliers"
      ]
    },
    marketAnalysis: {
      position: `${companyName} holds approximately 18% market share in its primary industry, positioning it among the top three competitors. The company has been gaining market share through product innovation and strategic expansions into emerging markets.`,
      competitors: [
        "Industry Leader Corp",
        "Global Competitor Inc",
        "Emerging Rival Ltd",
        "Regional Player Co"
      ],
      marketShare: "18%",
      swot: {
        strengths: [
          "Strong brand recognition",
          "Innovative product pipeline",
          "Robust distribution network",
          "Customer loyalty programs"
        ],
        weaknesses: [
          "Limited presence in some emerging markets",
          "Product portfolio gaps in certain segments",
          "Higher cost structure than some competitors",
          "Aging infrastructure in some facilities"
        ],
        opportunities: [
          "Expansion into untapped markets",
          "Growing demand for premium products",
          "Strategic partnerships with tech companies",
          "E-commerce channel development"
        ],
        threats: [
          "Increasing regulatory scrutiny",
          "Disruptive technologies",
          "New market entrants",
          "Economic slowdown in key markets"
        ]
      }
    },
    riskAssessment: {
      financial: [
        "Currency exchange rate volatility",
        "Interest rate fluctuations affecting debt servicing",
        "Potential goodwill impairment from past acquisitions",
        "Pension fund obligations"
      ],
      operational: [
        "Supply chain disruptions",
        "Cybersecurity threats",
        "Key personnel retention",
        "Manufacturing capacity constraints"
      ],
      market: [
        "Shifting consumer preferences",
        "Price competition in core markets",
        "Market saturation in developed regions",
        "Substitute products gaining traction"
      ],
      regulatory: [
        "Changing environmental regulations",
        "Data privacy compliance challenges",
        "Antitrust considerations in key markets",
        "Import/export restrictions"
      ],
      esg: [
        "Carbon footprint reduction targets",
        "Supply chain sustainability concerns",
        "Diversity and inclusion initiatives",
        "Corporate governance structure"
      ]
    },
    recentDevelopments: {
      news: [
        {
          title: `${companyName} Announces Expansion into Asian Markets`,
          url: "#",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: "Business News Daily" }
        },
        {
          title: `${companyName} Reports Strong Q2 Earnings`,
          url: "#",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: "Financial Times" }
        },
        {
          title: `${companyName} Launches New Product Line`,
          url: "#",
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: "Industry Today" }
        }
      ],
      filings: [
        {
          type: "10-Q",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Quarterly Report",
          url: "#"
        },
        {
          type: "8-K",
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Material Event",
          url: "#"
        }
      ],
      management: [
        "New Chief Technology Officer appointed",
        "Restructuring of sales organization",
        "Board of Directors expanded with industry experts"
      ],
      strategic: [
        "Five-year growth strategy announced",
        "Digital transformation initiative launched",
        "Sustainability goals established",
        "R&D investment increased by 20%"
      ]
    }
  };
} 