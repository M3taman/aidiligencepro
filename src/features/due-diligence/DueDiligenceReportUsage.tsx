import React, { useState } from 'react';
import DueDiligenceReportWrapper from './DueDiligenceReportWrapper';
import { DueDiligenceReport as DueDiligenceReportType } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

const DueDiligenceReportUsage: React.FC = () => {
  const [company, setCompany] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  // Example of saving generated report data
  const handleReportGenerated = (report: DueDiligenceReportType) => {
    console.log('Report data received in parent component:', report);
    setReportGenerated(true);
    
    // You could save this data to state, context, or a database
    // Example: saveReportToUserHistory(report);
  };
  
  // Example of handling errors from the report generation
  const handleError = (error: string) => {
    console.error('Error generating report:', error);
    // You could show a custom error UI or log errors
  };
  
  const startAnalysis = () => {
    if (company.trim()) {
      setSelectedCompany(company);
      setReportGenerated(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Company Research</h1>
      
      {!selectedCompany && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Analyze a Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-search">Enter Company Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company-search"
                    placeholder="e.g., Apple, Microsoft, Tesla"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                onClick={startAnalysis} 
                className="w-full"
                disabled={!company.trim()}
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {selectedCompany && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Analysis for: <span className="text-primary">{selectedCompany}</span>
            </h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCompany(null);
                setReportGenerated(false);
              }}
            >
              New Search
            </Button>
          </div>
          
          {/* The wrapper component handles all the API calls and state management */}
          <DueDiligenceReportWrapper 
            companyName={selectedCompany}
            onReportGenerated={handleReportGenerated}
            onError={handleError}
            showControls={true}
          />
          
          {reportGenerated && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Report generated successfully. You can now download it or start a new search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DueDiligenceReportUsage; 