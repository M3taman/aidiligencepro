import React from 'react';
import { MCPDashboard } from './components/MCPDashboard';

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="navbar container">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg"></div>
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
            <span className="px-4 py-2 bg-primary/20 rounded-lg">
              Real-time Data via MCP
            </span>
            <span className="px-4 py-2 bg-primary/20 rounded-lg">
              AI-Powered Analysis
            </span>
            <span className="px-4 py-2 bg-primary/20 rounded-lg">
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
      <footer className="py-8 border-t">
        <div className="container text-center">
          <p className="text-muted-foreground">
            AI Diligence Pro - Professional Due Diligence Platform for RIAs
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Powered by Model Context Protocol (MCP) for seamless data integration
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;