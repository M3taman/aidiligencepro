import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Lock, Search, Bot, AlertCircle, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from '@/components/auth/authContext';
import { analyzeSECFiling } from '@/features/ai-processor/SECAnalyzer';
import { getAlphaVantageData, fetchSECFilings } from '@/lib/api';
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
import { addAiDiligenceLogoToPDF, addWatermarkAndBacklink } from './utils/pdfUtils.ts';
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

// Function to convert OpenAI text response to structured report
function convertTextToStructuredReport(text: string, companyName: string): DueDiligenceReportType {
  // Initialize with default structure
  const report: DueDiligenceReportType = {
    companyName,
    timestamp: new Date().toISOString(),
    companyData: { Name: companyName },
    executiveSummary: { overview: '' },
    financialAnalysis: { overview: '', metrics: {}, trends: [] },
    marketAnalysis: { overview: '', competitors: [] },
    riskAssessment: { 
      overview: '', 
      riskFactors: {
        financial: [],
        operational: [],
        market: [],
        regulatory: []
      },
      riskRating: 'medium'
    },
  };
  
  try {
    // Extract sections using regex
    // Executive Summary
    const execSummaryMatch = text.match(/Executive\s+Summary[:\s\n]*([\s\S]*?)(?=\s*Financial\s+Analysis|\s*#|\s*$)/i);
    if (execSummaryMatch) {
      const execSummaryText = execSummaryMatch[1].trim();
      
      // Look for subsections
      const keyFindingsMatch = execSummaryText.match(/Key\s+Findings[:\s\n]*([\s\S]*?)(?=\s*Risk\s+Rating|\s*Recommendation|\s*#|\s*$)/i);
      const riskRatingMatch = execSummaryText.match(/Risk\s+Rating[:\s\n]*([A-Za-z]+)/i);
      const recommendationMatch = execSummaryText.match(/Recommendation[:\s\n]*([\s\S]*?)(?=\s*#|\s*$)/i);
      
      // Extract overview (everything before Key Findings if present)
      const overviewMatch = execSummaryText.match(/^([\s\S]*?)(?=\s*Key\s+Findings|\s*$)/i);
      
      report.executiveSummary = {
        overview: overviewMatch ? overviewMatch[1].trim() : execSummaryText
      };
      
      if (keyFindingsMatch) {
        // Extract bullet points
        const bulletRegex = /[•\-\*]\s*([^\n]+)/g;
        const findings: string[] = [];
        let match;
        while ((match = bulletRegex.exec(keyFindingsMatch[1])) !== null) {
          findings.push(match[1].trim());
        }
        if (findings.length > 0) {
          report.executiveSummary.keyFindings = findings;
          report.keyFindings = findings;
        } else {
          report.executiveSummary.keyFindings = keyFindingsMatch[1].trim();
        }
      }
      
      if (riskRatingMatch) {
        report.executiveSummary.riskRating = riskRatingMatch[1].trim();
      }
      
      if (recommendationMatch) {
        report.executiveSummary.recommendation = recommendationMatch[1].trim();
      }
    }
    
    // Financial Analysis
    const financialMatch = text.match(/Financial\s+Analysis[:\s\n]*([\s\S]*?)(?=\s*Market\s+Analysis|\s*#|\s*$)/i);
    if (financialMatch) {
      const financialText = financialMatch[1].trim();
      
      // Extract overview (first paragraph)
      const overviewMatch = financialText.match(/^([\s\S]*?)(?=\s*Key\s+Metrics|\s*Trends|\s*Strengths|\s*Weaknesses|\s*$)/i);
      
      report.financialAnalysis = {
        overview: overviewMatch ? overviewMatch[1].trim() : financialText,
        metrics: {},
        trends: []
      };
      
      // Extract metrics
      const metricsMatch = financialText.match(/Key\s+Metrics[:\s\n]*([\s\S]*?)(?=\s*Trends|\s*Strengths|\s*Weaknesses|\s*#|\s*$)/i);
      if (metricsMatch) {
        const metricsText = metricsMatch[1].trim();
        // Extract key-value pairs
        const metricRegex = /[•\-\*]?\s*([^:]+):\s*([^\n]+)/g;
        let match;
        while ((match = metricRegex.exec(metricsText)) !== null) {
          report.financialAnalysis.metrics[match[1].trim()] = match[2].trim();
        }
      }
      
      // Extract trends
      const trendsMatch = financialText.match(/Trends[:\s\n]*([\s\S]*?)(?=\s*Strengths|\s*Weaknesses|\s*#|\s*$)/i);
      if (trendsMatch) {
        const trendsText = trendsMatch[1].trim();
        // Extract bullet points
        const bulletRegex = /[•\-\*]\s*([^\n]+)/g;
        const trends: string[] = [];
        let match;
        while ((match = bulletRegex.exec(trendsText)) !== null) {
          trends.push(match[1].trim());
        }
        report.financialAnalysis.trends = trends.length > 0 ? trends : trendsText;
      }
      
      // Extract strengths
      const strengthsMatch = financialText.match(/Strengths[:\s\n]*([\s\S]*?)(?=\s*Weaknesses|\s*#|\s*$)/i);
      if (strengthsMatch) {
        const strengthsText = strengthsMatch[1].trim();
        // Extract bullet points
        const bulletRegex = /[•\-\*]\s*([^\n]+)/g;
        const strengths: string[] = [];
        let match;
        while ((match = bulletRegex.exec(strengthsText)) !== null) {
          strengths.push(match[1].trim());
        }
        report.financialAnalysis.strengths = strengths.length > 0 ? strengths : strengthsText;
      }
      
      // Extract weaknesses
      const weaknessesMatch = financialText.match(/Weaknesses[:\s\n]*([\s\S]*?)(?=\s*#|\s*$)/i);
      if (weaknessesMatch) {
        const weaknessesText = weaknessesMatch[1].trim();
        // Extract bullet points
        const bulletRegex = /[•\-\*]\s*([^\n]+)/g;
        const weaknesses: string[] = [];
        let match;
        while ((match = bulletRegex.exec(weaknessesText)) !== null) {
          weaknesses.push(match[1].trim());
        }
        report.financialAnalysis.weaknesses = weaknesses.length > 0 ? weaknesses : weaknessesText;
      }
    }
    
    // Market Analysis
    const marketMatch = text.match(/Market\s+Analysis[:\s\n]*([\s\S]*?)(?=\s*Risk\s+Assessment|\s*#|\s*$)/i);
    if (marketMatch) {
      const marketText = marketMatch[1].trim();
      
      // Extract overview (first paragraph)
      const overviewMatch = marketText.match(/^([\s\S]*?)(?=\s*Competitors|\s*SWOT|\s*Market\s+Position|\s*$)/i);
      
      report.marketAnalysis = {
        overview: overviewMatch ? overviewMatch[1].trim() : marketText,
        competitors: []
      };
      
      // Extract competitors
      const competitorsMatch = marketText.match(/Competitors[:\s\n]*([\s\S]*?)(?=\s*SWOT|\s*Market\s+Position|\s*#|\s*$)/i);
      if (competitorsMatch) {
        const competitorsText = competitorsMatch[1].trim();
        // Extract bullet points
        const bulletRegex = /[•\-\*]\s*([^\n]+)/g;
        const competitors: string[] = [];
        let match;
        while ((match = bulletRegex.exec(competitorsText)) !== null) {
          competitors.push(match[1].trim());
        }
        report.marketAnalysis.competitors = competitors.length > 0 ? competitors : competitorsText.
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
  const [company, setCompany] = useState(""); // Restore state
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ReportGenerationOptions>({
    format: {
      includeCharts: true,
      includeTables: true
    }
  });
  
  // Restore internal state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DueDiligenceReportType | null>(null);
  const [showCharts, setShowCharts] = useState(true); // Keep UI state
  const [showTables, setShowTables] = useState(true);

const handleGenerateReport = async () => {
  if (!company) {
    toast.error('Company Required', {
      description: 'Please enter a company name or ticker symbol'
    });
    return;
  }

  // Check if user can generate a report (trial active and has remaining reports)
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
    if (onGenerateReport) {
      onGenerateReport(company);
      return;
    }

    // Try to use the deployed Firebase function if available
    try {
      const response = await fetch('https://us-central1-ai-diligence.cloudfunctions.net/generateDueDiligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken || ''}`
        },
        body: JSON.stringify({ companyName: company })
      });

      if (response.ok) {
        const result = await response.json();
        const structuredReport = result.data;
        await trackReportGeneration();
        setReport(structuredReport);
        toast.success(`Report for ${company} generated successfully!`);
        return;
      }
    } catch (apiError) {
      console.warn('Failed to connect to Firebase Function, falling back to direct OpenAI:', apiError);
      // Continue to fallback implementation
    }

    // Fallback: Generate report directly using OpenAI
    const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_key');
    
    if (!OPENAI_KEY) {
      // Prompt for API key if not available
      const apiKey = prompt("Please enter your OpenAI API key to generate a report:");
      if (!apiKey) {
        throw new Error("OpenAI API key is required to generate a report");
      }
      localStorage.setItem('openai_key', apiKey);
    }
    
    // Create the prompt for OpenAI
    const prompt = `Generate a comprehensive due diligence report for the company: ${company}.

The report must include the following sections:
1. Executive Summary - Including key findings, risk rating, and recommendation
2. Financial Analysis - Including key metrics, trends, strengths and weaknesses
3. Market Analysis - Including competitors, SWOT analysis, and market position
4. Risk Assessment - Including financial, operational, market, and regulatory risks
5. Recent Developments - Including news, filings, and strategic developments
6. Conclusion - Summarizing the overall investment thesis

Format your response in a clear, structured manner with proper headings and bullet points for key findings.`;
    
    // Call OpenAI API directly
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to generate report');
    }
    
    const openaiResult = await openaiResponse.json();
    const reportText = openaiResult.choices[0].message.content;
    
    // Convert the text response to a structured report
    const structuredReport = convertTextToStructuredReport(reportText, company);

    await trackReportGeneration();
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

  // Restore useEffects
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

  // Function to download the report as PDF
  const downloadReport = async () => {
    if (!report) return;

    try {
      const doc = new jsPDF();
      const margin = 20; // Declare margin first
      
      // Add AI Diligence Pro logo and branding (positioned at top-left with 50px width)
      await addAiDiligenceLogoToPDF(doc, margin, 15, 50);
      
      // Add watermark and backlink to aidiligence.pro
      addWatermarkAndBacklink(doc);
      
      // Add report content
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let y = 40; // Start position after logo

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = `Due Diligence Report: ${report.companyName}`;
      // Use standard signature: text(text, x, y, options?)
      doc.text(title, margin, y, { align: 'left' });
      y += 15;

      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const date = `Generated on: ${new Date(report.timestamp || Date.now()).toLocaleDateString()}`;
      // Use standard signature: text(text, x, y, options?)
      doc.text(date, pageWidth / 2, y, { align: 'left' });
      y += 15;

      // Helper function to add a section
const addSection = (title: string, content: string, level: number = 1) => {
  // Add section title
  doc.setFontSize(level === 1 ? 14 : 12);
  doc.setFont('helvetica', 'bold');
  // Correct jsPDF text call with proper arguments
  doc.text(title, margin, y, { align: 'left' });
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
  
  // Correct jsPDF text call with proper arguments
  splitText.forEach((line, i) => {
    doc.text(line, margin, y + (i * 6), { align: 'left' });
  });
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
// Correct jsPDF text call with proper arguments
disclaimerText.forEach((line, i) => {
  doc.text(line, margin, y + (i * 6), { align: 'left' });
});
      y += (disclaimerText.length * 6) + 10;

      // Add generation info
      doc.setFont('helvetica', 'normal');
      // Correct jsPDF text call (no options needed here)
doc.text(`Report generated by aidiligence.pro on ${new Date().toLocaleDateString()}`, margin, y, { align: 'left' });

      // Save the PDF
      doc.save(`${report.companyName.replace(/\s+/g, '_')}_Due_Diligence_Report.pdf`);
      
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('PDF Generation Failed', {
        description: 'Failed to generate PDF. Please try again.'
      });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trial Status */}
      {!isLandingDemo && user && <TrialStatus />}
      
      {/* Report Generation Form - Use internal state */}
      {!report && !error && !isLoading && ( 
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
                value={company} // Restore state
                onChange={(e) => setCompany(e.target.value)} // Restore state
                className="flex-1"
              />
              <Button 
                onClick={handleGenerateReport} 
                disabled={isLoading || !company} // Restore state
              >
                {isLoading ? ( // Restore state
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
          
          {/* Error message - Use internal state */}
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
      
      {/* Report Display - Use internal state */}
      {report && !isLoading && !error && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Due Diligence Report: {report.companyName}</CardTitle>
            <Button onClick={downloadReport} disabled={!report}> {/* Use internal state */}
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            <SimpleReportDisplay 
              report={report} // Use internal state
              showCharts={showCharts}
              showTables={showTables}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
