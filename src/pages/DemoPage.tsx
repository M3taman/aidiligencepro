import React from 'react';
import { Helmet } from 'react-helmet-async';
import DemoSection from '@/components/landing/DemoSection';

const DemoPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Demo - AI Diligence Pro</title>
        <meta name="description" content="Try our AI-powered due diligence platform with an interactive demo." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Interactive Demo</h1>
        <p className="text-lg text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
          Experience the power of AI-driven due diligence with our interactive demo. 
          See how our platform can transform your investment research process.
        </p>
        
        <DemoSection />
      </div>
    </>
  );
};

export default DemoPage; 