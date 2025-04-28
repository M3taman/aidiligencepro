import { DueDiligenceReportType } from '../due-diligence/types';

// Type predicates for DueDiligenceReportType properties
function isDetailedExecutiveSummary(
  summary: string | { overview: string }
): summary is { overview: string } {
  return typeof summary === 'object' && 'overview' in summary;
}

function isDetailedRiskAssessment(
  assessment: string | { riskFactors: Record<string, string[]> }
): assessment is { riskFactors: Record<string, string[]> } {
  return typeof assessment === 'object' && 'riskFactors' in assessment;
}

function isDetailedFinancialAnalysis(
  analysis: string | { metrics: Record<string, any> }
): analysis is { metrics: Record<string, any> } {
  return typeof analysis === 'object' && 'metrics' in analysis;
}

export async function generateRule206Checklist(analysis: DueDiligenceReportType): Promise<string[]> {
  const checklist: string[] = [];
  
  // 1. Disclosure Requirements
  const requiredDisclosures = [
    'Fee structure and compensation',
    'Potential conflicts of interest',
    'Investment strategy and risks',
    'Performance reporting methodology'
  ];
  
  if (isDetailedExecutiveSummary(analysis.executiveSummary)) {
    requiredDisclosures.forEach(disclosure => {
      if (!analysis.executiveSummary.overview.includes(disclosure)) {
        checklist.push(`Disclose: ${disclosure}`);
      }
    });
  }

  // 2. Risk Management
  if (isDetailedRiskAssessment(analysis.riskAssessment)) {
    const requiredRiskCategories = [
      'financial', 'operational', 'market', 'regulatory'
    ];
    
    requiredRiskCategories.forEach(category => {
      if (!analysis.riskAssessment.riskFactors[category] || 
          analysis.riskAssessment.riskFactors[category].length === 0) {
        checklist.push(`Identify ${category} risks`);
      }
    });
  }

  // 3. Financial Reporting
  if (isDetailedFinancialAnalysis(analysis.financialAnalysis)) {
    const requiredMetrics = [
      'revenue', 'ebitda', 'netIncome', 
      'debtToEquity', 'currentRatio'
    ];
    
    requiredMetrics.forEach(metric => {
      if (!analysis.financialAnalysis.metrics[metric]) {
        checklist.push(`Include ${metric} metric`);
      }
    });
  }

  // 4. Historical Comparison
  if (analysis.recentDevelopments?.filings?.length === 0) {
    checklist.push('Compare with at least 3 previous filings');
  }

  // 5. Compliance Documentation
  checklist.push(
    'Document compliance review process',
    'Maintain audit trail of changes',
    'Record decision-making rationale'
  );

  return checklist;
}
