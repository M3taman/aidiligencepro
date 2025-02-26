import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import fetch from 'node-fetch';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();

const MODEL_NAME = "gemini-pro";

// Define configuration parameters
const GEMINI_API_KEY = defineString('GEMINI_APIKEY');
const ALPHA_VANTAGE_KEY = defineString('ALPHAVANTAGE_KEY');
const NEWS_API_KEY = defineString('NEWS_API_KEY');
const LINKEDIN_API_KEY = defineString('LINKEDIN_API_KEY');
const CRUNCHBASE_API_KEY = defineString('CRUNCHBASE_API_KEY');
const BLOOMBERG_API_KEY = defineString('BLOOMBERG_API_KEY');

// Initialize Gemini only when needed
let genAI: any = null;

function initializeGenAI() {
    if (!genAI && GEMINI_API_KEY.value()) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
        console.log('Gemini AI initialized successfully');
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

interface SECFilingResponse {
    filings: Array<{
        type: string;
        filingDate: string;
        description: string;
        url: string;
    }>;
}

interface SECCompanyInfo {
    cik: string;
    entityType: string;
    sic: string;
    sicDescription: string;
    name: string;
    tickers: string[];
}

interface SECFilingData {
    recent: Array<{
        form: string;
        filingDate: string;
        description: string;
        accessionNumber: string;
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

// Create rate limiters for each API
const linkedInRateLimiter = new RateLimiter({ maxRequests: 30, timeWindow: 60000 }); // 30 requests per minute
const crunchbaseRateLimiter = new RateLimiter({ maxRequests: 50, timeWindow: 60000 }); // 50 requests per minute
const bloombergRateLimiter = new RateLimiter({ maxRequests: 20, timeWindow: 60000 }); // 20 requests per minute

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

// Add currency conversion functionality
interface ExchangeRateResponse {
    "Realtime Currency Exchange Rate": {
        "1. From_Currency Code": string;
        "2. From_Currency Name": string;
        "3. To_Currency Code": string;
        "4. To_Currency Name": string;
        "5. Exchange Rate": string;
        "6. Last Refreshed": string;
        "7. Time Zone": string;
        "8. Bid Price": string;
        "9. Ask Price": string;
    };
}

class CurrencyConverter {
    private static instance: CurrencyConverter;
    private cache: Map<string, { rate: number; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

    private constructor() {}

    static getInstance(): CurrencyConverter {
        if (!CurrencyConverter.instance) {
            CurrencyConverter.instance = new CurrencyConverter();
        }
        return CurrencyConverter.instance;
    }

    async getExchangeRate(fromCurrency: string, toCurrency: string = 'USD'): Promise<number> {
        const cacheKey = `${fromCurrency}_${toCurrency}`;
        const cachedRate = this.cache.get(cacheKey);

        if (cachedRate && Date.now() - cachedRate.timestamp < this.CACHE_TTL) {
            return cachedRate.rate;
        }

        try {
            const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${ALPHA_VANTAGE_KEY.value()}`;
            const response = await fetch(url);
            const data = await response.json() as ExchangeRateResponse;

            if (!data["Realtime Currency Exchange Rate"]) {
                throw new Error(`Failed to get exchange rate for ${fromCurrency}/${toCurrency}`);
            }

            const rate = parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
            this.cache.set(cacheKey, { rate, timestamp: Date.now() });
            return rate;
        } catch (error) {
            console.error(`Error fetching exchange rate ${fromCurrency}/${toCurrency}:`, error);
            return 1; // Default to 1 if conversion fails
        }
    }

    async convertAmount(amount: number | string, fromCurrency: string, toCurrency: string = 'USD'): Promise<number> {
        if (fromCurrency === toCurrency) {
            return typeof amount === 'string' ? parseFloat(amount) : amount;
        }

        const numericAmount = typeof amount === 'string' ? 
            parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;

        if (isNaN(numericAmount)) {
            return 0;
        }

        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        return numericAmount * rate;
    }

    formatCurrency(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

const currencyConverter = CurrencyConverter.getInstance();

// Update getCompanyData to include currency conversion
async function getCompanyData(companyName: string): Promise<OverviewResponse | { error: string; fallbackData: Partial<OverviewResponse> }> {
    try {
        const result = await getCompanyDataRaw(companyName);
        
        if ('error' in result) {
            return result;
        }

        // Convert financial metrics to USD
        const currency = result.Currency || 'USD';
        const metrics = [
            'MarketCapitalization',
            'EBITDA',
            'RevenueTTM',
            'GrossProfitTTM',
            'OperatingCashFlowTTM'
        ];

        for (const metric of metrics) {
            if (result[metric] && result[metric] !== 'N/A') {
                const usdValue = await currencyConverter.convertAmount(result[metric], currency);
                result[`${metric}USD`] = currencyConverter.formatCurrency(usdValue);
            }
        }

        return result;
    } catch (error) {
        console.error("Error in getCompanyData:", error);
        return {
            error: `Failed to fetch company data: ${error}`,
            fallbackData: {
                MarketCapitalization: 'N/A',
                RevenueTTM: 'N/A',
                ProfitMargin: 'N/A',
                PERatio: 'N/A',
                Industry: 'N/A',
                Sector: 'N/A',
                Description: 'N/A'
            }
        };
    }
}

// Rename original getCompanyData to getCompanyDataRaw
async function getCompanyDataRaw(companyName: string): Promise<OverviewResponse | { error: string; fallbackData: Partial<OverviewResponse> }> {
    try {
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${companyName}&apikey=${ALPHA_VANTAGE_KEY.value()}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json() as AlphaVantageResponse;

        if (!searchData.bestMatches || searchData.bestMatches.length === 0) {
            return {
                error: `No symbol found for company: ${companyName}`,
                fallbackData: {
                    MarketCapitalization: 'N/A',
                    RevenueTTM: 'N/A',
                    ProfitMargin: 'N/A',
                    PERatio: 'N/A',
                    Industry: 'N/A',
                    Sector: 'N/A',
                    Description: 'N/A'
                }
            };
        }

        const symbol = searchData.bestMatches[0].symbol;
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY.value()}`;
        const overviewResponse = await fetch(overviewUrl);
        const overview = await overviewResponse.json() as OverviewResponse;

        if (!overview || overview.Note) {
            return {
                error: (overview as any).Note || `Could not retrieve overview data for symbol: ${symbol}`,
                fallbackData: {
                    MarketCapitalization: 'N/A',
                    RevenueTTM: 'N/A',
                    ProfitMargin: 'N/A',
                    PERatio: 'N/A',
                    Industry: 'N/A',
                    Sector: 'N/A',
                    Description: 'N/A'
                }
            };
        }

        return overview;
    } catch (error) {
        console.error("Error fetching company data:", error);
        return {
            error: `Failed to fetch company data: ${error}`,
            fallbackData: {
                MarketCapitalization: 'N/A',
                RevenueTTM: 'N/A',
                ProfitMargin: 'N/A',
                PERatio: 'N/A',
                Industry: 'N/A',
                Sector: 'N/A',
                Description: 'N/A'
            }
        };
    }
}

// Update Yahoo Finance data fetching with currency conversion
async function getYahooFinanceData(companyName: string): Promise<YahooFinanceQuote | null> {
    try {
        const data = await getYahooFinanceDataRaw(companyName);
        
        if (!data) {
            return null;
        }

        // Convert financial metrics to USD
        const currency = data.currency || 'USD';
        const metrics = {
            marketCap: data.marketCap,
            enterpriseValue: data.enterpriseValue,
            totalRevenue: data.totalRevenue,
            ebitda: data.ebitda
        };

        const convertedMetrics: { [key: string]: number } = {};
        for (const [key, value] of Object.entries(metrics)) {
            if (value) {
                convertedMetrics[`${key}USD`] = await currencyConverter.convertAmount(value, currency);
            }
        }

        return {
            ...data,
            ...convertedMetrics
        };
    } catch (error) {
        console.error("Error in getYahooFinanceData:", error);
        return null;
    }
}

// Rename original getYahooFinanceData to getYahooFinanceDataRaw
async function getYahooFinanceDataRaw(companyName: string): Promise<YahooFinanceQuote | null> {
    try {
        // First search for the symbol
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(companyName)}&quotesCount=1&newsCount=0&listsCount=0`;
        const searchResponse = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Aidiligence/1.0'
            }
        });
        const searchData = await searchResponse.json() as YahooSearchResponse;
        
        if (!searchData.quotes || searchData.quotes.length === 0) {
            console.error(`No Yahoo Finance data found for: ${companyName}`);
            return null;
        }

        const symbol = searchData.quotes[0].symbol;
        
        // Fetch detailed quote data
        const quoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile,summaryDetail,financialData,defaultKeyStatistics`;
        const quoteResponse = await fetch(quoteUrl, {
            headers: {
                'User-Agent': 'Aidiligence/1.0'
            }
        });
        const quoteData = await quoteResponse.json() as YahooQuoteResponse;
        
        if (!quoteData.quoteSummary?.result?.[0]) {
            throw new Error('Invalid Yahoo Finance response');
        }

        const result = quoteData.quoteSummary.result[0];
        const { summaryProfile, summaryDetail, financialData, defaultKeyStatistics } = result;

        return {
            shortName: summaryProfile?.shortName || '',
            longName: summaryProfile?.longName || '',
            symbol: symbol,
            exchange: summaryProfile?.exchange || '',
            currency: summaryDetail?.currency || '',
            marketCap: financialData?.marketCap?.raw || 0,
            marketCapFormat: financialData?.marketCap?.fmt || 'N/A',
            enterpriseValue: defaultKeyStatistics?.enterpriseValue?.raw || 0,
            totalRevenue: financialData?.totalRevenue?.raw || 0,
            revenueGrowth: financialData?.revenueGrowth?.raw || 0,
            grossMargins: financialData?.grossMargins?.raw || 0,
            operatingMargins: financialData?.operatingMargins?.raw || 0,
            profitMargins: financialData?.profitMargins?.raw || 0,
            ebitda: financialData?.ebitda?.raw || 0,
            trailingPE: summaryDetail?.trailingPE?.raw || 0,
            forwardPE: summaryDetail?.forwardPE?.raw || 0,
            pegRatio: defaultKeyStatistics?.pegRatio?.raw || 0,
            beta: defaultKeyStatistics?.beta?.raw || 0,
            priceToBook: defaultKeyStatistics?.priceToBook?.raw || 0,
            dividendYield: summaryDetail?.dividendYield?.raw || 0,
            payoutRatio: summaryDetail?.payoutRatio?.raw || 0,
            sector: summaryProfile?.sector || '',
            industry: summaryProfile?.industry || '',
            fullTimeEmployees: summaryProfile?.fullTimeEmployees || 0,
            country: summaryProfile?.country || '',
            website: summaryProfile?.website || '',
            longBusinessSummary: summaryProfile?.longBusinessSummary || ''
        };
    } catch (error) {
        console.error("Error fetching Yahoo Finance data:", error);
        return null;
    }
}

// Update Bloomberg data fetching with currency conversion
async function getBloombergData(companyName: string): Promise<BloombergCompanyData | null> {
    try {
        const data = await getBloombergDataRaw(companyName);
        
        if (!data) {
            return null;
        }

        // Convert financial metrics to USD
        const metrics = {
            price: data.marketData.price,
            marketCap: data.marketData.marketCap,
            revenue: data.financials.revenue,
            netIncome: data.financials.netIncome,
            assets: data.financials.assets,
            liabilities: data.financials.liabilities,
            equity: data.financials.equity,
            cashFlow: data.financials.cashFlow
        };

        const convertedMetrics: { [key: string]: number } = {};
        for (const [key, value] of Object.entries(metrics)) {
            if (value) {
                convertedMetrics[`${key}USD`] = await currencyConverter.convertAmount(value, data.marketData.currency || 'USD');
            }
        }

        return {
            ...data,
            financialsUSD: convertedMetrics
        };
    } catch (error) {
        console.error("Error in getBloombergData:", error);
        return null;
    }
}

// Rename original getBloombergData to getBloombergDataRaw
async function getBloombergDataRaw(companyName: string): Promise<BloombergCompanyData | null> {
    const cacheKey = `bloomberg_${companyName.toLowerCase()}`;
    
    try {
        // Check cache first
        const cachedData = await apiCache.get<BloombergCompanyData>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        await bloombergRateLimiter.waitForSlot();
        
        const data = await retryWithBackoff(async () => {
            const url = `https://api.bloomberg.com/v1/companies/${encodeURIComponent(companyName)}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${BLOOMBERG_API_KEY.value()}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = new Error(`Bloomberg API returned ${response.status}`);
                (error as any).status = response.status;
                throw error;
            }

            const data = await response.json() as BloombergResponse;
            
            return {
                ticker: data.ticker,
                name: data.name,
                exchange: data.exchange,
                marketData: {
                    price: data.price,
                    volume: data.volume,
                    marketCap: data.marketCap,
                    peRatio: data.peRatio,
                    eps: data.eps,
                    dividend: data.dividend,
                    yield: data.yield
                },
                financials: {
                    revenue: data.revenue,
                    netIncome: data.netIncome,
                    assets: data.assets,
                    liabilities: data.liabilities,
                    equity: data.equity,
                    cashFlow: data.cashFlow
                },
                ratings: {
                    analystRating: data.analystRating,
                    targetPrice: data.targetPrice,
                    recommendations: {
                        buy: data.recommendations.buy,
                        hold: data.recommendations.hold,
                        sell: data.recommendations.sell
                    }
                }
            };
        });

        if (data) {
            // Cache successful response
            await apiCache.set(cacheKey, data);
        }

        return data;
    } catch (error) {
        console.error("Error fetching Bloomberg data:", error);
        return null;
    }
}

// Add back the interfaces
interface YahooFinanceQuote {
    shortName: string;
    longName: string;
    symbol: string;
    exchange: string;
    currency: string;
    marketCap: number;
    marketCapFormat: string;
    enterpriseValue: number;
    totalRevenue: number;
    revenueGrowth: number;
    grossMargins: number;
    operatingMargins: number;
    profitMargins: number;
    ebitda: number;
    trailingPE: number;
    forwardPE: number;
    pegRatio: number;
    beta: number;
    priceToBook: number;
    dividendYield: number;
    payoutRatio: number;
    sector: string;
    industry: string;
    fullTimeEmployees: number;
    country: string;
    website: string;
    longBusinessSummary: string;
}

interface YahooSearchResponse {
    quotes: Array<{
        symbol: string;
        longname?: string;
        shortname?: string;
        exchDisp?: string;
        typeDisp?: string;
    }>;
}

interface YahooQuoteResponse {
    quoteSummary: {
        result: Array<{
            summaryProfile?: {
                shortName?: string;
                longName?: string;
                exchange?: string;
                sector?: string;
                industry?: string;
                fullTimeEmployees?: number;
                country?: string;
                website?: string;
                longBusinessSummary?: string;
            };
            summaryDetail?: {
                currency?: string;
                trailingPE?: { raw?: number };
                forwardPE?: { raw?: number };
                dividendYield?: { raw?: number };
                payoutRatio?: { raw?: number };
            };
            financialData?: {
                marketCap?: { raw?: number; fmt?: string };
                totalRevenue?: { raw?: number };
                revenueGrowth?: { raw?: number };
                grossMargins?: { raw?: number };
                operatingMargins?: { raw?: number };
                profitMargins?: { raw?: number };
                ebitda?: { raw?: number };
            };
            defaultKeyStatistics?: {
                enterpriseValue?: { raw?: number };
                pegRatio?: { raw?: number };
                beta?: { raw?: number };
                priceToBook?: { raw?: number };
            };
        }>;
        error?: any;
    };
}

// Update BloombergCompanyData interface to include USD conversions
interface BloombergCompanyData {
    ticker: string;
    name: string;
    exchange: string;
    marketData: {
        price: number;
        volume: number;
        marketCap: number;
        peRatio: number;
        eps: number;
        dividend: number;
        yield: number;
        currency?: string;
    };
    financials: {
        revenue: number;
        netIncome: number;
        assets: number;
        liabilities: number;
        equity: number;
        cashFlow: number;
    };
    financialsUSD?: { [key: string]: number };
    ratings: {
        analystRating: string;
        targetPrice: number;
        recommendations: {
            buy: number;
            hold: number;
            sell: number;
        };
    };
}

interface BloombergResponse {
    ticker: string;
    name: string;
    exchange: string;
    price: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    eps: number;
    dividend: number;
    yield: number;
    revenue: number;
    netIncome: number;
    assets: number;
    liabilities: number;
    equity: number;
    cashFlow: number;
    analystRating: string;
    targetPrice: number;
    recommendations: {
        buy: number;
        hold: number;
        sell: number;
    };
}

// Add back the missing functions
async function getNewsData(companyName: string): Promise<NewsResponse | null> {
    try {
        const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&sortBy=relevancy&apiKey=${NEWS_API_KEY.value()}`;
        const response = await fetch(newsUrl);
        const data = await response.json() as NewsResponse;
        
        if (data && Array.isArray(data.articles)) {
            return data;
        }
        
        console.error("Invalid news API response format:", data);
        return null;
    } catch (error) {
        console.error("Error fetching news data:", error);
        return null;
    }
}

async function getSECFilings(companyName: string): Promise<SECFilingResponse | null> {
    try {
        const searchResponse = await fetch(`https://data.sec.gov/submissions/search-index.json`);
        const searchData = await searchResponse.json() as { companies: SECCompanyInfo[] };
        
        const company = searchData.companies.find(c => 
            c.name.toLowerCase().includes(companyName.toLowerCase()) ||
            c.tickers.some(t => t.toLowerCase() === companyName.toLowerCase())
        );

        if (!company) {
            console.error(`No SEC data found for company: ${companyName}`);
            return null;
        }

        const filingsUrl = `https://data.sec.gov/submissions/CIK${company.cik.padStart(10, '0')}.json`;
        const filingsResponse = await fetch(filingsUrl, {
            headers: {
                'User-Agent': 'Aidiligence/1.0',
                'Accept-Encoding': 'gzip, deflate',
                'Host': 'data.sec.gov'
            }
        });

        if (!filingsResponse.ok) {
            throw new Error(`SEC API returned ${filingsResponse.status}: ${filingsResponse.statusText}`);
        }

        const filingsData = await filingsResponse.json() as { filings: SECFilingData };
        
        return {
            filings: filingsData.filings.recent
                .filter(filing => ['10-K', '10-Q', '8-K', '20-F', '6-K'].includes(filing.form))
                .slice(0, 5)
                .map(filing => ({
                    type: filing.form,
                    filingDate: filing.filingDate,
                    description: `${filing.form} - ${filing.description || 'Periodic Report'}`,
                    url: `https://www.sec.gov/Archives/edgar/data/${company.cik}/${filing.accessionNumber}`
                }))
        };
    } catch (error) {
        console.error("Error fetching SEC filings:", error);
        return null;
    }
}

// Add LinkedIn interfaces
interface LinkedInCompanyData {
    id: string;
    name: string;
    description: string;
    industry: string;
    specialties: string[];
    website: string;
    employeeCount: number;
    headquarters: {
        country: string;
        city: string;
    };
    founded: string;
    followers: number;
    insights: {
        totalEmployees: number;
        employeeGrowth: number;
        jobOpenings: number;
    };
}

interface LinkedInResponse {
    elements: Array<{
        id: string;
        localizedName: string;
        localizedDescription: string;
        localizedIndustry: string;
        specialties: { values: string[] };
        websiteUrl: string;
        staffCount: number;
        address: {
            country: string;
            city: string;
        };
        founded: { year: string };
    }>;
}

interface LinkedInInsightsResponse {
    totalFollowerCount: number;
    employeeGrowthRate: number;
    jobOpenings: number;
}

// Add Crunchbase interfaces
interface CrunchbaseCompanyData {
    uuid: string;
    name: string;
    description: string;
    primaryRole: string;
    foundedOn: string;
    operatingStatus: string;
    categories: string[];
    funding: {
        totalRounds: number;
        totalRaised: number;
        lastRound: {
            type: string;
            amount: number;
            date: string;
        } | null;
    };
    investors: Array<{
        name: string;
        type: string;
        investmentCount: number;
    }>;
    acquisitions: Array<{
        acquiredBy: string;
        price: number;
        date: string;
    }>;
    ipos: Array<{
        date: string;
        valuationAtIpo: number;
        stockSymbol: string;
    }>;
}

interface CrunchbaseResponse {
    data: {
        uuid: string;
        name: string;
        description: string;
        primary_role: string;
        founded_on: string;
        operating_status: string;
        categories: Array<{ name: string }>;
        funding_rounds: Array<{
            funding_type: string;
            money_raised: { value: number };
            announced_on: string;
        }>;
        funding_total: { value: number };
        investors: Array<{
            name: string;
            type: string;
            investment_count: number;
        }>;
        acquisitions: Array<{
            acquirer: { name: string };
            price: { value: number };
            announced_on: string;
        }>;
        ipos: Array<{
            went_public_on: string;
            valuation: { value: number };
            stock_symbol: string;
        }>;
    };
}

// Update type annotations in functions
async function getCrunchbaseData(companyName: string): Promise<CrunchbaseCompanyData | null> {
    const cacheKey = `crunchbase_${companyName.toLowerCase()}`;
    
    try {
        const cachedData = await apiCache.get<CrunchbaseCompanyData>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        await crunchbaseRateLimiter.waitForSlot();
        
        const data = await retryWithBackoff(async () => {
            const url = `https://api.crunchbase.com/v3.1/organizations/${encodeURIComponent(companyName)}?user_key=${CRUNCHBASE_API_KEY.value()}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = new Error(`Crunchbase API returned ${response.status}`);
                (error as any).status = response.status;
                throw error;
            }

            const { data } = await response.json() as CrunchbaseResponse;

            if (!data) {
                return null;
            }

            return {
                uuid: data.uuid,
                name: data.name,
                description: data.description,
                primaryRole: data.primary_role,
                foundedOn: data.founded_on,
                operatingStatus: data.operating_status,
                categories: data.categories?.map((c: { name: string }) => c.name) || [],
                funding: {
                    totalRounds: data.funding_rounds?.length || 0,
                    totalRaised: data.funding_total?.value || 0,
                    lastRound: data.funding_rounds?.[0] ? {
                        type: data.funding_rounds[0].funding_type,
                        amount: data.funding_rounds[0].money_raised?.value || 0,
                        date: data.funding_rounds[0].announced_on
                    } : null
                },
                investors: (data.investors || []).map(investor => ({
                    name: investor.name,
                    type: investor.type,
                    investmentCount: investor.investment_count
                })),
                acquisitions: (data.acquisitions || []).map(acq => ({
                    acquiredBy: acq.acquirer?.name,
                    price: acq.price?.value || 0,
                    date: acq.announced_on
                })),
                ipos: (data.ipos || []).map(ipo => ({
                    date: ipo.went_public_on,
                    valuationAtIpo: ipo.valuation?.value || 0,
                    stockSymbol: ipo.stock_symbol
                }))
            };
        });

        if (data) {
            await apiCache.set(cacheKey, data);
        }

        return data;
    } catch (error) {
        console.error("Error fetching Crunchbase data:", error);
        return null;
    }
}

// Add back LinkedIn data fetching function
async function getLinkedInData(companyName: string): Promise<LinkedInCompanyData | null> {
    const cacheKey = `linkedin_${companyName.toLowerCase()}`;
    
    try {
        const cachedData = await apiCache.get<LinkedInCompanyData>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        await linkedInRateLimiter.waitForSlot();
        
        const data = await retryWithBackoff(async () => {
            const url = `https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${encodeURIComponent(companyName)}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${LINKEDIN_API_KEY.value()}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = new Error(`LinkedIn API returned ${response.status}`);
                (error as any).status = response.status;
                throw error;
            }

            const data = await response.json() as LinkedInResponse;
            const company = data.elements?.[0];

            if (!company) {
                return null;
            }

            const insightsUrl = `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${company.id}`;
            const insightsResponse = await fetch(insightsUrl, {
                headers: {
                    'Authorization': `Bearer ${LINKEDIN_API_KEY.value()}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });
            
            const insights = await insightsResponse.json() as LinkedInInsightsResponse;

            return {
                id: company.id,
                name: company.localizedName,
                description: company.localizedDescription,
                industry: company.localizedIndustry,
                specialties: company.specialties?.values || [],
                website: company.websiteUrl,
                employeeCount: company.staffCount,
                headquarters: {
                    country: company.address?.country,
                    city: company.address?.city
                },
                founded: company.founded?.year,
                followers: insights.totalFollowerCount,
                insights: {
                    totalEmployees: company.staffCount,
                    employeeGrowth: insights.employeeGrowthRate || 0,
                    jobOpenings: insights.jobOpenings || 0
                }
            };
        });

        if (data) {
            await apiCache.set(cacheKey, data);
        }

        return data;
    } catch (error) {
        console.error("Error fetching LinkedIn data:", error);
        return null;
    }
}

// Update the generateDueDiligence function
export const generateDueDiligence = onRequest({ 
    memory: "1GiB",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 10,
    invoker: "public"
}, async (request, response) => {
    return corsHandler(request, response, async () => {
        try {
            const data = request.body;
            if (!data.company) {
                response.status(400).json({ error: "Company name is required" });
                return;
            }

            const ai = initializeGenAI();
            if (!ai) {
                response.status(500).json({ error: "Gemini AI is not configured" });
                return;
            }

            // Rest of the generateDueDiligence implementation...
            const [
                _companyData,
                newsData,
                secData,
                yahooData,
                linkedinData,
                crunchbaseData,
                bloombergData
            ] = await Promise.all([
                getCompanyData(data.company),
                getNewsData(data.company),
                getSECFilings(data.company),
                getYahooFinanceData(data.company),
                getLinkedInData(data.company),
                getCrunchbaseData(data.company),
                getBloombergData(data.company)
            ]);

            // Construct a more sophisticated analysis prompt
            const prompt = `Generate a professional, data-driven due diligence report for ${data.company}.

REPORT STRUCTURE AND REQUIREMENTS:

1. Executive Summary (2-3 paragraphs)
- Company snapshot with key metrics
- Critical findings and investment thesis
- Major risk factors and opportunities
- Current market position and competitive advantages

2. Financial Analysis (Detailed with metrics)
${yahooData ? `
Key Financial Metrics:
- Market Cap: ${yahooData.marketCapFormat}
- Revenue Growth: ${(yahooData.revenueGrowth * 100).toFixed(2)}%
- Operating Margins: ${(yahooData.operatingMargins * 100).toFixed(2)}%
- EBITDA: ${yahooData.ebitda}
- P/E Ratio: ${yahooData.trailingPE}
- Forward P/E: ${yahooData.forwardPE}
- PEG Ratio: ${yahooData.pegRatio}
- Beta: ${yahooData.beta}` : 'Financial data not available'}

${bloombergData ? `
Bloomberg Analysis:
- Analyst Rating: ${bloombergData.ratings.analystRating}
- Target Price: ${bloombergData.ratings.targetPrice}
- Buy/Hold/Sell Ratio: ${bloombergData.ratings.recommendations.buy}/${bloombergData.ratings.recommendations.hold}/${bloombergData.ratings.recommendations.sell}
- Market Data: ${JSON.stringify(bloombergData.marketData, null, 2)}
- Financial Metrics: ${JSON.stringify(bloombergData.financials, null, 2)}` : ''}

3. Market Position & Competitive Analysis
${linkedinData ? `
Company Profile (LinkedIn):
- Industry: ${linkedinData.industry}
- Employee Count: ${linkedinData.employeeCount}
- Employee Growth: ${linkedinData.insights.employeeGrowth}%
- Job Openings: ${linkedinData.insights.jobOpenings}
- Specialties: ${linkedinData.specialties?.join(', ')}` : ''}

4. Investment History & Funding
${crunchbaseData ? `
Crunchbase Data:
- Founded: ${crunchbaseData.foundedOn}
- Total Funding: ${crunchbaseData.funding.totalRaised}
- Latest Round: ${crunchbaseData.funding.lastRound?.type} (${crunchbaseData.funding.lastRound?.amount})
- Key Investors: ${crunchbaseData.investors.map(i => i.name).join(', ')}
- Acquisitions: ${crunchbaseData.acquisitions.length}
- IPO Status: ${crunchbaseData.ipos.length > 0 ? 'Public' : 'Private'}` : ''}

5. Recent Developments & News
${newsData?.articles ? newsData.articles.slice(0, 5).map(article => 
    `- ${article.title} (${article.source.name}, ${new Date(article.publishedAt).toLocaleDateString()})`
).join('\n') : 'No recent news available'}

6. Regulatory Compliance & SEC Filings
${secData?.filings ? secData.filings.map(filing => 
    `- ${filing.type} (${filing.filingDate}): ${filing.description}`
).join('\n') : 'No SEC filings available'}

ANALYSIS REQUIREMENTS:

1. Financial Health Assessment
- Analyze key financial ratios and trends
- Compare metrics against industry standards
- Evaluate capital structure and efficiency
- Assess liquidity and cash flow management
- Highlight any red flags or concerns

2. Market Position Evaluation
- Analyze market share and competitive position
- Evaluate brand strength and reputation
- Assess product/service differentiation
- Analyze pricing power and market influence
- Identify key competitive advantages

3. Risk Assessment
- Identify and analyze operational risks
- Evaluate market and competitive risks
- Assess regulatory and compliance risks
- Analyze financial and liquidity risks
- Consider technological and disruption risks
- Evaluate ESG risks and opportunities

4. Growth Analysis
- Evaluate organic growth opportunities
- Assess M&A potential and strategy
- Analyze market expansion possibilities
- Evaluate product development pipeline
- Consider technological innovation potential

5. Management & Governance
- Evaluate management team experience
- Assess corporate governance structure
- Analyze decision-making processes
- Review compensation and incentives
- Evaluate succession planning

6. Investment Considerations
- Provide detailed valuation analysis
- Compare against industry peers
- Identify key investment risks
- Evaluate potential returns
- Consider exit opportunities

FORMAT REQUIREMENTS:
- Use professional, precise language
- Include specific data points and metrics
- Provide evidence-based conclusions
- Use bullet points for clarity
- Include source citations
- Maintain objectivity
- Highlight both positives and negatives
- Provide actionable insights

The report should be thorough, data-driven, and actionable for professional investors. Focus on quantitative analysis where data is available and qualitative analysis where needed.`;

            // Generate the analysis using the AI model
            const model = ai.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            response.json({ data: text });
        } catch (error) {
            console.error("Error in generateDueDiligence:", error);
            response.status(500).json({ 
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    });
});

export const generateText = onRequest({ 
    memory: "1GiB",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 10,
    invoker: "public"
}, async (request, response) => {
    return corsHandler(request, response, async () => {
        try {
            const data = request.body;
            if (!data.prompt) {
                response.status(400).json({ error: "Prompt is required" });
                return;
            }

            if (!GEMINI_API_KEY.value()) {
                response.status(500).json({ error: "Gemini API key is not configured" });
                return;
            }

            console.log('Generating text for prompt:', data.prompt);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(data.prompt);
            const text = result.response.text();
            console.log('Generated text successfully');
            response.json({ data: text });
        } catch (error) {
            console.error("Error in generateText:", error);
            response.status(500).json({ 
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    });
});