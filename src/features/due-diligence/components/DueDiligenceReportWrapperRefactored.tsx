import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DueDiligenceReport as DueDiligenceReportType } from '../types';
import DueDiligenceReport from './DueDiligenceReportRefactored';
import { mockDueDiligenceReport } from '../mock-data/mockDueDiligenceReport';

/**
 * Wrapper component for the Due Diligence Report that handles data fetching
 */
const DueDiligenceReportWrapper: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [report, setReport] = useState<DueDiligenceReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // For development, use the mock data
        if (import.meta.env.DEV) {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          setReport(mockDueDiligenceReport);
          setLoading(false);
          return;
        }

        // For production, make the actual API call
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.aidiligencepro.com';
        const response = await fetch(`${apiUrl}/api/due-diligence/reports/${companyId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`);
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching due diligence report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Report</h2>
        <p className="text-red-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Report Available</h2>
        <p className="text-yellow-700">We couldn't find a due diligence report for the requested company.</p>
      </div>
    );
  }

  return <DueDiligenceReport report={report} />;
};

export default DueDiligenceReportWrapper; 