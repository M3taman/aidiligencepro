import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  BrowserRouter,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from '@/components/auth/authContext';
import MainLayout from './components/layout/MainLayout';
import { DueDiligenceReport } from '@/features/due-diligence/DueDiligenceReport';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, LineChart, Shield, Clock, Users, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DueDiligencePage } from './pages/DueDiligencePage';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import Contact from './pages/Contact';
import { Blog } from './pages/Blog';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import DemoSection from '@/components/landing/DemoSection';
import BlogSection from '@/components/landing/BlogSection';
import CtaSection from '@/components/landing/CtaSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import Profile from '@/components/auth/Profile';
import Settings from '@/components/auth/Settings';
import Dashboard from '@/components/auth/Dashboard';
import ForgotPassword from '@/components/auth/ForgotPassword';
import ReportsPage from '@/pages/ReportsPage';
import ReportDetailPage from '@/pages/ReportDetailPage';
import DemoPage from '@/pages/DemoPage';
import FileManagerPage from '@/pages/file-manager';

// Create a client
const queryClient = new QueryClient();

// Features data for the home page
const features = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI-Powered Analysis",
    description: "Advanced AI algorithms analyze company data to generate comprehensive reports in minutes."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security measures to protect your sensitive data."
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Data-Driven Insights",
    description: "Real-time market data and financial metrics for informed decision-making."
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Time-Saving",
    description: "Reduce research time from days to minutes with automated report generation."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Collaboration",
    description: "Share reports and insights with your team in real-time."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Results",
    description: "Get comprehensive due diligence reports in seconds, not hours."
  }
];

// Home component
const Home = () => {
  return (
    <>
      <Helmet>
        <title>AI Diligence Pro - Automated Due Diligence Reports</title>
        <meta name="description" content="Generate comprehensive due diligence reports powered by AI. Get instant insights on any company." />
      </Helmet>

      <main className="bg-background text-foreground">
        {/* Hero Section with Due Diligence Report */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                AI-Powered Due Diligence Reports in Seconds
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Generate comprehensive company analysis and due diligence reports instantly using advanced AI technology.
                Sign up for a free 7-day trial and get 5 free reports.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <DueDiligenceReport isLandingDemo={true} />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-background/50 border-y border-border">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Why Choose AI Diligence Pro?</h2>
                <p className="text-lg text-muted-foreground">
                  Our platform combines advanced AI with comprehensive data analysis to deliver actionable insights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="p-6 rounded-lg bg-card hover:bg-accent transition-colors border shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <DemoSection />

        {/* Blog Section */}
        <BlogSection />

        {/* CTA Section */}
        <CtaSection />
      </main>
    </>
  );
};

// Root component that wraps everything
const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="about" element={<About />} />
                    <Route path="faq" element={<FAQ />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="terms" element={<Terms />} />
                    <Route path="cookies" element={<Cookies />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="due-diligence" element={<DueDiligencePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="reports/:reportId" element={<ReportDetailPage />} />
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="file-manager" element={<FileManagerPage />} />
                  </Route>
                </Routes>
                <Toaster />
                <Sonner />
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

// App component that just returns the Root
const App = () => <Root />;

export default App;
