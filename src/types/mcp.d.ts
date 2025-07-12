interface Alert {
  type: string;
  symbol: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

interface StockAnalysis {
  symbol: string;
  currentPrice: number;
  movingAverage: number;
  volatility: number;
  recommendation: string;
  lastUpdated: string;
}
