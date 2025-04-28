import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DueDiligenceReport } from '../DueDiligenceReport';
import { BrowserRouter } from 'react-router-dom';

// Mock the SimpleReportDisplay component
vi.mock('../SimpleReportDisplay', () => ({
  default: () => <div data-testid="mock-simple-report">Mock Simple Report Display</div>,
}));

const mockReport = {
  companyName: 'Test Company',
  companyData: {},
  executiveSummary: { overview: 'Overview', keyFindings: [], riskRating: 'Medium', recommendation: 'Rec' },
  financialAnalysis: { overview: 'FA', metrics: {}, trends: [], strengths: [], weaknesses: [] },
  marketAnalysis: { overview: 'MA', position: 'Strong', competitors: [], marketShare: '25%', swot: {} },
  riskAssessment: { overview: 'RA', riskFactors: {}, riskRating: 'medium' },
  recentDevelopments: {},
};

describe('DueDiligenceReport', () => {
  it('renders loading state when isLoading is true', () => {
    render(
      <BrowserRouter>
        <DueDiligenceReport isLoading={true} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Generating/i)).toBeInTheDocument();
  });

  it('renders error message when error prop is set', () => {
    render(
      <BrowserRouter>
        <DueDiligenceReport error="Failed to generate report" />
      </BrowserRouter>
    );
    expect(screen.getByText(/Failed to generate report/i)).toBeInTheDocument();
  });

  it('renders report when preloadedReport is provided', () => {
    render(
      <BrowserRouter>
        <DueDiligenceReport preloadedReport={mockReport} />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /Due Diligence Report: Test Company/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-simple-report')).toBeInTheDocument();
  });

  it('calls onGenerateReport with company name', () => {
    const onGenerateReportMock = vi.fn();
    render(
      <BrowserRouter>
        <DueDiligenceReport onGenerateReport={onGenerateReportMock} />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/Company Name/i);
    const button = screen.getByRole('button', { name: /Generate/i });

    fireEvent.change(input, { target: { value: 'Test Company' } });
    fireEvent.click(button);

    expect(onGenerateReportMock).toHaveBeenCalledWith('Test Company');
  });
});
