import React, { useState } from 'react';
import { DueDiligenceReportType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportDisplayProps {
  report: DueDiligenceReportType;
  onDownload: () => void;
}

export function ReportDisplay({ report, onDownload }: ReportDisplayProps) {
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
Generated on: ${formatDate(new Date(report.timestamp))}

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

### Market Share
${report.marketAnalysis.marketShare}

### Competitors
${report.marketAnalysis.competitors.map(competitor => `- ${competitor}`).join('\n')}

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
${report.recentDevelopments.news.map(item => `- ${item.title} (${formatDate(new Date(item.date))})`).join('\n')}

### Filings
${report.recentDevelopments.filings.map(filing => `- ${filing.type}: ${filing.description} (${formatDate(new Date(filing.date))})`).join('\n')}

### Management Changes
${report.recentDevelopments.management.map(change => `- ${change}`).join('\n')}

### Strategic Initiatives
${report.recentDevelopments.strategic.map(initiative => `- ${initiative}`).join('\n')}
      `;

      await navigator.clipboard.writeText(reportText);
      toast.success('Report copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy report to clipboard');
      console.error('Copy error:', error);
    }
  };

  const shareReport = () => {
    // Implement sharing functionality
    toast.info('Sharing functionality coming soon');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{report.companyName}</h2>
          <p className="text-sm text-muted-foreground">
            Generated on {formatDate(new Date(report.timestamp))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={shareReport}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="default" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="developments">Developments</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p>{report.executiveSummary.overview}</p>
                
                <h3 className="text-lg font-semibold mt-4">Key Findings</h3>
                <ul className="mt-2">
                  {report.executiveSummary.keyFindings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium">Risk Rating</h4>
                    <p className="text-lg font-semibold">{report.executiveSummary.riskRating}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium">Recommendation</h4>
                    <p>{report.executiveSummary.recommendation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.financialAnalysis.metrics).map(([key, value]) => (
                  <div key={key} className="p-4 border rounded-md">
                    <h4 className="text-sm font-medium text-muted-foreground">{key}</h4>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Trends</h3>
                <ul className="space-y-1">
                  {report.financialAnalysis.trends.map((trend, index) => (
                    <li key={index}>{trend}</li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {report.financialAnalysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Weaknesses</h3>
                  <ul className="space-y-1">
                    {report.financialAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{report.marketAnalysis.position}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">Market Share</h4>
                  <p className="text-lg font-semibold">{report.marketAnalysis.marketShare}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">Competitors</h4>
                  <ul className="mt-2">
                    {report.marketAnalysis.competitors.map((competitor, index) => (
                      <li key={index}>{competitor}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">SWOT Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md bg-green-50/50 dark:bg-green-950/20">
                    <h4 className="font-medium">Strengths</h4>
                    <ul className="mt-2">
                      {report.marketAnalysis.swot.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border rounded-md bg-red-50/50 dark:bg-red-950/20">
                    <h4 className="font-medium">Weaknesses</h4>
                    <ul className="mt-2">
                      {report.marketAnalysis.swot.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border rounded-md bg-blue-50/50 dark:bg-blue-950/20">
                    <h4 className="font-medium">Opportunities</h4>
                    <ul className="mt-2">
                      {report.marketAnalysis.swot.opportunities.map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border rounded-md bg-amber-50/50 dark:bg-amber-950/20">
                    <h4 className="font-medium">Threats</h4>
                    <ul className="mt-2">
                      {report.marketAnalysis.swot.threats.map((threat, index) => (
                        <li key={index}>{threat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Financial Risks</h3>
                  <ul className="space-y-1">
                    {report.riskAssessment.financial.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Operational Risks</h3>
                  <ul className="space-y-1">
                    {report.riskAssessment.operational.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Market Risks</h3>
                  <ul className="space-y-1">
                    {report.riskAssessment.market.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Regulatory Risks</h3>
                  <ul className="space-y-1">
                    {report.riskAssessment.regulatory.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 border rounded-md md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">ESG Risks</h3>
                  <ul className="space-y-1">
                    {report.riskAssessment.esg.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Developments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">News</h3>
                <div className="space-y-3">
                  {report.recentDevelopments.news.map((item, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">{item.source.name}</span>
                        <span className="text-sm text-muted-foreground">{formatDate(new Date(item.date))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Filings</h3>
                <div className="space-y-3">
                  {report.recentDevelopments.filings.map((filing, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{filing.type}: {filing.description}</h4>
                        <span className="text-sm text-muted-foreground">{formatDate(new Date(filing.date))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Management Changes</h3>
                  <ul className="space-y-1">
                    {report.recentDevelopments.management.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Strategic Initiatives</h3>
                  <ul className="space-y-1">
                    {report.recentDevelopments.strategic.map((initiative, index) => (
                      <li key={index}>{initiative}</li>
                    ))}
                  </ul>
                </div>
      </div>
            </CardContent>
    </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 