import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/authContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Helmet } from 'react-helmet-async';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  FileText, 
  Search, 
  Download, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Report {
  id: string;
  companyName: string;
  createdAt: Date;
  status: 'completed' | 'processing' | 'failed';
  industry?: string;
  score?: number;
  lastUpdated?: Date;
}

const ReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reportsPerPage = 10;
  
  // Filtering and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const reportsQuery = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(reportsQuery);
        const fetchedReports: Report[] = [];
        
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fetchedReports.push({
            id: doc.id,
            companyName: data.companyName || 'Unnamed Company',
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate() 
              : new Date(data.createdAt),
            status: data.status || 'completed',
            industry: data.industry || 'Not specified',
            score: data.score || 0,
            lastUpdated: data.lastUpdated 
              ? data.lastUpdated instanceof Timestamp 
                ? data.lastUpdated.toDate() 
                : new Date(data.lastUpdated)
              : undefined
          });
        });
        
        setReports(fetchedReports);
        setFilteredReports(fetchedReports);
        setTotalPages(Math.ceil(fetchedReports.length / reportsPerPage));
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [user]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...reports];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(report => 
        report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(report => report.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          result = result.filter(report => report.createdAt >= today);
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          result = result.filter(report => report.createdAt >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          result = result.filter(report => report.createdAt >= monthAgo);
          break;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          result = result.filter(report => report.createdAt >= yearAgo);
          break;
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'companyName':
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'industry':
          comparison = (a.industry || '').localeCompare(b.industry || '');
          break;
        case 'score':
          comparison = (a.score || 0) - (b.score || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredReports(result);
    setTotalPages(Math.ceil(result.length / reportsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [reports, searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  // Get current page reports
  const getCurrentPageReports = () => {
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    return filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  };

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
      </PaginationItem>
    );
    
    // First page
    items.push(
      <PaginationItem key="1">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Ellipsis and middle pages
    if (totalPages > 5) {
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Pages around current
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    } else {
      // Show all pages for small total
      for (let i = 2; i < totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Last page (if more than 1 page)
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </PaginationItem>
    );
    
    return items;
  };

  return (
    <>
      <Helmet>
        <title>Reports | AI Diligence Pro</title>
        <meta name="description" content="View and manage your due diligence reports" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold">Reports</h1>
              <p className="text-muted-foreground">
                View and manage your due diligence reports
              </p>
            </div>
            <Button asChild>
              <Link to="/due-diligence">
                <FileText className="mr-2 h-4 w-4" />
                New Report
              </Link>
            </Button>
          </div>
          
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies or industries..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={`${sortField}-${sortDirection}`}
                    onValueChange={(value) => {
                      const [field, direction] = value.split('-');
                      setSortField(field);
                      setSortDirection(direction as 'asc' | 'desc');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="companyName-asc">Company Name (A-Z)</SelectItem>
                      <SelectItem value="companyName-desc">Company Name (Z-A)</SelectItem>
                      <SelectItem value="score-desc">Highest Score</SelectItem>
                      <SelectItem value="score-asc">Lowest Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Reports</CardTitle>
              <CardDescription>
                {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reports found</h3>
                  <p className="text-muted-foreground mb-6">
                    {reports.length === 0 
                      ? "You haven't created any reports yet." 
                      : "No reports match your current filters."}
                  </p>
                  {reports.length === 0 ? (
                    <Button asChild>
                      <Link to="/due-diligence">Create Your First Report</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter('all');
                    }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">
                            <button 
                              className="flex items-center space-x-1 hover:text-primary"
                              onClick={() => handleSort('companyName')}
                            >
                              <span>Company</span>
                              {sortField === 'companyName' && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center space-x-1 hover:text-primary"
                              onClick={() => handleSort('industry')}
                            >
                              <span>Industry</span>
                              {sortField === 'industry' && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center space-x-1 hover:text-primary"
                              onClick={() => handleSort('createdAt')}
                            >
                              <span>Date</span>
                              {sortField === 'createdAt' && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center space-x-1 hover:text-primary"
                              onClick={() => handleSort('status')}
                            >
                              <span>Status</span>
                              {sortField === 'status' && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center space-x-1 hover:text-primary"
                              onClick={() => handleSort('score')}
                            >
                              <span>Score</span>
                              {sortField === 'score' && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentPageReports().map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              {report.companyName}
                            </TableCell>
                            <TableCell>{report.industry}</TableCell>
                            <TableCell>
                              {report.createdAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {renderStatusBadge(report.status)}
                            </TableCell>
                            <TableCell>
                              {report.score !== undefined ? (
                                <span className={`font-medium ${
                                  report.score >= 70 ? 'text-green-600' : 
                                  report.score >= 40 ? 'text-amber-600' : 
                                  'text-red-600'
                                }`}>
                                  {report.score}/100
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/reports/${report.id}`}>
                                    View
                                  </Link>
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          {renderPaginationItems()}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ReportsPage; 