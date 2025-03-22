import { DueDiligenceReportType } from '../types';
import { 
  MCPContext, 
  createDefaultMCPContext, 
  createMCPPrompt, 
  processMCPResponse,
  formatMCPContextForAPI
} from '../utils/modelContextProtocol';

/**
 * Service for generating due diligence reports using the Model Context Protocol
 */
export class MCPReportService {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_APIKEY || '';
  }
  
  /**
   * Generate a due diligence report for a company using MCP
   */
  async generateReport(
    companyName: string,
    userId?: string,
    options?: {
      analysisDepth?: 'basic' | 'standard' | 'comprehensive';
      focusAreas?: Array<'financial' | 'market' | 'risk' | 'strategic' | 'esg'>;
      reportFormat?: 'detailed' | 'summary';
      includeCharts?: boolean;
      includeTables?: boolean;
    }
  ): Promise<DueDiligenceReportType> {
    try {
      // Create MCP context
      const context = this.createContext(companyName, userId, options);
      
      // Generate prompt using MCP
      const prompt = createMCPPrompt(context);
      
      // Call AI API with MCP prompt
      const aiResponse = await this.callAIAPI(prompt, context);
      
      // Process response using MCP
      const report = processMCPResponse(aiResponse, context);
      
      return report;
    } catch (error) {
      console.error('Error generating report with MCP:', error);
      throw new Error('Failed to generate report');
    }
  }
  
  /**
   * Create MCP context for report generation
   */
  private createContext(
    companyName: string,
    userId?: string,
    options?: {
      analysisDepth?: 'basic' | 'standard' | 'comprehensive';
      focusAreas?: Array<'financial' | 'market' | 'risk' | 'strategic' | 'esg'>;
      reportFormat?: 'detailed' | 'summary';
      includeCharts?: boolean;
      includeTables?: boolean;
    }
  ): MCPContext {
    // Create default context
    const context = createDefaultMCPContext(companyName, userId);
    
    // Update with options if provided
    if (options) {
      if (options.analysisDepth) {
        context.parameters.analysisDepth = options.analysisDepth;
      }
      
      if (options.focusAreas) {
        context.parameters.focusAreas = options.focusAreas;
      }
      
      if (options.reportFormat || options.includeCharts !== undefined || options.includeTables !== undefined) {
        context.user.preferences = {
          reportFormat: options.reportFormat || 'detailed',
          includeCharts: options.includeCharts !== undefined ? options.includeCharts : true,
          includeTables: options.includeTables !== undefined ? options.includeTables : true,
        };
      }
    }
    
    return context;
  }
  
  /**
   * Call AI API with MCP prompt
   */
  private async callAIAPI(prompt: string, context: MCPContext): Promise<any> {
    try {
      // Check if we're using the Gemini API
      if (this.apiUrl.includes('generativelanguage.googleapis.com')) {
        return this.callGeminiAPI(prompt, context);
      }
      
      // Default implementation for custom API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          context: formatMCPContextForAPI(context),
          max_tokens: 4000,
          temperature: 0.2,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.result || data;
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error('Failed to call AI API');
    }
  }
  
  /**
   * Call Gemini API with MCP prompt
   */
  private async callGeminiAPI(prompt: string, context: MCPContext): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4000
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response text from Gemini API
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }
      
      // Try to parse JSON from the response text
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // If parsing fails, return the raw text
        return { rawResponse: responseText };
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to call Gemini API');
    }
  }
  
  /**
   * Get available data sources for a company
   */
  async getAvailableDataSources(companyName: string): Promise<Record<string, string[]>> {
    // This would typically check which data sources are available for the company
    // For now, we'll return a default set
    return {
      financial: ['Financial Modeling Prep API', 'Alpha Vantage API'],
      news: ['News API'],
      filings: ['SEC Edgar Database'],
      market: ['Market Data API'],
    };
  }
  
  /**
   * Get competitor companies for comparison
   */
  async getCompetitors(companyName: string, sector?: string, industry?: string): Promise<string[]> {
    // This would typically fetch competitors from an API
    // For now, we'll return a default set based on well-known companies
    const defaultCompetitors = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    
    // Industry-specific competitors
    const industryCompetitors: Record<string, string[]> = {
      'Technology': ['AAPL', 'MSFT', 'GOOGL', 'IBM', 'ORCL'],
      'Retail': ['AMZN', 'WMT', 'TGT', 'COST', 'HD'],
      'Automotive': ['TSLA', 'F', 'GM', 'TM', 'VWAGY'],
      'Financial': ['JPM', 'BAC', 'WFC', 'C', 'GS'],
      'Healthcare': ['JNJ', 'PFE', 'MRK', 'ABBV', 'UNH']
    };
    
    if (industry && industryCompetitors[industry]) {
      return industryCompetitors[industry];
    }
    
    return defaultCompetitors;
  }
} 