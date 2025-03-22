import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText, Lock, Search, Bot, Settings2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useAuth } from '@/components/auth/authContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Import components and utilities
import { ReportOptions } from './ReportOptions';
import SimpleReportDisplay from './SimpleReportDisplay';
import { DueDiligenceReportType, ReportGenerationOptions } from "../types";

// Import the MCP hook
import { useMCPReport } from '../hooks/useMCPReport';

interface MCPDueDiligenceReportProps {
  className?: string;
  preloadedReport?: DueDiligenceReportType | null;
  isLandingDemo?: boolean;
}

export function MCPDueDiligenceReport({ 
  className,
  preloadedReport,
  isLandingDemo = false
}: MCPDueDiligenceReportProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ReportGenerationOptions>({
    analysisDepth: 'standard',
    focusAreas: ['financial', 'market', 'risk', 'strategic'],
    reportFormat: 'detailed',
    includeCharts: true,
    includeTables: true
  });
  
  // Use our custom hook for MCP report generation
  const {
    isLoading,
    error,
    report,
    reportText,
    generateReport,
    downloadReportAsPDF,
    remainingFreeReports,
    canGenerateReport
  } = useMCPReport();

  const handleGenerateReport = async () => {
    if (!company) {
      toast.error('Please enter a company name or ticker symbol');
      return;
    }

    try {
      // Use our hook for report generation
      await generateReport(company, {
        analysisDepth: options.analysisDepth,
        focusAreas: options.focusAreas,
        reportFormat: options.reportFormat,
        includeCharts: options.includeCharts,
        includeTables: options.includeTables,
        isDemo: isLandingDemo
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
            Please log in to access the full due diligence report generator.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            You can still generate {remainingFreeReports} more {remainingFreeReports === 1 ? 'report' : 'reports'} without logging in.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/login')} variant="default">
              Log In
            </Button>
            <Button onClick={() => navigate('/register')} variant="outline">
              Sign Up
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Due Diligence Report</h1>
          
          {!user && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">
                {remainingFreeReports} free {remainingFreeReports === 1 ? 'report' : 'reports'} remaining
              </span>
            </div>
          )}
        </div>
        
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {!user && (
              <div className="bg-primary/10 rounded-md p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">You're using the free version</p>
                  <p className="text-xs text-muted-foreground">
                    You have {remainingFreeReports} free {remainingFreeReports === 1 ? 'report' : 'reports'} remaining. 
                    <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/pricing')}>
                      Subscribe for unlimited reports
                    </Button>
                  </p>
                </div>
              </div>
            )}
            
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
              disabled={isLoading || !canGenerateReport}
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
            
            {!canGenerateReport && !user && (
              <p className="text-xs text-destructive text-center">
                You've used all your free reports. Please subscribe to continue.
              </p>
            )}
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

export default MCPDueDiligenceReport; 