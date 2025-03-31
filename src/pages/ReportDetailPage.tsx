import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/components/auth/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Building2, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  FileDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  companyName: string;
  createdAt: any;
  status: string;
  industry?: string;
  score?: number;
  financialMetrics?: {
    revenue?: number;
    growth?: number;
    profitMargin?: number;
    cashFlow?: number;
  };
  risks?: {
    financial?: string[];
    operational?: string[];
    market?: string[];
    regulatory?: string[];
  };
  recommendations?: {
    shortTerm?: string[];
    longTerm?: string[];
    critical?: string[];
  };
  marketAnalysis?: {
    competitors?: string[];
    marketSize?: string;
    trends?: string[];
  };
}

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId || !user) return;

      try {
        const reportDoc = await getDoc(doc(db, 'reports', reportId));
        
        if (!reportDoc.exists()) {
          toast.error('Report not found');
          navigate('/reports');
          return;
        }

        const data = reportDoc.data();
        if (data.userId !== user.uid) {
          toast.error('You do not have permission to view this report');
          navigate('/reports');
          return;
        }

        setReport({
          id: reportDoc.id,
          ...data
        } as ReportData);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report');
        navigate('/reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, user, navigate]);

  const handleExportCSV = () => {
    if (!report) return;
    
    // In a real app, this would generate a comprehensive CSV
    toast.info('CSV export functionality will be implemented');
  };

  const handleExportPDF = () => {
    if (!report) return;
    
    // In a real app, this would generate a PDF
    toast.info('PDF export functionality will be implemented');
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* Add data-testid for the loading spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>{report.companyName} - Due Diligence Report | AI Diligence Pro</title>
        <meta name="description" content={`Detailed due diligence report for ${report.companyName}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{report.companyName}</h1>
            <p className="text-muted-foreground">
              Generated on {format(report.createdAt.toDate(), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{report.industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Report Status</p>
                  <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={report.score || 0} className="h-2">
                  <ProgressIndicator className={getScoreColor(report.score)} />
                  <ProgressLabel>Overall Score</ProgressLabel>
                  <ProgressValue>{report.score || 0}%</ProgressValue>
                </Progress>
                <p className="text-sm text-muted-foreground">
                  Based on comprehensive analysis of financial, operational, and market factors
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={report.score && report.score >= 70 ? 'default' : 'destructive'}>
                    {report.score && report.score >= 70 ? 'Low Risk' : 'High Risk'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {report.score && report.score >= 70 
                    ? 'Company shows strong fundamentals and low risk indicators'
                    : 'Company requires careful consideration of identified risks'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList>
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
                <CardDescription>Key financial indicators and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {report.financialMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">
                        ${report.financialMetrics.revenue?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="text-2xl font-bold">
                        {report.financialMetrics.growth ? `${report.financialMetrics.growth}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className="text-2xl font-bold">
                        {report.financialMetrics.profitMargin ? `${report.financialMetrics.profitMargin}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cash Flow</p>
                      <p className="text-2xl font-bold">
                        ${report.financialMetrics.cashFlow?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No financial metrics available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Identified risks across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                {report.risks ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(report.risks).map(([category, risks]) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-2 capitalize">{category} Risks</h3>
                        <ul className="space-y-2">
                          {risks.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No risks identified</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>Market position and competitive landscape</CardDescription>
              </CardHeader>
              <CardContent>
                {report.marketAnalysis ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Market Size</h3>
                      <p>{report.marketAnalysis.marketSize || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Key Competitors</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {report.marketAnalysis.competitors?.map((competitor, index) => (
                          <li key={index}>{competitor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Market Trends</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {report.marketAnalysis.trends?.map((trend, index) => (
                          <li key={index}>{trend}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No market analysis available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Strategic recommendations for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                {report.recommendations ? (
                  <div className="space-y-6">
                    {Object.entries(report.recommendations).map(([category, recommendations]) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()} Recommendations</h3>
                        <ul className="space-y-2">
                          {recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recommendations available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportDetailPage;
