import { useState, useEffect } from 'react';
import { CompetitiveAnalysisData, CompetitiveAnalysisProps } from '../types';
import { fetchCompetitiveAnalysis } from '../api';

export function useCompetitiveIntelligence({
  companyId,
  timeRange,
  peerGroup
}: CompetitiveAnalysisProps) {
  const [data, setData] = useState<CompetitiveAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchCompetitiveAnalysis({
          companyId,
          timeRange,
          peerGroup
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId, timeRange, peerGroup]);

  return { data, loading, error };
}
