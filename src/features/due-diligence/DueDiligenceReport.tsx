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
import { useRouter } from 'next/router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Import components and utilities
import { ReportOptions } from './components/ReportOptions';
import { ReportDisplay } from './components/ReportDisplay';
import SimpleReportDisplay from './components/SimpleReportDisplay';
import { formatReport } from './utils/reportFormatter';
import { addAiDiligenceLogoToPDF } from './utils/pdfUtils';
import { DueDiligenceReportType, ReportGenerationOptions } from "./types";
import jsPDF from 'jspdf';

// Import the MCP hook
import { useMCPReport } from './hooks/useMCPReport';

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
    'Banking': ['JPMorgan Chase', 'Bank of America', 'Citigroup', 'Wells Fargo', 'Goldman Sachs'],
    'Oil & Gas': ['ExxonMobil', 'Chevron', 'BP', 'Shell', 'TotalEnergies']
  };
  
  return industryCompetitors[industry] || 
    ['Major Competitor 1', 'Major Competitor 2', 'Major Competitor 3', 'Major Competitor 4', 'Major Competitor 5'];
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
  
  // Use our custom hook for MCP report generation
  const {
    isLoading,
    error,
    report,
    reportText,
    generateReport,
    downloadReportAsPDF
  } = useMCPReport();
  
  // Set initial states from props
  useEffect(() => {
    if (preloadedReport) {
      // The hook doesn't have a direct setter for the report, so we'd need to handle this differently
      // This is a limitation when migrating to the hook pattern
      console.log("Preloaded report available but not directly settable with the hook");
    }
    // We don't need to handle external loading and error states as they're managed by the hook
  }, [preloadedReport]);

  const handleGenerateReport = async () => {
    if (!company) {
      toast.error('Please enter a company name or ticker symbol');
      return;
    }

    try {
      // Call onGenerateReport if provided (for external handling)
      if (onGenerateReport) {
        await onGenerateReport(company);
        return;
      }

      // Use our hook for report generation
      await generateReport(company, {
        analysisDepth: 'standard',
        focusAreas: ['financial', 'market', 'risk', 'strategic'],
        reportFormat: 'detailed',
        includeCharts: options.format.includeCharts,
        includeTables: options.format.includeTables,
        isDemo: isLandingDemo || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      });
      
      toast.success('Report generated successfully');
    } catch (err) {
      console.error('Error in report generation:', err);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  // For landing demo, use a simplified UI
  if (isLandingDemo) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Try it now! Enter any company name..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-12"
            />
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="h-12 px-6 neo-button"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {!reportText && !isLoading && !error && (
            <Card className="p-6 bg-primary/5 border-dashed">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Bot className="w-5 h-5" />
                <p>Enter any company name above to generate a comprehensive due diligence report powered by AI.</p>
              </div>
            </Card>
          )}

          {error && (
            <Card className="p-6 border-destructive/50 bg-destructive/10">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {reportText && (
            <SimpleReportDisplay 
              reportText={reportText} 
              onDownload={downloadReportAsPDF} 
            />
          )}
        </div>
      </div>
    );
  }

  // Regular authentication check for full version
  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access the due diligence report generator.
          </p>
          <Button onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Due Diligence Report</h1>
        </div>
        
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="company">Company Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-10"
                    placeholder="Enter company name (e.g., Apple, Microsoft)"
                  />
                </div>
              </div>
              <Button
                onClick={() => setShowOptions(!showOptions)}
                variant="outline"
                className="mt-auto"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Options
                {showOptions ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>

            {showOptions && (
              <ReportOptions 
                options={options}
                onChange={setOptions}
              />
            )}

            <Button
              onClick={handleGenerateReport}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="w-full mt-4">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {reportText && (
          <SimpleReportDisplay 
            reportText={reportText} 
            onDownload={downloadReportAsPDF} 
            className="mt-4" 
          />
        )}
      </div>
    </div>
  );
} 