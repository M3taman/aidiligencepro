import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Lock, Search, Bot, AlertCircle, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from '@/components/auth/authContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useReportUsage } from '@/hooks/useReportUsage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import TrialStatus from '@/components/TrialStatus';

// Import components and utilities
import { ReportOptions } from './components/ReportOptions';
import { ReportDisplay } from './components/ReportDisplay';
import SimpleReportDisplay from './components/SimpleReportDisplay';
import { formatReport } from './utils/reportFormatter';
import { addAiDiligenceLogoToPDF, addWatermarkAndBacklink } from './utils/pdfUtils';
import { DueDiligenceReportType, ReportGenerationOptions } from "./types";
import jsPDF from 'jspdf';

// Helper functions for report generation
const getCompetitorsByIndustry = (industry: string): string[] => {
  // This would ideally be a more sophisticated lookup based on industry
  const industryCompetitors: Record<string, string[]> = {
    'Auto Manufacturers': ['Tesla', 'Ford', 'General Motors', 'Toyota', 'Volkswagen'],
    'Software': ['Microsoft', 'Oracle', 'Salesforce', 'Adobe', 'SAP'],
    'Consumer Electronics': ['Apple', 'Sony', 'Samsung', 'HP', 'Dell'],
    'Semiconductors': ['NVIDIA', 'AMD', 'Intel', 'TSMC', 'Qualcomm'],
    'Retail': ['Amazon', 'Walmart', 'Target', 'Costco', 'JD.com'],
    'Aerospace & Defense': ['Boeing', 'Lockheed Martin', 'Raytheon', 'General Dynamics', 'Northrop Grumman'],
    'Pharmaceutical': ['CVS Health', 'Walgreens', 'Rite Aid', 'Dr. Reddy\'s', 'Teva'],
    'Banking': ['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup', 'Goldman Sachs']
  };
  
  return industryCompetitors[industry] || ['Competitor 1', 'Competitor 2', 'Competitor 3', 'Competitor 4', 'Competitor 5'];
};

interface DueDiligenceReportProps {
  className?: string;
  preloadedReport?: DueDiligenceReportType | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerateReport?: (company: string) => void;
  isLandingDemo?: boolean;
}

export function DueDiligenceReport({ 
  className,
  preloadedReport,
  isLoading: externalLoading,
  error: externalError,
  onGenerateReport,
  isLandingDemo = false
}: DueDiligenceReportProps) {
  const { user } = useAuth();
  const { trialStatus, loading: trialLoading, trackReportGeneration, canGenerateReport, generateReport } = useReportUsage();
  const navigate = useNavigate();
  const { settings } = useUserSettings();
  const [company, setCompany] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ReportGenerationOptions>({
    format: {
      includeCharts: true,
      includeTables: true
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DueDiligenceReportType | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(true);

  const handleGenerateReport = async () => {
    if (!company) {
      toast.error('Please enter a company name or ticker symbol');
      return;
    }

    // Check if user can generate a report (trial active and has remaining reports)
    if (!canGenerateReport()) {
      if (trialStatus.endDate && new Date() > trialStatus.endDate) {
        toast.error('Your trial has expired. Please upgrade to continue generating reports.');
      } else if (trialStatus.reportsUsed >= trialStatus.reportsLimit) {
        toast.error('You have used all your trial reports. Please upgrade to generate more reports.');
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // If we have an external handler (e.g. for demo purposes), use that
      if (onGenerateReport) {
        onGenerateReport(company);
        return;
      }

      // Use our enhanced report generation system that provides real data for first 5 reports
      const generatedReport = await generateReport(company);
      
      // Track report generation
      await trackReportGeneration();
      
      // Set the report
      setReport(generatedReport);
      
      // Show success message
      toast.success(`Report for ${company} generated successfully!`);
      
    } catch (err: any) {
      console.error('Error generating due diligence report:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
      toast.error('Error generating report');
    } finally {
      setIsLoading(false);
    }
  };

  // Use preloaded report if provided
  useEffect(() => {
    if (preloadedReport) {
      setReport(preloadedReport);
    }
  }, [preloadedReport]);

  // Set loading state from external source if provided
  useEffect(() => {
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading);
    }
  }, [externalLoading]);

  // Set error from external source if provided
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  // Function to download the report as PDF
  const downloadReport = async () => {
    if (!report) return;

    try {
      const doc = new jsPDF();
      
      // Add AI Diligence Pro logo and branding
      await addAiDiligenceLogoToPDF(doc);
      
      // Add watermark and backlink to aidiligence.pro
      addWatermarkAndBacklink(doc);
      
      // Add report content
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let y = 40; // Start position after logo

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = `Due Diligence Report: ${report.companyName}`;
      doc.text(title, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const date = `Generated on: ${new Date(report.timestamp || Date.now()).toLocaleDateString()}`;
      doc.text(date, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Helper function to add a section
      const addSection = (title: string, content: string, level: number = 1) => {
        // Add section title
        doc.setFontSize(level === 1 ? 14 : 12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 8;

        // Add section content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Split text to fit page width
        const textWidth = pageWidth - (margin * 2);
        const splitText = doc.splitTextToSize(content, textWidth);
        
        // Check if we need a new page
        if (y + (splitText.length * 5) > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(splitText, margin, y);
        y += (splitText.length * 6) + 10;
      };

      // Add executive summary
      if (typeof report.executiveSummary === 'string') {
        addSection('Executive Summary', report.executiveSummary);
      } else {
        addSection('Executive Summary', report.executiveSummary.overview);
        
        if (report.executiveSummary.keyFindings) {
          const keyFindings = Array.isArray(report.executiveSummary.keyFindings) 
            ? report.executiveSummary.keyFindings.join('\n• ')
            : report.executiveSummary.keyFindings;
          addSection('Key Findings', '• ' + keyFindings, 2);
        }
        
        if (report.executiveSummary.riskRating) {
          addSection('Risk Rating', report.executiveSummary.riskRating, 2);
        }
        
        if (report.executiveSummary.recommendation) {
          addSection('Recommendation', report.executiveSummary.recommendation, 2);
        }
      }

      // Add financial analysis
      if (typeof report.financialAnalysis === 'string') {
        addSection('Financial Analysis', report.financialAnalysis);
      } else {
        addSection('Financial Analysis', report.financialAnalysis.overview);
        
        // Add metrics if available
        if (report.financialAnalysis.metrics) {
          let metricsText = '';
          for (const [key, value] of Object.entries(report.financialAnalysis.metrics)) {
            metricsText += `${key}: ${value}\n`;
          }
          addSection('Key Financial Metrics', metricsText, 2);
        }
        
        // Add trends if available
        if (report.financialAnalysis.trends) {
          const trends = Array.isArray(report.financialAnalysis.trends)
            ? report.financialAnalysis.trends.join('\n• ')
            : report.financialAnalysis.trends;
          addSection('Financial Trends', trends, 2);
        }
        
        // Add strengths if available
        if (report.financialAnalysis.strengths) {
          const strengths = Array.isArray(report.financialAnalysis.strengths)
            ? report.financialAnalysis.strengths.join('\n• ')
            : report.financialAnalysis.strengths;
          addSection('Financial Strengths', '• ' + strengths, 2);
        }
        
        // Add weaknesses if available
        if (report.financialAnalysis.weaknesses) {
          const weaknesses = Array.isArray(report.financialAnalysis.weaknesses)
            ? report.financialAnalysis.weaknesses.join('\n• ')
            : report.financialAnalysis.weaknesses;
          addSection('Financial Weaknesses', '• ' + weaknesses, 2);
        }
      }

      // Add market analysis
      if (typeof report.marketAnalysis === 'string') {
        addSection('Market Analysis', report.marketAnalysis);
      } else {
        addSection('Market Analysis', report.marketAnalysis.overview);
        
        // Add market position if available
        if (report.marketAnalysis.position) {
          addSection('Market Position', report.marketAnalysis.position, 2);
        }
        
        // Add competitors if available
        if (report.marketAnalysis.competitors && report.marketAnalysis.competitors.length > 0) {
          let competitorsText = '';
          if (typeof report.marketAnalysis.competitors[0] === 'string') {
            competitorsText = '• ' + (report.marketAnalysis.competitors as string[]).join('\n• ');
          } else {
            const competitors = report.marketAnalysis.competitors as Array<{name: string, strengths?: string, weaknesses?: string}>;
            for (const competitor of competitors) {
              competitorsText += `• ${competitor.name}`;
              if (competitor.strengths) competitorsText += `\n  Strengths: ${competitor.strengths}`;
              if (competitor.weaknesses) competitorsText += `\n  Weaknesses: ${competitor.weaknesses}`;
              competitorsText += '\n';
            }
          }
          addSection('Key Competitors', competitorsText, 2);
        }
        
        // Add SWOT analysis if available
        if (report.marketAnalysis.swot) {
          let swotText = '';
          if (report.marketAnalysis.swot.strengths) {
            const strengths = Array.isArray(report.marketAnalysis.swot.strengths)
              ? report.marketAnalysis.swot.strengths.join('\n• ')
              : report.marketAnalysis.swot.strengths;
            swotText += `Strengths:\n• ${strengths}\n\n`;
          }
          if (report.marketAnalysis.swot.weaknesses) {
            const weaknesses = Array.isArray(report.marketAnalysis.swot.weaknesses)
              ? report.marketAnalysis.swot.weaknesses.join('\n• ')
              : report.marketAnalysis.swot.weaknesses;
            swotText += `Weaknesses:\n• ${weaknesses}\n\n`;
          }
          if (report.marketAnalysis.swot.opportunities) {
            const opportunities = Array.isArray(report.marketAnalysis.swot.opportunities)
              ? report.marketAnalysis.swot.opportunities.join('\n• ')
              : report.marketAnalysis.swot.opportunities;
            swotText += `Opportunities:\n• ${opportunities}\n\n`;
          }
          if (report.marketAnalysis.swot.threats) {
            const threats = Array.isArray(report.marketAnalysis.swot.threats)
              ? report.marketAnalysis.swot.threats.join('\n• ')
              : report.marketAnalysis.swot.threats;
            swotText += `Threats:\n• ${threats}`;
          }
          addSection('SWOT Analysis', swotText, 2);
        }
      }

      // Add risk assessment
      if (typeof report.riskAssessment === 'string') {
        addSection('Risk Assessment', report.riskAssessment);
      } else {
        addSection('Risk Assessment', report.riskAssessment.overview);
        
        // Add financial risks if available
        if (report.riskAssessment.financial) {
          addSection('Financial Risks', report.riskAssessment.financial, 2);
        }
        
        // Add operational risks if available
        if (report.riskAssessment.operational) {
          addSection('Operational Risks', report.riskAssessment.operational, 2);
        }
        
        // Add market risks if available
        if (report.riskAssessment.market) {
          addSection('Market Risks', report.riskAssessment.market, 2);
        }
        
        // Add regulatory risks if available
        if (report.riskAssessment.regulatory) {
          addSection('Regulatory Risks', report.riskAssessment.regulatory, 2);
        }
        
        // Add ESG considerations if available
        if (report.riskAssessment.esgConsiderations) {
          addSection('ESG Considerations', report.riskAssessment.esgConsiderations, 2);
        }
      }

      // Add recent developments if available
      if (report.recentDevelopments) {
        addSection('Recent Developments', 'Key recent events and developments that may impact the company.');
        
        // Add news if available
        if (report.recentDevelopments.news && report.recentDevelopments.news.length > 0) {
          let newsText = '';
          for (const item of report.recentDevelopments.news) {
            newsText += `• ${item.title} (${item.date})\n  ${item.summary || item.description || ''}\n\n`;
          }
          addSection('Recent News', newsText, 2);
        }
        
        // Add filings if available
        if (report.recentDevelopments.filings && report.recentDevelopments.filings.length > 0) {
          let filingsText = '';
          for (const item of report.recentDevelopments.filings) {
            filingsText += `• ${item.type || ''} (${item.date})\n  ${item.description || ''}\n\n`;
          }
          addSection('Recent Filings', filingsText, 2);
        }
        
        // Add strategic initiatives if available
        if (report.recentDevelopments.strategic) {
          if (Array.isArray(report.recentDevelopments.strategic)) {
            if (typeof report.recentDevelopments.strategic[0] === 'string') {
              const strategic = (report.recentDevelopments.strategic as string[]).join('\n• ');
              addSection('Strategic Initiatives', '• ' + strategic, 2);
            } else {
              let strategicText = '';
              for (const item of report.recentDevelopments.strategic as Array<{title: string, date: string, summary?: string, description?: string}>) {
                strategicText += `• ${item.title} (${item.date})\n  ${item.summary || item.description || ''}\n\n`;
              }
              addSection('Strategic Initiatives', strategicText, 2);
            }
          } else {
            addSection('Strategic Initiatives', report.recentDevelopments.strategic as string, 2);
          }
        }
      }

      // Add conclusion if available
      if (report.conclusion) {
        addSection('Conclusion', report.conclusion);
      }

      // Add disclaimer
      doc.addPage();
      y = 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const disclaimer = 'Disclaimer: This report is generated using AI and should be used for informational purposes only. ' +
                        'It does not constitute investment advice. Always perform your own due diligence before making investment decisions.';
      const disclaimerText = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
      doc.text(disclaimerText, margin, y);
      y += (disclaimerText.length * 6) + 10;

      // Add generation info
      doc.setFont('helvetica', 'normal');
      doc.text(`Report generated by aidiligence.pro on ${new Date().toLocaleDateString()}`, margin, y);

      // Save the PDF
      doc.save(`${report.companyName.replace(/\s+/g, '_')}_Due_Diligence_Report.pdf`);
      
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trial Status */}
      {!isLandingDemo && user && (
        <TrialStatus trialStatus={trialStatus} loading={trialLoading} />
      )}
      
      {/* Report Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Due Diligence Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="company">Company Name or Ticker Symbol</Label>
            <div className="flex space-x-2">
              <Input
                id="company"
                placeholder="e.g., Apple or AAPL"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleGenerateReport} 
                disabled={isLoading || !company}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Advanced Options Toggle */}
          <div>
            <Button 
              variant="ghost" 
              className="p-0 h-auto" 
              onClick={() => setShowOptions(!showOptions)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Advanced Options
              {showOptions ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
          
          {/* Advanced Options */}
          {showOptions && (
            <div className="border rounded-md p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Report Format</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCharts" 
                    checked={showCharts}
                    onCheckedChange={(checked) => setShowCharts(!!checked)}
                  />
                  <Label htmlFor="includeCharts">Include charts and visualizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTables" 
                    checked={showTables}
                    onCheckedChange={(checked) => setShowTables(!!checked)}
                  />
                  <Label htmlFor="includeTables">Include data tables</Label>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Report Display */}
      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Due Diligence Report: {report.companyName}</CardTitle>
            <Button onClick={downloadReport}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            <SimpleReportDisplay 
              report={report} 
              showCharts={showCharts}
              showTables={showTables}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}