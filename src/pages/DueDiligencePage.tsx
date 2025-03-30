import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { generateDueDiligence } from '@/lib/api';
import { DueDiligenceResponse } from '@/types/due-diligence';
import { ReportDisplay } from '@/features/due-diligence/components/ReportDisplay';

export function DueDiligencePage() {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DueDiligenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name or ticker symbol",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateDueDiligence(companyName.trim());
      setReport(response.data);
      toast({
        title: "Report Generated",
        description: `Due diligence report for ${companyName} has been generated successfully.`,
      });
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
      toast({
        title: "Error",
        description: err.message || 'Failed to generate report',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI-Powered Due Diligence Reports | Aidiligence Pro</title>
        <meta name="description" content="Generate comprehensive due diligence reports for any company in seconds using our AI-powered platform." />
      </Helmet>
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Generate Due Diligence Report</h1>
          
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle>Generate Due Diligence Report</CardTitle>
              <CardDescription>
                Enter a company name to generate a comprehensive due diligence report powered by AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Enter company name (e.g., Apple Inc)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {!user && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      to save your reports and access premium features.
                    </p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !companyName.trim()} 
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {report && <ReportDisplay report={report} />}
        </div>
      </div>
    </>
  );
}