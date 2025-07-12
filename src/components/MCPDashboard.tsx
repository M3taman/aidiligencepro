import React, { useState, useEffect, useCallback } from 'react';
import { useMCP } from '../hooks/useMCP';
import { DueDiligenceReportType, ESGRatings } from '../features/due-diligence/types';



export const MCPDashboard: React.FC = () => {
  const { state, analyzeStock, generateDueDiligenceReport, getRealTimeAlerts, getESGRatings } = useMCP();
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dueDiligenceReport, setDueDiligenceReport] = useState<DueDiligenceReportType | null>(null);
  const [esgRatings, setEsgRatings] = useState<ESGRatings | null>(null);

  const loadStockAnalysis = useCallback(async () => {
    try {
      const analysis = await analyzeStock(activeSymbol);
      setStockAnalysis(analysis);
    } catch (error: unknown) {
      console.error('Failed to load stock analysis:', error);
    }
  }, [activeSymbol, analyzeStock]);

  const loadAlerts = useCallback(async () => {
    try {
      const alertData = await getRealTimeAlerts('portfolio-1');
      setAlerts(alertData.alerts);
    } catch (error: unknown) {
      console.error('Failed to load alerts:', error);
    }
  }, [getRealTimeAlerts]);

  // Load initial data
  useEffect(() => {
    if (state.connected) {
      loadStockAnalysis();
      loadAlerts();
    }
  }, [state.connected, loadStockAnalysis, loadAlerts]);

  const handleGenerateReport = async () => {
    try {
      const report = await generateDueDiligenceReport(activeSymbol, {});
      setDueDiligenceReport(report);
    } catch (error: unknown) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleGetESGRatings = async () => {
    try {
      const esg = await getESGRatings(activeSymbol);
      setEsgRatings(esg);
    } catch (error: unknown) {
      console.error('Failed to get ESG ratings:', error);
    }
  };

  if (!state.connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Connecting to MCP Server</h2>
          <p className="text-secondary">Initializing real-time data connections...</p>
          {state.error && (
            <div className="mt-4 p-4" style={{backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px'}}>
              <p style={{color: '#dc2626'}}>Error: {state.error}</p>
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
        <label className="block font-medium mb-2">
          Select Stock Symbol:
        </label>
        <select 
          value={activeSymbol} 
          onChange={(e) => setActiveSymbol(e.target.value)}
          className="input"
          style={{width: '200px'}}
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
                <span style={{color: stockAnalysis.volatility > 2 ? '#dc2626' : '#059669'}}>
                  {stockAnalysis.volatility.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Recommendation:</span>
                <span className="font-semibold" style={{
                  color: stockAnalysis.recommendation === 'LOW_RISK' ? '#059669' :
                        stockAnalysis.recommendation === 'MEDIUM_RISK' ? '#d97706' : '#dc2626'
                }}>
                  {stockAnalysis.recommendation}
                </span>
              </div>
              <p style={{fontSize: '0.875rem', color: '#64748b'}}>
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
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {alerts.slice(0, 3).map((alert, index) => (
                <div 
                  key={index}
                  className="p-3"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid',
                    backgroundColor: alert.severity === 'HIGH' ? '#fee2e2' :
                                    alert.severity === 'MEDIUM' ? '#fef3c7' : '#dbeafe',
                    borderColor: alert.severity === 'HIGH' ? '#fecaca' :
                                alert.severity === 'MEDIUM' ? '#fde68a' : '#bfdbfe'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{alert.symbol}</span>
                      <p style={{fontSize: '0.875rem'}}>{alert.message}</p>
                    </div>
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: alert.severity === 'HIGH' ? '#fee2e2' :
                                        alert.severity === 'MEDIUM' ? '#fef3c7' : '#dbeafe',
                        color: alert.severity === 'HIGH' ? '#991b1b' :
                              alert.severity === 'MEDIUM' ? '#92400e' : '#1e40af'
                      }}
                    >
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
          <div className="mt-6 p-6" style={{backgroundColor: '#f8fafc', borderRadius: '8px'}}>
            <h4 className="text-xl font-semibold mb-4">
              Due Diligence Report: {dueDiligenceReport.companyName}
            </h4>
            
            <div className="grid grid-2 gap-6 mb-6">
              <div>
                <h5 className="font-semibold mb-2">Executive Summary</h5>
                <p style={{fontSize: '0.875rem'}}>{typeof dueDiligenceReport.executiveSummary === 'string' ? dueDiligenceReport.executiveSummary : dueDiligenceReport.executiveSummary?.overview}</p>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Investment Recommendation</h5>
                <div className="flex items-center gap-2">
                  {typeof dueDiligenceReport.executiveSummary !== 'string' && dueDiligenceReport.executiveSummary?.recommendation && (
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: dueDiligenceReport.executiveSummary.recommendation === 'BUY' ? '#dcfce7' :
                                        dueDiligenceReport.executiveSummary.recommendation === 'SELL' ? '#fee2e2' : '#fef3c7',
                        color: dueDiligenceReport.executiveSummary.recommendation === 'BUY' ? '#166534' :
                              dueDiligenceReport.executiveSummary.recommendation === 'SELL' ? '#991b1b' : '#92400e'
                      }}
                    >
                      {dueDiligenceReport.executiveSummary.recommendation}
                    </span>
                  )}
                  {typeof dueDiligenceReport.executiveSummary !== 'string' && dueDiligenceReport.executiveSummary?.confidence && (
                    <span style={{fontSize: '0.875rem', color: '#64748b'}}>
                      Confidence: {dueDiligenceReport.executiveSummary.confidence}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{fontSize: '0.875rem', color: '#64748b'}}>
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
            <ul style={{fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
              <li className="flex items-center gap-2">
                <span className="status-dot status-success"></span>
                Alpha Vantage (Real-time Market Data)
              </li>
              <li className="flex items-center gap-2">
                <span className="status-dot status-success"></span>
                SEC API (Regulatory Filings)
              </li>
              <li className="flex items-center gap-2">
                <span className="status-dot status-success"></span>
                AIML API (AI Analysis)
              </li>
              <li className="flex items-center gap-2">
                <span className="status-dot status-warning"></span>
                ESG Data Provider (Mock Data)
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-2">Premium Features</h5>
            <ul style={{fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
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