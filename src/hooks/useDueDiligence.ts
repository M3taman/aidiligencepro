import { useState } from 'react';
import { generateDueDiligence } from '@/lib/api';
import { DueDiligenceResponse } from '@/types/due-diligence';
import { APIError } from '@/lib/api';

interface UseDueDiligenceResult {
  report: DueDiligenceResponse | null;
  isLoading: boolean;
  error: APIError | null;
  generateReport: (companyName: string) => Promise<void>;
}

function validateReport(report: any): report is DueDiligenceResponse {
  return (
    report &&
    typeof report === 'object' &&
    typeof report.companyName === 'string' &&
    typeof report.timestamp === 'string' &&
    typeof report.executiveSummary === 'object' &&
    typeof report.financialAnalysis === 'object' &&
    typeof report.marketAnalysis === 'object' &&
    typeof report.riskAssessment === 'object' &&
    typeof report.recentDevelopments === 'object'
  );
}

export function useDueDiligence(): UseDueDiligenceResult {
  const [report, setReport] = useState<DueDiligenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const generateReport = async (companyName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await generateDueDiligence(companyName);
      
      if (!validateReport(response.data)) {
        throw new APIError('Invalid report format received from the server');
      }
      
      setReport(response.data);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof APIError ? err : new APIError('Failed to generate report'));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    report,
    isLoading,
    error,
    generateReport,
  };
} 