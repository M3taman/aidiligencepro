import { DueDiligenceReportType } from '../types';

/**
 * Format a due diligence report into a readable text format
 */
export const formatReport = (report: DueDiligenceReportType): string => {
  if (!report) return '';
  
  const sections: string[] = [];
  
  // Company name and timestamp
  sections.push(`# ${report.companyName} Due Diligence Report`);
  sections.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  sections.push('');
  
  // Executive Summary
  sections.push('## Executive Summary');
  sections.push(report.executiveSummary.overview);
  sections.push('');
  
  // Key Findings
  sections.push('### Key Findings');
  report.executiveSummary.keyFindings.forEach(finding => {
    sections.push(`- ${finding}`);
  });
  sections.push('');
  
  // Risk Rating and Recommendation
  sections.push(`### Risk Rating: ${report.executiveSummary.riskRating}`);
  sections.push(report.executiveSummary.recommendation);
  sections.push('');
  
  // Financial Analysis
  sections.push('## Financial Analysis');
  
  // Financial Metrics
  sections.push('### Key Metrics');
  Object.entries(report.financialAnalysis.metrics).forEach(([key, value]) => {
    sections.push(`- ${key}: ${value}`);
  });
  sections.push('');
  
  // Financial Trends
  sections.push('### Trends');
  report.financialAnalysis.trends.forEach(trend => {
    sections.push(`- ${trend}`);
  });
  sections.push('');
  
  // Financial Strengths and Weaknesses
  sections.push('### Financial Strengths');
  report.financialAnalysis.strengths.forEach(strength => {
    sections.push(`- ${strength}`);
  });
  sections.push('');
  
  sections.push('### Financial Weaknesses');
  report.financialAnalysis.weaknesses.forEach(weakness => {
    sections.push(`- ${weakness}`);
  });
  sections.push('');
  
  // Market Analysis
  sections.push('## Market Analysis');
  sections.push(report.marketAnalysis.position);
  sections.push('');
  
  // Competitors
  sections.push('### Competitors');
  report.marketAnalysis.competitors.forEach(competitor => {
    sections.push(`- ${competitor}`);
  });
  sections.push('');
  
  // Market Share
  sections.push(`### Market Share: ${report.marketAnalysis.marketShare}`);
  sections.push('');
  
  // SWOT Analysis
  sections.push('### SWOT Analysis');
  
  sections.push('#### Strengths');
  report.marketAnalysis.swot.strengths.forEach(strength => {
    sections.push(`- ${strength}`);
  });
  sections.push('');
  
  sections.push('#### Weaknesses');
  report.marketAnalysis.swot.weaknesses.forEach(weakness => {
    sections.push(`- ${weakness}`);
  });
  sections.push('');
  
  sections.push('#### Opportunities');
  report.marketAnalysis.swot.opportunities.forEach(opportunity => {
    sections.push(`- ${opportunity}`);
  });
  sections.push('');
  
  sections.push('#### Threats');
  report.marketAnalysis.swot.threats.forEach(threat => {
    sections.push(`- ${threat}`);
  });
  sections.push('');
  
  // Risk Assessment
  sections.push('## Risk Assessment');
  
  sections.push('### Financial Risks');
  report.riskAssessment.financial.forEach(risk => {
    sections.push(`- ${risk}`);
  });
  sections.push('');
  
  sections.push('### Operational Risks');
  report.riskAssessment.operational.forEach(risk => {
    sections.push(`- ${risk}`);
  });
  sections.push('');
  
  sections.push('### Market Risks');
  report.riskAssessment.market.forEach(risk => {
    sections.push(`- ${risk}`);
  });
  sections.push('');
  
  sections.push('### Regulatory Risks');
  report.riskAssessment.regulatory.forEach(risk => {
    sections.push(`- ${risk}`);
  });
  sections.push('');
  
  sections.push('### ESG Risks');
  report.riskAssessment.esg.forEach(risk => {
    sections.push(`- ${risk}`);
  });
  sections.push('');
  
  // Recent Developments
  sections.push('## Recent Developments');
  
  // News
  sections.push('### Recent News');
  report.recentDevelopments.news.forEach(news => {
    sections.push(`- ${news.title} (${new Date(news.date).toLocaleDateString()} - ${news.source.name})`);
  });
  sections.push('');
  
  // Filings
  sections.push('### Recent Filings');
  report.recentDevelopments.filings.forEach(filing => {
    sections.push(`- ${filing.type}: ${filing.description} (${new Date(filing.date).toLocaleDateString()})`);
  });
  sections.push('');
  
  // Management
  sections.push('### Management');
  report.recentDevelopments.management.forEach(item => {
    sections.push(`- ${item}`);
  });
  sections.push('');
  
  // Strategic
  sections.push('### Strategic Initiatives');
  report.recentDevelopments.strategic.forEach(item => {
    sections.push(`- ${item}`);
  });
  
  // Register the formatter with the window object for global access
  if (typeof window !== 'undefined') {
    window.formatReport = formatReport;
  }
  
  return sections.join('\n');
};

// Add a function to format the report for PDF
export const formatReportForPDF = (report: DueDiligenceReportType): string => {
  // Similar to formatReport but with PDF-specific formatting
  return formatReport(report);
};
