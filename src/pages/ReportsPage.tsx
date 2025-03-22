import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/components/auth/authContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { 
  Search, 
  FileText, 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye, 
  FileDown, 
  Calendar, 
  Filter, 
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  companyName: string;
  createdAt: Timestamp | string;
  status: 'completed' | 'processing' | 'failed';
  industry?: string;
  score?: number;
}

const ReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      try {
        const reportsQuery = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(reportsQuery);
        const reportsData: Report[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          reportsData.push({
            id: doc.id,
            companyName: data.companyName || 'Unnamed Company',
            createdAt: data.createdAt,
            status: data.status || 'completed',
            industry: data.industry || 'Not specified',
            score: data.score
          });
        });
        
        setReports(reportsData);
        setFilteredReports(reportsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [user]);

  useEffect(() => {
    // Apply filters and search
    let result = [...reports];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(report => 
        report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(report => report.status === statusFilter);
    }
    
    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let filterDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      result = result.filter(report => {
        const reportDate = report.createdAt instanceof Timestamp 
          ? report.createdAt.toDate() 
          : new Date(report.createdAt as string);
        return reportDate >= filterDate;
      });
    }
    
    // Sorting
    result.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp 
        ? a.createdAt.toDate() 
        : new Date(a.createdAt as string);
      const dateB = b.createdAt instanceof Timestamp 
        ? b.createdAt.toDate() 
        : new Date(b.createdAt as string);
      
      if (sortBy === 'newest') {
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'oldest') {
        return dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'name-asc') {
        return a.companyName.localeCompare(b.companyName);
      } else if (sortBy === 'name-desc') {
        return b.companyName.localeCompare(a.companyName);
      } else if (sortBy === 'score-high' && a.score !== undefined && b.score !== undefined) {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === 'score-low' && a.score !== undefined && b.score !== undefined) {
        return (a.score || 0) - (b.score || 0);
      }
      return 0;
    });
    
    setFilteredReports(result);
  }, [reports, searchTerm, statusFilter, timeFilter, sortBy]);

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'reports', reportToDelete));
      
      setReports(prev => prev.filter(report => report.id !== reportToDelete));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } finally {
      setReportToDelete(null);
    }
  };

  const handleExportCSV = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    // In a real app, this would fetch the full report data
    // For now, we'll create a simple CSV with the data we have
    const csvContent = [
      ['Company Name', 'Industry', 'Created Date', 'Status', 'Score'].join(','),
      [
        report.companyName,
        report.industry || 'Not specified',
        report.createdAt instanceof Timestamp 
          ? format(report.createdAt.toDate(), 'yyyy-MM-dd') 
          : format(new Date(report.createdAt as string), 'yyyy-MM-dd'),
        report.status,
        report.score || 'N/A'
      ].join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.companyName.replace(/\s+/g, '_')}_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = (reportId: string) => {
    // In a real app, this would generate a PDF
    // For now, we'll just show a toast
    toast.info('PDF export functionality will be implemented with a PDF generation library');
  };

  const formatDate = (date: Timestamp | string) => {
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'MMM d, yyyy');
    }
    return format(new Date(date), 'MMM d, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Reports | AI Diligence Pro</title>
        <meta name="description" content="View and manage your due diligence reports" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              View and manage your due diligence reports
            </p>
          </div>
          <Button onClick={() => navigate('/due-diligence')}>
            New Report
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company name or industry..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="w-full sm:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="score-high">Score (High-Low)</SelectItem>
                      <SelectItem value="score-low">Score (Low-High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reports found</h3>
                <p className="text-muted-foreground mb-6">
                  {reports.length === 0 
                    ? "You haven't created any reports yet." 
                    : "No reports match your current filters."}
                </p>
                {reports.length === 0 && (
                  <Button onClick={() => navigate('/due-diligence')}>
                    Create Your First Report
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.companyName}</TableCell>
                        <TableCell>{report.industry || 'Not specified'}</TableCell>
                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{report.score !== undefined ? report.score : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/reports/${report.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportCSV(report.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportPDF(report.id)}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => setReportToDelete(report.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report
              and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportsPage; 