import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './components/landing/LandingPage';
import CheckoutPage from './components/payments/CheckoutPage';
import AuthPage from './components/auth/AuthPage';
import DashboardPage from './components/dashboard/DashboardPage';
import DemoPage from './components/demo/DemoPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SubscriptionPanel from './components/payments/SubscriptionPanel';
import MfaPage from './components/auth/MfaPage';
import MCPDashboard from './components/dashboard/MCPDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div 
            className="min-h-screen flex flex-col bg-cover bg-center"
            style={{ backgroundImage: "url('https://placehold.co/1920x1080/000000/FFFFFF?text=AI+Diligence+Pro')" }}
          >
            <div className="min-h-screen flex flex-col backdrop-filter backdrop-blur-xs bg-glass">
              <Header />
              <main className="flex-grow">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/subscribe" element={<SubscriptionPanel />} />
                    <Route path="/mfa" element={<MfaPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mcp-dashboard"
                      element={
                        <ProtectedRoute>
                          <MCPDashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;