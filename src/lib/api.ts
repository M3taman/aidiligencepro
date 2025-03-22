import { DueDiligenceResponse } from '@/types/due-diligence';

const API_ENDPOINTS = {
  generateText: 'https://generatetext-toafsgw4rq-uc.a.run.app',
  generateDueDiligence: 'https://generateduediligence-toafsgw4rq-uc.a.run.app'
};

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      error.message || 'An error occurred',
      response.status,
      error.details
    );
  }

  const data = await response.json();
  
  if (!data || typeof data !== 'object') {
    throw new APIError('Invalid response format from server');
  }

  return data as T;
}

export async function generateText(prompt: string): Promise<{ data: string; model: string; timestamp: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.generateText, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to generate text');
  }
}

export async function generateDueDiligence(companyName: string): Promise<{ data: DueDiligenceResponse }> {
  try {
    const response = await fetch(API_ENDPOINTS.generateDueDiligence, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        companyName,
        options: {
          format: {
            type: 'detailed',
            includeCharts: true,
          }
        }
      }),
    });

    const result = await handleResponse<{ data: DueDiligenceResponse }>(response);

    // Validate the response structure
    if (!result.data || typeof result.data !== 'object') {
      throw new APIError('Invalid report data received from server');
    }

    // Check if the report is empty
    const isEmptyReport = 
      !result.data.executiveSummary?.overview &&
      result.data.executiveSummary?.keyFindings?.length === 0 &&
      Object.keys(result.data.financialAnalysis?.metrics || {}).length === 0 &&
      result.data.financialAnalysis?.trends?.length === 0 &&
      !result.data.marketAnalysis?.position &&
      result.data.marketAnalysis?.competitors?.length === 0 &&
      result.data.marketAnalysis?.swot?.strengths?.length === 0 &&
      result.data.marketAnalysis?.swot?.weaknesses?.length === 0 &&
      result.data.marketAnalysis?.swot?.opportunities?.length === 0 &&
      result.data.marketAnalysis?.swot?.threats?.length === 0 &&
      result.data.riskAssessment?.financial?.length === 0 &&
      result.data.riskAssessment?.operational?.length === 0 &&
      result.data.riskAssessment?.market?.length === 0 &&
      result.data.riskAssessment?.regulatory?.length === 0 &&
      result.data.recentDevelopments?.news?.length === 0 &&
      result.data.recentDevelopments?.filings?.length === 0;

    if (isEmptyReport) {
      throw new APIError('Report generated but no data was returned. Please try again.');
    }

    // Ensure all required fields are present
    const requiredFields = [
      'companyName',
      'timestamp',
      'executiveSummary',
      'financialAnalysis',
      'marketAnalysis',
      'riskAssessment',
      'recentDevelopments'
    ];

    const missingFields = requiredFields.filter(field => !(field in result.data));
    if (missingFields.length > 0) {
      throw new APIError(`Missing required fields in report: ${missingFields.join(', ')}`);
    }

    return result;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to generate due diligence report');
  }
} 