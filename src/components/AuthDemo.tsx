import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

interface AuthDemoProps {
  children: React.ReactNode;
}

export const AuthDemo: React.FC<AuthDemoProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymously(auth);
      console.log('Anonymous login successful');
    } catch (error: any) {
      console.error('Demo login failed:', error);
      setError(error.message || 'Login failed. Please enable Anonymous authentication in Firebase Console.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#0f172a'
          }}>Initializing AI Diligence Pro</h2>
          <p style={{color: '#64748b'}}>Setting up authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>AI</span>
          </div>
          
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#0f172a'
          }}>AI Diligence Pro</h2>
          
          <p style={{
            color: '#64748b',
            marginBottom: '1.5rem'
          }}>
            Professional Due Diligence Platform for RIAs
          </p>
          
          <div style={{marginBottom: '1.5rem'}}>
            <h3 style={{
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#0f172a'
            }}>Demo Features:</h3>
            <ul style={{
              color: '#64748b',
              fontSize: '0.875rem',
              textAlign: 'left',
              listStyle: 'none',
              padding: '0'
            }}>
              <li style={{marginBottom: '0.25rem'}}>✅ Real-time Stock Analysis via MCP</li>
              <li style={{marginBottom: '0.25rem'}}>✅ AI-Powered Due Diligence Reports</li>
              <li style={{marginBottom: '0.25rem'}}>✅ ESG Rating Integration</li>
              <li style={{marginBottom: '0.25rem'}}>✅ Predictive Insights</li>
              <li style={{marginBottom: '0.25rem'}}>✅ Portfolio Alert System</li>
              <li style={{marginBottom: '0.25rem'}}>✅ SEC Filing Analysis</li>
            </ul>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                margin: '0'
              }}>
                {error}
              </p>
              <p style={{
                color: '#dc2626',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                margin: '0.5rem 0 0 0'
              }}>
                Please enable Anonymous authentication in Firebase Console
              </p>
            </div>
          )}

          <button 
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              textDecoration: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.875rem',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Connecting...' : 'Enter Demo Platform'}
          </button>
          
          <div style={{textAlign: 'center'}}>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              Demo Mode: Anonymous access with full MCP features
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};