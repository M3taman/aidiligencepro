// src/App.tsx
import React from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import HeroSection from './components/landing/HeroSection';
import MethodologySection from './components/landing/MethodologySection';
import NewsletterSection from './components/landing/NewsletterSection';
import PricingSection from './components/landing/PricingSection';
import StatsSection from './components/landing/StatsSection';
import UseCasesSection from './components/landing/UseCasesSection';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

function App() {
  return (
    
      <HeroSection />
      <StatsSection />
      <UseCasesSection />
      <MethodologySection />
      <PricingSection />
      <NewsletterSection />
      <Login />
      <Register />
      <Profile />
    
  )

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
