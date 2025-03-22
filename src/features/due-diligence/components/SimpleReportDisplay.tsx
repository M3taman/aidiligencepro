import React from 'react';
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SimpleReportDisplayProps {
  reportText: string;
  onDownload?: () => void;
  className?: string;
}

const SimpleReportDisplay: React.FC<SimpleReportDisplayProps> = ({ 
  reportText, 
  onDownload,
  className = ''
}) => {
  // Extract company name from the first line of the report
  const lines = reportText.split('\n');
  const companyName = lines.length > 0 ? lines[0].replace('Company: ', '') : 'Company Report';
  
  // Format the report text for display
  const formatReportText = () => {
    if (!reportText) return <p>No report data available</p>;
    
    return lines.map((line, index) => {
      // Skip the first line as we're using it for the title
      if (index === 0) return null;
      
      // Make headings bold
      if (line.endsWith(':')) {
        return <h3 key={index} className="font-bold text-lg mt-4 mb-2">{line}</h3>;
      }
      
      // Handle empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2"></div>;
      }
      
      // Regular lines
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  if (!reportText) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <h2 className="text-xl font-bold">Report Unavailable</h2>
        </CardHeader>
        <CardContent>
          <p>No report data is available. Please try generating a report first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{companyName}</h2>
        {onDownload && (
          <Button onClick={onDownload} variant="outline">
            Download PDF
          </Button>
        )}
      </CardHeader>
      <CardContent className="prose max-w-none">
        {formatReportText()}
      </CardContent>
    </Card>
  );
};

export default SimpleReportDisplay; 