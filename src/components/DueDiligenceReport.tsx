import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { DueDiligenceResponse } from "@/types/due-diligence";
import { APIError } from "@/lib/api";

interface DueDiligenceReportProps {
  report: DueDiligenceResponse | null;
  isLoading: boolean;
  error: APIError | null;
}

export function DueDiligenceReport({ report, isLoading, error }: DueDiligenceReportProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return null;
  }

  // Check if the report is empty (all fields are empty or arrays are empty)
  const isEmptyReport = 
    !report.executiveSummary?.overview &&
    report.executiveSummary?.keyFindings?.length === 0 &&
    Object.keys(report.financialAnalysis?.metrics || {}).length === 0 &&
    report.financialAnalysis?.trends?.length === 0 &&
    !report.marketAnalysis?.position &&
    report.marketAnalysis?.competitors?.length === 0 &&
    report.marketAnalysis?.swot?.strengths?.length === 0 &&
    report.marketAnalysis?.swot?.weaknesses?.length === 0 &&
    report.marketAnalysis?.swot?.opportunities?.length === 0 &&
    report.marketAnalysis?.swot?.threats?.length === 0 &&
    report.riskAssessment?.financial?.length === 0 &&
    report.riskAssessment?.operational?.length === 0 &&
    report.riskAssessment?.market?.length === 0 &&
    report.riskAssessment?.regulatory?.length === 0 &&
    report.recentDevelopments?.news?.length === 0 &&
    report.recentDevelopments?.filings?.length === 0;

  if (isEmptyReport) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          The report was generated but no data was returned. This could be due to:
          <ul className="list-disc pl-6 mt-2">
            <li>Limited information available for the company</li>
            <li>API rate limiting or temporary service issues</li>
            <li>Error in data processing</li>
          </ul>
          Please try again in a few minutes or contact support if the issue persists.
        </AlertDescription>
      </Alert>
    );
  }

  // Validate required fields
  const isValidReport = report && 
    report.executiveSummary && 
    report.financialAnalysis && 
    report.marketAnalysis && 
    report.riskAssessment && 
    report.recentDevelopments;

  if (!isValidReport) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Invalid report format received from the server.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{report.executiveSummary?.overview || 'No overview available'}</p>
          <div className="space-y-2">
            <h3 className="font-semibold">Key Findings:</h3>
            <ul className="list-disc pl-6">
              {(report.executiveSummary?.keyFindings || []).map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <p><strong>Risk Rating:</strong> {report.executiveSummary?.riskRating || 'Not available'}</p>
            <p><strong>Recommendation:</strong> {report.executiveSummary?.recommendation || 'Not available'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Key Metrics</h3>
              <ul className="space-y-1">
                {Object.entries(report.financialAnalysis?.metrics || {}).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Trends</h3>
              <ul className="list-disc pl-6">
                {(report.financialAnalysis?.trends || []).map((trend, index) => (
                  <li key={index}>{trend}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{report.marketAnalysis?.position || 'No position data available'}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Competitors</h3>
              <ul className="list-disc pl-6">
                {(report.marketAnalysis?.competitors || []).map((competitor, index) => (
                  <li key={index}>{competitor}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">SWOT Analysis</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Strengths</h4>
                  <ul className="list-disc pl-6">
                    {(report.marketAnalysis?.swot?.strengths || []).map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Weaknesses</h4>
                  <ul className="list-disc pl-6">
                    {(report.marketAnalysis?.swot?.weaknesses || []).map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Opportunities</h4>
                  <ul className="list-disc pl-6">
                    {(report.marketAnalysis?.swot?.opportunities || []).map((opportunity, index) => (
                      <li key={index}>{opportunity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Threats</h4>
                  <ul className="list-disc pl-6">
                    {(report.marketAnalysis?.swot?.threats || []).map((threat, index) => (
                      <li key={index}>{threat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Financial Risks</h3>
              <ul className="list-disc pl-6">
                {(report.riskAssessment?.financial || []).map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Operational Risks</h3>
              <ul className="list-disc pl-6">
                {(report.riskAssessment?.operational || []).map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Market Risks</h3>
              <ul className="list-disc pl-6">
                {(report.riskAssessment?.market || []).map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Regulatory Risks</h3>
              <ul className="list-disc pl-6">
                {(report.riskAssessment?.regulatory || []).map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Developments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">News</h3>
              <ul className="space-y-2">
                {(report.recentDevelopments?.news || []).map((item, index) => (
                  <li key={index}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {item.title}
                    </a>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(item.date).toLocaleDateString()} - {item.source}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">SEC Filings</h3>
              <ul className="space-y-2">
                {(report.recentDevelopments?.filings || []).map((filing, index) => (
                  <li key={index}>
                    <a href={filing.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {filing.type} - {new Date(filing.date).toLocaleDateString()}
                    </a>
                    <p className="text-sm text-gray-600">{filing.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 