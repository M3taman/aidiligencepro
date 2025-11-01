import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './components/dashboard/DashboardPage';
import MCPDashboard from './components/dashboard/MCPDashboard';
import MfaPage from './components/auth/MfaPage';

type FallbackRender = (props: { error: Error }) => React.ReactNode;

const App: React.FC = () => {
  const fallback: FallbackRender = ({ error }) => (
    <div role="alert" className="p-4 text-red-500">
      <p className="font-bold">Something went wrong:</p>
      <pre className="whitespace-pre-wrap">{error.message}</pre>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary fallbackRender={fallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/mcp" element={<MCPDashboard />} />
              <Route path="/mfa" element={<MfaPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
};

export default App;