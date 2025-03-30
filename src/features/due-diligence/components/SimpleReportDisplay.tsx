import React from 'react';
import { DueDiligenceReportType } from '../types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SimpleReportDisplayProps {
  report: DueDiligenceReportType;
  showCharts?: boolean;
  showTables?: boolean;
}

const SimpleReportDisplay: React.FC<SimpleReportDisplayProps> = ({ 
  report,
  showCharts = true,
  showTables = true
}) => {
  // Helper function to render a section that might be a string or an object
  const renderSection = (section: any, title: string) => {
    if (!section) return null;
    
    if (typeof section === 'string') {
      return (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="whitespace-pre-line">{section}</p>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };
  
  // Helper function to render a list of items
  const renderList = (items: string | string[] | undefined, title: string) => {
    if (!items) return null;
    
    const itemList = Array.isArray(items) ? items : [items];
    
    return (
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">{title}</h4>
        <ul className="list-disc pl-5 space-y-1">
          {itemList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Generate financial metrics chart data
  const generateFinancialMetricsChart = () => {
    if (!report.financialAnalysis || typeof report.financialAnalysis === 'string') {
      return [];
    }

    const { metrics } = report.financialAnalysis;
    if (!metrics) return [];

    return Object.entries(metrics)
      .filter(([key]) => {
        // Filter out metrics that don't make sense for a bar chart
        const excludedMetrics = ['Market Cap', 'Cash & Equivalents', 'Revenue (TTM)', 'Net Income'];
        return !excludedMetrics.includes(key);
      })
      .map(([name, value]) => {
        // Extract numeric value from string like '$2.35' or '48.5%'
        let numericValue = 0;
        if (typeof value === 'string') {
          const match = value.match(/[\d.]+/);
          if (match) {
            numericValue = parseFloat(match[0]);
          }
        } else if (typeof value === 'number') {
          numericValue = value;
        }
        return { name, value: numericValue };
      });
  };

  // Generate market share chart data
  const generateMarketShareChart = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    if (!report.marketAnalysis || typeof report.marketAnalysis === 'string' || !report.marketAnalysis.competitors) {
      return { data: [], colors: [] };
    }

    const competitors = Array.isArray(report.marketAnalysis.competitors) 
      ? report.marketAnalysis.competitors 
      : [];

    // Create pie chart data with company and competitors
    const data = [
      { name: report.companyName, value: 35 }, // Example market share
      ...competitors.slice(0, 4).map((comp, index) => {
        const compName = typeof comp === 'string' ? comp : comp.name;
        // Distribute remaining market share among competitors
        return { name: compName, value: (65 / Math.min(competitors.length, 4)) };
      })
    ];

    return { data, colors: COLORS };
  };

  // Render financial metrics table
  const renderFinancialTable = () => {
    if (!showTables || !report.financialAnalysis || typeof report.financialAnalysis === 'string' || !report.financialAnalysis.metrics) {
      return null;
    }

    const { metrics } = report.financialAnalysis;

    return (
      <div className="my-4">
        <h4 className="text-md font-medium mb-2">Financial Metrics</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(metrics).map(([key, value], index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render competitors table
  const renderCompetitorsTable = () => {
    if (!showTables || !report.marketAnalysis || typeof report.marketAnalysis === 'string' || !report.marketAnalysis.competitors) {
      return null;
    }

    const competitors = report.marketAnalysis.competitors;
    
    if (Array.isArray(competitors) && competitors.length > 0) {
      if (typeof competitors[0] === 'string') {
        return (
          <div className="my-4">
            <h4 className="text-md font-medium mb-2">Key Competitors</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor, index) => (
                  <TableRow key={index}>
                    <TableCell>{competitor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      } else {
        return (
          <div className="my-4">
            <h4 className="text-md font-medium mb-2">Key Competitors</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Strengths</TableHead>
                  <TableHead>Weaknesses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{competitor.name}</TableCell>
                    <TableCell>{competitor.strengths || '-'}</TableCell>
                    <TableCell>{competitor.weaknesses || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
    }
    
    return null;
  };

  // Render financial metrics chart
  const renderFinancialChart = () => {
    if (!showCharts) return null;
    
    const data = generateFinancialMetricsChart();
    if (data.length === 0) return null;

    return (
      <div className="my-6">
        <h4 className="text-md font-medium mb-2">Financial Metrics Visualization</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render market share chart
  const renderMarketShareChart = () => {
    if (!showCharts) return null;
    
    const { data, colors } = generateMarketShareChart();
    if (data.length === 0) return null;

    return (
      <div className="my-6">
        <h4 className="text-md font-medium mb-2">Estimated Market Share</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render executive summary section
  const renderExecutiveSummary = () => {
    const { executiveSummary } = report;
    
    if (!executiveSummary) return null;
    
    if (typeof executiveSummary === 'string') {
      return renderSection(executiveSummary, 'Executive Summary');
    }
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
          <p className="mb-4">{executiveSummary.overview}</p>
          
          {renderList(executiveSummary.keyFindings, 'Key Findings')}
          
          {executiveSummary.riskRating && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Risk Rating</h4>
              <Badge variant={executiveSummary.riskRating.toLowerCase() === 'high' ? 'destructive' : 
                     executiveSummary.riskRating.toLowerCase() === 'medium' ? 'warning' : 'success'}>
                {executiveSummary.riskRating}
              </Badge>
            </div>
          )}
          
          {executiveSummary.recommendation && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Recommendation</h4>
              <p>{executiveSummary.recommendation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render financial analysis section
  const renderFinancialAnalysis = () => {
    const { financialAnalysis } = report;
    
    if (!financialAnalysis) return null;
    
    if (typeof financialAnalysis === 'string') {
      return renderSection(financialAnalysis, 'Financial Analysis');
    }
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Financial Analysis</h3>
          <p className="mb-4">{financialAnalysis.overview}</p>
          
          {renderFinancialTable()}
          {renderFinancialChart()}
          
          {financialAnalysis.trends && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Financial Trends</h4>
              <p>{financialAnalysis.trends}</p>
            </div>
          )}
          
          {renderList(financialAnalysis.strengths, 'Financial Strengths')}
          {renderList(financialAnalysis.weaknesses, 'Financial Weaknesses')}
        </CardContent>
      </Card>
    );
  };
  
  // Render market analysis section
  const renderMarketAnalysis = () => {
    const { marketAnalysis } = report;
    
    if (!marketAnalysis) return null;
    
    if (typeof marketAnalysis === 'string') {
      return renderSection(marketAnalysis, 'Market Analysis');
    }
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Market Analysis</h3>
          <p className="mb-4">{marketAnalysis.overview}</p>
          
          {marketAnalysis.position && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Market Position</h4>
              <p>{marketAnalysis.position}</p>
            </div>
          )}
          
          {renderMarketShareChart()}
          {renderCompetitorsTable()}
          
          {marketAnalysis.swot && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">SWOT Analysis</h4>
              <Tabs defaultValue="strengths">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                  <TabsTrigger value="threats">Threats</TabsTrigger>
                </TabsList>
                <TabsContent value="strengths">
                  {renderList(marketAnalysis.swot.strengths, 'Strengths')}
                </TabsContent>
                <TabsContent value="weaknesses">
                  {renderList(marketAnalysis.swot.weaknesses, 'Weaknesses')}
                </TabsContent>
                <TabsContent value="opportunities">
                  {renderList(marketAnalysis.swot.opportunities, 'Opportunities')}
                </TabsContent>
                <TabsContent value="threats">
                  {renderList(marketAnalysis.swot.threats, 'Threats')}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render risk assessment section
  const renderRiskAssessment = () => {
    const { riskAssessment } = report;
    
    if (!riskAssessment) return null;
    
    if (typeof riskAssessment === 'string') {
      return renderSection(riskAssessment, 'Risk Assessment');
    }
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
          <p className="mb-4">{riskAssessment.overview}</p>
          
          {riskAssessment.riskRating && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Overall Risk Rating</h4>
              <Badge variant={riskAssessment.riskRating === 'high' ? 'destructive' : 
                     riskAssessment.riskRating === 'medium' ? 'warning' : 'success'}>
                {riskAssessment.riskRating.charAt(0).toUpperCase() + riskAssessment.riskRating.slice(1)}
              </Badge>
            </div>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            {riskAssessment.financial && (
              <AccordionItem value="financial">
                <AccordionTrigger>Financial Risks</AccordionTrigger>
                <AccordionContent>
                  <p>{riskAssessment.financial}</p>
                  {riskAssessment.riskFactors?.financial && (
                    <ul className="list-disc pl-5 mt-2">
                      {riskAssessment.riskFactors.financial.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            
            {riskAssessment.operational && (
              <AccordionItem value="operational">
                <AccordionTrigger>Operational Risks</AccordionTrigger>
                <AccordionContent>
                  <p>{riskAssessment.operational}</p>
                  {riskAssessment.riskFactors?.operational && (
                    <ul className="list-disc pl-5 mt-2">
                      {riskAssessment.riskFactors.operational.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            
            {riskAssessment.market && (
              <AccordionItem value="market">
                <AccordionTrigger>Market Risks</AccordionTrigger>
                <AccordionContent>
                  <p>{riskAssessment.market}</p>
                  {riskAssessment.riskFactors?.market && (
                    <ul className="list-disc pl-5 mt-2">
                      {riskAssessment.riskFactors.market.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            
            {riskAssessment.regulatory && (
              <AccordionItem value="regulatory">
                <AccordionTrigger>Regulatory Risks</AccordionTrigger>
                <AccordionContent>
                  <p>{riskAssessment.regulatory}</p>
                  {riskAssessment.riskFactors?.regulatory && (
                    <ul className="list-disc pl-5 mt-2">
                      {riskAssessment.riskFactors.regulatory.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            
            {riskAssessment.esgConsiderations && (
              <AccordionItem value="esg">
                <AccordionTrigger>ESG Considerations</AccordionTrigger>
                <AccordionContent>
                  <p>{riskAssessment.esgConsiderations}</p>
                  {riskAssessment.riskFactors?.esg && (
                    <ul className="list-disc pl-5 mt-2">
                      {riskAssessment.riskFactors.esg.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    );
  };
  
  // Render recent developments section
  const renderRecentDevelopments = () => {
    const { recentDevelopments } = report;
    
    if (!recentDevelopments) return null;
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Developments</h3>
          
          {recentDevelopments.news && recentDevelopments.news.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Recent News</h4>
              <ul className="space-y-2">
                {recentDevelopments.news.map((item, index) => (
                  <li key={index} className="border-l-2 border-primary pl-4 py-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                    {item.summary && <p className="mt-1">{item.summary}</p>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                        Read more
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {recentDevelopments.filings && recentDevelopments.filings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Recent Filings</h4>
              <ul className="space-y-2">
                {recentDevelopments.filings.map((item, index) => (
                  <li key={index} className="border-l-2 border-secondary pl-4 py-1">
                    <div className="font-medium">{item.type || 'Filing'}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                    {item.description && <p className="mt-1">{item.description}</p>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                        View filing
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {recentDevelopments.strategic && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Strategic Initiatives</h4>
              {Array.isArray(recentDevelopments.strategic) && typeof recentDevelopments.strategic[0] === 'string' ? (
                <ul className="list-disc pl-5 space-y-1">
                  {recentDevelopments.strategic.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : Array.isArray(recentDevelopments.strategic) ? (
                <ul className="space-y-2">
                  {recentDevelopments.strategic.map((item: any, index) => (
                    <li key={index} className="border-l-2 border-primary pl-4 py-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.date}</div>
                      {(item.summary || item.description) && <p className="mt-1">{item.summary || item.description}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{recentDevelopments.strategic}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render conclusion section
  const renderConclusion = () => {
    const { conclusion } = report;
    
    if (!conclusion) return null;
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
          <p className="whitespace-pre-line">{conclusion}</p>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderExecutiveSummary()}
      {renderFinancialAnalysis()}
      {renderMarketAnalysis()}
      {renderRiskAssessment()}
      {renderRecentDevelopments()}
      {renderConclusion()}
    </div>
  );
};

export default SimpleReportDisplay;