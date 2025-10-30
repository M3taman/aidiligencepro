import axios from 'axios';
import * as functions from 'firebase-functions';

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  eps: number;
  beta: number;
  week52High: number;
  week52Low: number;
}

interface FinancialMetrics {
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholderEquity: number;
  debtToEquity: number;
  currentRatio: number;
  returnOnEquity: number;
  profitMargin: number;
}

export class FinancialDataService {
  private alphaVantageKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.alphaVantageKey = functions.config().alphavantage?.key || process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const result: StockQuote = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        marketCap: 0, // Will be fetched from overview
        pe: 0, // Will be fetched from overview
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close'])
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw new functions.https.HttpsError('unavailable', `Failed to fetch stock data for ${symbol}`);
    }
  }

  async getCompanyOverview(symbol: string): Promise<CompanyOverview> {
    const cacheKey = `overview_${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'OVERVIEW',
          symbol: symbol.toUpperCase(),
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      const data = response.data;
      if (!data || Object.keys(data).length === 0 || data.Note) {
        throw new Error(`No overview data found for symbol: ${symbol}`);
      }

      const result: CompanyOverview = {
        symbol: data.Symbol,
        name: data.Name,
        description: data.Description,
        sector: data.Sector,
        industry: data.Industry,
        marketCap: parseFloat(data.MarketCapitalization) || 0,
        peRatio: parseFloat(data.PERatio) || 0,
        dividendYield: parseFloat(data.DividendYield) || 0,
        eps: parseFloat(data.EPS) || 0,
        beta: parseFloat(data.Beta) || 0,
        week52High: parseFloat(data['52WeekHigh']) || 0,
        week52Low: parseFloat(data['52WeekLow']) || 0
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching company overview:', error);
      throw new functions.https.HttpsError('unavailable', `Failed to fetch company overview for ${symbol}`);
    }
  }

  async getFinancialMetrics(symbol: string): Promise<FinancialMetrics> {
    const cacheKey = `metrics_${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Fetch income statement
      const incomeResponse = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'INCOME_STATEMENT',
          symbol: symbol.toUpperCase(),
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      // Fetch balance sheet
      const balanceResponse = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'BALANCE_SHEET',
          symbol: symbol.toUpperCase(),
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      // Fetch cash flow
      const cashFlowResponse = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'CASH_FLOW',
          symbol: symbol.toUpperCase(),
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      const latestIncome = incomeResponse.data.annualReports?.[0];
      const latestBalance = balanceResponse.data.annualReports?.[0];
      const latestCashFlow = cashFlowResponse.data.annualReports?.[0];

      if (!latestIncome || !latestBalance || !latestCashFlow) {
        throw new Error(`Incomplete financial data for symbol: ${symbol}`);
      }

      const totalAssets = parseFloat(latestBalance.totalAssets) || 0;
      const totalLiabilities = parseFloat(latestBalance.totalLiabilities) || 0;
      const shareholderEquity = parseFloat(latestBalance.totalShareholderEquity) || 0;
      const revenue = parseFloat(latestIncome.totalRevenue) || 0;
      const netIncome = parseFloat(latestIncome.netIncome) || 0;

      const result: FinancialMetrics = {
        revenue,
        netIncome,
        operatingCashFlow: parseFloat(latestCashFlow.operatingCashflow) || 0,
        totalAssets,
        totalLiabilities,
        shareholderEquity,
        debtToEquity: totalLiabilities / shareholderEquity,
        currentRatio: parseFloat(latestBalance.totalCurrentAssets) / parseFloat(latestBalance.totalCurrentLiabilities) || 0,
        returnOnEquity: (netIncome / shareholderEquity) * 100,
        profitMargin: (netIncome / revenue) * 100
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      throw new functions.https.HttpsError('unavailable', `Failed to fetch financial metrics for ${symbol}`);
    }
  }

  async getHistoricalData(symbol: string, period: string = '1y'): Promise<any[]> {
    const cacheKey = `historical_${symbol}_${period}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol.toUpperCase(),
          outputsize: period === '1y' ? 'full' : 'compact',
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const result = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).slice(0, 365); // Last year of data

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new functions.https.HttpsError('unavailable', `Failed to fetch historical data for ${symbol}`);
    }
  }

  async searchSymbol(query: string): Promise<any[]> {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.alphaVantageKey
        },
        timeout: 10000
      });

      const matches = response.data.bestMatches || [];
      return matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));
    } catch (error) {
      console.error('Error searching symbol:', error);
      throw new functions.https.HttpsError('unavailable', 'Failed to search for symbol');
    }
  }
}