import React, { useState } from 'react';
import { DueDiligenceResponse } from '@/types/due-diligence';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';

interface ReportDisplayProps {
  report: DueDiligenceResponse;
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    executiveSummary: true,
    financialAnalysis: false,
    marketAnalysis: false,
    riskAssessment: false,
    recentDevelopments: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = async () => {
    try {
      const reportText = `
# Due Diligence Report: ${report.companyName}
Generated on: ${new Date(report.timestamp).toLocaleDateString()}

## Executive Summary
${report.executiveSummary.overview}

### Key Findings
${report.executiveSummary.keyFindings.map(finding => `- ${finding}`).join('\n')}

### Risk Rating
${report.executiveSummary.riskRating}

### Recommendation
${report.executiveSummary.recommendation}

## Financial Analysis
${Object.entries(report.financialAnalysis.metrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

### Trends
${report.financialAnalysis.trends.map(trend => `- ${trend}`).join('\n')}

### Strengths
${report.financialAnalysis.strengths.map(strength => `- ${strength}`).join('\n')}

### Weaknesses
${report.financialAnalysis.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

## Market Analysis
${report.marketAnalysis.position}

### Competitors
${report.marketAnalysis.competitors.map(competitor => `- ${competitor}`).join('\n')}

### Market Share
${report.marketAnalysis.marketShare}

### SWOT Analysis
#### Strengths
${report.marketAnalysis.swot.strengths.map(strength => `- ${strength}`).join('\n')}

#### Weaknesses
${report.marketAnalysis.swot.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

#### Opportunities
${report.marketAnalysis.swot.opportunities.map(opportunity => `- ${opportunity}`).join('\n')}

#### Threats
${report.marketAnalysis.swot.threats.map(threat => `- ${threat}`).join('\n')}

## Risk Assessment
### Financial Risks
${report.riskAssessment.financial.map(risk => `- ${risk}`).join('\n')}

### Operational Risks
${report.riskAssessment.operational.map(risk => `- ${risk}`).join('\n')}

### Market Risks
${report.riskAssessment.market.map(risk => `- ${risk}`).join('\n')}

### Regulatory Risks
${report.riskAssessment.regulatory.map(risk => `- ${risk}`).join('\n')}

### ESG Risks
${report.riskAssessment.esg.map(risk => `- ${risk}`).join('\n')}

## Recent Developments
### News
${report.recentDevelopments.news.map(item => `- ${item.title} (${new Date(item.date).toLocaleDateString()})`).join('\n')}

### Filings
${report.recentDevelopments.filings.map(filing => `- ${filing.type}: ${filing.description} (${new Date(filing.date).toLocaleDateString()})`).join('\n')}

### Management Updates
${report.recentDevelopments.management.map(update => `- ${update}`).join('\n')}

### Strategic Initiatives
${report.recentDevelopments.strategic.map(initiative => `- ${initiative}`).join('\n')}
`;

      await navigator.clipboard.writeText(reportText);
      toast({
        title: "Copied to clipboard",
        description: "Report has been copied to your clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Could not copy report to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadPDF = () => {
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(`Due Diligence Report: ${report.companyName}`, 20, 20);
      
      // Add generation date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date(report.timestamp).toLocaleDateString()}`, 20, 30);
      
      // Executive Summary
      pdf.setFontSize(16);
      pdf.text('Executive Summary', 20, 40);
      pdf.setFontSize(12);
      
      const executiveSummaryLines = pdf.splitTextToSize(report.executiveSummary.overview, 170);
      pdf.text(executiveSummaryLines, 20, 50);
      
      // Add more sections as needed...
      
      pdf.save(`${report.companyName.replace(/\s+/g, '_')}_due_diligence_report.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Report has been downloaded as PDF",
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast({
        title: "Download failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Due Diligence Report: {report.companyName}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Generated on {new Date(report.timestamp).toLocaleString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex justify-end space-x-2 mb-6">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="developments">Developments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Executive Summary</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('executiveSummary')}
                >
                  {expandedSections.executiveSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedSections.executiveSummary && (
                <div className="space-y-4">
                  <p className="text-sm">{report.executiveSummary.overview}</p>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Key Findings</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.executiveSummary.keyFindings.map((finding, index) => (
                        <li key={index} className="text-sm">{finding}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-medium mb-2">Risk Rating</h4>
                      <div className="text-sm">{report.executiveSummary.riskRating}</div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2">Recommendation</h4>
                      <p className="text-sm">{report.executiveSummary.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Financial Analysis</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('financialAnalysis')}
                >
                  {expandedSections.financialAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedSections.financialAnalysis && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(report.financialAnalysis.metrics).map(([key, value], index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <div className="text-xs text-muted-foreground">{key}</div>
                          <div className="text-lg font-semibold">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Trends</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.financialAnalysis.trends.map((trend, index) => (
                        <li key={index} className="text-sm">{trend}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-medium mb-2">Strengths</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {report.financialAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm">{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2">Weaknesses</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {report.financialAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="market" className="space-y-6">
            {/* Market Analysis Tab Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Market Analysis</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('marketAnalysis')}
                >
                  {expandedSections.marketAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedSections.marketAnalysis && (
                <div className="space-y-4">
                  <p className="text-sm">{report.marketAnalysis.position}</p>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Competitors</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.marketAnalysis.competitors.map((competitor, index) => (
                        <li key={index} className="text-sm">{competitor}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Market Share</h4>
                    <p className="text-sm">{report.marketAnalysis.marketShare}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">SWOT Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Strengths</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {report.marketAnalysis.swot.strengths.map((strength, index) => (
                            <li key={index} className="text-xs">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">Weaknesses</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {report.marketAnalysis.swot.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-xs">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">Opportunities</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {report.marketAnalysis.swot.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-xs">{opportunity}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">Threats</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {report.marketAnalysis.swot.threats.map((threat, index) => (
                            <li key={index} className="text-xs">{threat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="risks" className="space-y-6">
            {/* Risk Assessment Tab Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('riskAssessment')}
                >
                  {expandedSections.riskAssessment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedSections.riskAssessment && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">Financial Risks</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.riskAssessment.financial.map((risk, index) => (
                        <li key={index} className="text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Operational Risks</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.riskAssessment.operational.map((risk, index) => (
                        <li key={index} className="text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Market Risks</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.riskAssessment.market.map((risk, index) => (
                        <li key={index} className="text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Regulatory Risks</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.riskAssessment.regulatory.map((risk, index) => (
                        <li key={index} className="text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">ESG Risks</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.riskAssessment.esg.map((risk, index) => (
                        <li key={index} className="text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="developments" className="space-y-6">
            {/* Recent Developments Tab Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Developments</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('recentDevelopments')}
                >
                  {expandedSections.recentDevelopments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedSections.recentDevelopments && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">News</h4>
                    <div className="space-y-2">
                      {report.recentDevelopments.news.map((item, index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.date).toLocaleDateString()} • {item.source}
                          </div>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">
                              Read more
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Filings</h4>
                    <div className="space-y-2">
                      {report.recentDevelopments.filings.map((filing, index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <div className="font-medium">{filing.type}</div>
                          <div className="text-sm">{filing.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(filing.date).toLocaleDateString()}
                          </div>
                          {filing.url && (
                            <a href={filing.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">
                              View filing
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-medium mb-2">Management Updates</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {report.recentDevelopments.management.map((update, index) => (
                          <li key={index} className="text-sm">{update}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2">Strategic Initiatives</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {report.recentDevelopments.strategic.map((initiative, index) => (
                          <li key={index} className="text-sm">{initiative}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Powered by AI Diligence Pro
        </div>
        <Button variant="outline" size="sm" onClick={downloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}