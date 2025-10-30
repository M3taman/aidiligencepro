import axios from 'axios';
import * as functions from 'firebase-functions';

interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  sources: string[];
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  factors: {
    financial: number;
    market: number;
    operational: number;
    regulatory: number;
  };
  concerns: string[];
}

interface AIRecommendation {
  action: 'buy' | 'hold' | 'sell';
  confidence: number;
  reasoning: string[];
  targetPrice: number;
  timeHorizon: string;
}

export class AIAnalysisService {
  private openaiKey: string;

  constructor() {
    this.openaiKey = functions.config().openai?.key || process.env.OPENAI_API_KEY || '';
  }

  async analyzeSentiment(companyName: string, newsArticles: string[]): Promise<SentimentAnalysis> {
    if (!this.openaiKey) {
      // Fallback to simple sentiment analysis
      return this.simpleSentimentAnalysis(newsArticles);
    }

    try {
      const prompt = `Analyze the sentiment of the following news articles about ${companyName}. 
      Provide a sentiment score from -1 (very negative) to 1 (very positive), a label (positive/negative/neutral), 
      and confidence level (0-1). Also identify key themes.
      
      Articles:
      ${newsArticles.slice(0, 5).join('\n\n')}
      
      Respond in JSON format: { "score": number, "label": string, "confidence": number, "themes": string[] }`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a financial analyst expert in sentiment analysis.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        score: result.score,
        label: result.label,
        confidence: result.confidence,
        sources: result.themes || []
      };
    } catch (error) {
      console.error('Error in AI sentiment analysis:', error);
      return this.simpleSentimentAnalysis(newsArticles);
    }
  }

  private simpleSentimentAnalysis(articles: string[]): SentimentAnalysis {
    const positiveWords = ['growth', 'profit', 'increase', 'strong', 'success', 'gain', 'positive', 'beat', 'exceed'];
    const negativeWords = ['loss', 'decline', 'decrease', 'weak', 'fail', 'drop', 'negative', 'miss', 'concern'];

    let positiveCount = 0;
    let negativeCount = 0;

    articles.forEach(article => {
      const lowerArticle = article.toLowerCase();
      positiveWords.forEach(word => {
        if (lowerArticle.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (lowerArticle.includes(word)) negativeCount++;
      });
    });

    const total = positiveCount + negativeCount;
    const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
    
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';

    return {
      score,
      label,
      confidence: Math.min(total / 20, 1),
      sources: ['keyword analysis']
    };
  }

  async assessRisk(companyData: any): Promise<RiskAssessment> {
    const { financials, overview, quote } = companyData;

    // Financial risk factors
    const debtToEquity = financials.debtToEquity || 0;
    const currentRatio = financials.currentRatio || 0;
    const profitMargin = financials.profitMargin || 0;

    const financialRisk = this.calculateFinancialRisk(debtToEquity, currentRatio, profitMargin);

    // Market risk factors
    const beta = overview.beta || 1;
    const volatility = Math.abs(quote.changePercent) || 0;

    const marketRisk = this.calculateMarketRisk(beta, volatility);

    // Operational risk (simplified)
    const operationalRisk = 50; // Default medium risk

    // Regulatory risk (simplified)
    const regulatoryRisk = 50; // Default medium risk

    const overallRiskScore = (financialRisk + marketRisk + operationalRisk + regulatoryRisk) / 4;

    const concerns: string[] = [];
    if (debtToEquity > 2) concerns.push('High debt-to-equity ratio');
    if (currentRatio < 1) concerns.push('Low current ratio - liquidity concerns');
    if (profitMargin < 5) concerns.push('Low profit margins');
    if (beta > 1.5) concerns.push('High market volatility');

    return {
      overallRisk: overallRiskScore < 40 ? 'low' : overallRiskScore < 70 ? 'medium' : 'high',
      riskScore: overallRiskScore,
      factors: {
        financial: financialRisk,
        market: marketRisk,
        operational: operationalRisk,
        regulatory: regulatoryRisk
      },
      concerns
    };
  }

  private calculateFinancialRisk(debtToEquity: number, currentRatio: number, profitMargin: number): number {
    let risk = 0;

    // Debt to equity risk
    if (debtToEquity > 2) risk += 30;
    else if (debtToEquity > 1) risk += 15;

    // Current ratio risk
    if (currentRatio < 1) risk += 30;
    else if (currentRatio < 1.5) risk += 15;

    // Profit margin risk
    if (profitMargin < 0) risk += 40;
    else if (profitMargin < 5) risk += 20;
    else if (profitMargin < 10) risk += 10;

    return Math.min(risk, 100);
  }

  private calculateMarketRisk(beta: number, volatility: number): number {
    let risk = 0;

    // Beta risk
    if (beta > 2) risk += 40;
    else if (beta > 1.5) risk += 25;
    else if (beta > 1) risk += 10;

    // Volatility risk
    if (volatility > 5) risk += 30;
    else if (volatility > 3) risk += 15;

    return Math.min(risk, 100);
  }

  async generateRecommendation(companyData: any, sentiment: SentimentAnalysis, risk: RiskAssessment): Promise<AIRecommendation> {
    const { quote, overview, financials } = companyData;

    if (!this.openaiKey) {
      return this.simpleRecommendation(quote, sentiment, risk);
    }

    try {
      const prompt = `As a financial analyst, provide an investment recommendation for a company with the following data:
      
      Current Price: $${quote.price}
      P/E Ratio: ${overview.peRatio}
      Market Cap: $${overview.marketCap}
      Profit Margin: ${financials.profitMargin}%
      ROE: ${financials.returnOnEquity}%
      Debt/Equity: ${financials.debtToEquity}
      
      Sentiment Score: ${sentiment.score} (${sentiment.label})
      Risk Level: ${risk.overallRisk} (${risk.riskScore}/100)
      
      Provide: action (buy/hold/sell), confidence (0-1), reasoning (array of strings), target price, and time horizon.
      Respond in JSON format.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an expert financial analyst providing investment recommendations.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating AI recommendation:', error);
      return this.simpleRecommendation(quote, sentiment, risk);
    }
  }

  private simpleRecommendation(quote: any, sentiment: SentimentAnalysis, risk: RiskAssessment): AIRecommendation {
    let action: 'buy' | 'hold' | 'sell' = 'hold';
    const reasoning: string[] = [];

    // Decision logic
    if (sentiment.score > 0.3 && risk.overallRisk === 'low') {
      action = 'buy';
      reasoning.push('Positive sentiment with low risk profile');
    } else if (sentiment.score < -0.3 || risk.overallRisk === 'high') {
      action = 'sell';
      reasoning.push('Negative sentiment or high risk concerns');
    } else {
      reasoning.push('Mixed signals suggest holding current position');
    }

    const targetPrice = action === 'buy' 
      ? quote.price * 1.15 
      : action === 'sell' 
        ? quote.price * 0.90 
        : quote.price;

    return {
      action,
      confidence: 0.65,
      reasoning,
      targetPrice,
      timeHorizon: '6-12 months'
    };
  }
}