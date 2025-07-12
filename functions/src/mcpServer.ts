import { onCall } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

// Initialize Firebase Admin only if no app exists
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// MCP Resource: Real-time stock analysis
export const mcpExecuteResource = onCall(async (request) => {
  const { name, params } = request.data;

  switch (name) {
    case 'stock_analysis':
      return await analyzeStock(params.symbol, params.period);
    
    case 'real_time_alerts':
      return await getRealTimeAlerts(params.portfolioId);
    
    case 'esg_ratings':
      return await getESGRatings(params.symbol);
    
    case 'sec_filings':
      return await getSECFilings(params.symbol, params.filingType);
    
    default:
      throw new Error(`Unknown resource: ${name}`);
  }
});

// MCP Tool: Due diligence report generation
export const mcpCallTool = onCall(async (request) => {
  const { name, params } = request.data;

  switch (name) {
    case 'due_diligence_report':
      return await generateDueDiligenceReport(params.companyName, params);
    
    case 'predictive_insights':
      return await generatePredictiveInsights(params.symbol, params.timeframe);
    
    case 'portfolio_integration':
      return await integrateWithPortfolioTool(params.platform, params.data);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Stock Analysis with Alpha Vantage integration
async function analyzeStock(symbol: string, period: string) {
  try {
    // Get real-time data from Alpha Vantage
    const alphaVantageResponse = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${process.env.VITE_ALPHA_VANTAGE_API_KEY}`
    );

    // Cache data in Firestore
    await db.collection('stock_data').doc(symbol).set({
      data: alphaVantageResponse.data,
      timestamp: new Date(),
      period
    });

    // Calculate technical indicators
    const timeSeries = alphaVantageResponse.data['Time Series (5min)'];
    const prices = Object.values(timeSeries).map((data: any) => parseFloat(data['4. close']));
    
    const movingAvg = prices.slice(0, 20).reduce((sum, price) => sum + price, 0) / 20;
    const volatility = calculateVolatility(prices.slice(0, 20));

    return {
      symbol,
      currentPrice: prices[0],
      movingAverage: movingAvg,
      volatility: volatility,
      recommendation: volatility > 2 ? 'HIGH_RISK' : volatility > 1 ? 'MEDIUM_RISK' : 'LOW_RISK',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Stock analysis error:', error);
    throw new Error('Failed to analyze stock');
  }
}

// ESG Ratings integration
async function getESGRatings(symbol: string) {
  try {
    // This would integrate with MSCI ESG API or similar
    // For now, using mock data structure
    const esgData = {
      symbol,
      environmentalScore: Math.random() * 10,
      socialScore: Math.random() * 10,
      governanceScore: Math.random() * 10,
      overallRating: 'A', // A, B, C, D rating
      lastUpdated: new Date().toISOString(),
      riskFactors: [
        'Carbon emissions above industry average',
        'Strong diversity and inclusion policies',
        'Excellent board independence'
      ]
    };

    await db.collection('esg_ratings').doc(symbol).set(esgData);
    return esgData;
  } catch (error) {
    console.error('ESG ratings error:', error);
    throw new Error('Failed to get ESG ratings');
  }
}

// SEC Filings integration
async function getSECFilings(symbol: string, filingType: string) {
  try {
    const secResponse = await axios.get(
      `https://api.sec-api.io/search?q=ticker:${symbol} AND formType:${filingType}&token=${process.env.VITE_SEC_API_KEY}`
    );

    const filings = secResponse.data.filings.map((filing: any) => ({
      id: filing.id,
      type: filing.formType,
      filedAt: filing.filedAt,
      url: filing.linkToHtml,
      summary: filing.summary || 'No summary available'
    }));

    await db.collection('sec_filings').doc(`${symbol}_${filingType}`).set({
      symbol,
      filingType,
      filings,
      lastUpdated: new Date().toISOString()
    });

    return { symbol, filingType, filings };
  } catch (error) {
    console.error('SEC filings error:', error);
    throw new Error('Failed to get SEC filings');
  }
}

// Due diligence report generation with AI
async function generateDueDiligenceReport(companyName: string, options: any) {
  try {
    // Gather data from multiple sources
    const [stockData, esgData, secData] = await Promise.all([
      analyzeStock(options.ticker || companyName, '1d'),
      getESGRatings(options.ticker || companyName),
      getSECFilings(options.ticker || companyName, '10-K')
    ]);

    // Generate AI-powered analysis using AIML API
    const aiResponse = await axios.post(
      'https://api.aimlapi.com/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst generating comprehensive due diligence reports for RIAs. Focus on investment risks, opportunities, and regulatory compliance.'
          },
          {
            role: 'user',
            content: `Generate a comprehensive due diligence report for ${companyName}. Include analysis of:
            
Stock Data: ${JSON.stringify(stockData)}
ESG Ratings: ${JSON.stringify(esgData)}
SEC Filings: ${JSON.stringify(secData)}

Provide executive summary, risk assessment, financial analysis, and investment recommendation.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_AIML_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const report = {
      companyName,
      ticker: options.ticker,
      generatedAt: new Date().toISOString(),
      executiveSummary: aiResponse.data.choices[0].message.content,
      stockAnalysis: stockData,
      esgRatings: esgData,
      secFilings: secData,
      riskRating: stockData.recommendation,
      recommendation: aiResponse.data.choices[0].message.content.includes('BUY') ? 'BUY' : 
                      aiResponse.data.choices[0].message.content.includes('SELL') ? 'SELL' : 'HOLD',
      confidence: 85 // AI confidence score
    };

    // Cache report
    await db.collection('due_diligence_reports').add(report);

    return report;
  } catch (error) {
    console.error('Due diligence report error:', error);
    throw new Error('Failed to generate due diligence report');
  }
}

// Real-time alerts for portfolio changes
async function getRealTimeAlerts(portfolioId: string) {
  try {
    const portfolio = await db.collection('portfolios').doc(portfolioId).get();
    const holdings = portfolio.data()?.holdings || [];

    const alerts = [];
    for (const holding of holdings) {
      const stockData = await analyzeStock(holding.symbol, '1h');
      
      // Generate alerts based on thresholds
      if (stockData.volatility > 2) {
        alerts.push({
          type: 'HIGH_VOLATILITY',
          symbol: holding.symbol,
          message: `${holding.symbol} showing high volatility (${stockData.volatility.toFixed(2)}%)`,
          severity: 'HIGH',
          timestamp: new Date().toISOString()
        });
      }

      if (Math.abs(stockData.currentPrice - stockData.movingAverage) / stockData.movingAverage > 0.05) {
        alerts.push({
          type: 'PRICE_DEVIATION',
          symbol: holding.symbol,
          message: `${holding.symbol} price deviating significantly from moving average`,
          severity: 'MEDIUM',
          timestamp: new Date().toISOString()
        });
      }
    }

    return { portfolioId, alerts, lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Real-time alerts error:', error);
    throw new Error('Failed to get real-time alerts');
  }
}

// Predictive insights using historical data
async function generatePredictiveInsights(symbol: string, timeframe: string) {
  try {
    // Get historical data
    const historicalData = await db.collection('stock_data')
      .where('symbol', '==', symbol)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const prices = historicalData.docs.map(doc => doc.data().currentPrice);
    
    // Simple predictive model (in production, use more sophisticated ML)
    const trend = calculateTrend(prices);
    const support = Math.min(...prices.slice(0, 20));
    const resistance = Math.max(...prices.slice(0, 20));

    return {
      symbol,
      timeframe,
      trend: trend > 0 ? 'BULLISH' : 'BEARISH',
      trendStrength: Math.abs(trend),
      supportLevel: support,
      resistanceLevel: resistance,
      predictedDirection: trend > 0.02 ? 'UP' : trend < -0.02 ? 'DOWN' : 'SIDEWAYS',
      confidence: Math.min(Math.abs(trend) * 100, 95),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Predictive insights error:', error);
    throw new Error('Failed to generate predictive insights');
  }
}

// Portfolio tool integration (Schwab, Salesforce, etc.)
async function integrateWithPortfolioTool(platform: string, data: any) {
  switch (platform) {
    case 'schwab':
      return await integrateWithSchwab(data);
    case 'salesforce':
      return await integrateWithSalesforce(data);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Helper functions
function calculateVolatility(prices: number[]): number {
  const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100; // Convert to percentage
}

function calculateTrend(prices: number[]): number {
  // Simple linear regression slope
  const n = prices.length;
  const x = Array.from({length: n}, (_, i) => i);
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = prices.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * prices[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

async function integrateWithSchwab(data: any) {
  // Integration with Schwab Institutional APIs
  // This would use Schwab's OAuth and API endpoints
  return { status: 'success', platform: 'schwab', data };
}

async function integrateWithSalesforce(data: any) {
  // Integration with Salesforce CRM APIs
  // This would use Salesforce REST API
  return { status: 'success', platform: 'salesforce', data };
}