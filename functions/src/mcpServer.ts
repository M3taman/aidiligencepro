import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FinancialDataService } from './services/financialDataService';
import { AIAnalysisService } from './services/aiAnalysisService';
import { NewsService } from './services/newsService';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const financialService = new FinancialDataService();
const aiService = new AIAnalysisService();
const newsService = new NewsService();

// Simple in-memory rate limiter per user: 30 requests per 15 min
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const rateMap: Map<string, { count: number; windowStart: number }> = new Map();

function enforceRateLimit(uid: string) {
  const now = Date.now();
  const entry = rateMap.get(uid);
  if (!entry) {
    rateMap.set(uid, { count: 1, windowStart: now });
    return;
  }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(uid, { count: 1, windowStart: now });
    return;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
  }
  entry.count += 1;
  rateMap.set(uid, entry);
}

function validateSymbol(symbol: unknown): string | null {
  if (typeof symbol !== 'string') return null;
  const s = symbol.trim().toUpperCase();
  if (!/^[A-Z.\-]{1,10}$/.test(s)) return null;
  return s;
}

async function resolveSymbol(data: any): Promise<{ symbol: string; companyName: string }> {
  const inputSymbol = validateSymbol(data?.symbol);
  if (inputSymbol) {
    return { symbol: inputSymbol, companyName: data?.company || inputSymbol };
  }
  const companyQuery = typeof data?.company === 'string' ? data.company.trim() : '';
  if (!companyQuery) {
    throw new functions.https.HttpsError('invalid-argument', 'Provide a valid "symbol" (e.g., AAPL) or "company" name.');
  }
  const matches = await financialService.searchSymbol(companyQuery);
  if (!matches.length) {
    throw new functions.https.HttpsError('not-found', `No matches found for company: ${companyQuery}`);
  }
  return { symbol: matches[0].symbol.toUpperCase(), companyName: matches[0].name || companyQuery };
}

function formatCurrency(n: number): string {
  if (!isFinite(n)) return 'N/A';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

async function generatePdfSummary(report: any): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  let y = height - 40;

  const draw = (text: string, bold = false, size = fontSize) => {
    const f = bold ? fontBold : font;
    page.drawText(text, { x: 50, y, font: f, size, color: rgb(0, 0, 0) });
    y -= size + 6;
  };

  draw(`Due Diligence Report: ${report?.overview?.name || report?.symbol}`, true, 18);
  draw(`Symbol: ${report?.symbol}`, false, 12);
  draw(`Generated At: ${new Date().toLocaleString()}`, false, 12);
  y -= 10;

  draw('Key Metrics', true, 14);
  const km = report.keyMetrics || {};
  Object.keys(km).forEach((k) => draw(`${k}: ${km[k]}`, false, 12));
  y -= 6;

  draw('Recommendation', true, 14);
  const rec = report.recommendation || {};
  draw(`Action: ${rec.action?.toUpperCase() || 'N/A'} (Confidence: ${Math.round((rec.confidence || 0) * 100)}%)`, false, 12);
  draw(`Target Price: ${rec.targetPrice ? `$${rec.targetPrice.toFixed(2)}` : 'N/A'} | Horizon: ${rec.timeHorizon || 'N/A'}`, false, 12);
  y -= 6;

  draw('Risk Assessment', true, 14);
  const risk = report.risk || {};
  draw(`Overall Risk: ${risk.overallRisk || 'N/A'} (${Math.round(risk.riskScore || 0)}/100)`, false, 12);
  if (risk.concerns?.length) {
    draw('Concerns:', false, 12);
    risk.concerns.slice(0, 6).forEach((c: string) => draw(`- ${c}`, false, 12));
  }
  y -= 6;

  draw('Summary', true, 14);
  draw(report.reportSummary || 'No summary available.', false, 12);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}

export const getMCPData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  }
  enforceRateLimit(context.auth.uid);

  const { symbol, companyName } = await resolveSymbol(data);

  try {
    const [quote, overview, financials, historical, news, secFilings] = await Promise.all([
      financialService.getStockQuote(symbol),
      financialService.getCompanyOverview(symbol),
      financialService.getFinancialMetrics(symbol),
      financialService.getHistoricalData(symbol, '1y'),
      newsService.getCompanyNews(companyName, symbol),
      newsService.getSECFilings(symbol)
    ]);

    const sentiment = await aiService.analyzeSentiment(companyName, news.map(n => `${n.title}. ${n.description || ''}`));
    const risk = await aiService.assessRisk({ quote, overview, financials });
    const recommendation = await aiService.generateRecommendation({ quote, overview, financials }, sentiment, risk);

    const keyMetrics = {
      'P/E Ratio': overview.peRatio?.toFixed?.(2) ?? String(overview.peRatio),
      'Market Cap': formatCurrency(overview.marketCap),
      'Dividend Yield': overview.dividendYield ? `${(overview.dividendYield * 100).toFixed(2)}%` : 'N/A',
      '52-Week High': `$${overview.week52High?.toFixed?.(2) || 'N/A'}`,
      '52-Week Low': `$${overview.week52Low?.toFixed?.(2) || 'N/A'}`,
      'Profit Margin': `${(financials.profitMargin || 0).toFixed(2)}%`,
      'ROE': `${(financials.returnOnEquity || 0).toFixed(2)}%`
    };

    const sentimentHistory = historical.slice(0, 30).map((d, i) => {
      if (i === 0) return 0;
      const prev = historical[i - 1];
      const ret = ((d.close - prev.close) / prev.close) || 0;
      return Math.max(-1, Math.min(1, ret * 10));
    }).slice(-10);

    const reportSummary = `${overview.name} (${symbol}) operates in the ${overview.sector} sector, ${overview.industry} industry. ` +
      `Current price is $${quote.price.toFixed(2)} with P/E of ${overview.peRatio || 'N/A'}. ` +
      `Sentiment is ${sentiment.label} (score ${sentiment.score.toFixed(2)}). Overall risk is ${risk.overallRisk}. ` +
      `Recommendation: ${recommendation.action.toUpperCase()} with ${(recommendation.confidence * 100).toFixed(0)}% confidence.`;

    return {
      symbol,
      overview,
      quote,
      financials,
      historical: historical.slice(0, 180),
      news,
      secFilings,
      sentiment,
      risk,
      recommendation,
      reportSummary,
      keyMetrics,
      sentimentHistory
    };
  } catch (error) {
    console.error('getMCPData error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch analysis data.');
  }
});

export const mcpExecuteResource = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  enforceRateLimit(context.auth.uid);
  const { symbol, resource } = data || {};
  const s = validateSymbol(symbol);
  if (!s) throw new functions.https.HttpsError('invalid-argument', 'Provide valid symbol.');
  try {
    switch (resource) {
      case 'stock_data':
        return {
          quote: await financialService.getStockQuote(s),
          historical: await financialService.getHistoricalData(s, '1y')
        };
      case 'news':
        return { news: await newsService.getCompanyNews(s, s) };
      case 'sec_filings':
        return { filings: await newsService.getSECFilings(s) };
      case 'overview':
        return { overview: await financialService.getCompanyOverview(s) };
      case 'metrics':
        return { metrics: await financialService.getFinancialMetrics(s) };
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Unknown resource.');
    }
  } catch (e) {
    console.error('mcpExecuteResource error:', e);
    throw new functions.https.HttpsError('internal', 'Failed to execute resource.');
  }
});

export const mcpCallTool = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  enforceRateLimit(context.auth.uid);

  const tool = data?.tool as string;
  if (!tool) throw new functions.https.HttpsError('invalid-argument', 'Missing tool name.');

  const { symbol, companyName } = await resolveSymbol(data);

  try {
    const quote = await financialService.getStockQuote(symbol);
    const overview = await financialService.getCompanyOverview(symbol);
    const financials = await financialService.getFinancialMetrics(symbol);
    const news = await newsService.getCompanyNews(companyName, symbol);

    switch (tool) {
      case 'analyze_risk': {
        const risk = await aiService.assessRisk({ quote, overview, financials });
        return { risk };
      }
      case 'recommend': {
        const sentiment = await aiService.analyzeSentiment(companyName, news.map(n => `${n.title}. ${n.description || ''}`));
        const risk = await aiService.assessRisk({ quote, overview, financials });
        const recommendation = await aiService.generateRecommendation({ quote, overview, financials }, sentiment, risk);
        return { sentiment, risk, recommendation };
      }
      case 'generate_report': {
        const sentiment = await aiService.analyzeSentiment(companyName, news.map(n => `${n.title}. ${n.description || ''}`));
        const risk = await aiService.assessRisk({ quote, overview, financials });
        const recommendation = await aiService.generateRecommendation({ quote, overview, financials }, sentiment, risk);
        const payload = {
          symbol,
          overview,
          quote,
          keyMetrics: {
            'P/E Ratio': overview.peRatio?.toFixed?.(2) ?? String(overview.peRatio),
            'Market Cap': formatCurrency(overview.marketCap),
            'Dividend Yield': overview.dividendYield ? `${(overview.dividendYield * 100).toFixed(2)}%` : 'N/A',
          },
          recommendation,
          risk,
          reportSummary: `${overview.name} (${symbol}) investment brief: ${recommendation.action.toUpperCase()} @ ${(recommendation.confidence * 100).toFixed(0)}% confidence.`
        };
        const pdf = await generatePdfSummary(payload);
        return { pdf };
      }
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Unknown tool.');
    }
  } catch (e) {
    console.error('mcpCallTool error:', e);
    throw new functions.https.HttpsError('internal', 'Tool execution failed.');
  }
});

export const mcpRealTime = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  enforceRateLimit(context.auth.uid);
  return { mode: 'polling', intervalSeconds: 30, message: 'Realtime sockets not available; use polling.' };
});