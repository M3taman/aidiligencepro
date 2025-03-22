import { DueDiligenceReportType, ReportGenerationOptions } from "../types";
import { formatReport, validateReport } from "../utils/reportFormatter";
import { generateMockDueDiligenceReport } from "../mockApi";

/**
 * Class for handling due diligence report generation and API calls
 */
export class ReportService {
  private apiUrl = 'https://generateduediligence-toafsgw4rq-uc.a.run.app/generateDueDiligence';
  
  /**
   * Generate a due diligence report for a company
   * @param companyName The name of the company to generate a report for
   * @param options Report generation options
   * @param userToken Authentication token (optional)
   * @param useMock Whether to use mock data (for dev/demo purposes)
   */
  async generateReport(
    companyName: string, 
    options: ReportGenerationOptions,
    userToken?: string,
    useMock: boolean = false
  ): Promise<{ report: DueDiligenceReportType | null; reportText: string }> {
    // For mock data (development or demo mode)
    if (useMock || process.env.NODE_ENV === 'development') {
      console.log("Using mock data for report generation");
      const mockReport = await generateMockDueDiligenceReport(companyName);
      return {
        report: mockReport,
        reportText: formatReport(mockReport)
      };
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if provided
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    
    // Make API call
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        companyName,
        options
      }),
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    console.log('API response:', data);
    
    // Validate response structure
    if (!data || !data.data) {
      throw new Error('Invalid response format: No data returned');
    }
    
    // Handle both string and object responses
    if (typeof data.data === 'string') {
      // It's a string response
      try {
        // Try to parse as JSON if it looks like JSON
        if (data.data.trim().startsWith('{') && data.data.trim().endsWith('}')) {
          const parsedData = JSON.parse(data.data);
          if (validateReport(parsedData)) {
            return {
              report: parsedData,
              reportText: formatReport(parsedData)
            };
          }
        }
      } catch (e) {
        // Not valid JSON, use as plain text
        console.log('Response is plain text, not JSON');
      }
      
      // Return as plain text
      return {
        report: null,
        reportText: data.data
      };
    } else {
      // It's already an object
      if (!validateReport(data.data)) {
        throw new Error('Invalid report structure received from API');
      }
      
      return {
        report: data.data,
        reportText: formatReport(data.data)
      };
    }
  }
} 