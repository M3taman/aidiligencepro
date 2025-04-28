import { CompetitiveAnalysisData, CompetitiveAnalysisProps } from './types';
import { APIError } from '@/lib/api';

const COMPETITIVE_INTEL_ENDPOINT = process.env.NODE_ENV === 'production'
  ? 'https://competitive-intel-toafsgw4rq-uc.a.run.app'
  : 'http://localhost:5001/ai-diligence/us-central1/apiProxy/competitive-intel';

export async function fetchCompetitiveAnalysis(
  params: CompetitiveAnalysisProps
): Promise<CompetitiveAnalysisData> {
  try {
    const response = await fetch(COMPETITIVE_INTEL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.message || 'Failed to fetch competitive intelligence',
        response.status,
        error.details
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching competitive analysis:', error);
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to fetch competitive analysis');
  }
}
