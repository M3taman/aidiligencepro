import React, { useState, useEffect } from 'react';
import { useMCP } from '../hooks/useMCP';

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

export const MCPDashboard: React.FC = () => {
  const { state, analyzeStock, generateDueDiligenceReport, getRealTimeAlerts, getESGRatings } = useMCP();
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dueDiligenceReport, setDueDiligenceReport] = useState<any>(null);
  const [esgRatings, setEsgRatings] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (state.connected) {
      loadStockAnalysis();
      loadAlerts();
    }
  }, [state.connected, activeSymbol]);

  const loadStockAnalysis = async () => {
    try {
      const analysis = await analyzeStock(activeSymbol);
      setStockAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load stock analysis:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertData = await getRealTimeAlerts('portfolio-1');
      setAlerts(alertData.alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateDueDiligenceReport(activeSymbol, { ticker: activeSymbol });
      setDueDiligenceReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleGetESGRatings = async () => {
    try {
      const esg = await getESGRatings(activeSymbol);
      setEsgRatings(esg);
    } catch (error) {
      console.error('Failed to get ESG ratings:', error);
    }
  };

  if (!state.connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Connecting to MCP Server</h2>
          <p className="text-muted-foreground">Initializing real-time data connections...</p>
          {state.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">Error: {state.error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">AI Diligence Pro - MCP Dashboard</h1>
      
      {/* Stock Symbol Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select Stock Symbol:
        </label>
        <select 
          value={activeSymbol} 
          onChange={(e) => setActiveSymbol(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="AAPL">Apple (AAPL)</option>
          <option value="MSFT">Microsoft (MSFT)</option>
          <option value="GOOGL">Google (GOOGL)</option>
          <option value="AMZN">Amazon (AMZN)</option>
          <option value="TSLA">Tesla (TSLA)</option>
        </select>
      </div>

      {/* Real-time Stock Analysis */}
      <div className="grid grid-3 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Real-time Stock Analysis</h3>
          {stockAnalysis ? (
            <div>
              <div className="flex justify-between mb-2">
                <span>Current Price:</span>
                <span className="font-semibold">${stockAnalysis.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Moving Average:</span>
                <span>${stockAnalysis.movingAverage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Volatility:</span>
                <span className={stockAnalysis.volatility > 2 ? 'text-red-600' : 'text-green-600'}>
                  {stockAnalysis.volatility.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Recommendation:</span>
                <span className={`font-semibold ${
                  stockAnalysis.recommendation === 'LOW_RISK' ? 'text-green-600' :
                  stockAnalysis.recommendation === 'MEDIUM_RISK' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stockAnalysis.recommendation}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(stockAnalysis.lastUpdated).toLocaleString()}
              </p>
            </div>
          ) : (
            <p>Loading analysis...</p>
          )}
        </div>

        {/* ESG Ratings */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">ESG Ratings</h3>
          <button 
            onClick={handleGetESGRatings}
            className="btn btn-primary mb-4"
            disabled={state.loading}
          >
            Get ESG Data
          </button>
          {esgRatings && (
            <div>
              <div className="flex justify-between mb-2">
                <span>Environmental:</span>
                <span>{esgRatings.environmentalScore.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Social:</span>
                <span>{esgRatings.socialScore.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Governance:</span>
                <span>{esgRatings.governanceScore.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Overall Rating:</span>
                <span className="font-semibold">{esgRatings.overallRating}</span>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Alerts */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Real-time Alerts</h3>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'HIGH' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{alert.symbol}</span>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No alerts at this time</p>
          )}
        </div>
      </div>

      {/* Due Diligence Report Generation */}
      <div className="card mb-8">
        <h3 className="text-2xl font-semibold mb-4">AI-Powered Due Diligence Report</h3>
        <button 
          onClick={handleGenerateReport}
          className="btn btn-primary mb-4"
          disabled={state.loading}
        >
          {state.loading ? 'Generating Report...' : 'Generate Comprehensive Report'}
        </button>

        {dueDiligenceReport && (
          <div className="mt-6 p-6 bg-secondary rounded-lg">
            <h4 className="text-xl font-semibold mb-4">
              Due Diligence Report: {dueDiligenceReport.companyName}
            </h4>
            
            <div className="grid grid-2 gap-6 mb-6">
              <div>
                <h5 className="font-semibold mb-2">Executive Summary</h5>
                <p className="text-sm">{dueDiligenceReport.executiveSummary}</p>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Investment Recommendation</h5>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    dueDiligenceReport.recommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                    dueDiligenceReport.recommendation === 'SELL' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dueDiligenceReport.recommendation}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {dueDiligenceReport.confidence}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Generated: {new Date(dueDiligenceReport.generatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* MCP Connection Status */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">MCP Integration Status</h3>
        <div className="grid grid-2 gap-4">
          <div>
            <h5 className="font-semibold mb-2">Data Sources Connected</h5>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Alpha Vantage (Real-time Market Data)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                SEC API (Regulatory Filings)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                AIML API (AI Analysis)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                ESG Data Provider (Mock Data)
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-2">Premium Features</h5>
            <ul className="text-sm space-y-1">
              <li>✅ Real-time Market Analysis</li>
              <li>✅ AI-Powered Due Diligence Reports</li>
              <li>✅ ESG Rating Integration</li>
              <li>✅ Predictive Insights</li>
              <li>✅ Portfolio Alert System</li>
              <li>🔄 Schwab Integration (Coming Soon)</li>
              <li>🔄 Bloomberg Terminal Access (Enterprise)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};