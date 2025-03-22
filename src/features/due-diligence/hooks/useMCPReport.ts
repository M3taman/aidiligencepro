import { useState, useCallback, useEffect } from 'react';
import { DueDiligenceReportType } from '../types';
import { MCPReportService } from '../services/mcpReportService';
import { MCPContext } from '../utils/modelContextProtocol';
import { useAuth } from '@/components/auth/authContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { jsPDF } from 'jspdf';
import { addAiDiligenceLogoToPDF, addPDFHeader, addPDFFooter, addPDFSection } from '../utils/pdfUtils';
import { formatReportForPDF } from '../utils/reportFormatter';

// Local storage key for tracking free report generations
const FREE_REPORTS_KEY = 'ai_diligence_free_reports_count';
const MAX_FREE_REPORTS = 5;

/**
 * Custom hook for managing MCP-based report generation
 */
export const useMCPReport = () => {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DueDiligenceReportType | null>(null);
  const [reportText, setReportText] = useState<string | null>(null);
  const [mcpContext, setMcpContext] = useState<MCPContext | null>(null);
  const [freeReportsUsed, setFreeReportsUsed] = useState<number>(0);
  
  // Initialize the MCP report service
  const mcpReportService = new MCPReportService();
  
  // Load free reports count from localStorage on mount
  useEffect(() => {
    const storedCount = localStorage.getItem(FREE_REPORTS_KEY);
    if (storedCount) {
      setFreeReportsUsed(parseInt(storedCount, 10));
    }
  }, []);

  // Check if user can generate a report (either logged in or has free reports left)
  const canGenerateReport = useCallback(() => {
    // If user is logged in, they can generate reports
    if (user) return true;
    
    // If not logged in, check free report count
    return freeReportsUsed < MAX_FREE_REPORTS;
  }, [user, freeReportsUsed]);

  // Increment free reports count
  const incrementFreeReportsCount = useCallback(() => {
    if (!user) {
      const newCount = freeReportsUsed + 1;
      setFreeReportsUsed(newCount);
      localStorage.setItem(FREE_REPORTS_KEY, newCount.toString());
    }
  }, [user, freeReportsUsed]);

  // Get remaining free reports
  const getRemainingFreeReports = useCallback(() => {
    return MAX_FREE_REPORTS - freeReportsUsed;
  }, [freeReportsUsed]);

  /**
   * Generate a report using MCP
   */
  const generateReport = useCallback(async (
    companyName: string,
    options?: {
      analysisDepth?: 'basic' | 'standard' | 'comprehensive';
      focusAreas?: Array<'financial' | 'market' | 'risk' | 'strategic' | 'esg'>;
      reportFormat?: 'detailed' | 'summary';
      includeCharts?: boolean;
      includeTables?: boolean;
      isDemo?: boolean;
    }
  ) => {
    if (!companyName) {
      setError('Please enter a company name or ticker symbol');
      return null;
    }
    
    // Check if user can generate a report
    if (!canGenerateReport() && !options?.isDemo) {
      setError(`You've used all ${MAX_FREE_REPORTS} free reports. Please subscribe to continue generating reports.`);
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    setReport(null);
    setReportText(null);
    
    try {
      // If it's a demo, use demo report
      if (options?.isDemo) {
        const demoReport = await generateDemoReport(companyName, options);
        setReport(demoReport);
        setReportText(formatReportForPDF(demoReport));
        return demoReport;
      }
      
      // Generate real report
      const generatedReport = await mcpReportService.generateReport(
        companyName,
        user?.uid,
        options
      );
      
      setReport(generatedReport);
      setReportText(formatReportForPDF(generatedReport));
      
      // Increment free report count if user is not logged in
      if (!user) {
        incrementFreeReportsCount();
      }
      
      return generatedReport;
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, mcpReportService, canGenerateReport, incrementFreeReportsCount]);
  
  /**
   * Generate a demo report
   */
  const generateDemoReport = useCallback((companyName: string): DueDiligenceReportType => {
    // Create a simplified demo report
    const demoReport: DueDiligenceReportType = {
      companyName,
      timestamp: new Date().toISOString(),
      executiveSummary: {
        overview: `This is a demonstration of our AI-powered due diligence report for ${companyName}. In a real report, this would contain actual company data and analysis based on real-time financial information.`,
        keyFindings: [
          "Real reports include actual financial metrics from reliable sources",
          "Market analysis based on real-time data and industry comparisons",
          "Risk assessment using multiple data sources and AI analysis",
          "Competitive analysis and market positioning with actionable insights"
        ],
        riskRating: 'Demo',
        recommendation: "This is a demo recommendation. Sign up for a full account to access detailed investment recommendations."
      },
      financialAnalysis: {
        metrics: {
          "Revenue Growth": "Demo",
          "Profit Margin": "Demo",
          "Debt-to-Equity": "Demo",
          "Current Ratio": "Demo",
          "Return on Equity": "Demo"
        },
        trends: [
          "Demo trend analysis would show historical performance patterns",
          "Financial ratio comparisons against industry benchmarks",
          "Growth trajectory analysis with future projections"
        ],
        strengths: [
          "Demo financial strength 1: Strong cash position",
          "Demo financial strength 2: Consistent revenue growth",
          "Demo financial strength 3: Industry-leading margins"
        ],
        weaknesses: [
          "Demo financial weakness 1: Seasonal revenue fluctuations",
          "Demo financial weakness 2: Increasing competition in key markets",
          "Demo financial weakness 3: Regulatory compliance costs"
        ]
      },
      marketAnalysis: {
        position: `Demo market position analysis would show where ${companyName} stands in its industry, including market share, competitive landscape, and growth opportunities.`,
        competitors: ['Major Competitor 1', 'Major Competitor 2', 'Major Competitor 3'],
        marketShare: "Demo Market Share %",
        swot: {
          strengths: [
            "Brand recognition and reputation",
            "Innovative product/service offerings",
            "Strong financial position"
          ],
          weaknesses: [
            "Areas needing operational improvement",
            "Market segments with underperformance",
            "Resource allocation challenges"
          ],
          opportunities: [
            "Emerging market expansion potential",
            "New product/service development",
            "Strategic partnership possibilities"
          ],
          threats: [
            "Competitive pressure points",
            "Regulatory challenges on the horizon",
            "Economic factors affecting growth"
          ]
        }
      },
      riskAssessment: {
        financial: [
          "Detailed analysis of financial risk factors",
          "Debt structure and repayment capability",
          "Cash flow stability assessment"
        ],
        operational: [
          "Supply chain resilience evaluation",
          "Production efficiency metrics",
          "Operational bottleneck identification"
        ],
        market: [
          "Market volatility impact assessment",
          "Customer concentration risk analysis",
          "Market share vulnerability factors"
        ],
        regulatory: [
          "Compliance status with industry regulations",
          "Pending regulatory changes and their impact",
          "Historical regulatory issues and resolutions"
        ],
        esg: [
          "Environmental impact and sustainability initiatives",
          "Social responsibility programs and effectiveness",
          "Governance structure and transparency evaluation"
        ]
      },
      recentDevelopments: {
        news: [
          {
            title: `${companyName} Announces Strategic Initiative`,
            url: "#",
            date: new Date().toISOString(),
            source: { name: "Demo News Source" }
          },
          {
            title: `Industry Analysis: Impact on ${companyName}`,
            url: "#",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            source: { name: "Demo Financial Times" }
          }
        ],
        filings: [
          {
            type: "Annual Report",
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Latest annual financial report",
            url: "#"
          }
        ],
        management: [
          "Leadership team assessment",
          "Management strategy evaluation",
          "Executive track record analysis"
        ],
        strategic: [
          "Long-term growth strategy assessment",
          "Market positioning initiatives",
          "Innovation and R&D investment analysis"
        ]
      }
    };
    
    setReport(demoReport);
    
    // Format the report text if a formatter is available
    if (typeof window !== 'undefined' && window.formatReport) {
      setReportText(window.formatReport(demoReport));
    } else {
      // Basic formatting fallback
      setReportText(JSON.stringify(demoReport, null, 2));
    }
    
    return demoReport;
  }, []);
  
  /**
   * Download the report as PDF
   */
  const downloadReportAsPDF = useCallback(() => {
    if (!report) return;
    
    try {
      const pdf = new jsPDF();
      
      // Add header with logo
      addPDFHeader(pdf, `Due Diligence Report: ${report.companyName}`);
      
      let yPosition = 50; // Starting position after header
      
      // Executive Summary
      yPosition = addPDFSection(
        pdf, 
        'Executive Summary', 
        report.executiveSummary.overview, 
        yPosition
      );
      
      // Key Findings
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Key Findings', 20, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      
      yPosition += 8;
      report.executiveSummary.keyFindings.forEach(finding => {
        pdf.text(`• ${finding}`, 25, yPosition);
        yPosition += 6;
      });
      
      // Risk Rating
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Risk Rating: ${report.executiveSummary.riskRating}`, 20, yPosition);
      pdf.setFont(undefined, 'normal');
      
      // Recommendation
      yPosition += 8;
      pdf.setFontSize(10);
      const recommendationLines = pdf.splitTextToSize(report.executiveSummary.recommendation, 170);
      pdf.text(recommendationLines, 20, yPosition);
      yPosition += (recommendationLines.length * 6) + 10;
      
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        addPDFFooter(pdf, 1, 2); // Add footer to first page
        yPosition = 20; // Reset position for new page
      }
      
      // Financial Analysis
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Financial Analysis', 20, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 10;
      
      // Financial Metrics
      pdf.setFontSize(12);
      pdf.text('Key Metrics', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      Object.entries(report.financialAnalysis.metrics).forEach(([key, value]) => {
        pdf.text(`• ${key}: ${value}`, 25, yPosition);
        yPosition += 6;
      });
      
      // Add more sections as needed...
      
      // Add footer to the last page
      addPDFFooter(pdf, pdf.getNumberOfPages(), pdf.getNumberOfPages());
      
      // Save the PDF
      const safeCompanyName = report.companyName.replace(/\s+/g, '_');
      pdf.save(`${safeCompanyName}_due_diligence_report.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF');
    }
  }, [report]);
  
  return {
    isLoading,
    error,
    report,
    reportText,
    mcpContext,
    generateReport,
    generateDemoReport,
    downloadReportAsPDF,
    freeReportsUsed,
    remainingFreeReports: getRemainingFreeReports(),
    canGenerateReport: canGenerateReport()
  };
};

// Add the formatReport function to the window object for global access
declare global {
  interface Window {
    formatReport?: (report: DueDiligenceReportType) => string;
  }
} 