import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

interface AuthDemoProps {
  children: React.ReactNode;
}

export const AuthDemo: React.FC<AuthDemoProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Demo login failed:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Initializing AI Diligence Pro</h2>
          <p className="text-secondary">Setting up authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="card p-8" style={{maxWidth: '400px'}}>
            <h2 className="text-3xl font-bold mb-4">AI Diligence Pro</h2>
            <p className="text-secondary mb-6">
              Professional Due Diligence Platform for RIAs
            </p>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Demo Features:</h3>
              <ul className="text-secondary" style={{fontSize: '0.875rem', textAlign: 'left'}}>
                <li>✅ Real-time Stock Analysis via MCP</li>
                <li>✅ AI-Powered Due Diligence Reports</li>
                <li>✅ ESG Rating Integration</li>
                <li>✅ Predictive Insights</li>
                <li>✅ Portfolio Alert System</li>
                <li>✅ SEC Filing Analysis</li>
              </ul>
            </div>

            <button 
              onClick={handleDemoLogin}
              className="btn btn-primary w-full mb-4"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Enter Demo Platform'}
            </button>
            
            <div className="text-center">
              <p style={{fontSize: '0.75rem', color: '#64748b'}}>
                Demo Mode: Anonymous access with full MCP features
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
};