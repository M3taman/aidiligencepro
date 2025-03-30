import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DueDiligenceReport } from '../DueDiligenceReport';
import { BrowserRouter } from 'react-router-dom';

// Mock the SimpleReportDisplay component
vi.mock('../SimpleReportDisplay', () => ({
  default: ({ report }: any) => (
    <div data-testid="mock-simple-report">
      <div data-testid="report-company-name">{report.companyName}</div>
    </div>
  ),
}));

// Mock the mockApi functions
vi.mock('../mockApi', () => ({
  generateDueDiligenceReport: vi.fn().mockResolvedValue({
    companyName: 'Test Company',
    executiveSummary: {
      overview: 'Test overview',
      keyFindings: ['Finding 1', 'Finding 2'],
      riskRating: 'Medium',
      recommendation: 'Test recommendation'
    },
    financialAnalysis: {
      metrics: { revenue: '100M' },
      trends: ['Trend 1'],
      strengths: ['Strength 1'],
      weaknesses: ['Weakness 1']
    },
    marketAnalysis: {
      position: 'Strong',
      competitors: ['Competitor 1'],
      marketShare: '25%',
      swot: {
        strengths: ['S1'],
        weaknesses: ['W1'],
        opportunities: ['O1'],
        threats: ['T1']
      }
    },
    riskAssessment: {
      financial: ['F1'],
      operational: ['O1'],
      market: ['M1'],
      regulatory: ['R1'],
      esg: ['E1']
    },
    recentDevelopments: {
      news: [],
      filings: [],
      management: [],
      strategic: []
    }
  }),
}));

// Mock the auth context
vi.mock('@/components/auth/authContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user-id' },
    isAdmin: false,
  }),
}));

describe('DueDiligenceReport', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <DueDiligenceReport 
          preloadedReport={null}
          isLoading={true}
          error={null}
          onGenerateReport={(company) => console.log(`Generate report for ${company}`)}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Generating report/i)).toBeInTheDocument();
  });
});
