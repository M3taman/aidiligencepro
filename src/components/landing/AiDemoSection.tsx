import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Loader2, Search, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jsPDF } from "jspdf";
// Import the mock API function
import { generateMockDueDiligenceReport } from "../../features/due-diligence/mockApi";
import { DueDiligenceReport } from "../../features/due-diligence/types";

type DueDiligenceResponse = {
  data: string | DueDiligenceReport;
  remainingQuota?: number;
};

const AiDemoSection = () => {
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [structuredReport, setStructuredReport] = useState<DueDiligenceReport | null>(null);
  const [demoUsageCount, setDemoUsageCount] = useState(0);
  const navigate = useNavigate();

  const MAX_DEMO_USAGE = 2;

  const handleAnalysis = async () => {
    if (!company.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    if (demoUsageCount >= MAX_DEMO_USAGE) {
      toast.error("Demo limit reached. Please sign up for full access.");
      navigate("/register");
      return;
    }

    setIsLoading(true);
    try {
      // Check if we're in development mode
      const isDev = import.meta.env.MODE === 'development';
      
      if (isDev) {
        // Use mock API in development
        console.log("Using mock API for development");
        const mockReport = await generateMockDueDiligenceReport(company);
        setStructuredReport(mockReport);
        
        // Generate a text representation for display
        const textReport = formatReportAsText(mockReport);
        setAnalysis(textReport);
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

        const result: DueDiligenceResponse = await response.json();
        if (typeof result.data === 'string') {
          setAnalysis(result.data);
        } else {
          setStructuredReport(result.data as DueDiligenceReport);
          const textReport = formatReportAsText(result.data as DueDiligenceReport);
          setAnalysis(textReport);
        }
      }
      
      setDemoUsageCount(prev => prev + 1);
      toast.success("Analysis generated successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Error generating analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format structured report as text
  const formatReportAsText = (report: DueDiligenceReport): string => {
    return `
DUE DILIGENCE REPORT: ${report.companyName}
Generated: ${new Date(report.timestamp).toLocaleString()}

1. EXECUTIVE SUMMARY
${report.executiveSummary.overview}

Key Findings: ${report.executiveSummary.keyFindings}
Risk Rating: ${report.executiveSummary.riskRating}
Recommendation: ${report.executiveSummary.recommendation}

2. FINANCIAL ANALYSIS
Revenue Growth: ${report.financialAnalysis.revenueGrowth}
Profitability: ${report.financialAnalysis.profitabilityMetrics}
Balance Sheet: ${report.financialAnalysis.balanceSheetAnalysis}
Cash Flow: ${report.financialAnalysis.cashFlowAnalysis}
Peer Comparison: ${report.financialAnalysis.peerComparison}

3. MARKET POSITION & COMPETITIVE ANALYSIS
Industry Overview: ${report.marketAnalysis.industryOverview}
Competitive Landscape: ${report.marketAnalysis.competitiveLandscape}

SWOT Analysis:
- Strengths: ${report.marketAnalysis.swot.strengths}
- Weaknesses: ${report.marketAnalysis.swot.weaknesses}
- Opportunities: ${report.marketAnalysis.swot.opportunities}
- Threats: ${report.marketAnalysis.swot.threats}

Market Share: ${report.marketAnalysis.marketShare}
Competitive Advantages: ${report.marketAnalysis.competitiveAdvantages}

4. RISK ASSESSMENT
Financial Risks: ${report.riskAssessment.financialRisks}
Operational Risks: ${report.riskAssessment.operationalRisks}
Market Risks: ${report.riskAssessment.marketRisks}
Regulatory Risks: ${report.riskAssessment.regulatoryRisks}
ESG Considerations: ${report.riskAssessment.esgConsiderations}

5. RECENT DEVELOPMENTS
${report.recentDevelopments.news.length > 0 ? 'Recent News:' : ''}
${report.recentDevelopments.news.map(news => `- ${news.title} (${news.source?.name || 'Unknown'}, ${news.date})`).join('\n')}

${report.recentDevelopments.filings.length > 0 ? 'SEC Filings:' : ''}
${report.recentDevelopments.filings.map(filing => `- ${filing.type}: ${filing.description} (${filing.date})`).join('\n')}

${report.recentDevelopments.strategicInitiatives.length > 0 ? 'Strategic Initiatives:' : ''}
${report.recentDevelopments.strategicInitiatives.map(initiative => `- ${initiative}`).join('\n')}

DISCLAIMER: This report is generated using AI technology and should not be considered as financial advice. For full access and detailed reports, please sign up for a full account.
`;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add logo and watermark
    const watermarkText = "aidiligence.pro";
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.text(watermarkText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
      align: 'center',
      angle: 45
    });

    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    
    // Add header with logo and company info
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Due Diligence Report (Demo)", 20, 20);
    
    doc.setFontSize(16);
    doc.text(`Company: ${company}`, 20, 35);
    
    // Add report metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Report ID: DEMO-${Date.now().toString(36)}`, 20, 50);
    
    // Add disclaimer
    doc.setFontSize(8);
    doc.text(
      "DISCLAIMER: This is a demo report generated using AI technology and should not be considered as financial advice. " +
      "For full access and detailed reports, please visit https://aidiligence.pro",
      20, 60
    );

    // Add horizontal line
    doc.line(20, 65, 190, 65);
    
    // Format and add report content
    doc.setFontSize(11);
    let y = 75;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - 2 * margin;

    // Split report into sections
    const sections = analysis.split('\n\n');
    
    sections.forEach((section) => {
      if (/^\d+\./.test(section)) {
        y += 5;
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      
      const lines = doc.splitTextToSize(section, maxWidth);
      lines.forEach((line: string) => {
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          // Add watermark to new page
          doc.setTextColor(200, 200, 200);
          doc.setFontSize(60);
          doc.text(watermarkText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
            align: 'center',
            angle: 45
          });
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
      });
    });
    
    // Add footer to each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated by Aidiligence Pro - https://aidiligence.pro | Page ${i} of ${pageCount} (Demo Version)`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`${company.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_due_diligence_demo.pdf`);
  };

  return (
    <section className="container mx-auto px-4 py-24" id="demo-section">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
        </div>
        <h2 className="text-4xl font-bold mb-4 gradient-text">
          Experience Advanced AI Due Diligence
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get a comprehensive due diligence report powered by Gemini AI. Our analysis covers financials, market position, risks, and growth potential.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto p-8 glass-card shadow-xl">
        <div className="flex flex-col gap-6">
          {demoUsageCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Demo reports remaining: {MAX_DEMO_USAGE - demoUsageCount} of {MAX_DEMO_USAGE}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter company name (e.g., Tesla, Apple, Microsoft)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-12"
                disabled={demoUsageCount >= MAX_DEMO_USAGE}
              />
            </div>
            <Button
              className="h-12 px-6 neo-button"
              onClick={handleAnalysis}
              disabled={isLoading || demoUsageCount >= MAX_DEMO_USAGE}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>

          {analysis && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Analysis Complete</span>
              </div>
              <div className="bg-background/50 p-6 rounded-lg backdrop-blur-sm overflow-auto max-h-[600px]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </pre>
              </div>
              <div className="flex gap-4">
                <Button
                  className="flex-1 neo-button"
                  onClick={downloadPDF}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Demo Report
                </Button>
                <Button
                  className="flex-1 neo-button"
                  onClick={() => navigate("/register")}
                >
                  Sign Up for Full Access
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              "12-dimensional analysis",
              "Real-time market data",
              "ESG insights",
              "Risk assessment",
              "Growth potential",
              "Competitive analysis"
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AiDemoSection;
