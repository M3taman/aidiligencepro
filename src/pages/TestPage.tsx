import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TestRunner } from '@/components/TestRunner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker, CheckCircle2, ClipboardList, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  id: string;
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: Date;
}

const TestPage = () => {
  const [activeTab, setActiveTab] = useState('system-tests');
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: '1',
      name: 'Authentication Test',
      status: 'success',
      message: 'All authentication flows working correctly',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      name: 'API Connection Test',
      status: 'warning',
      message: 'API response time is higher than expected',
      timestamp: new Date(Date.now() - 7200000)
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">Success</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">Error</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      <Helmet>
        <title>Test Dashboard | Aidiligence Pro</title>
        <meta name="description" content="System test dashboard for Aidiligence Pro platform." />
      </Helmet>
      
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Test Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Testing Environment
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Test Suite</CardTitle>
            <CardDescription>
              Run comprehensive tests on all major features of the application.
              The tests will verify authentication, user settings, profile management, and due diligence report generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Last successful run: {formatDate(new Date(Date.now() - 3600000))}</span>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system-tests">
              <ClipboardList className="h-4 w-4 mr-2" />
              System Tests
            </TabsTrigger>
            <TabsTrigger value="test-results">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Test Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="system-tests" className="space-y-4">
            <TestRunner />
          </TabsContent>
          
          <TabsContent value="test-results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>
                  Recent test results and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-4">
                    {testResults.map((result) => (
                      <div key={result.id} className="flex items-start justify-between p-4 border rounded-md">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-muted-foreground">{result.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">{formatDate(result.timestamp)}</div>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No test results available. Run tests to see results here.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default TestPage; 