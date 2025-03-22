import React, { useState } from 'react';
import { DueDiligenceReport } from './DueDiligenceReport';
import { DueDiligenceReport as DueDiligenceReportType } from './types';
import { generateMockDueDiligenceReport } from './mockApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Download, RefreshCcw } from 'lucide-react';

interface DueDiligenceReportWrapperProps {
  companyName?: string;
  onReportGenerated?: (report: DueDiligenceReportType) => void;
  onError?: (error: string) => void;
  className?: string;
  showControls?: boolean;
}

const DueDiligenceReportWrapper: React.FC<DueDiligenceReportWrapperProps> = ({
  companyName,
  onReportGenerated,
  onError,
  className,
  showControls = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DueDiligenceReportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to generate a report using the mock API or real API
  const generateReport = async (company: string) => {
    if (!company.trim()) {
      const errorMsg = 'Please enter a company name';
      setError(errorMsg);
      onError?.(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        // Use mock API in development
        console.log("Using mock API for development");
        const mockReport = await generateMockDueDiligenceReport(company);
        setReport(mockReport);
        onReportGenerated?.(mockReport);
        toast({
          title: 'Success',
          description: 'Report generated successfully',
        });
      } else {
        // Use real API in production
        const response = await fetch('https://generateduediligence-toafsgw4rq-uc.a.run.app/generateDueDiligence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyName: company }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Network response was not ok');
        }

        const result = await response.json();
        const reportData = result.data as DueDiligenceReportType;
        setReport(reportData);
        onReportGenerated?.(reportData);
        toast({
          title: 'Success',
          description: 'Report generated successfully',
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMsg = error instanceof Error ? error.message : 'Error generating analysis. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to reset the report and start over
  const resetReport = () => {
    setReport(null);
    setError(null);
  };

  // If companyName is provided, automatically generate a report for that company
  React.useEffect(() => {
    if (companyName && !report && !loading) {
      generateReport(companyName);
    }
  }, [companyName]);

  return (
    <div className={className}>
      {/* We pass the props to the DueDiligenceReport component */}
      <DueDiligenceReport 
        preloadedReport={report}
        isLoading={loading}
        error={error}
        onGenerateReport={generateReport}
        className={className}
      />
      
      {/* Additional controls if needed */}
      {showControls && report && (
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={resetReport}
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-sm text-muted-foreground">Generating report...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error display */}
      {error && !loading && (
        <Card className="mt-4 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>There was a problem generating the report</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setError(null)}>Dismiss</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default DueDiligenceReportWrapper; 