import React from 'react';
import { Helmet } from 'react-helmet-async';
import MCPDueDiligenceReport from '@/features/due-diligence/components/MCPDueDiligenceReport';

const MCPReportPage = () => {
  return (
    <>
      <Helmet>
        <title>MCP Due Diligence Report | AI Diligence Pro</title>
        <meta name="description" content="Generate comprehensive due diligence reports using our advanced Model Context Protocol" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">MCP Due Diligence Report</h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive due diligence reports using our advanced Model Context Protocol (MCP) framework.
            This version provides more structured and reliable reports with enhanced context management.
          </p>
        </div>
        
        <MCPDueDiligenceReport />
      </div>
    </>
  );
};

export default MCPReportPage; 