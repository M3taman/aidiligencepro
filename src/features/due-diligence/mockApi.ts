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


// API Keys from environment variables
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || 'demo';
const SEC_API_KEY = import.eVITE_SEC_API_KEY || 'demo';

// Create axios isith defaults
const apiClient = axios.create({
  timeout: 10000,
  headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
  }
});

// Simple cache implementation
const apiCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// API endpoint
const ALPHA_VANTAGE_ENDPOINT = 'https://www.alphavantage.co/query';
const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';
const SEC_API_ENDPOINT = 'hti.sec-api.io';

// Enhanced API fetch hing and retries
async function fetchWithRetry(
  url: string,
  params: Record<string, any>,
  
  Record<string,>
 

retries = 2
 Promise<any> {
  
const cacheKey = `${url}-${JSON.stringify(params)}`;
nst cached = apiCache.get(cacheKey);


if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
return cached.data;


{
const response = await apiClient.get(url, { params });
apiCache.set(cacheKey, {
    data: response.data,
  timestamp: Date.now()
;
turn response.data;
  } carror) {
    retries > 0) {
    nsole.log(`Retrying ${url}... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, params, retries - 1);
    }
    throw error;
  }CompData


ction to fetch company overview from Alpha Vantage
async on fetchCompanyOverview(ticker: string): Promise<CompanyData | null> {
ry {
  cot data = await fetchWithRetry(ALPHA_VANTAGE_ENDPOINT, {
    
  function: 'OVERVIEW',
     s: ticker,
  apik: ALPHA_VANTAGE_API_KEY
;

data && data.Symbol) {
      // numeric strings to numbers
     ret
      Sydata.Symbol,
     Asse: data.AssetType,
    Nameta.Name,
   Descrion: data.Description,
   Excha: data.Exchange,
  Curren: data.Currency,
 Country data.Country,
Sector: data.Sector,
        : data.Industry,
       Mpitalization: Number(data.MarketCapitalization) || 1000000000,
      EBNumber(data.EBITDA) || 100000000,
     PER Number(data.PERatio) || 15,
    PEGR: Number(data.PEGRatio) || 1.5,
    Booke: Number(data.BookValue) || 50,
        PerShare: Number(data.DividendPerShare) || 1,dthYOY) || 0.05,
        AnalystTargetPrice: Number(data.AnalystTargetPrice) || 150,
        TrailingPE: Number(data.TrailingPE) || 15,
        ForwardPE: Number(data.ForwardPE) || 15,
        PriceToSalesRatioTTM: Number(data.PPriceToSalesRatioTTM) || 5,
        PriceToBookRatio: Number(data.PriceToBookRatio) || 5,
        EVToRevenue: Number(data.EVToRevenue) || 5,
        EVToEBITDA: Number(data.EVToEBITDA) || 10,
        Beta: Number(data.Beta) || 1.1,
        '52WeekHigh': Number(data['52WeekHigh']) || 200,
        '52WeekLow': Number(data['52WeekLow']) || 100,
        '50DayMovingAverage': Number(data['50DayMovingAverage']) || 150,
        '200DayMovingAverage': Number(data['200DayMovingAverage']) || 140,
        SharesOutstanding: Number(data.SharesOutstanding) || 1000000000,
        DividendDate: data.DividendDate || '2025-04-15',
        ExDividendDate: data.ExDividendDate || '2025-03-30'
      };
    }
    // If data doesn't contain Symbol, return null to trigger fallback
    console.log('Could not fetch company data for ' + ticker + ', using generated data');
    return null;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    // Return null to trigger fallback mode
    return null;
  }
}

// Function to fetch company news
async function fetchCompanyNews(companyName: string): Promise<any[]> {
  try {
    const response = await axios.get(NEWS_API_ENDPOINT, {
      params: {
        q: companyName,
        from: '2025-03-01',
        to: '2025-03-30',
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY
      }
    });
    
    if (response.data && response.data.articles) {
      return response.data.articles.map((article: any) => ({
        title: article.title,
        date: new Date(article.publishedAt).toISOString().split('T')[0],
        summary: article.description,
        url: article.url
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}

// Function to fetch SEC filings
async function fetchSECFilings(ticker: string): Promise<any[]> {
  try {
    const response = await axios.get(`${SEC_API_ENDPOINT}/filings`, {
      params: {
        ticker: ticker,
        from: '2025-01-01',
        to: '2025-03-30',
        token: SEC_API_KEY
      }
    });
    
    if (response.data && response.data.filings) {
      return response.data.filings.map((filing: any) => ({
        type: filing.formType,
        date: filing.filedAt.split('T')[0],
        description: `${filing.formType} filing for period ending ${filing.periodOfReport}`,
        url: filing.linkToFilingDetails
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
    return [];
  }
}

// Mock data for Apple (AAPL)
const mockAppleReport: DueDiligenceReportType = {
  companyName: 'Apple Inc. (AAPL)',
  companyData: {
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    industry: 'Consumer Electronics',
    sector: 'Technology',
    marketCap: 2850000000000, // $2.85 trillion
    employees: 164000,
    founded: 1976,
    ceo: 'Tim Cook',
    headquarters: 'Cupertino, California, USA',
    website: 'https://www.apple.com'
  },
  executiveSummary: {
    overview: 'Apple Inc. continues to demonstrate strong financial performance and market leadership in the consumer electronics and services sectors. The company maintains a robust balance sheet with significant cash reserves and consistent revenue growth, particularly in its services segment.',
    keyFindings: [
      'Strong financial position with over $200 billion in cash and marketable securities',
      'Continued growth in high-margin services revenue (App Store, Apple Music, Apple TV+)',
      'Robust ecosystem creating high customer retention and recurring revenue',
      'Potential risks from regulatory scrutiny and supply chain dependencies'
    ],
    riskRating: 'Low',
    recommendation: 'Apple represents a stable investment with strong fundamentals and consistent returns to shareholders through dividends and share repurchases.'
  },
  financialAnalysis: {
    overview: 'Apple maintains exceptional financial health with industry-leading margins, strong cash flow generation, and a robust balance sheet. The company continues to return significant capital to shareholders while investing in future growth opportunities.',
    metrics: {
      'Market Cap': '$2.85 trillion',
      'Revenue (TTM)': '$383.3 billion',
      'Net Income': '$96.9 billion',
      'Profit Margin': '25.3%',
      'P/E Ratio': '29.4',
      'EPS (TTM)': '$6.14',
      'Dividend Yield': '0.52%',
      'Cash & Equivalents': '$205.1 billion',
      'Total Debt': '$120.0 billion',
      'Debt-to-Equity': '1.52',
      'Return on Equity': '160.1%',
      'Return on Assets': '28.4%',
      'Current Ratio': '0.99',
      'Quick Ratio': '0.92',
      'Operating Margin': '30.1%',
      'Free Cash Flow (TTM)': '$110.5 billion'
    },
    trends: 'Apple has demonstrated consistent revenue growth over the past five years, with services revenue growing at a faster rate than hardware. Gross margins have improved as the revenue mix shifts toward higher-margin services. The company continues to generate substantial free cash flow, allowing for significant shareholder returns.',
    strengths: [
      'Exceptional cash flow generation and capital return program',
      'Growing high-margin services business',
      'Strong brand value and customer loyalty',
      'Vertical integration of hardware, software, and services'
    ],
    weaknesses: [
      'Dependence on iPhone for majority of revenue',
      'Exposure to supply chain disruptions',
      'Increasing regulatory scrutiny in key markets',
      'Slowing growth in mature smartphone market'
    ]
  },
  marketAnalysis: {
    overview: 'Apple maintains dominant positions in premium smartphones, tablets, and wearables while expanding its ecosystem through services. The company leverages its brand strength and ecosystem integration to maintain premium pricing and customer loyalty.',
    position: 'Apple holds a dominant position in the premium segment of several hardware categories and is rapidly expanding its services ecosystem. While not always the market share leader by volume, Apple captures the majority of industry profits in smartphones and maintains strong positions in tablets, wearables, and personal computers.',
    competitors: [
      {
        name: 'Samsung Electronics',
        strengths: 'Vertical integration, component manufacturing, diverse product portfolio',
        weaknesses: 'Lower software/services integration, lower profit margins than Apple'
      },
      {
        name: 'Microsoft',
        strengths: 'Enterprise software dominance, cloud services, subscription revenue model',
        weaknesses: 'Limited hardware ecosystem compared to Apple'
      },
      {
        name: 'Alphabet (Google)',
        strengths: 'Android OS market share, search and advertising dominance, AI capabilities',
        weaknesses: 'Less hardware/software integration, privacy concerns'
      },
      {
        name: 'Amazon',
        strengths: 'E-commerce platform, AWS cloud services, smart home devices',
        weaknesses: 'Limited premium hardware presence, thinner margins'
      }
    ],
    swot: {
      strengths: [
        'Strong brand recognition and customer loyalty',
        'Seamless integration across hardware, software, and services',
        'Premium pricing power and high margins',
        'Robust research and development capabilities'
      ],
      weaknesses: [
        'Premium pricing limits market share in developing markets',
        'Reliance on iPhone for majority of revenue',
        'Limited presence in enterprise solutions compared to competitors',
        'Closed ecosystem approach limits certain partnerships'
      ],
      opportunities: [
        'Expansion into healthcare technology and services',
        'Growth in wearables and augmented reality',
        'Further penetration of financial services through Apple Pay',
        'Emerging markets growth with targeted products'
      ],
      threats: [
        'Increasing regulatory scrutiny and potential antitrust actions',
        'Rrising competition in services (streaming, gaming)',
        'Geopolitical tensions affecting global supply chain',
        'Saturation in key product categories'
      ]
    }
  },
  riskAssessment: {
    overview: 'Apple faces several key risk categories, though its financial strength and market position mitigate many concerns. The primary risks include regulatory challenges, supply chain dependencies, and market saturation in key product categories.',
    riskRating: 'low',
    financial: 'Apple faces minimal financial risk due to its strong balance sheet, consistent cash flow generation, and conservative financial management. The company maintains significant cash reserves and manageable debt levels.',
    operational: 'Supply chain concentration in China and other Asian countries presents operational risk, as demonstrated during recent global disruptions. Apple is gradually diversifying manufacturing locations to mitigate this risk.',
    market: 'Market saturation in smartphones and potential commoditization of hardware present long-term market risks. Apple mitigates these through ecosystem lock-in, services growth, and continuous innovation in new product categories.',
    regulatory: 'Apple faces increasing regulatory scrutiny regarding App Store policies, competitive practices, and data privacy. Potential forced changes to business practices, particularly regarding the App Store commission structure, could impact services revenue growth.',
    esgConsiderations: 'Apple has made significant commitments to environmental sustainability, including carbon neutrality goals and reduced packaging. Labor practices in the supply chain remain an ongoing area of focus for improvement and monitoring.',
    riskFactors: {
      financial: [
        'Foreign exchange fluctuations impacting international revenue',
        'Tax policy changes in major markets',
        'Potential goodwill impairment from acquisitions'
      ],
      operational: [
        'Supply chain disruptions due to geopolitical tensions',
        'Manufacturing concentration in specific regions',
        'Intellectual property theft or infringement',
        'Talent retention in competitive tech labor market'
      ],
      market: [
        'Smartphone market saturation',
        'Intensifying competition in services',
        'Rapid technological change requiring continuous innovation',
        'Changing consumer preferences'
      ],
      regulatory: [
        'Antitrust investigations in US and EU',
        'App Store commission structure scrutiny',
        'Data privacy regulations',
        'Digital services taxes in multiple jurisdictions'
      ],
      esg: [
        'Supply chain labor practices',
        'Electronic waste management',
        'Carbon footprint of manufacturing operations',
        'Product repairability concerns'
      ]
    }
  },
  recentDevelopments: {
    news: [
      {
        title: 'Apple Announces New iPhone 15 Pro with Titanium Design',
        date: '2023-09-12',
        summary: 'Apple unveiled its latest flagship smartphone featuring a titanium frame, improved camera system, and A17 Pro chip manufactured with 3nm process technology.',
        url: 'https://www.apple.com/newsroom/'
      },
      {
        title: 'Services Revenue Reaches All-Time High in Q3 2023',
        date: '2023-08-03',
        summary: 'Apple reported record services revenue of $21.2 billion for the quarter, representing 16% year-over-year growth and highlighting the success of the company\'s subscription strategy.',
        url: 'https://www.apple.com/investor/'
      },
      {
        title: 'Apple Vision Pro Set to Launch in Early 2024',
        date: '2023-06-05',
        summary: 'Apple announced its entry into the spatial computing category with Vision Pro, a mixed reality headset priced at $3,499 that blends digital content with the physical world.',
        url: 'https://www.apple.com/apple-vision-pro/'
      }
    ],
    filings: [
      {
        type: '10-Q Quarterly Report',
        date: '2023-07-28',
        description: 'Quarterly financial results showing $81.8 billion in revenue and $19.9 billion in net income for fiscal Q3 2023.',
        url: 'https://investor.apple.com/sec-filings/'
      },
      {
        type: 'Proxy Statement',
        date: '2023-01-12',
        description: 'Annual proxy statement detailing executive compensation, board matters, and shareholder proposals for the annual meeting.',
        url: 'https://investor.apple.com/sec-filings/'
      }
    ],
    strategic: [
      {
        title: 'Apple Intelligence AI Strategy',
        date: '2023-06-05',
        summary: 'Apple announced its comprehensive AI strategy focusing on on-device processing for privacy, including enhanced Siri capabilities and system-wide intelligence features coming to iOS 18.',
      },
      {
        title: 'Manufacturing Diversification Initiative',
        date: '2023-04-18',
        summary: 'Apple continues to expand manufacturing beyond China, with new facilities in India and Vietnam coming online to reduce geographic concentration risk.',
      },
      {
        title: 'Carbon Neutrality Commitment',
        date: '2022-10-13',
        summary: 'Apple reaffirmed its commitment to become carbon neutral across its entire business, manufacturing supply chain, and product life cycle by 2030.',
      }
    ]
  },
  conclusion: 'Apple Inc. maintains its position as one of the world\'s most valuable companies with strong fundamentals, a loyal customer base, and an expanding ecosystem of products and services. While facing challenges from market saturation, regulatory scrutiny, and supply chain dependencies, the company\'s financial strength, brand power, and innovation capabilities provide significant competitive advantages. Apple\'s growing services segment, expansion into new product categories, and focus on privacy and sustainability align well with current market trends and consumer preferences. For investors, Apple represents a relatively stable investment with a balanced mix of growth potential and capital return through dividends and share repurchases.'
};

// Mock data for Microsoft (MSFT)
const mockMicrosoftReport: DueDiligenceReportType = {
  companyName: 'Microsoft Corporation (MSFT)',
  companyData: {
    ticker: 'MSFT',
    exchange: 'NASDAQ',
    industry: 'Software',
    sector: 'Technology',
    marketCap: 2500000000000, // $2.5 trillion
    employees: 180000,
    founded: 1975,
    ceo: 'Satya Nadella',
    headquarters: 'Redmond, Washington, USA',
    website: 'https://www.microsoft.com'
  },
  executiveSummary: {
    overview: 'Microsoft Corporation continues to demonstrate strong financial performance and market leadership in the software and cloud services sectors. The company maintains a robust balance sheet with significant cash reserves and consistent revenue growth, particularly in its cloud services segment.',
    keyFindings: [
      'Strong financial position with over $130 billion in cash and marketable securities',
      'Continued growth in high-margin cloud services revenue (Azure, Office 365)',
      'Robust ecosystem creating high customer retention and recurring revenue',
      'Potential risks from increasing competition in cloud services'
    ],
    riskRating: 'Low',
    recommendation: 'Microsoft represents a stable investment with strong fundamentals and consistent returns to shareholders through dividends and share repurchases.'
  },
  financialAnalysis: {
    overview: 'Microsoft maintains exceptional financial health with industry-leading margins, strong cash flow generation, and a robust balance sheet. The company continues to return significant capital to shareholders while investing in future growth opportunities.',
    metrics: {
      'Market Cap': '$2.5 trillion',
      'Revenue (TTM)': '$211.9 billion',
      'Net Income': '$72.4 billion',
      'Profit Margin': '34.2%',
      'P/E Ratio': '34.8',
      'EPS (TTM)': '$9.65',
      'Dividend Yield': '0.81%',
      'Cash & Equivalents': '$111.3 billion',
      'Total Debt': '$70.0 billion',
      'Debt-to-Equity': '0.83',
      'Return on Equity': '43.2%',
      'Return on Assets': '14.1%',
      'Current Ratio': '2.53',
      'Quick Ratio': '2.46',
      'Operating Margin': '42.1%',
      'Free Cash Flow (TTM)': '$63.1 billion'
    },
    trends: 'Microsoft has demonstrated consistent revenue growth over the past five years, with cloud services revenue growing at a faster rate than traditional software. Gross margins have improved as the revenue mix shifts toward higher-margin cloud services. The company continues to generate substantial free cash flow, allowing for significant shareholder returns.',
    strengths: [
      'Exceptional cash flow generation and capital return program',
      'Growing high-margin cloud services business',
      'Strong brand value and customer loyalty',
      'Vertical integration of software and services'
    ],
    weaknesses: [
      'Dependence on Windows and Office for majority of revenue',
      'Exposure to competition in cloud services',
      'Increasing regulatory scrutiny in key markets',
      'Slowing growth in mature software market'
    ]
  },
  marketAnalysis: {
    overview: 'Microsoft maintains dominant positions in enterprise software and cloud services while expanding its ecosystem through strategic acquisitions and partnerships. The company leverages its brand strength and ecosystem integration to maintain premium pricing and customer loyalty.',
    position: 'Microsoft holds a dominant position in the enterprise software market and is rapidly expanding its cloud services ecosystem. While facing challenges from increasing competition in cloud services, the company\'s financial strength, brand power, and innovation capabilities provide significant competitive advantages.',
    competitors: [
      {
        name: 'Amazon Web Services (AWS)',
        strengths: 'Market share leadership in cloud infrastructure, diverse product portfolio',
        weaknesses: 'Lower profit margins compared to Microsoft'
      },
      {
        name: 'Alphabet (Google)',
        strengths: 'Search and advertising dominance, AI capabilities',
        weaknesses: 'Less enterprise software presence compared to Microsoft'
      },
      {
        name: 'Apple',
        strengths: 'Strong brand recognition and customer loyalty, premium pricing power',
        weaknesses: 'Limited enterprise software presence compared to Microsoft'
      },
      {
        name: 'Oracle',
        strengths: 'Enterprise software dominance, cloud services growth',
        weaknesses: 'Lower profit margins compared to Microsoft'
      }
    ],
    swot: {
      strengths: [
        'Strong brand recognition and customer loyalty',
        'Seamless integration across software and services',
        'Premium pricing power and high margins',
        'Robust research and development capabilities'
      ],
      weaknesses: [
        'Dependence on Windows and Office for majority of revenue',
        'Exposure to competition in cloud services',
        'Increasing regulatory scrutiny in key markets',
        'Slowing growth in mature software market'
      ],
      opportunities: [
        'Expansion into emerging markets',
        'Growth in cloud services and artificial intelligence',
        'Further penetration of gaming market through Xbox',
        'Strategic acquisitions and partnerships'
      ],
      threats: [
        'Increasing competition in cloud services',
        'Rising regulatory scrutiny in key markets',
        'Geopolitical tensions affecting global supply chain',
        'Saturation in key product categories'
      ]
    }
  },
  riskAssessment: {
    overview: 'Microsoft faces several key risk categories, though its financial strength and market position mitigate many concerns. The primary risks include regulatory challenges, competition in cloud services, and market saturation in key product categories.',
    riskRating: 'low',
    financial: 'Microsoft faces minimal financial risk due to its strong balance sheet, consistent cash flow generation, and conservative financial management. The company maintains significant cash reserves and manageable debt levels.',
    operational: 'Supply chain concentration in Asia presents operational risk, as demonstrated during recent global disruptions. Microsoft is gradually diversifying manufacturing locations to mitigate this risk.',
    market: 'Market saturation in software and potential commoditization of cloud services present long-term market risks. Microsoft mitigates these through ecosystem lock-in, cloud services growth, and continuous innovation in new product categories.',
    regulatory: 'Microsoft faces increasing regulatory scrutiny regarding antitrust practices, data privacy, and cybersecurity. Potential forced changes to business practices could impact revenue growth.',
    esgConsiderations: 'Microsoft has made significant commitments to environmental sustainability, including carbon neutrality goals and reduced packaging. Labor practices in the supply chain remain an ongoing area of focus for improvement and monitoring.',
    riskFactors: {
      financial: [
        'Foreign exchange fluctuations impacting international revenue',
        'Tax policy changes in major markets',
        'Potential goodwill impairment from acquisitions'
      ],
      operational: [
        'Supply chain disruptions due to geopolitical tensions',
        'Manufacturing concentration in specific regions',
        'Intellectual property theft or infringement',
        'Talent retention in competitive tech labor market'
      ],
      market: [
        'Cloud services competition',
        'Intensifying competition in software',
        'Rapid technological change requiring continuous innovation',
        'Changing consumer preferences'
      ],
      regulatory: [
        'Antitrust investigations in US and EU',
        'Data privacy regulations',
        'Cybersecurity requirements',
        'Digital services taxes in multiple jurisdictions'
      ],
      esg: [
        'Supply chain labor practices',
        'Electronic waste management',
        'Carbon footprint of manufacturing operations',
        'Product repairability concerns'
      ]
    }
  },
  recentDevelopments: {
    news: [
      {
        title: 'Microsoft Announces New Azure AI Capabilities',
        date: '2023-09-12',
        summary: 'Microsoft unveiled new AI features for Azure, enhancing machine learning capabilities for enterprise customers.',
        url: 'https://www.microsoft.com/en-us/azure/ai'
      },
      {
        title: 'Cloud Revenue Surges in Latest Quarter',
        date: '2023-07-25',
        summary: 'Microsoft reported 27% growth in Azure revenue, exceeding analyst expectations.',
        url: 'https://www.microsoft.com/investor'
      },
      {
        title: 'Microsoft Completes Acquisition of Activision Blizzard',
        date: '2023-10-13',
        summary: 'The $68.7 billion acquisition strengthens Microsoft\'s position in the gaming market.',
        url: 'https://www.microsoft.com/en-us/news/press/2023/oct23/activisionblizzard.aspx'
      }
    ],
    filings: [
      {
        type: '10-Q Quarterly Report',
        date: '2023-07-27',
        description: 'Quarterly financial results showing $56.2 billion in revenue and $20.1 billion in net income for fiscal Q4 2023.',
        url: 'https://www.microsoft.com/investor/sec-filings.aspx'
      },
      {
        type: 'Proxy Statement',
        date: '2023-09-19',
        description: 'Annual proxy statement detailing executive compensation, board matters, and shareholder proposals for the annual meeting.',
        url: 'https://www.microsoft.com/investor/sec-filings.aspx'
      }
    ],
    strategic: [
      {
        title: 'Microsoft AI Strategy',
        date: '2023-06-05',
        summary: 'Microsoft announced its comprehensive AI strategy focusing on on-device processing for privacy, including enhanced AI capabilities in Azure and Office 365.',
      },
      {
        title: 'Gaming Expansion through Activision Blizzard Acquisition',
        date: '2023-10-13',
        summary: 'Microsoft completed the acquisition of Activision Blizzard, expanding its gaming ecosystem and strengthening its position in the market.',
      },
      {
        title: 'Carbon Neutrality Commitment',
        date: '2022-10-13',
        summary: 'Microsoft reaffirmed its commitment to become carbon neutral across its entire business, manufacturing supply chain, and product life cycle by 2030.',
      }
    ]
  },
  conclusion: 'Microsoft Corporation maintains its position as one of the world\'s most valuable companies with strong fundamentals, a loyal customer base, and an expanding ecosystem of software and services. While facing challenges from increasing competition in cloud services, regulatory scrutiny, and market saturation in key product categories, the company\'s financial strength, brand power, and innovation capabilities provide significant competitive advantages. Microsoft\'s growing cloud services segment, expansion into new product categories, and focus on sustainability align well with current market trends and consumer preferences. For investors, Microsoft represents a relatively stable investment with a balanced mix of growth potential and capital return through dividends and share repurchases.'
};

// Sample mock data for a due diligence report
const mockReportData: Record<string, DueDiligenceReportType> = {
  'apple': mockAppleReport,
  'microsoft': mockMicrosoftReport
};

// Default fallback report for companies not in our mock data
const defaultReport: DueDiligenceReportType = {
  companyName: '',
  ticker: '',
  timestamp: Date.now(),
  executiveSummary: {
    overview: 'This is a demo report with placeholder data. In a real report, this section would contain a concise summary of the company\'s financial health, market position, and key risks.',
    keyFindings: [
      'This is a demo report with placeholder data',
      'In a real report, these would be key findings about the company',
      'Subscribe to access full reports with real data',
      'Our AI analyzes thousands of data points to generate insights',
      'Upgrade to see comprehensive analysis and recommendations'
    ],
    riskRating: 'Demo data only',
    recommendation: 'This is a demo report. Subscribe to access full reports with actionable recommendations.'
  },
  financialAnalysis: {
    overview: 'This section would contain a detailed analysis of the company\'s financial performance, including revenue trends, profitability, balance sheet strength, and cash flow analysis.',
    metrics: {
      'Revenue': 'Demo data',
      'Profit Margin': 'Demo data',
      'EPS': 'Demo data',
      'P/E Ratio': 'Demo data',
      'Market Cap': 'Demo data',
      'Debt-to-Equity': 'Demo data'
    },
    trends: 'In a real report, this section would analyze revenue and earnings trends over time, highlighting key drivers and potential concerns.',
    strengths: [
      'This is placeholder data for demonstration purposes',
      'Real reports include actual financial strengths',
      'Subscribe to access comprehensive analysis'
    ],
    weaknesses: [
      'This is placeholder data for demonstration purposes',
      'Real reports include actual financial weaknesses',
      'Subscribe to access comprehensive analysis'
    ]
  },
  marketAnalysis: {
    overview: 'This section would analyze the company\'s market position, competitive landscape, industry trends, and growth opportunities.',
    position: 'In a real report, this would describe the company\'s position within its industry.',
    competitors: [
      'Competitor 1 (Demo)',
      'Competitor 2 (Demo)',
      'Competitor 3 (Demo)',
      'Competitor 4 (Demo)',
      'Competitor 5 (Demo)'
    ],
    swot: {
      strengths: 'In a real report, this would list the company\'s competitive strengths',
      weaknesses: 'In a real report, this would identify competitive weaknesses',
      opportunities: 'In a real report, this would highlight market opportunities',
      threats: 'In a real report, this would outline competitive and market threats'
    },
    marketShare: 'This is a demo report. Subscribe to access actual market share data and analysis.',
    competitiveAdvantages: 'This is a demo report. Real reports include detailed analysis of competitive advantages.'
  },
  riskAssessment: {
    overview: 'This section would identify and analyze key risks facing the company, including financial, operational, market, and regulatory risks.',
    financial: 'In a real report, this would detail financial risks such as debt levels, liquidity concerns, or currency exposure.',
    operational: 'In a real report, this would cover operational risks such as supply chain vulnerabilities or production challenges.',
    market: 'In a real report, this would address market risks such as changing consumer preferences or competitive pressures.',
    regulatory: 'In a real report, this would outline regulatory risks such as pending legislation or compliance challenges.',
    esgConsiderations: 'In a real report, this would analyze environmental, social, and governance factors that could impact the company.',
    riskFactors: {
      financial: [
        'Demo risk factor 1',
        'Demo risk factor 2',
        'Demo risk factor 3'
      ],
      operational: [
        'Demo risk factor 1',
        'Demo risk factor 2',
        'Demo risk factor 3'
      ],
      market: [
        'Demo risk factor 1',
        'Demo risk factor 2',
        'Demo risk factor 3'
      ],
      regulatory: [
        'Demo risk factor 1',
        'Demo risk factor 2',
        'Demo risk factor 3'
      ],
      esg: [
        'Demo risk factor 1',
        'Demo risk factor 2',
        'Demo risk factor 3'
      ]
    }
  },
  recentDevelopments: {
    news: [
      {
        title: 'Demo News Article 1',
        date: '2025-10-15',
        summary: 'This is a placeholder for a real news article. Subscribe to access actual recent news and analysis.',
        url: '#'
      },
      {
        title: 'Demo News Article 2',
        date: '2025-10-10',
        summary: 'This is a placeholder for a real news article. Subscribe to access actual recent news and analysis.'
      },
      {
        title: 'Demo News Article 3',
        date: '2025-10-05',
        summary: 'This is a placeholder for a real news article. Subscribe to access actual recent news and analysis.'
      }
    ],
    filings: [
      {
        type: 'Demo Filing',
        date: '2025-09-30',
        description: 'This is a placeholder for actual SEC filings. Subscribe to access real filing data and analysis.'
      },
      {
        type: 'Demo Filing',
        date: '2025-09-15',
        description: 'This is a placeholder for actual SEC filings. Subscribe to access real filing data and analysis.'
      }
    ],
    strategic: [
      'This is a demo report with placeholder data',
      'Real reports include actual strategic initiatives',
      'Subscribe to access comprehensive analysis'
    ]
  },
  conclusion: 'This is a demo report with placeholder data. Subscribe to access full reports with comprehensive analysis and actionable recommendations based on real data.',
  generatedAt: new Date().toISOString()
};

// Generates a due diligence report using real data when possible, falling back to mock data when needed
// @param companyName The name of the company to generate a report for
// @param useRealData Whether to generate real-like data (for trial users) or demo data
// @returns A due diligence report with real or mock data
export const generateMockDueDiligenceReport = async (companyName: string, useRealData: boolean = false): Promise<DueDiligenceReportType> => {
  // Simulate API delay for demo mode
  if (!useRealData) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      ...defaultReport,
      companyName: companyName,
      timestamp: Date.now()
    };
  }
  
  // For real data mode, attempt to fetch actual data
  try {
    console.log(`Generating report for ${companyName} with real data`);
    
    // Normalize company name for lookup
    const normalizedCompany = companyName.toLowerCase().trim();
    
    // Check if we have mock data for this company
    if (normalizedCompany === 'apple') {
      console.log(`Using enhanced mock data for ${companyName}`);
      return {
        ...mockAppleReport,
        timestamp: Date.now()
      };
    } else if (normalizedCompany === 'microsoft') {
      console.log(`Using enhanced mock data for ${companyName}`);
      return {
        ...mockMicrosoftReport,
        timestamp: Date.now()
      };
    }
    
    // Try to determine ticker symbol
    let ticker = companyName.substring(0, 4).toUpperCase();
    if (companyName.includes('(') && companyName.includes(')')) {
      // Extract ticker from format "Company Name (TICK)"
      ticker = companyName.split('(')[1].split(')')[0].trim();
    }
    
    // Attempt to fetch company data from Alpha Vantage
    const companyData = await fetchCompanyOverview(ticker);
    
    if (companyData) {
      console.log(`Successfully fetched company data for ${ticker}`);
      
      // Fetch news articles
      const newsArticles = await fetchCompanyNews(companyName);
      
      // Fetch SEC filings
      const secFilings = await fetchSECFilings(ticker);
      
      // Generate a report based on the real data
      return {
        companyName: companyData.Name || companyName,
        ticker: companyData.Symbol || ticker,
        timestamp: Date.now(),
        companyData,
        executiveSummary: {
          overview: companyData.Description || `${companyName} is a company operating in the ${companyData.Industry || 'technology'} industry.`,
          keyFindings: [
            `Market capitalization of $${(companyData.MarketCapitalization / 1000000000).toFixed(2)} billion`,
            `P/E ratio of ${companyData.PERatio.toFixed(2)}`,
            `EPS of $${companyData.EPS.toFixed(2)}`,
            `Profit margin of ${(companyData.ProfitMargin * 100).toFixed(2)}%`,
            `Quarterly earnings growth YOY of ${(companyData.QuarterlyEarningsGrowthYOY * 100).toFixed(2)}%`
          ],
          riskRating: companyData.Beta > 1.5 ? 'High' : companyData.Beta > 1 ? 'Medium' : 'Low',
          recommendation: `Based on our analysis, ${companyName} presents a ${companyData.Beta > 1.5 ? 'high-risk, high-reward' : companyData.Beta > 1 ? 'moderate' : 'conservative'} investment opportunity.`
        },
        financialAnalysis: {
          overview: `${companyName} demonstrates ${companyData.QuarterlyEarningsGrowthYOY > 0 ? 'positive' : 'challenging'} financial performance with ${companyData.QuarterlyEarningsGrowthYOY > 0 ? 'growth' : 'decline'} in quarterly earnings.`,
          metrics: {
            'Revenue (TTM)': `$${(companyData.MarketCapitalization / 1000000000).toFixed(2)} billion`,
            'Gross Margin': `${(companyData.ProfitMargin * 1.5 * 100).toFixed(2)}% (estimated)`,
            'Operating Margin': `${(companyData.ProfitMargin * 1.2 * 100).toFixed(2)}% (estimated)`,
            'Net Income': `$${(companyData.MarketCapitalization * companyData.ProfitMargin / 1000000000).toFixed(2)} billion (estimated)`,
            'EPS (TTM)': `$${companyData.EPS.toFixed(2)}`,
            'P/E Ratio': `${companyData.PERatio.toFixed(2)}`,
            'Market Cap': `$${(companyData.MarketCapitalization / 1000000000).toFixed(2)} billion`,
            'Cash & Equivalents': `$${(companyData.MarketCapitalization * 0.1 / 1000000000).toFixed(2)} billion (estimated)`
          },
          trends: `${companyName} has shown ${companyData.QuarterlyEarningsGrowthYOY > 0 ? 'positive' : 'negative'} earnings growth of ${(companyData.QuarterlyEarningsGrowthYOY * 100).toFixed(2)}% year-over-year, with revenue growth at ${(companyData.QuarterlyRevenueGrowthYOY * 100).toFixed(2)}%.`,
          strengths: [
            companyData.ProfitMargin > 0.2 ? 'Strong profit margins compared to industry peers' : 'Reasonable profit margins given industry conditions',
            companyData.QuarterlyEarningsGrowthYOY > 0 ? 'Positive earnings growth trajectory' : 'Cost management initiatives in place to address earnings challenges',
            companyData.DividendYield > 0.02 ? 'Attractive dividend yield for income investors' : 'Balanced approach to capital allocation',
            companyData.PEGRatio < 1.5 ? 'Favorable PEG ratio indicating reasonable valuation relative to growth' : 'Ongoing investments in future growth opportunities'
          ],
          weaknesses: [
            companyData.ProfitMargin < 0.15 ? 'Below-average profit margins compared to industry leaders' : 'Potential margin pressure from increasing competition',
            companyData.QuarterlyEarningsGrowthYOY < 0 ? 'Recent earnings decline requiring management attention' : 'Potential growth deceleration in mature markets',
            companyData.Beta > 1.2 ? 'Higher volatility than market average' : 'Limited exposure to high-growth emerging markets',
            companyData.PERatio > 25 ? 'Relatively high valuation multiples' : 'Moderate growth expectations priced into current valuation'
          ]
        },
        marketAnalysis: {
          overview: `${companyName} operates in the ${companyData.Industry} industry within the ${companyData.Sector} sector, facing both opportunities and challenges in its competitive landscape.`,
          position: `${companyName} holds a ${companyData.MarketCapitalization > 100000000000 ? 'significant' : 'moderate'} position in the ${companyData.Industry} market, with opportunities for ${companyData.QuarterlyRevenueGrowthYOY > 0.1 ? 'continued expansion' : 'stabilization and targeted growth'}.`,
          competitors: getCompetitorsByIndustry(companyData.Industry),
          swot: {
            strengths: [
              `Strong brand recognition in ${companyData.Industry}`,
              companyData.ProfitMargin > 0.2 ? 'Industry-leading profit margins' : 'Established market presence',
              companyData.QuarterlyEarningsGrowthYOY > 0.1 ? 'Exceptional recent growth performance' : 'Stable business model'
            ],
            weaknesses: [
              companyData.Beta > 1.5 ? 'Higher volatility than industry average' : 'Moderate competitive pressures',
              companyData.QuarterlyEarningsGrowthYOY < 0 ? 'Recent performance challenges' : 'Ongoing need for innovation to maintain position',
              companyData.PERatio > 30 ? 'Premium valuation requiring consistent execution' : 'Market expectations aligned with historical performance'
            ],
            opportunities: [
              `Expansion in ${companyData.Sector} adjacent markets`,
              'Digital transformation initiatives',
              'Strategic partnerships',
              'Product innovation and diversification'
            ],
            threats: [
              'Increasing competition from established players',
              'New market entrants',
              'Margin pressure',
              'Changing customer preferences'
            ]
          }
        },
        riskAssessment: {
          overview: `${companyName} faces several key risks that could impact its business performance and market position.`,
          financial: `Financial risks include ${companyData.Beta > 1.5 ? 'higher than average market volatility' : 'moderate market sensitivity'}, with a beta of ${companyData.Beta.toFixed(2)}.`,
          operational: `Operational risks include typical challenges in the ${companyData.Industry} industry, including supply chain management, talent acquisition, and technology infrastructure.`,
          market: `Market risks stem from competitive pressures in the ${companyData.Industry} space, with potential for disruption from new entrants and changing customer preferences.`,
          regulatory: `Regulatory risks include industry-specific compliance requirements, potential policy changes affecting the ${companyData.Sector} sector, and evolving standards.`,
          esgConsiderations: 'Environmental, social, and governance factors are increasingly important to investors and customers, requiring ongoing attention and transparent reporting.',
          riskFactors: {
            financial: [
              companyData.Beta > 1.5 ? 'High market volatility' : 'Moderate market sensitivity',
              'Currency exchange exposure in international markets',
              companyData.DividendYield > 0 ? 'Dividend sustainability considerations' : 'Capital allocation priorities'
            ],
            operational: [
              'Supply chain resilience',
              'Talent acquisition and retention',
              'Technology infrastructure and cybersecurity',
              'Intellectual property protection'
            ],
            market: [
              'Competitive pressure from established players',
              'Emerging market entrants with disruptive models',
              'Shifting customer preferences and expectations',
              'Product lifecycle management'
            ],
            regulatory: [
              `${companyData.Sector}-specific regulations`,
              'Data privacy and protection requirements',
              'International trade policies',
              'Environmental compliance standards'
            ],
            esg: [
              'Carbon footprint reduction initiatives',
              'Diversity and inclusion practices',
              'Corporate governance standards',
              'Supply chain sustainability'
            ]
          }
        },
        recentDevelopments: {
          news: newsArticles.length > 0 ? newsArticles : [
            {
              title: `${companyName} Reports Q1 2025 Financial Results`,
              date: '2025-03-15',
              summary: `${companyName} announced quarterly results with revenue of $${(companyData.MarketCapitalization * 0.05 / 1000000000).toFixed(2)} billion, representing a ${(companyData.QuarterlyRevenueGrowthYOY * 100).toFixed(1)}% increase year-over-year.`
            },
            {
              title: `${companyName} Expands Product Portfolio`,
              date: '2025-02-28',
              summary: `${companyName} unveiled its newest product line aimed at expanding its presence in the growing ${companyData.Industry} market segment.`
            },
            {
              title: `${companyName} Announces Strategic Partnership`,
              date: '2025-02-10',
              summary: `${companyName} announced a strategic partnership to enhance its capabilities in emerging technologies and expand market reach.`
            }
          ],
          filings: secFilings.length > 0 ? secFilings : [
            {
              type: '10-Q',
              date: '2025-03-15',
              description: `Quarterly report detailing ${companyName}'s financial performance for Q1 2025.`
            },
            {
              type: '8-K',
              date: '2025-02-10',
              description: `Current report announcing strategic partnership for ${companyName}.`
            }
          ],
          strategic: [
            `Expansion in ${companyData.Industry} core markets`,
            'Digital transformation initiatives',
            'Sustainability and ESG program development',
            'Strategic partnerships and potential acquisitions'
          ]
        },
        conclusion: `${companyName} (${companyData.Symbol}) presents a ${companyData.Beta > 1.5 ? 'high-risk, high-potential' : companyData.Beta > 1 ? 'moderate' : 'conservative'} investment opportunity within the ${companyData.Industry} industry. With a market capitalization of $${(companyData.MarketCapitalization / 1000000000).toFixed(2)} billion and a P/E ratio of ${companyData.PERatio.toFixed(2)}, the company ${companyData.QuarterlyEarningsGrowthYOY > 0 ? 'demonstrates positive growth trends' : 'faces some growth challenges'} that investors should monitor closely. Key considerations include ${companyData.QuarterlyEarningsGrowthYOY > 0 ? 'strong recent performance' : 'ongoing transformation efforts'}, competitive positioning, and ${companyData.Beta > 1.5 ? 'higher volatility' : 'market sensitivity'} reflected in its beta of ${companyData.Beta.toFixed(2)}. Investors should conduct further research on recent developments and industry trends before making investment decisions.`,
        generatedAt: new Date().toISOString()
      };
    } else {
      console.log(`Could not fetch company data for ${ticker}, using generated data`);
    }
    
    // If we couldn't get real data, generate a more realistic report with mock data
    const generatedReport: DueDiligenceReportType = {
      companyName: companyName,
      ticker: ticker,
      timestamp: Date.now(),
      companyData: {
        Symbol: ticker,
        AssetType: 'Common Stock',
        Name: companyName,
        Description: `${companyName} is a company operating in its industry with various products and services.`,
        Exchange: 'NASDAQ',
        Currency: 'USD',
        Country: 'USA',
        Sector: 'Technology',
        Industry: 'Software',
        MarketCapitalization: 15000000000,
        EBITDA: 3000000000,
        PERatio: 22.5,
        PEGRatio: 1.8,
        BookValue: 12.5,
        DividendPerShare: 0.8,
        DividendYield: 0.015,
        EPS: 2.35,
        ProfitMargin: 0.18,
        QuarterlyEarningsGrowthYOY: 0.12,
        QuarterlyRevenueGrowthYOY: 0.09,
        AnalystTargetPrice: 125.50,
        TrailingPE: 22.5,
        ForwardPE: 20.8,
        PriceToSalesRatioTTM: 5.2,
        PriceToBookRatio: 8.5,
        EVToRevenue: 5.5,
        EVToEBITDA: 18.2,
        Beta: 1.15,
        '52WeekHigh': 130.75,
        '52WeekLow': 85.25,
        '50DayMovingAverage': 110.42,
        '200DayMovingAverage': 105.67,
        SharesOutstanding: 285000000,
        DividendDate: '2025-03-15',
        ExDividendDate: '2025-02-28'
      },
      executiveSummary: {
        overview: `${companyName} is a company operating in its industry with various products and services.`,
        keyFindings: [
          `${companyName} has shown moderate financial performance in recent quarters`,
          'The company faces both opportunities and challenges in its market',
          'Competitive pressures remain a concern for future growth',
          'Financial position appears stable but with areas for improvement',
          'Recent strategic initiatives may impact future performance'
        ],
        riskRating: 'Medium',
        recommendation: `${companyName} presents a moderate investment opportunity with both potential upside and notable risks.`
      },
      financialAnalysis: {
        overview: `${companyName} demonstrates mixed financial performance with some strengths and areas for improvement.`,
        metrics: {
          'Revenue (TTM)': '$3.25 billion',
          'Gross Margin': '48.5%',
          'Operating Margin': '22.3%',
          'Net Income': '$0.58 billion',
          'EPS (TTM)': '$2.35',
          'P/E Ratio': '22.5',
          'Market Cap': '$15.0 billion',
          'Cash & Equivalents': '$1.85 billion'
        },
        trends: `${companyName} has shown variable revenue growth over recent periods, with some quarters outperforming expectations and others falling short.`,
        strengths: [
          'Reasonable cash position providing operational flexibility',
          'Stable gross margins compared to industry average',
          'Manageable debt levels',
          'Consistent dividend payments to shareholders'
        ],
        weaknesses: [
          'Inconsistent revenue growth quarter-to-quarter',
          'Operating expenses growing faster than revenue',
          'Below-industry-average return on invested capital',
          'Cash flow volatility affecting investment capacity'
        ]
      },
      marketAnalysis: {
        overview: `${companyName} operates in a competitive market environment with moderate market share in its primary segments.`,
        position: 'Mid-tier market position with opportunities for expansion in select segments.',
        competitors: getCompetitorsByIndustry('Software'),
        swot: {
          strengths: [
            'Established brand in core markets',
            'Loyal customer base',
            'Product quality reputation'
          ],
          weaknesses: [
            'Limited market share in growth segments',
            'Higher cost structure than some competitors'
          ],
          opportunities: [
            'Expansion into adjacent markets',
            'Digital transformation initiatives',
            'Strategic partnerships',
            'Product innovation'
          ],
          threats: [
            'Increasing competition from established players',
            'New market entrants',
            'Margin pressure',
            'Changing customer preferences'
          ]
        }
      },
      riskAssessment: {
        overview: `${companyName} faces several key risks that could impact its business performance and market position.`,
        financial: 'Moderate financial risks related to variable cash flow, debt servicing requirements, and potential margin pressure.',
        operational: 'Operational risks include supply chain dependencies, production capacity constraints, and workforce challenges.',
        market: 'Market risks stem from competitive pressures, changing customer preferences, and potential disruptive technologies.',
        regulatory: 'Regulatory risks include industry-specific compliance requirements, potential policy changes affecting the sector, and evolving standards.',
        esgConsiderations: 'Environmental, social, and governance factors are increasingly important to investors and customers, requiring ongoing attention and transparent reporting.',
        riskFactors: {
          financial: [
            'Cash flow volatility',
            'Debt covenant compliance',
            'Currency exchange exposure'
          ],
          operational: [
            'Supply chain disruptions',
            'Production capacity limitations',
            'Talent acquisition and retention'
          ],
          market: [
            'Increasing competitive pressure',
            'Changing customer preferences',
            'Technology disruption'
          ],
          regulatory: [
            'Industry-specific regulations',
            'Data privacy requirements',
            'Environmental compliance'
          ],
          esg: [
            'Carbon footprint reduction',
            'Diversity and inclusion initiatives',
            'Supply chain sustainability'
          ]
        }
      },
      recentDevelopments: {
        news: [
          {
            title: `${companyName} Reports Q1 2025 Financial Results`,
            date: '2025-03-15',
            summary: `${companyName} reported quarterly results with revenue of $825 million, representing a 9% increase year-over-year.`,
          },
          {
            title: `${companyName} Launches New Product Line`,
            date: '2025-02-28',
            summary: `${companyName} unveiled its newest product line aimed at expanding its presence in the growing market segment.`,
          },
          {
            title: `${companyName} Announces Leadership Changes`,
            date: '2025-02-10',
            summary: `${companyName} announced the appointment of a new CTO to lead its technology innovation efforts.`,
          }
        ],
        filings: [
          {
            type: '10-Q',
            date: '2025-03-15',
            description: `Quarterly report detailing ${companyName}'s financial performance for Q1 2025.`,
          },
          {
            type: '8-K',
            date: '2025-02-10',
            description: `Current report announcing executive leadership changes at ${companyName}.`,
          }
        ],
        strategic: [
          'Expansion into adjacent markets',
          'Digital transformation initiatives',
          'Product portfolio diversification',
          'Strategic partnerships and acquisitions'
        ]
      },
      conclusion: `${companyName} presents a moderate investment opportunity with both potential upside and notable risks. The company's financial position appears stable, but investors should monitor competitive pressures and execution of strategic initiatives. Recent developments suggest management is taking steps to address challenges and position for future growth, but results may take time to materialize. A thorough assessment of the company's competitive position and industry trends is recommended before making investment decisions.`,
      generatedAt: new Date().toISOString()
    };
    
    return generatedReport;
  } catch (error) {
    console.error('Error generating report with real data:', error);
    
    // Fallback to basic mock data
    return {
      ...defaultReport,
      companyName: companyName,
      timestamp: Date.now(),
      companyData: {
        Symbol: companyName.substring(0, 4).toUpperCase(),
        AssetType: 'Common Stock',
        Name: companyName,
        Description: `${companyName} is a company operating in its industry with various products and services.`,
        Exchange: 'NASDAQ',
        Currency: 'USD',
        Country: 'USA',
        Sector: 'Technology',
        Industry: 'Software',
        MarketCapitalization: 10000000000,
        EBITDA: 2000000000,
        PERatio: 20,
        PEGRatio: 1.5,
        BookValue: 10,
        DividendPerShare: 0.5,
        DividendYield: 0.01,
        EPS: 2,
        ProfitMargin: 0.15,
        QuarterlyEarningsGrowthYOY: 0.1,
        QuarterlyRevenueGrowthYOY: 0.08,
        AnalystTargetPrice: 100,
        TrailingPE: 20,
        ForwardPE: 18,
        PriceToSalesRatioTTM: 5,
        PriceToBookRatio: 8,
        EVToRevenue: 5,
        EVToEBITDA: 10,
        Beta: 1.2,
        '52WeekHigh': 120,
        '52WeekLow': 80,
        '50DayMovingAverage': 100,
        '200DayMovingAverage': 95,
        SharesOutstanding: 250000000,
        DividendDate: '2025-04-15',
        ExDividendDate: '2025-03-30'
      }
    };
  }
};

/**
 * Generates a due diligence report for a company
 * @param companyName The name of the company to generate a report for
 * @param options Options for the report generation
 * @returns A promise that resolves to a due diligence report
 */
export const generateDueDiligenceReport = async (
  companyName: string,
  options: ReportOptions = {}
): Promise<DueDiligenceReportType> => {
  // Default options
  const defaultOptions: ReportOptions = {
    sections: {
      includeFinancial: true,
      includeMarket: true,
      includeRisk: true,
      includeRecent: true
    },
    format: {
      includeCharts: true,
      includeTables: true
    }
  };

  // Merge options with defaults
  const mergedOptions: ReportOptions = {
    sections: {
      ...defaultOptions.sections,
      ...options.sections
    },
    format: {
      ...defaultOptions.format,
      ...options.format
    }
  };

  console.log('Generating report for', companyName, 'with options:', mergedOptions);

  try {
    // First try to generate a report using the Cloud Function
    try {
      // Add a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://generateduediligence-toafsgw4rq-uc.a.run.app/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({ companyName }),
        signal: controller.signal,
        // Use mode no-cors as fallback for CORS issues
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Successfully generated report from cloud function');
        return data;
      }
    } catch (cloudError) {
      console.log('Error using cloud function, falling back to local generation:', cloudError);
      // Continue to local generation if cloud function fails
    }
    
    // Fall back to local generation
    const report = await generateMockDueDiligenceReport(companyName, true);

    // Apply section filters based on options
    if (!mergedOptions.sections?.includeFinancial) {
      report.financialAnalysis = undefined;
    }

    if (!mergedOptions.sections?.includeMarket) {
      report.marketAnalysis = undefined;
    }

    if (!mergedOptions.sections?.includeRisk) {
      report.riskAssessment = undefined;
    }

    if (!mergedOptions.sections?.includeRecent) {
      report.recentDevelopments = undefined;
    }

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    // Always return something usable even if everything fails
    // This ensures the app doesn't crash
    return {
      companyName: companyName,
      ticker: companyName.substring(0, 4).toUpperCase(),
      timestamp: Date.now(),
      executiveSummary: {
        overview: `${companyName} is a company we're currently analyzing.`,
        keyFindings: ['Report generated with limited data due to connectivity issues'],
        riskRating: 'Medium',
        recommendation: 'Additional research recommended due to limited data availability.'
      },
      companyData: {
        Symbol: companyName.substring(0, 4).toUpperCase(),
        Name: companyName,
        Description: `${companyName} is a company we're currently analyzing.`,
        Industry: 'Unknown',
        Sector: 'Unknown',
        MarketCapitalization: 0,
        EBITDA: 0,
        PERatio: 0,
        PEGRatio: 0,
        BookValue: 0,
        DividendPerShare: 0,
        DividendYield: 0,
        EPS: 0,
        ProfitMargin: 0,
        QuarterlyEarningsGrowthYOY: 0,
        QuarterlyRevenueGrowthYOY: 0,
        AnalystTargetPrice: 0,
        TrailingPE: 0,
        ForwardPE: 0,
        PriceToSalesRatioTTM: 0,
        PriceToBookRatio: 0,
        EVToRevenue: 0,
        EVToEBITDA: 0,
        Beta: 1,
        '52WeekHigh': 0,
        '52WeekLow': 0,
        '50DayMovingAverage': 0,
        '200DayMovingAverage': 0,
        SharesOutstanding: 0,
        DividendDate: '',
        ExDividendDate: ''
      },
      financialAnalysis: {
        overview: 'Financial data unavailable due to connectivity issues.',
        metrics: {
          'Data Availability': 'Limited due to connectivity issues'
        },
        trends: 'Trend analysis unavailable.',
        strengths: ['Unable to determine strengths due to limited data'],
        weaknesses: ['Unable to determine weaknesses due to limited data']
      },
      marketAnalysis: {
        overview: 'Market data unavailable due to connectivity issues.',
        position: 'Market position data unavailable.',
        competitors: [],
        marketPosition: 'Unable to determine due to connectivity issues',
        swot: {
          strengths: ['Unable to determine strengths due to limited data'],
          weaknesses: ['Unable to determine weaknesses due to limited data'],
          opportunities: ['Unable to determine opportunities due to limited data'],
          threats: ['Unable to determine threats due to limited data']
        }
      },
      riskAssessment: {
        overview: 'Risk assessment unavailable due to connectivity issues.',
        riskRating: 'medium',
        financial: 'Financial risk data unavailable.',
        operational: 'Operational risk data unavailable.',
        market: 'Market risk data unavailable.',
        regulatory: 'Legal and regulatory risk data unavailable.',
        esgConsiderations: 'Environmental, social, and governance factors are increasingly important to investors and customers, requiring ongoing attention and transparent reporting.',
        riskFactors: {
          financial: [
            'Cash flow volatility',
            'Debt covenant compliance',
            'Currency exchange exposure'
          ],
          operational: [
            'Supply chain disruptions',
            'Production capacity limitations',
            'Talent acquisition and retention'
          ],
          market: [
            'Increasing competitive pressure',
            'Changing customer preferences',
            'Technology disruption'
          ],
          regulatory: [
            'Industry-specific regulations',
            'Data privacy requirements',
            'Environmental compliance'
          ],
          esg: [
            'Carbon footprint reduction',
            'Diversity and inclusion initiatives',
            'Supply chain sustainability'
          ]
        }
      },
      recentDevelopments: {
        news: [
          {
            title: `${companyName} Reports Q1 2025 Financial Results`,
            date: '2025-03-15',
            summary: `${companyName} reported quarterly results with revenue of $825 million, representing a 9% increase year-over-year.`,
          },
          {
            title: `${companyName} Launches New Product Line`,
            date: '2025-02-28',
            summary: `${companyName} unveiled its newest product line aimed at expanding its presence in the growing market segment.`,
          },
          {
            title: `${companyName} Announces Leadership Changes`,
            date: '2025-02-10',
            summary: `${companyName} announced the appointment of a new CTO to lead its technology innovation efforts.`,
          }
        ],
        filings: [
          {
            type: '10-Q',
            date: '2025-03-15',
            description: `Quarterly report detailing ${companyName}'s financial performance for Q1 2025.`,
          },
          {
            type: '8-K',
            date: '2025-02-10',
            description: `Current report announcing executive leadership changes at ${companyName}.`,
          }
        ],
        strategic: [
          'Expansion into adjacent markets',
          'Digital transformation initiatives',
          'Product portfolio diversification',
          'Strategic partnerships and acquisitions'
        ]
      },
      conclusion: `${companyName} presents a moderate investment opportunity with both potential upside and notable risks. The company's financial position appears stable, but investors should monitor competitive pressures and execution of strategic initiatives. Recent developments suggest management is taking steps to address challenges and position for future growth, but results may take time to materialize. A thorough assessment of the company's competitive position and industry trends is recommended before making investment decisions.`,
      generatedAt: new Date().toISOString()
    };
  }
};
