import { DueDiligenceResponse } from '@/types/due-diligence';

const API_ENDPOINTS = {
  generateText: 'https://generatetext-toafsgw4rq-uc.a.run.app',
  generateDueDiligence: 'https://generateduediligence-toafsgw4rq-uc.a.run.app',
  aiml: 'https://api.aiml.com/v1/chat/completions' // AIML API endpoint
};

// AIML API key - should be stored in environment variables in production
const AIML_API_KEY = import.meta.env.VITE_AIML_API_KEY || '';

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
    // Use AIML API with GPT-4 Mini
    const response = await fetch(API_ENDPOINTS.aiml, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-mini',
        messages: [
          { role: 'system', content: 'You are an AI assistant specialized in generating high-quality content.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      }),
    });

    const result = await handleResponse<any>(response);
    
    return {
      data: result.choices[0].message.content,
      model: 'gpt-4-mini',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to generate text');
  }
}

export async function generateDueDiligence(companyName: string): Promise<{ data: DueDiligenceResponse }> {
  try {
    // Use AIML API with GPT-4 Mini for due diligence
    const systemPrompt = `You are an expert financial analyst and investment advisor with decades of experience in due diligence. 
    Your task is to create a comprehensive due diligence report for the company provided by the user. 
    The report should include: executive summary, financial analysis, market analysis, risk assessment, and recent developments. 
    Use reliable sources and provide actionable insights that would help an investor make informed decisions. 
    Format your response as a structured JSON object matching the DueDiligenceResponse type.`;
    
    const userPrompt = `Generate a comprehensive due diligence report for ${companyName}. Include all relevant financial metrics, market analysis, risk factors, and recent developments that would be important for an investor.`;
    
    const response = await fetch(API_ENDPOINTS.aiml, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      }),
    });

    const result = await handleResponse<any>(response);
    const reportData = JSON.parse(result.choices[0].message.content);
    
    // Ensure the report matches our expected format
    const formattedReport: DueDiligenceResponse = {
      companyName: companyName,
      timestamp: new Date().toISOString(),
      executiveSummary: reportData.executiveSummary || {
        overview: '',
        keyFindings: [],
        riskRating: 'Medium',
        recommendation: ''
      },
      financialAnalysis: reportData.financialAnalysis || {
        metrics: {},
        trends: [],
        strengths: [],
        weaknesses: []
      },
      marketAnalysis: reportData.marketAnalysis || {
        position: '',
        competitors: [],
        marketShare: '',
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      },
      riskAssessment: reportData.riskAssessment || {
        financial: [],
        operational: [],
        market: [],
        regulatory: [],
        esg: []
      },
      recentDevelopments: reportData.recentDevelopments || {
        news: [],
        filings: [],
        management: [],
        strategic: []
      }
    };

    return { data: formattedReport };
  } catch (error) {
    console.error('Error generating due diligence report:', error);
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to generate due diligence report');
  }
}