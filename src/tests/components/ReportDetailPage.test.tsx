import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportDetailPage from '@/pages/ReportDetailPage';
import { useAuth } from '@/components/auth/authContext';
import { getDoc } from 'firebase/firestore';
// Import toast to check calls
import { toast } from 'sonner';

// Mock the auth context
vi.mock('@/components/auth/authContext', () => ({
  useAuth: vi.fn(),
}));

// REMOVED local firebase/firestore mock - will rely on global setup

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
  // Clear mocks after each test to prevent leakage
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Mock auth context
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'test-user-id' },
    } as any);

    // Default mock for getDoc for most tests in this suite
    // Use mockImplementation to potentially check the docRef if needed
    vi.mocked(getDoc).mockImplementation(async (docRef: any) => {
      // Basic check to ensure it's the expected path from useParams mock
      if (docRef && docRef.path === 'reports/test-report-id') {
        // Cast the resolved value to 'any' to bypass strict type checking on 'exists'
        return Promise.resolve({
          id: docRef.id,
          exists: () => true,
          data: () => ({ ...mockReport, userId: 'test-user-id' }),
          metadata: { hasPendingWrites: false, fromCache: false, isEqual: vi.fn() },
          get: vi.fn(),
          ref: { path: docRef.path },
        } as any);
      }
      // Fallback for unexpected calls
      return Promise.resolve({
        id: 'fallback-id',
        exists: () => false,
        data: () => undefined,
        metadata: { hasPendingWrites: false, fromCache: false, isEqual: vi.fn() },
        get: vi.fn(),
        ref: { path: 'fallback/path' },
       } as any); // Cast fallback as well
    });
  });

  it('renders loading state initially', () => {
    // No need to mock getDoc here, beforeEach handles the default case
    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );
    // Check for the loading spinner SVG element directly
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(); // Assuming you add data-testid="loading-spinner" to the Loader2 component in ReportDetailPage.tsx
  });

  it('renders report details after loading', async () => {
    // No need to mock getDoc here, beforeEach handles the default case
    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await act(async () => {
      // Advance timers to trigger async operations
      vi.runAllTimers();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    // Now query for the content
    await act(async () => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText(/85%/)).toBeInTheDocument();
    });
  });

  it('shows error toast when report is not found', async () => {
    // Override getDoc specifically for this test
    vi.mocked(getDoc).mockImplementation(async (docRef: any) => {
       // Cast the resolved value to 'any'
       return Promise.resolve({
         id: docRef?.id || 'test-report-id',
         exists: () => false,
         data: () => undefined,
         metadata: { hasPendingWrites: false, fromCache: false, isEqual: vi.fn() },
         get: vi.fn(),
         ref: { path: docRef?.path || 'reports/test-report-id' },
       } as any);
    });

    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await act(async () => {
      // Advance timers to trigger async operations
      vi.runAllTimers();

      // Wait for loading to finish and check toast
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
      expect(toast.error).toHaveBeenCalledWith('Report not found');
    });
    // Optional: Check if navigate was called
    // const navigate = require('react-router-dom').useNavigate(); // Get mock navigate
    // expect(navigate).toHaveBeenCalledWith('/reports');
  });

  it('shows error toast when user does not have permission', async () => {
    // Override getDoc specifically for this test
    vi.mocked(getDoc).mockImplementation(async (docRef: any) => {
      // Cast the resolved value to 'any'
      return Promise.resolve({
        id: docRef?.id || 'test-report-id',
        exists: () => true,
        data: () => ({ ...mockReport, userId: 'different-user-id' }),
        metadata: { hasPendingWrites: false, fromCache: false, isEqual: vi.fn() },
        get: vi.fn(),
        ref: { path: docRef?.path || 'reports/test-report-id' },
      } as any);
    });

    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await act(async () => {
      // Advance timers to trigger async operations
      vi.runAllTimers();

      // Wait for loading to finish and check toast
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
      expect(toast.error).toHaveBeenCalledWith('You do not have permission to view this report');
    });
    // Optional: Check if navigate was called
    // const navigate = require('react-router-dom').useNavigate(); // Get mock navigate
    // expect(navigate).toHaveBeenCalledWith('/reports');
  });

  it('renders all report sections', async () => {
    // No need to mock getDoc here, beforeEach handles the default case
    render(
      <BrowserRouter>
        <ReportDetailPage />
      </BrowserRouter>
    );

    await act(async () => {
      // Advance timers to trigger async operations
      vi.runAllTimers();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    // Now query for the content using getBy* since loading should be done
    await act(async () => {
      // Check for section headers
      expect(screen.getByText('Financial Analysis')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Market Analysis')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();

      // Check for financial metrics
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText(/15%/)).toBeInTheDocument();
      expect(screen.getByText(/25%/)).toBeInTheDocument();
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
