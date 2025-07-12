import React from 'react';
import { MCPDashboard } from './components/MCPDashboard';

function App() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="navbar container">
        <div className="flex items-center gap-4">
          <div style={{width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '8px'}}></div>
          <span className="text-2xl font-bold">AI Diligence Pro</span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="#" className="nav-link">Dashboard</a>
          <a href="#" className="nav-link">Reports</a>
          <a href="#" className="nav-link">Portfolio</a>
          <a href="#" className="nav-link">Settings</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Due Diligence with MCP Integration
          </h1>
          <p className="text-xl mb-8">
            Real-time financial analysis, ESG ratings, and comprehensive reporting for RIAs
          </p>
          <div className="flex justify-center gap-4">
            <span className="px-4 py-2" style={{backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px'}}>
              Real-time Data via MCP
            </span>
            <span className="px-4 py-2" style={{backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px'}}>
              AI-Powered Analysis
            </span>
            <span className="px-4 py-2" style={{backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px'}}>
              $2,000/month Value
            </span>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main>
        <MCPDashboard />
      </main>

      {/* Footer */}
      <footer className="py-8" style={{borderTop: '1px solid #e2e8f0'}}>
        <div className="container text-center">
          <p className="text-secondary">
            AI Diligence Pro - Professional Due Diligence Platform for RIAs
          </p>
          <p className="text-secondary mt-2" style={{fontSize: '0.875rem'}}>
            Powered by Model Context Protocol (MCP) for seamless data integration
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;