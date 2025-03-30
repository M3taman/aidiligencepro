import axios from 'axios';
import { CompanyData, NewsItem, SECFiling } from '../features/due-diligence/types';

// API Keys - in production, these should be environment variables
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY || 'demo';

// Cache mechanism to avoid hitting API rate limits
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const cache: Record<string, CacheItem<any>> = {};

/**
 * Get cached data or fetch new data if cache is expired
 */
async function getCachedData<T>(
  cacheKey: string, 
  fetchFn: () => Promise<T>, 
  expiryTime: number = 3600000 // 1 hour by default
): Promise<T> {
  const now = Date.now();
  const cachedItem = cache[cacheKey];
  
  if (cachedItem && now < cachedItem.expiry) {
    console.log(`Using cached data for ${cacheKey}`);
    return cachedItem.data;
  }
  
  try {
    console.log(`Fetching fresh data for ${cacheKey}`);
    const data = await fetchFn();
    
    // Cache the result
    cache[cacheKey] = {
      data,
      timestamp: now,
      expiry: now + expiryTime
    };
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${cacheKey}:`, error);
    
    // If we have stale cache, return it as fallback
    if (cachedItem) {
      console.log(`Using stale cached data for ${cacheKey}`);
      return cachedItem.data;
    }
    
    throw error;
  }
}

/**
 * Search for a company by name and get its ticker symbol
 */
export async function searchCompany(companyName: string): Promise<{ symbol: string; name: string; } | null> {
  return getCachedData(
    `company_search_${companyName}`,
    async () => {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: companyName,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });
      
      if (response.data.bestMatches && response.data.bestMatches.length > 0) {
        const bestMatch = response.data.bestMatches[0];
        return {
          symbol: bestMatch['1. symbol'],
          name: bestMatch['2. name']
        };
      }
      
      return null;
    },
    86400000 // Cache for 24 hours
  );
}

/**
 * Get company overview data
 */
export async function getCompanyOverview(symbol: string): Promise<CompanyData | null> {
  return getCachedData(
    `company_overview_${symbol}`,
    async () => {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'OVERVIEW',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });
      
      if (response.data && response.data.Symbol) {
        const data = response.data;
        return {
          Symbol: data.Symbol,
          AssetType: data.AssetType,
          Name: data.Name,
          Description: data.Description,
          Exchange: data.Exchange,
          Currency: data.Currency,
          Country: data.Country,
          Sector: data.Sector,
          Industry: data.Industry,
          MarketCapitalization: parseFloat(data.MarketCapitalization) || 0,
          EBITDA: parseFloat(data.EBITDA) || 0,
          PERatio: parseFloat(data.PERatio) || 0,
          PEGRatio: parseFloat(data.PEGRatio) || 0,
          BookValue: parseFloat(data.BookValue) || 0,
          DividendPerShare: parseFloat(data.DividendPerShare) || 0,
          DividendYield: parseFloat(data.DividendYield) || 0,
          EPS: parseFloat(data.EPS) || 0,
          RevenuePerShareTTM: parseFloat(data.RevenuePerShareTTM) || 0,
          ProfitMargin: parseFloat(data.ProfitMargin) || 0,
          OperatingMarginTTM: parseFloat(data.OperatingMarginTTM) || 0,
          ReturnOnAssetsTTM: parseFloat(data.ReturnOnAssetsTTM) || 0,
          ReturnOnEquityTTM: parseFloat(data.ReturnOnEquityTTM) || 0,
          RevenueTTM: parseFloat(data.RevenueTTM) || 0,
          GrossProfitTTM: parseFloat(data.GrossProfitTTM) || 0,
          QuarterlyEarningsGrowthYOY: parseFloat(data.QuarterlyEarningsGrowthYOY) || 0,
          QuarterlyRevenueGrowthYOY: parseFloat(data.QuarterlyRevenueGrowthYOY) || 0,
          AnalystTargetPrice: parseFloat(data.AnalystTargetPrice) || 0,
          TrailingPE: parseFloat(data.TrailingPE) || 0,
          ForwardPE: parseFloat(data.ForwardPE) || 0,
          PriceToSalesRatioTTM: parseFloat(data.PriceToSalesRatioTTM) || 0,
          PriceToBookRatio: parseFloat(data.PriceToBookRatio) || 0,
          EVToRevenue: parseFloat(data.EVToRevenue) || 0,
          EVToEBITDA: parseFloat(data.EVToEBITDA) || 0,
          Beta: parseFloat(data.Beta) || 0,
          52WeekHigh: parseFloat(data['52WeekHigh']) || 0,
          52WeekLow: parseFloat(data['52WeekLow']) || 0,
          50DayMovingAverage: parseFloat(data['50DayMovingAverage']) || 0,
          200DayMovingAverage: parseFloat(data['200DayMovingAverage']) || 0,
          SharesOutstanding: parseFloat(data.SharesOutstanding) || 0,
          SharesFloat: parseFloat(data.SharesFloat) || 0,
          SharesShort: parseFloat(data.SharesShort) || 0,
          SharesShortPriorMonth: parseFloat(data.SharesShortPriorMonth) || 0,
          ShortRatio: parseFloat(data.ShortRatio) || 0,
          ShortPercentOutstanding: parseFloat(data.ShortPercentOutstanding) || 0,
          ShortPercentFloat: parseFloat(data.ShortPercentFloat) || 0,
          PercentInsiders: parseFloat(data.PercentInsiders) || 0,
          PercentInstitutions: parseFloat(data.PercentInstitutions) || 0,
          ForwardAnnualDividendRate: parseFloat(data.ForwardAnnualDividendRate) || 0,
          ForwardAnnualDividendYield: parseFloat(data.ForwardAnnualDividendYield) || 0,
          PayoutRatio: parseFloat(data.PayoutRatio) || 0,
          LastSplitFactor: data.LastSplitFactor || 'None',
          LastSplitDate: data.LastSplitDate || 'None'
        };
      }
      
      return null;
    },
    3600000 // Cache for 1 hour
  );
}

/**
 * Get company financial ratios
 */
export async function getFinancialRatios(symbol: string): Promise<any | null> {
  return getCachedData(
    `financial_ratios_${symbol}`,
    async () => {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/metric`, {
          params: {
            symbol,
            metric: 'all',
            token: FINNHUB_API_KEY
          }
        });
        
        if (response.data && response.data.metric) {
          return response.data.metric;
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching financial ratios:', error);
        return null;
      }
    },
    86400000 // Cache for 24 hours
  );
}

/**
 * Get company news
 */
export async function getCompanyNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
  return getCachedData(
    `company_news_${symbol}_${limit}`,
    async () => {
      try {
        // Get current date and date from 30 days ago
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };
        
        const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
          params: {
            symbol,
            from: formatDate(thirtyDaysAgo),
            to: formatDate(today),
            token: FINNHUB_API_KEY
          }
        });
        
        if (Array.isArray(response.data)) {
          return response.data.slice(0, limit).map((item: any) => ({
            title: item.headline,
            url: item.url,
            date: new Date(item.datetime * 1000).toISOString().split('T')[0],
            source: item.source,
            summary: item.summary
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching company news:', error);
        return [];
      }
    },
    3600000 // Cache for 1 hour
  );
}

/**
 * Get SEC filings
 */
export async function getSECFilings(symbol: string, limit: number = 10): Promise<SECFiling[]> {
  return getCachedData(
    `sec_filings_${symbol}_${limit}`,
    async () => {
      try {
        const response = await axios.get(`https://api.polygon.io/v3/reference/tickers/${symbol}/filings`, {
          params: {
            limit,
            apiKey: POLYGON_API_KEY
          }
        });
        
        if (response.data && Array.isArray(response.data.results)) {
          return response.data.results.map((filing: any) => ({
            type: filing.filing_type || '',
            date: filing.filing_date || '',
            description: filing.description || '',
            url: filing.filing_url || ''
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching SEC filings:', error);
        return [];
      }
    },
    86400000 // Cache for 24 hours
  );
}

/**
 * Get company competitors
 */
export async function getCompanyCompetitors(symbol: string, sector: string, industry: string): Promise<string[]> {
  return getCachedData(
    `competitors_${sector}_${industry}`,
    async () => {
      try {
        // This would ideally be a call to a proper API that returns competitors
        // For now, we'll use a simplified approach based on industry
        const response = await axios.get('https://finnhub.io/api/v1/stock/peers', {
          params: {
            symbol,
            token: FINNHUB_API_KEY
          }
        });
        
        if (Array.isArray(response.data)) {
          return response.data.filter(peer => peer !== symbol).slice(0, 5);
        }
        
        // Fallback to industry-based competitors
        const industryCompetitors: Record<string, string[]> = {
          'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
          'Financial Services': ['JPM', 'BAC', 'WFC', 'C', 'GS'],
          'Healthcare': ['JNJ', 'PFE', 'MRK', 'UNH', 'ABBV'],
          'Consumer Cyclical': ['AMZN', 'HD', 'MCD', 'NKE', 'SBUX'],
          'Communication Services': ['GOOGL', 'META', 'DIS', 'NFLX', 'VZ'],
          'Industrials': ['HON', 'UNP', 'UPS', 'CAT', 'BA'],
          'Consumer Defensive': ['WMT', 'PG', 'KO', 'PEP', 'COST'],
          'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
          'Basic Materials': ['LIN', 'SHW', 'APD', 'ECL', 'NEM'],
          'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA'],
          'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP']
        };
        
        return industryCompetitors[sector] || ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
      } catch (error) {
        console.error('Error fetching company competitors:', error);
        return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
      }
    },
    604800000 // Cache for 1 week
  );
}

/**
 * Get market data for a list of symbols
 */
export async function getMarketData(symbols: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  
  await Promise.all(symbols.map(async (symbol) => {
    try {
      const data = await getCachedData(
        `market_data_${symbol}`,
        async () => {
          const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
              function: 'GLOBAL_QUOTE',
              symbol,
              apikey: ALPHA_VANTAGE_API_KEY
            }
          });
          
          if (response.data && response.data['Global Quote']) {
            const quote = response.data['Global Quote'];
            return {
              symbol,
              price: parseFloat(quote['05. price']) || 0,
              change: parseFloat(quote['09. change']) || 0,
              changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
              volume: parseInt(quote['06. volume']) || 0,
              latestTradingDay: quote['07. latest trading day']
            };
          }
          
          return null;
        },
        3600000 // Cache for 1 hour
      );
      
      if (data) {
        results[symbol] = data;
      }
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
    }
  }));
  
  return results;
}

/**
 * Get historical price data
 */
export async function getHistoricalPrices(symbol: string, interval: string = 'monthly', outputSize: string = 'compact'): Promise<any[]> {
  return getCachedData(
    `historical_prices_${symbol}_${interval}_${outputSize}`,
    async () => {
      try {
        let timeSeriesFunction = 'TIME_SERIES_MONTHLY';
        if (interval === 'daily') timeSeriesFunction = 'TIME_SERIES_DAILY';
        if (interval === 'weekly') timeSeriesFunction = 'TIME_SERIES_WEEKLY';
        
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: timeSeriesFunction,
            symbol,
            outputsize: outputSize,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });
        
        const timeSeriesKey = Object.keys(response.data).find(key => key.includes('Time Series'));
        if (timeSeriesKey && response.data[timeSeriesKey]) {
          const timeSeries = response.data[timeSeriesKey];
          return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
            date,
            open: parseFloat(values['1. open']) || 0,
            high: parseFloat(values['2. high']) || 0,
            low: parseFloat(values['3. low']) || 0,
            close: parseFloat(values['4. close']) || 0,
            volume: parseInt(values['5. volume']) || 0
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching historical prices:', error);
        return [];
      }
    },
    86400000 // Cache for 24 hours
  );
}

/**
 * Get industry performance metrics
 */
export async function getIndustryPerformance(industry: string): Promise<any | null> {
  // This is a placeholder. In a real implementation, you would call an API
  // that provides industry performance metrics
  return {
    industry,
    averagePERatio: 22.5,
    averageROE: 15.3,
    averageROA: 8.7,
    growthRate: 7.2,
    marketSize: '$1.2T',
    topPerformers: ['AAPL', 'MSFT', 'GOOGL']
  };
}

/**
 * Get economic indicators
 */
export async function getEconomicIndicators(): Promise<any | null> {
  return getCachedData(
    'economic_indicators',
    async () => {
      try {
        // GDP growth rate
        const gdpResponse = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'REAL_GDP',
            interval: 'quarterly',
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });
        
        // Inflation rate
        const inflationResponse = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'INFLATION',
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });
        
        // Unemployment rate
        const unemploymentResponse = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'UNEMPLOYMENT',
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });
        
        // Interest rates
        const interestRateResponse = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'FEDERAL_FUNDS_RATE',
            interval: 'monthly',
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });
        
        return {
          gdp: gdpResponse.data.data ? gdpResponse.data.data[0].value : null,
          inflation: inflationResponse.data.data ? inflationResponse.data.data[0].value : null,
          unemployment: unemploymentResponse.data.data ? unemploymentResponse.data.data[0].value : null,
          interestRate: interestRateResponse.data.data ? interestRateResponse.data.data[0].value : null,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Error fetching economic indicators:', error);
        return null;
      }
    },
    86400000 // Cache for 24 hours
  );
}
