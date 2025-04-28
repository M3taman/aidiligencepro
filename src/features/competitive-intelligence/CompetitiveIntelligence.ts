import { DueDiligenceReportType } from '../due-diligence/types';
import { getFinancialData } from '../../lib/api';

interface PeerCompany {
  name: string;
  ticker: string;
  marketCap: number;
  revenue: number;
  profitMargin: number;
  peRatio: number;
}

interface ShortInterestData {
  current: number;
  average30Day: number;
  percentOfFloat: number;
  daysToCover: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketPosition {
  marketShare: number;
  competitiveAdvantages: string[];
  weaknesses: string[];
  position: 'leader' | 'challenger' | 'follower' | 'niche';
  history?: Array<{
    marketShare: number;
    advantages: string[];
    weaknesses: string[];
  }>;
}

export async function performPeerGroupBenchmarking(
  analysis: DueDiligenceReportType
): Promise<{
  peers: PeerCompany[];
  metrics: Record<string, {
    company: number | string;
    peerAvg: number;
    percentile: number;
  }>;
}> {
  try {
    // Get peer companies with enhanced criteria
const peers = await getFinancialData('peers', {
  industry: analysis.companyData.industry,
  sector: analysis.companyData.sector,
  marketCapRange: [
    analysis.companyData.marketCap * 0.5,
    analysis.companyData.marketCap * 1.5
  ],
  minRevenue: (analysis.financialAnalysis && typeof analysis.financialAnalysis === 'object') 
    ? (analysis.financialAnalysis.metrics?.revenue || 0) * 0.3 
    : 0,
  region: analysis.companyData.region || 'global'
}) as PeerCompany[];

    if (!peers || peers.length < 3) {
      throw new Error('Insufficient peer companies for meaningful comparison');
    }

    // Calculate benchmark metrics if financial data is available
    const metrics: Record<string, any> = {};
    
    if (typeof analysis.financialAnalysis === 'object') {
      const financials = analysis.financialAnalysis;
      
      // Revenue comparison
      if (financials.metrics.revenue) {
        const peerRevenueAvg = calculateAverage(peers.map(p => p.revenue));
        metrics.revenue = {
          company: financials.metrics.revenue,
          peerAvg: peerRevenueAvg,
          percentile: calculatePercentile(
            Number(financials.metrics.revenue),
            peers.map(p => p.revenue)
          )
        };
      }

      // Profit margin comparison
      if (financials.metrics.profitMargin) {
        const peerMarginAvg = calculateAverage(peers.map(p => p.profitMargin));
        metrics.profitMargin = {
          company: financials.metrics.profitMargin,
          peerAvg: peerMarginAvg,
          percentile: calculatePercentile(
            Number(financials.metrics.profitMargin),
            peers.map(p => p.profitMargin)
          )
        };
      }

      // PE ratio comparison
      if (financials.metrics.peRatio) {
        const peerPeAvg = calculateAverage(peers.map(p => p.peRatio));
        metrics.peRatio = {
          company: financials.metrics.peRatio,
          peerAvg: peerPeAvg,
          percentile: calculatePercentile(
            Number(financials.metrics.peRatio),
            peers.map(p => p.peRatio)
          )
        };
      }
    }

    return {
      peers,
      metrics
    };

  } catch (error) {
    console.error('Peer benchmarking failed:', error);
    throw error;
  }
}

export async function monitorShortInterest(
  analysis: DueDiligenceReportType,
  options?: {
    alertThresholds?: {
      percentFloat?: number;
      daysToCover?: number;
      trendChange?: boolean;
    }
  }
): Promise<ShortInterestData & {
  alerts?: string[];
  peerComparison?: {
    average: number;
    percentile: number;
  };
  history?: {
    date: string;
    value: number;
  }[];
}> {
  try {
const [shortData, peers] = await Promise.all([
  getFinancialData('shortInterest', {
    ticker: analysis.companyData.ticker,
    includeHistory: true
  }),
  getFinancialData('peers', {
    industry: analysis.companyData.industry,
    sector: analysis.companyData.sector
  })
]);

    if (!shortData?.shortInterest) {
      throw new Error('No short interest data available');
    }

    // Calculate peer comparison metrics
    const peerShortInterest = (peers && Array.isArray(peers))
      ? peers
          .filter((p: any) => p?.shortInterest?.percentFloat)
          .map((p: any) => p.shortInterest.percentFloat)
      : [];
    const peerAverage = peerShortInterest.length > 0 
      ? calculateAverage(peerShortInterest)
      : 0;
    const percentile = peerShortInterest.length > 0
      ? calculatePercentile(shortData.shortInterest.percentFloat, peerShortInterest)
      : 0;

    // Generate alerts based on thresholds
    const alerts: string[] = [];
    if (options?.alertThresholds) {
      const { percentFloat, daysToCover, trendChange } = options.alertThresholds;
      
      if (percentFloat && shortData.shortInterest.percentFloat > percentFloat) {
        alerts.push(`High short interest: ${shortData.shortInterest.percentFloat}% of float`);
      }
      
      if (daysToCover && shortData.shortInterest.daysToCover > daysToCover) {
        alerts.push(`High days to cover: ${shortData.shortInterest.daysToCover} days`);
      }
      
      if (trendChange && shortData.shortInterest.history.length >= 5) {
        const recentTrend = analyzeShortInterestTrend(
          shortData.shortInterest.history.slice(-5)
        );
        const previousTrend = analyzeShortInterestTrend(
          shortData.shortInterest.history.slice(0, -5)
        );
        if (recentTrend !== previousTrend) {
          alerts.push(`Trend change detected: from ${previousTrend} to ${recentTrend}`);
        }
      }
    }

    return {
      current: shortData.shortInterest.current,
      average30Day: shortData.shortInterest.avg30day,
      percentOfFloat: shortData.shortInterest.percentFloat,
      daysToCover: shortData.shortInterest.daysToCover,
      trend: analyzeShortInterestTrend(shortData.shortInterest.history),
      alerts: alerts.length > 0 ? alerts : undefined,
      peerComparison: peerShortInterest.length > 0 ? {
        average: peerAverage,
        percentile
      } : undefined,
      history: shortData.shortInterest.history?.map((item, index) => ({
        date: new Date(Date.now() - (shortData.shortInterest.history.length - index - 1) * 86400000).toISOString().split('T')[0],
        value: item
      }))
    };
  } catch (error) {
    console.error('Short interest monitoring failed:', error);
    throw error;
  }
}

export async function analyzeMarketPosition(
  analysis: DueDiligenceReportType,
  options?: {
    includeHistory?: boolean;
    peerComparison?: boolean;
  }
): Promise<MarketPosition & {
  trends?: {
    marketShare: {date: string; value: number}[];
    positionStrength: number[];
  };
  peerComparison?: {
    marketSharePercentile: number;
    advantageScore: number;
  };
}> {
  try {
const [marketData, peers] = await Promise.all([
  getFinancialData('marketPosition', {
    ticker: analysis.companyData.ticker,
    industry: analysis.companyData.industry,
    includeHistory: options?.includeHistory
  }),
  options?.peerComparison 
    ? getFinancialData('peers', {
        industry: analysis.companyData.industry,
        sector: analysis.companyData.sector
      })
    : Promise.resolve(null)
]);

    if (!marketData?.marketPosition) {
      throw new Error('No market position data available');
    }

    const result: MarketPosition & {
      trends?: any;
      peerComparison?: any;
    } = {
      marketShare: marketData.marketPosition.marketShare,
      competitiveAdvantages: marketData.marketPosition.advantages || [],
      weaknesses: marketData.marketPosition.weaknesses || [],
      position: determinePosition(marketData.marketPosition)
    };

    // Add historical trends if requested
    if (options?.includeHistory && marketData.marketPosition.history) {
      result.trends = {
        marketShare: marketData.marketPosition.history.map((item, index) => ({
          date: new Date(Date.now() - (marketData.marketPosition.history.length - index - 1) * 86400000)
            .toISOString().split('T')[0],
          value: item.marketShare
        })),
        positionStrength: marketData.marketPosition.history.map(item => 
          calculatePositionStrength(item)
        )
      };
    }

    // Add peer comparison if requested
    if (options?.peerComparison && peers) {
      const peerShares = (peers as any[])
        .filter(p => p?.marketPosition?.marketShare)
        .map(p => p.marketPosition.marketShare);
        
      if (peerShares.length > 0) {
        result.peerComparison = {
          marketSharePercentile: calculatePercentile(
            marketData.marketPosition.marketShare,
            peerShares
          ),
          advantageScore: calculateAdvantageScore(
            marketData.marketPosition.advantages || [],
            peers
          )
        };
      }
    }

    return result;
  } catch (error) {
    console.error('Market position analysis failed:', error);
    throw error;
  }
}

// Helper functions
function calculateAverage(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculatePercentile(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const countBelow = sorted.filter(v => v < value).length;
  return Math.round((countBelow / sorted.length) * 100);
}

function analyzeShortInterestTrend(history: number[]): 'up' | 'down' | 'stable' {
  if (history.length < 2) return 'stable';
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const change = last - prev;
  
  if (Math.abs(change) < 0.5) return 'stable';
  return change > 0 ? 'up' : 'down';
}

function determinePosition(marketData: any): MarketPosition['position'] {
  const share = marketData.marketShare || 0;
  if (share > 0.3) return 'leader';
  if (share > 0.15) return 'challenger';
  if (share > 0.05) return 'follower';
  return 'niche';
}

function calculatePositionStrength(marketData: any): number {
  // Score 0-100 based on market share and competitive advantages
  const shareScore = Math.min(100, (marketData.marketShare || 0) * 200);
  const advantageScore = marketData.advantages 
    ? Math.min(50, marketData.advantages.length * 10)
    : 0;
  return Math.round(shareScore + advantageScore);
}

function calculateAdvantageScore(advantages: string[], peers: any[]): number {
  if (!peers || peers.length === 0) return 0;
  
  const peerAdvantageCounts = peers
    .filter(p => p?.marketPosition?.advantages)
    .map(p => p.marketPosition.advantages.length);
  
  if (peerAdvantageCounts.length === 0) return 100;

  const avg = peerAdvantageCounts.reduce((a,b) => a + b, 0) / peerAdvantageCounts.length;
  return advantages.length > avg 
    ? 100 
    : Math.round((advantages.length / avg) * 100);
}
