import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Search, AlertCircle, Settings2, ChevronDown, ChevronUp } from "lucide-react"; // Removed Lock, Bot
import { useAuth } from '@/components/auth/authContext';
// Removed analyzeSECFiling, getAlphaVantageData, fetchSECFilings as they seem unused now
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed Tabs, TabsContent, TabsList, TabsTrigger, Accordion related imports as they don't appear to be used by the remaining code
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
// Removed useToast as sonner is used directly
import { useUserSettings } from '@/hooks/useUserSettings';
import { useReportUsage } from '@/hooks/useReportUsage';
// Removed Select related imports as they don't appear to be used
import { Checkbox } from '@/components/ui/checkbox';
import TrialStatus from '@/components/TrialStatus';

// Import components and utilities
// Removed ReportOptions, ReportDisplay as they seem unused now
import SimpleReportDisplay from './components/SimpleReportDisplay';
// Removed formatReport as it was likely for the old parser
import { addAiDiligenceLogoToPDF, addWatermarkAndBacklink } from './utils/pdfUtils.ts';
import { DueDiligenceReportType, ReportGenerationOptions } from "./types"; // Assuming ReportGenerationOptions is still needed for PDF or other options
import jsPDF from 'jspdf';

// Interface definition should be here
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
  const { trialStatus, loading: trialLoading, trackReportGeneration, canGenerateReport } = useReportUsage(); // Removed generateReport as it's not used in the new flow
  const navigate = useNavigate();
  const { settings } = useUserSettings();
  const [company, setCompany] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  // const [options, setOptions] = useState<ReportGenerationOptions>({ // Assuming options might still be used for PDF generation or other UI features
  //   format: {
  //     includeCharts: true,
  //     includeTables: true
  //   }
  // });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DueDiligenceReportType | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(true);

  const handleGenerateReport = async () => {
    if (!company) {
      toast.error('Company Required', {
        description: 'Please enter a company name or ticker symbol'
      });
      return;
    }

    if (!canGenerateReport()) {
      if (trialStatus.endDate && new Date() > trialStatus.endDate) {
        toast.error('Trial Expired', {
          description: 'Please upgrade to continue generating reports.'
        });
      } else if (trialStatus.reportsUsed >= trialStatus.reportsLimit) {
        toast.error('Trial Reports Exhausted', {
          description: 'Please upgrade to generate more reports.'
        });
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (onGenerateReport) { // This allows parent components to override generation for demo purposes
        onGenerateReport(company);
        return;
      }

      const response = await fetch('https://us-central1-ai-diligence.cloudfunctions.net/generateDueDiligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken || ''}`
        },
        body: JSON.stringify({ companyName: company })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore if response is not JSON
        }
        const errorMessage = errorData?.error || errorData?.message || response.statusText || `Failed to generate report. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const structuredReport = result.data; // Firebase function wraps the report in a 'data' field

      if (!structuredReport) {
        throw new Error("Received empty report data from server.");
      }

      await trackReportGeneration(); // Track successful generation
      setReport(structuredReport);
      toast.success(`Report for ${company} generated successfully!`);

    } catch (err: any) {
      console.error('Error generating due diligence report:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
      toast.error('Report Generation Failed', {
        description: err.message || 'Failed to generate report. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (preloadedReport) {
      setReport(preloadedReport);
    }
  }, [preloadedReport]);

  useEffect(() => {
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading);
    }
  }, [externalLoading]);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const downloadReport = async () => {
    if (!report) return;

    try {
      const doc = new jsPDF();
      const margin = 20;
      await addAiDiligenceLogoToPDF(doc, margin, 15, 50);
      addWatermarkAndBacklink(doc);
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let y = 40;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = `Due Diligence Report: ${report.companyName}`;
      doc.text(title, margin, y, { align: 'left' });
      y += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const date = `Generated on: ${new Date(report.timestamp || Date.now()).toLocaleDateString()}`;
      doc.text(date, pageWidth / 2, y, { align: 'left' }); // Center align was likely a mistake, changed to left for consistency
      y += 15;

      const addSection = (title: string, content: string | string[] | undefined, level: number = 1) => {
        if (content === undefined || (Array.isArray(content) && content.length === 0)) {
          return;
        }
        if (y + 20 > pageHeight - margin) { // Check space before adding section
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(level === 1 ? 14 : 12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y, { align: 'left' });
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const textWidth = pageWidth - (margin * 2);
        let textContent = '';
        if (Array.isArray(content)) {
          textContent = content.map(item => (typeof item === 'string' ? item.startsWith('• ') ? item : '• ' + item : item)).join('\n');
        } else {
          textContent = content;
        }

        const splitText = doc.splitTextToSize(textContent, textWidth);
        
        splitText.forEach((line: string) => {
          if (y + 6 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y, { align: 'left' });
          y += 6;
        });
        y += 10; // Spacing after section
      };

      if (report.executiveSummary) {
        if (typeof report.executiveSummary === 'string') {
          addSection('Executive Summary', report.executiveSummary);
        } else {
          addSection('Executive Summary', report.executiveSummary.overview);
          addSection('Key Findings', report.executiveSummary.keyFindings, 2);
          addSection('Risk Rating', report.executiveSummary.riskRating, 2);
          addSection('Recommendation', report.executiveSummary.recommendation, 2);
        }
      }

      if (report.financialAnalysis) {
        if (typeof report.financialAnalysis === 'string') {
          addSection('Financial Analysis', report.financialAnalysis);
        } else {
          addSection('Financial Analysis', report.financialAnalysis.overview);
          if (report.financialAnalysis.metrics && Object.keys(report.financialAnalysis.metrics).length > 0) {
            const metricsArray = Object.entries(report.financialAnalysis.metrics).map(([key, value]) => `${key}: ${value}`);
            addSection('Key Financial Metrics', metricsArray, 2);
          }
          addSection('Financial Trends', report.financialAnalysis.trends, 2);
          addSection('Financial Strengths', report.financialAnalysis.strengths, 2);
          addSection('Financial Weaknesses', report.financialAnalysis.weaknesses, 2);
        }
      }

      if (report.marketAnalysis) {
        if (typeof report.marketAnalysis === 'string') {
          addSection('Market Analysis', report.marketAnalysis);
        } else {
          addSection('Market Analysis', report.marketAnalysis.overview);
          addSection('Market Position', report.marketAnalysis.position || report.marketAnalysis.marketPosition, 2);
          if (report.marketAnalysis.competitors && report.marketAnalysis.competitors.length > 0) {
            const competitorsArray = (report.marketAnalysis.competitors as any[]).map(comp => typeof comp === 'string' ? comp : `${comp.name}${comp.strengths ? ` (Strengths: ${comp.strengths})` : ''}${comp.weaknesses ? ` (Weaknesses: ${comp.weaknesses})` : ''}`);
            addSection('Key Competitors', competitorsArray, 2);
          }
          if (report.marketAnalysis.swot) {
            let swotStrings: string[] = [];
            if(report.marketAnalysis.swot.strengths) swotStrings = swotStrings.concat("Strengths:", Array.isArray(report.marketAnalysis.swot.strengths) ? report.marketAnalysis.swot.strengths : [report.marketAnalysis.swot.strengths]);
            if(report.marketAnalysis.swot.weaknesses) swotStrings = swotStrings.concat("Weaknesses:", Array.isArray(report.marketAnalysis.swot.weaknesses) ? report.marketAnalysis.swot.weaknesses : [report.marketAnalysis.swot.weaknesses]);
            if(report.marketAnalysis.swot.opportunities) swotStrings = swotStrings.concat("Opportunities:", Array.isArray(report.marketAnalysis.swot.opportunities) ? report.marketAnalysis.swot.opportunities : [report.marketAnalysis.swot.opportunities]);
            if(report.marketAnalysis.swot.threats) swotStrings = swotStrings.concat("Threats:", Array.isArray(report.marketAnalysis.swot.threats) ? report.marketAnalysis.swot.threats : [report.marketAnalysis.swot.threats]);
            addSection('SWOT Analysis', swotStrings, 2);
          }
        }
      }

      if (report.riskAssessment) {
        if (typeof report.riskAssessment === 'string') {
          addSection('Risk Assessment', report.riskAssessment);
        } else {
          addSection('Risk Assessment', report.riskAssessment.overview);
          if(report.riskAssessment.riskFactors) {
            addSection('Financial Risks', report.riskAssessment.riskFactors.financial, 2);
            addSection('Operational Risks', report.riskAssessment.riskFactors.operational, 2);
            addSection('Market Risks', report.riskAssessment.riskFactors.market, 2);
            addSection('Regulatory Risks', report.riskAssessment.riskFactors.regulatory, 2);
            if(report.riskAssessment.riskFactors.esg) addSection('ESG Risks', report.riskAssessment.riskFactors.esg, 2);
          }
          addSection('Overall Risk Rating', report.riskAssessment.riskRating, 2);
        }
      }

      if (report.recentDevelopments) {
        addSection('Recent Developments', "Key recent events and developments that may impact the company.");
        if (report.recentDevelopments.news && report.recentDevelopments.news.length > 0) {
           const newsArray = report.recentDevelopments.news.map(item => `${item.title} (${item.date || item.publishedAt}): ${item.summary || item.description}`);
           addSection('Recent News', newsArray, 2);
        }
        if (report.recentDevelopments.filings && report.recentDevelopments.filings.length > 0) {
           const filingsArray = report.recentDevelopments.filings.map(item => `${item.type || item.title} (${item.date}): ${item.description}`);
           addSection('Recent Filings', filingsArray, 2);
        }
        if (report.recentDevelopments.strategic) {
          if (Array.isArray(report.recentDevelopments.strategic)) {
            const strategicArray = (report.recentDevelopments.strategic as any[]).map(item => typeof item === 'string' ? item : `${item.title} (${item.date}): ${item.summary || item.description}`);
            addSection('Strategic Initiatives', strategicArray, 2);
          } else {
             addSection('Strategic Initiatives', report.recentDevelopments.strategic as string, 2);
          }
        }
      }

      if (report.conclusion) {
        addSection('Conclusion', report.conclusion);
      }

      if (y + 30 > pageHeight - margin) { // Check for space for disclaimer
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const disclaimer = 'Disclaimer: This report is generated using AI and should be used for informational purposes only. ' +
                        'It does not constitute investment advice. Always perform your own due diligence before making investment decisions.';
      const disclaimerText = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
      disclaimerText.forEach((line: string, i: number) => {
        if (y + 6 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y + (i * 6), { align: 'left' });
      });
      y += (disclaimerText.length * 6) + 10;

      doc.setFont('helvetica', 'normal');
      if (y + 6 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(`Report generated by aidiligence.pro on ${new Date().toLocaleDateString()}`, margin, y, { align: 'left' });

      doc.save(`${report.companyName.replace(/\s+/g, '_')}_Due_Diligence_Report.pdf`);
      
      toast.success('PDF downloaded successfully!');
    } catch (err: any) { // Ensure 'err' is typed
      console.error('Error generating PDF:', err);
      toast.error('PDF Generation Failed', {
        description: err.message || 'Failed to generate PDF. Please try again.'
      });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {!isLandingDemo && user && <TrialStatus />}
      
      {!report && !isLoading && !error && (
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
          
          {showOptions && (
            <div className="border rounded-md p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Report Format (PDF)</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCharts" 
                    checked={showCharts}
                    onCheckedChange={(checked) => setShowCharts(!!checked)} // Ensure type compatibility
                  />
                  <Label htmlFor="includeCharts">Include charts and visualizations in PDF</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTables" 
                    checked={showTables}
                    onCheckedChange={(checked) => setShowTables(!!checked)} // Ensure type compatibility
                  />
                  <Label htmlFor="includeTables">Include data tables in PDF</Label>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Generating report, please wait...</p>
        </div>
      )}

      {report && !isLoading && !error && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Due Diligence Report: {report.companyName}</CardTitle>
            <Button onClick={downloadReport} disabled={!report}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            <SimpleReportDisplay 
              report={report}
              showCharts={showCharts} // This prop might be for PDF generation, ensure SimpleReportDisplay handles it or remove
              showTables={showTables} // This prop might be for PDF generation, ensure SimpleReportDisplay handles it or remove
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
