import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import fetch from 'node-fetch';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from "firebase-functions/params";

// Define secrets
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const ALPHA_VANTAGE_API_KEY = defineSecret("ALPHA_VANTAGE_API_KEY");
const NEWS_API_KEY = defineSecret("NEWS_API_KEY");
const SEC_API_KEY = defineSecret("SEC_API_KEY");

// Initialize Firebase Admin
initializeApp();

// Update the model name to use the correct version
const MODEL_NAME = "gemini-pro";

// Initialize Gemini only when needed
let genAI: GoogleGenerativeAI | null = null;

function initializeGenAI(apiKey: string) {
    if (!genAI) {
        try {
            genAI = new GoogleGenerativeAI(apiKey);
            console.log('Gemini AI initialized successfully with model:', MODEL_NAME);
        }
        catch (error) {
            console.error('Error initializing Gemini AI:', error);
            throw new Error('Failed to initialize Gemini AI');
        }
    }
    return genAI;
}

// CORS middleware
const corsHandler = cors({
    origin: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// Define TypeScript interfaces for Alpha Vantage API responses
interface AlphaVantageResponse {
    bestMatches?: Array<{
        symbol: string;
        name: string;
        region: string;
        currency: string;
    }>;
    Note?: string;
    [key: string]: any;
}

interface OverviewResponse {
    Symbol: string;
    AssetType: string;
    Name: string;
    Description: string;
    CIK: string;
    Exchange: string;
    Currency: string;
    Country: string;
    Sector: string;
    Industry: string;
    Address: string;
    FiscalYearEnd: string;
    LatestQuarter: string;
    MarketCapitalization: string;
    EBITDA: string;
    RevenueTTM: string;
    GrossProfitTTM: string;
    DilutedEPSTTM: string;
    ProfitMargin: string;
    OperatingMarginTTM: string;
    ReturnOnAssetsTTM: string;
    ReturnOnEquityTTM: string;
    RevenuePerShareTTM: string;
    QuarterlyRevenueGrowthYOY: string;
    QuarterlyEarningsGrowthYOY: string;
    BookValuePerShareQuarterly: string;
    OperatingCashFlowTTM: string;
    Beta: string;
    PEGRatio: string;
    PERatio: string;
    ForwardPE: string;
    PSRatio: string;
    PBRatio: string;
    DividendPerShareTTM: string;
    DividendYield: string;
    PayoutRatio: string;
    DividendDate: string;
    ExDividendDate: string;
    LastSplitFactor: string;
    LastSplitDate: string;
    AnalystTargetPrice: string;
    SharesOutstanding: string;
    [key: string]: any;
}

// Add new data source interfaces
interface NewsResponse {
    articles: Array<{
        title: string;
        description: string;
        url: string;
        publishedAt: string;
        source: {
            name: string;
        };
    }>;
}

interface SECApiResponse {
    filings: Array<{
        formType: string;
        filedAt: string;
        description?: string;
        linkToFilingDetails: string;
    }>;
}

// Add rate limiting and error handling utilities
interface RateLimitConfig {
    maxRequests: number;
    timeWindow: number; // in milliseconds
}

class RateLimiter {
    private requests: number[] = [];
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
    }

    async checkLimit(): Promise<boolean> {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.config.timeWindow);
        
        if (this.requests.length >= this.config.maxRequests) {
            return false;
        }

        this.requests.push(now);
        return true;
    }

    async waitForSlot(): Promise<void> {
        while (!(await this.checkLimit())) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Keep only the rate limiters we need
const alphaVantageRateLimiter = new RateLimiter({ maxRequests: 5, timeWindow: 60000 }); // 5 requests per minute

// Add retry logic for API calls
async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            if (error.status === 429) { // Rate limit exceeded
                const delay = initialDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    
    throw lastError;
}

// Add caching functionality
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class APICache {
    private db = getFirestore();
    private readonly COLLECTION = 'api_cache';
    private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds

    async get<T>(key: string): Promise<T | null> {
        try {
            const doc = await this.db.collection(this.COLLECTION).doc(key).get();
            if (!doc.exists) {
                return null;
            }

            const entry = doc.data() as CacheEntry<T>;
            if (Date.now() > entry.expiresAt) {
                await this.delete(key);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                expiresAt: Date.now() + ttl
            };
            await this.db.collection(this.COLLECTION).doc(key).set(entry);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.db.collection(this.COLLECTION).doc(key).delete();
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }
}

const apiCache = new APICache();

// Enhanced structure for due diligence reports
interface DueDiligenceResponse {
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

// Update getCompanyData to include currency conversion
async function getCompanyDataRaw(companyName: string, apiKey: string): Promise<any> {
    const cacheKey = `alphavantage_${companyName.toLowerCase()}`;
    
    try {
        // Check cache first
        const cachedData = await apiCache.get<any>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        await alphaVantageRateLimiter.waitForSlot();
        const data = await retryWithBackoff(async () => {
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${companyName}&apikey=${apiKey}`;
        const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json() as AlphaVantageResponse;

        if (!searchData.bestMatches || searchData.bestMatches.length === 0) {
                throw new Error('No company found');
        }

            const symbol = searchData.bestMatches[0]?.symbol;
            
            await alphaVantageRateLimiter.waitForSlot();
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
        const overviewResponse = await fetch(overviewUrl);
            const overview = await overviewResponse.json() as OverviewResponse;
            
            return overview;
        });
        
        // Cache successful response
        if (data) {
            await apiCache.set(cacheKey, data);
        }
        
        return data;
    } catch (error) {
        console.error("Error fetching company data:", error);
        return {
            error: error instanceof Error ? error.message : 'Unknown error',
            fallbackData: {}
        };
    }
}

// Enhanced news data function
async function getNewsData(companyName: string, apiKey: string): Promise<any> {
    const cacheKey = `news_${companyName.toLowerCase()}`;
    
    try {
        // Check cache first
        const cachedData = await apiCache.get<any>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&sortBy=relevancy&pageSize=15&apiKey=${apiKey}`;
        const response = await fetch(newsUrl);
        
        if (!response.ok) {
            throw new Error(`News API returned ${response.status}`);
        }
        
        const data = await response.json() as NewsResponse;
        
        // Cache successful response (for a shorter time as news is time-sensitive)
        if (data && Array.isArray(data.articles)) {
            await apiCache.set(cacheKey, data, 1800000); // 30 minutes
            return data;
        }
        
        console.error("Invalid news API response format:", data);
        return null;
    } catch (error) {
        console.error("Error fetching news data:", error);
        return null;
    }
}

// Enhanced SEC filings function
async function getSECFilings(companyName: string, apiKey: string): Promise<any> {
    const cacheKey = `sec_${companyName.toLowerCase()}`;
    
    try {
        // Check cache first
        const cachedData = await apiCache.get<any>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        const url = `https://api.sec-api.io/filings?company=${encodeURIComponent(companyName)}&token=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`SEC API returned ${response.status}`);
        }
        
        const data = await response.json() as SECApiResponse;
        
        const result = {
            filings: data.filings.map(filing => ({
                type: filing.formType,
                filingDate: filing.filedAt,
                description: filing.description || '',
                url: filing.linkToFilingDetails
            }))
        };
        
        // Cache successful response
        await apiCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching SEC filings:", error);
        return null;
    }
}

// Function to parse AI response into structured format
function parseAIResponse(text: string): DueDiligenceResponse {
    try {
        // Try to parse as JSON first in case the AI returns proper JSON
        try {
            const jsonData = JSON.parse(text);
            return jsonData as DueDiligenceResponse;
        } catch (e) {
            // Not valid JSON, parse as text
        }
        
        // Default empty report structure
        const report: DueDiligenceResponse = {
            companyName: "",
            timestamp: new Date().toISOString(),
            executiveSummary: {
                overview: "",
                keyFindings: [],
                riskRating: "Medium",
                recommendation: ""
            },
            financialAnalysis: {
                metrics: {},
                trends: [],
                strengths: [],
                weaknesses: []
            },
            marketAnalysis: {
                position: "",
                competitors: [],
                marketShare: "",
                swot: {
                    strengths: [],
                    weaknesses: [],
                    opportunities: [],
                    threats: []
                }
            },
            riskAssessment: {
                financial: [],
                operational: [],
                market: [],
                regulatory: [],
                esg: []
            },
            recentDevelopments: {
                news: [],
                filings: [],
                management: [],
                strategic: []
            }
        };
        
        // Parse sections from text
        const sections: Record<string, string> = {};
        
        // Extract major sections
        const sectionRegex = /\n\s*(\d+\.\s*[A-Z][A-Za-z\s&]+)\s*\n/g;
        let match;
        
        const sectionMatches = [];
        while ((match = sectionRegex.exec(text)) !== null) {
            sectionMatches.push({
                title: match[1].trim(),
                start: match.index,
                end: text.length // Will be updated for all but the last one
            });
        }
        
        // Set proper end positions
        for (let i = 0; i < sectionMatches.length - 1; i++) {
            sectionMatches[i].end = sectionMatches[i + 1].start;
        }
        
        // Extract section content
        sectionMatches.forEach(section => {
            const content = text.substring(section.start, section.end).replace(section.title, '').trim();
            sections[section.title] = content;
        });
        
        // Parse Executive Summary
        if (sections["1. Executive Summary"]) {
            report.executiveSummary.overview = sections["1. Executive Summary"]
                .split('\n\n')[0]
                .replace(/^[^a-zA-Z]+/, '')
                .trim();
            
            // Extract key findings
            const findingsMatch = sections["1. Executive Summary"].match(/Key findings[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i);
            if (findingsMatch) {
                report.executiveSummary.keyFindings = findingsMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Extract risk rating
            const riskMatch = sections["1. Executive Summary"].match(/Risk rating[^:]*:\s*(Low|Medium|High)/i);
            if (riskMatch) {
                report.executiveSummary.riskRating = riskMatch[1] as any;
            }
            
            // Extract recommendation
            const recoMatch = sections["1. Executive Summary"].match(/Recommendation[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|\Z)/i);
            if (recoMatch) {
                report.executiveSummary.recommendation = recoMatch[1].trim();
            }
        }
        
        // Parse Financial Analysis
        if (sections["2. Financial Analysis"]) {
            const content = sections["2. Financial Analysis"];
            
            // Extract metrics
            const metricsMatch = content.match(/Key (financial )?metrics[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i);
            if (metricsMatch) {
                const metricsText = metricsMatch[2];
                const metricItems = metricsText.match(/[•-]?\s*([^:]+):\s*([^•\n]+)/g);
                
                if (metricItems) {
                    metricItems.forEach(item => {
                        const [key, value] = item.split(/:\s*/);
                        if (key && value) {
                            report.financialAnalysis.metrics[key.replace(/^[•-]\s*/, '').trim()] = value.trim();
                        }
                    });
                }
            }
            
            // Extract trends
            const trendsMatch = content.match(/(?:Revenue|Profitability|Financial)\s+trends[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i);
            if (trendsMatch) {
                report.financialAnalysis.trends = trendsMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Extract strengths
            const strengthsMatch = content.match(/(?:Financial )?[Ss]trengths[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|Weaknesses)/i);
            if (strengthsMatch) {
                report.financialAnalysis.strengths = strengthsMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Extract weaknesses
            const weaknessesMatch = content.match(/(?:Financial )?[Ww]eaknesses[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i);
            if (weaknessesMatch) {
                report.financialAnalysis.weaknesses = weaknessesMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
        }
        
        // Parse Market Analysis
        if (sections["3. Market Position & Competitive Analysis"] || sections["3. Market Analysis"]) {
            const content = sections["3. Market Position & Competitive Analysis"] || sections["3. Market Analysis"];
            
            // Extract market position
            report.marketAnalysis.position = content.split('\n\n')[0].trim();
            
            // Extract competitors
            const competitorsMatch = content.match(/[Cc]ompetitive landscape[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i) || 
                                     content.match(/[Cc]ompetitors[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i);
            if (competitorsMatch) {
                report.marketAnalysis.competitors = competitorsMatch[1]
                    .split(/\n[•-]\s*|,\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Extract SWOT
            // Strengths
            const swotStrengthsMatch = content.match(/SWOT[^:]*strengths[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Ww]eaknesses)/i) || 
                                      content.match(/[Ss]trengths[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Ww]eaknesses)/i);
            if (swotStrengthsMatch) {
                report.marketAnalysis.swot.strengths = swotStrengthsMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Weaknesses
            const swotWeaknessesMatch = content.match(/SWOT[^:]*weaknesses[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Oo]pportunities)/i) || 
                                       content.match(/[Ww]eaknesses[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Oo]pportunities)/i);
            if (swotWeaknessesMatch) {
                report.marketAnalysis.swot.weaknesses = swotWeaknessesMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Opportunities
            const swotOpportunitiesMatch = content.match(/SWOT[^:]*opportunities[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Tt]hreats)/i) || 
                                          content.match(/[Oo]pportunities[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Tt]hreats)/i);
            if (swotOpportunitiesMatch) {
                report.marketAnalysis.swot.opportunities = swotOpportunitiesMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Threats
            const swotThreatsMatch = content.match(/SWOT[^:]*threats[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i) || 
                                    content.match(/[Tt]hreats[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z])/i);
            if (swotThreatsMatch) {
                report.marketAnalysis.swot.threats = swotThreatsMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
        }
        
        // Parse Risk Assessment
        if (sections["4. Risk Assessment"]) {
            const content = sections["4. Risk Assessment"];
            
            // Financial risks
            const financialRisksMatch = content.match(/[Ff]inancial risks[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Oo]perational)/i);
            if (financialRisksMatch) {
                report.riskAssessment.financial = financialRisksMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Operational risks
            const operationalRisksMatch = content.match(/[Oo]perational risks[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Mm]arket)/i);
            if (operationalRisksMatch) {
                report.riskAssessment.operational = operationalRisksMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Market risks
            const marketRisksMatch = content.match(/[Mm]arket risks[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|[Rr]egulatory)/i);
            if (marketRisksMatch) {
                report.riskAssessment.market = marketRisksMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // Regulatory risks
            const regulatoryRisksMatch = content.match(/[Rr]egulatory risks[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|ESG)/i);
            if (regulatoryRisksMatch) {
                report.riskAssessment.regulatory = regulatoryRisksMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
            
            // ESG considerations
            const esgMatch = content.match(/ESG considerations[^:]*:([\s\S]+?)(?:\n\n|\n[A-Z]|\Z)/i);
            if (esgMatch) {
                report.riskAssessment.esg = esgMatch[1]
                    .split(/\n[•-]\s*/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
        }
        
        return report;
    } catch (error) {
        console.error("Error parsing AI response:", error);
        return {
            companyName: "",
            timestamp: new Date().toISOString(),
            executiveSummary: {
                overview: "Error generating report. Please try again.",
                keyFindings: [],
                riskRating: "Medium",
                recommendation: ""
            },
            financialAnalysis: {
                metrics: {},
                trends: [],
                strengths: [],
                weaknesses: []
            },
            marketAnalysis: {
                position: "",
                competitors: [],
                marketShare: "",
                swot: {
                    strengths: [],
                    weaknesses: [],
                    opportunities: [],
                    threats: []
                }
            },
            riskAssessment: {
                financial: [],
                operational: [],
                market: [],
                regulatory: [],
                esg: []
            },
            recentDevelopments: {
                news: [],
                filings: [],
                management: [],
                strategic: []
            }
        };
    }
}

// Update the generateDueDiligence function
export const generateDueDiligence = onRequest({
    memory: "1GiB",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 10,
    invoker: "public",
    secrets: [GEMINI_API_KEY, ALPHA_VANTAGE_API_KEY, NEWS_API_KEY, SEC_API_KEY]
}, async (request, response) => {
    return corsHandler(request, response, async () => {
        try {
            const data = request.body;
            if (!data.companyName) {
                response.status(400).json({ error: "Company name is required" });
                return;
            }

            // Get API keys from secrets
            const geminiKey = GEMINI_API_KEY.value();
            const alphaVantageKey = ALPHA_VANTAGE_API_KEY.value();
            const newsKey = NEWS_API_KEY.value();
            const secKey = SEC_API_KEY.value();

            if (!geminiKey || !alphaVantageKey || !newsKey || !secKey) {
                throw new Error('Missing required API keys');
            }

            const ai = initializeGenAI(geminiKey);
            console.log('Initialized Gemini AI for company:', data.companyName);

            // Fetch data from all available sources
            const [companyData, newsData, secFilings] = await Promise.all([
                getCompanyDataRaw(data.companyName, alphaVantageKey),
                getNewsData(data.companyName, newsKey),
                getSECFilings(data.companyName, secKey)
            ]);

            console.log('Fetched all data sources successfully');

            // Prepare options from request or use defaults
            const reportFormat = (data.options || {
                format: {
                    type: 'detailed',
                    includeCharts: true,
                }
            }).format;

            console.log('Using report format:', reportFormat.type);

            // Enhanced prompt with more structure and formatting instructions
            const prompt = `Generate a comprehensive professional due diligence report for ${data.companyName} in a structured format. 
            Use the following data sources to inform your analysis:

            Financial Data:
            ${JSON.stringify(companyData)}

            Recent News:
            ${JSON.stringify(newsData)}

            SEC Filings:
            ${JSON.stringify(secFilings)}

            Please structure the report with the following numbered sections:

            1. Executive Summary
            - Brief company overview (2-3 paragraphs)
            - Key findings (5-7 bullet points)
            - Risk rating (Low/Medium/High) with justification
            - Recommendation summary (1-2 paragraphs)

            2. Financial Analysis
            - Key financial metrics (list the most important with values)
            - Revenue and profitability trends (3-5 bullet points)
            - Balance sheet strength assessment
            - Cash flow analysis summary
            - Financial strengths (3-5 bullet points)
            - Financial weaknesses (3-5 bullet points)

            3. Market Position & Competitive Analysis
            - Industry overview and market size
            - Competitive landscape (list main competitors)
            - Market share and positioning assessment
            - SWOT analysis with clear sections for:
              * Strengths (4-6 bullet points)
              * Weaknesses (4-6 bullet points)
              * Opportunities (4-6 bullet points)
              * Threats (4-6 bullet points)

            4. Risk Assessment
            - Financial risks (3-5 bullet points)
            - Operational risks (3-5 bullet points)
            - Market risks (3-5 bullet points)
            - Regulatory risks (3-5 bullet points)
            - ESG considerations (3-5 bullet points)

            5. Recent Developments
            - Summarize key news and events (2-3 paragraphs)
            - Management changes (if applicable)
            - Strategic initiatives (3-5 bullet points)
            - Market sentiment analysis

            Format Requirements:
            - Use precise, data-driven language
            - Include specific metrics and figures where available
            - Use clear section headings and subheadings
            - Present information in concise bullet points where appropriate
            - Provide balanced analysis with both positive and negative insights
            - Use professional financial terminology

            The report should be suitable for professional investors and investment advisors to make informed decisions.`;

            console.log('Generating report with Gemini AI...');
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log('Report generated successfully');

            // Parse the AI's text response into a structured format
            const structuredReport = parseAIResponse(text);

            // Add company name and timestamp
            structuredReport.companyName = data.companyName;
            structuredReport.timestamp = new Date().toISOString();

            // Save report to database for history/audit
            try {
                const db = getFirestore();
                const reportData = {
                    companyName: data.companyName,
                    timestamp: new Date().toISOString(),
                    report: structuredReport,
                    userId: request.headers.authorization ? 'authenticated' : 'anonymous',
                    rawResponse: text.substring(0, 1000) // Store beginning for debugging
                };
                await db.collection('reportHistory').add(reportData);
            }
            catch (dbError) {
                console.error("Error saving report to database:", dbError);
                // Don't fail the request if DB save fails
            }

            response.json({ data: structuredReport });
        }
        catch (error) {
            console.error("Error in generateDueDiligence:", error);
            response.status(500).json({
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    });
});

// Update the generateText function
export const generateText = onRequest({
    memory: "1GiB",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 10,
    invoker: "public",
    secrets: [GEMINI_API_KEY]
}, async (request, response) => {
    return corsHandler(request, response, async () => {
        try {
            const data = request.body;
            if (!data.prompt) {
                response.status(400).json({ error: "Prompt is required" });
                return;
            }

            const geminiKey = GEMINI_API_KEY.value();
            if (!geminiKey) {
                throw new Error('Missing Gemini API key');
            }

            const ai = initializeGenAI(geminiKey);

            // Enhanced model configuration
            const modelConfig = {
                model: MODEL_NAME,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            };

            console.log('Generating text with model:', MODEL_NAME);
            const model = ai.getGenerativeModel(modelConfig);

            // Add retry logic for API calls
            const result = await retryWithBackoff(async () => {
                return await model.generateContent(data.prompt);
            });

            const text = result.response.text();
            console.log('Generated text successfully');

            // Add response validation
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response from model');
            }

            response.json({
                data: text,
                model: MODEL_NAME,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error("Error in generateText:", error);
            response.status(500).json({
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
        }
    });
});