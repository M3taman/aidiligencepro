import React from 'react';
import { AuthDemo } from './components/AuthDemo';
import { MCPDashboard } from './components/MCPDashboard';

function App() {
  return (
    <AuthDemo>
      <div style={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
        {/* Header */}
        <header style={{
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 0',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '8px'
              }}></div>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0f172a'
              }}>AI Diligence Pro</span>
            </div>
            <nav style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <a href="#dashboard" style={{
                color: '#0f172a',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}>Dashboard</a>
              <a href="#reports" style={{
                color: '#0f172a',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}>Reports</a>
              <a href="#portfolio" style={{
                color: '#0f172a',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}>Portfolio</a>
              <a href="#settings" style={{
                color: '#0f172a',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}>Settings</a>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: '#dcfce7',
                color: '#166534'
              }}>Demo Mode</div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
          color: 'white',
          padding: '4rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              AI-Powered Due Diligence with MCP Integration
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              opacity: '0.9'
            }}>
              Real-time financial analysis, ESG ratings, and comprehensive reporting for RIAs
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                Real-time Data via MCP
              </span>
              <span style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                AI-Powered Analysis
              </span>
              <span style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
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
        <footer style={{
          padding: '2rem 0',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#64748b',
              marginBottom: '0.5rem'
            }}>
              AI Diligence Pro - Professional Due Diligence Platform for RIAs
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '1rem'
            }}>
              Powered by Model Context Protocol (MCP) for seamless data integration
            </p>
            <div style={{marginTop: '1rem'}}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                marginRight: '0.5rem'
              }}>Demo Version</span>
              <span style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                Contact sales for production deployment
              </span>
            </div>
          </div>
        </footer>
      </div>
    </AuthDemo>
  );
}

export default App;