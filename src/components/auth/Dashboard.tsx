import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './authContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FileText, Clock, BarChart, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';

interface RecentReport {
  id: string;
  companyName: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
}

const features = [
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Blog Generator",
    description: "Generate SEO-optimized blog posts about market news and financial topics.",
    href: "/blog-generator"
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "File Manager",
    description: "Upload, manage, and organize your files and documents securely.",
    href: "/file-manager"
  },
];

const Dashboard = () => {
  const { user, hasTrial } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    reportsThisMonth: 0,
    savedCompanies: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        // Get user data including trial info
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists() && userDoc.data().trial) {
          const trial = userDoc.data().trial;
          if (trial.status === 'active') {
            const endDate = new Date(trial.endDate);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setTrialDaysLeft(diffDays > 0 ? diffDays : 0);
          }
        }
        
        // Get recent reports
        const reportsQuery = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData: RecentReport[] = [];
        
        reportsSnapshot.forEach(doc => {
          const data = doc.data();
          reportsData.push({
            id: doc.id,
            companyName: data.companyName || 'Unnamed Company',
            createdAt: data.createdAt,
            status: data.status || 'completed'
          });
        });
        
        setRecentReports(reportsData);
        
        // Get user stats
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const totalReportsQuery = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid)
        );
        
        const monthlyReportsQuery = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', firstDayOfMonth.toISOString())
        );
        
        const savedCompaniesQuery = query(
          collection(db, 'savedCompanies'),
          where('userId', '==', user.uid)
        );
        
        const [totalReportsSnapshot, monthlyReportsSnapshot, savedCompaniesSnapshot] = await Promise.all([
          getDocs(totalReportsQuery),
          getDocs(monthlyReportsQuery),
          getDocs(savedCompaniesQuery)
        ]);
        
        setUserStats({
          totalReports: totalReportsSnapshot.size,
          reportsThisMonth: monthlyReportsSnapshot.size,
          savedCompanies: savedCompaniesSnapshot.size
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  const renderRecentReportsList = () => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 py-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ));
    }
    
    if (recentReports.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You haven't generated any reports yet</p>
          <Button asChild>
            <Link to="/due-diligence">Create Your First Report</Link>
          </Button>
        </div>
      );
    }
    
    return recentReports.map(report => (
      <div key={report.id} className="flex items-center justify-between py-3 border-b last:border-0">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{report.companyName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/reports/${report.id}`}>View</Link>
        </Button>
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || 'User'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link to="/due-diligence">
                New Due Diligence Report
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/mcp-report">
                MCP Report
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Trial Banner */}
        {hasTrial && trialDaysLeft !== null && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Your free trial</h3>
                    <p className="text-muted-foreground">
                      {trialDaysLeft > 0 
                        ? `${trialDaysLeft} days remaining in your trial` 
                        : 'Your trial has expired'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full md:w-48">
                    <Progress value={(7 - trialDaysLeft) * 100 / 7} className="h-2" />
                  </div>
                  <Button asChild>
                    <Link to="/pricing">Upgrade Now</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-24" />
              ) : (
                <div className="text-3xl font-bold">{userStats.totalReports}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Reports This Month</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-24" />
              ) : (
                <div className="text-3xl font-bold">{userStats.reportsThisMonth}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Saved Companies</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-24" />
              ) : (
                <div className="text-3xl font-bold">{userStats.savedCompanies}</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Reports */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Your recently generated due diligence reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {renderRecentReportsList()}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/reports">
                    View All Reports
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Links */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>
                  Frequently used features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/due-diligence">
                    <FileText className="mr-2 h-4 w-4" />
                    New Due Diligence Report
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/blog-generator">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Blog Post
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/companies">
                    <BarChart className="mr-2 h-4 w-4" />
                    Company Database
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/reports">
                    <Clock className="mr-2 h-4 w-4" />
                    Report History
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 