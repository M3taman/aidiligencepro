import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportDetailPage from '@/pages/ReportDetailPage';
import { useAuth } from '@/components/auth/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Mock the auth context
vi.mock('@/components/auth/authContext', () => ({
  useAuth: vi.fn(),
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

const mockReport = {
  id: 'test-report-id',
  companyName: 'Test Company',
  createdAt: { toDate: () => new Date('2024-01-01') },
  status: 'completed',
  industry: 'Technology',
  score: 85,
  financialMetrics: {
    revenue: 1000000,
    growth: 15,
    profitMargin: 25,
    cashFlow: 500000,
  },
  risks: {
    financial: ['High debt ratio'],
    operational: ['Limited scalability'],
  },
  recommendations: {
    shortTerm: ['Optimize cash flow'],
    longTerm: ['Expand market presence'],
  },
  marketAnalysis: {
    competitors: ['Competitor 1', 'Competitor 2'],
    marketSize: '$10B',
    trends: ['AI adoption', 'Remote work'],
  },
};

describe('ReportDetailPage', () => {
  beforeEach(() => {
    // Mock auth context
    (useAuth as any).mockReturnValue({
      user: { uid: 'test-user-id' },
    });

    // Mock Firebase getDoc
    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ ...mockReport, userId: 'test-user-id' }),
    });
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders report details after loading', async () => {
    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  it('shows error toast when report is not found', async () => {
    (getDoc as any).mockResolvedValue({
      exists: () => false,
    });

    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Report not found')).toBeInTheDocument();
    });
  });

  it('shows error toast when user does not have permission', async () => {
    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ ...mockReport, userId: 'different-user-id' }),
    });

    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('You do not have permission to view this report')).toBeInTheDocument();
    });
  });

  it('renders all report sections', async () => {
    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for section headers
      expect(screen.getByText('Financial Analysis')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Market Analysis')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();

      // Check for financial metrics
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();

      // Check for risks
      expect(screen.getByText('High debt ratio')).toBeInTheDocument();
      expect(screen.getByText('Limited scalability')).toBeInTheDocument();

      // Check for recommendations
      expect(screen.getByText('Optimize cash flow')).toBeInTheDocument();
      expect(screen.getByText('Expand market presence')).toBeInTheDocument();

      // Check for market analysis
      expect(screen.getByText('$10B')).toBeInTheDocument();
      expect(screen.getByText('AI adoption')).toBeInTheDocument();
      expect(screen.getByText('Remote work')).toBeInTheDocument();
    });
  });
}); 