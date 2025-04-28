import { DueDiligenceReportType } from '../due-diligence/types';
import { PDFDocument, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Predefined report templates
const TEMPLATES = {
  STANDARD: {
    sections: [
      'executiveSummary',
      'financialHighlights',
      'riskAssessment',
      'recommendations'
    ],
    styles: {
      font: 'Helvetica',
      primaryColor: '#2563eb',
      secondaryColor: '#6b7280'
    }
  },
  DETAILED: {
    sections: [
      'executiveSummary',
      'financialAnalysis',
      'marketPosition',
      'riskFactors',
      'competitiveLandscape',
      'investmentRecommendation'
    ],
    styles: {
      font: 'Times-Roman',
      primaryColor: '#1e40af',
      secondaryColor: '#4b5563'
    }
  },
  COMPLIANCE: {
    sections: [
      'executiveSummary',
      'riskFactors',
      'regulatoryCompliance',
      'auditFindings',
      'actionItems'
    ],
    styles: {
      font: 'Courier',
      primaryColor: '#065f46',
      secondaryColor: '#4b5563'
    }
  }
};

export async function generateOneClickReport(
  analysis: DueDiligenceReportType,
  format: 'pdf' | 'csv' | 'xlsx' = 'pdf'
): Promise<Blob | string> {
  try {
    switch (format) {
      case 'pdf':
        return await generatePDFReport(analysis, TEMPLATES.STANDARD);
      case 'csv':
        return generateCSVReport(analysis);
      case 'xlsx':
        return generateExcelReport(analysis);
      default:
        throw new Error('Unsupported report format');
    }
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
}

export async function generateCustomizableTemplate(
  analysis: DueDiligenceReportType,
  template: keyof typeof TEMPLATES,
  format: 'pdf' | 'csv' | 'xlsx' = 'pdf'
): Promise<Blob | string> {
  const selectedTemplate = TEMPLATES[template];
  if (!selectedTemplate) {
    throw new Error('Invalid template specified');
  }

  try {
    switch (format) {
      case 'pdf':
        return await generatePDFReport(analysis, selectedTemplate);
      case 'csv':
        return generateCSVReport(analysis);
      case 'xlsx':
        return generateExcelReport(analysis);
      default:
        throw new Error('Unsupported report format');
    }
  } catch (error) {
    console.error('Template report generation failed:', error);
    throw error;
  }
}

async function generatePDFReport(
  analysis: DueDiligenceReportType,
  template: typeof TEMPLATES.STANDARD
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const fontSize = 12;
  const margin = 50;

  // Add title
  page.drawText(`${analysis.companyName} - Due Diligence Report`, {
    x: margin,
    y: height - margin,
    size: 16,
    color: rgb(0, 0, 0),
  });

  // Add content based on template sections
  let yPosition = height - margin - 30;
  
  template.sections.forEach(section => {
    if (section in analysis) {
      const sectionContent = formatSectionContent(analysis, section);
      page.drawText(section.toUpperCase(), {
        x: margin,
        y: yPosition,
        size: 14,
        color: rgb(0.2, 0.4, 0.6),
      });
      yPosition -= 20;

      page.drawText(sectionContent, {
        x: margin,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
        maxWidth: width - 2 * margin,
      });
      yPosition -= (sectionContent.split('\n').length * (fontSize + 2)) + 20;
    }
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

function generateCSVReport(analysis: DueDiligenceReportType): string {
  let csvContent = 'Section,Content\n';
  
  // Add basic company info
  csvContent += `Company Name,${analysis.companyName}\n`;
  
  // Add financial metrics if available
  if (typeof analysis.financialAnalysis === 'object') {
    Object.entries(analysis.financialAnalysis.metrics).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });
  }

  return csvContent;
}

function generateExcelReport(analysis: DueDiligenceReportType): Blob {
  const workbook = XLSX.utils.book_new();
  
  // Create company info sheet
  const companyData = [
    ['Company Name', analysis.companyName],
    ['Report Date', new Date().toISOString().split('T')[0]]
  ];
  const companySheet = XLSX.utils.aoa_to_sheet(companyData);
  XLSX.utils.book_append_sheet(workbook, companySheet, 'Company Info');

  // Create financial data sheet if available
  if (typeof analysis.financialAnalysis === 'object') {
    const financialData = Object.entries(analysis.financialAnalysis.metrics)
      .map(([key, value]) => [key, value]);
    const financialSheet = XLSX.utils.aoa_to_sheet([
      ['Metric', 'Value'],
      ...financialData
    ]);
    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financials');
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function formatSectionContent(analysis: DueDiligenceReportType, section: string): string {
  // Format different sections appropriately
  switch (section) {
    case 'executiveSummary':
      return typeof analysis.executiveSummary === 'string' 
        ? analysis.executiveSummary
        : analysis.executiveSummary.overview;
    case 'financialAnalysis':
      return typeof analysis.financialAnalysis === 'string'
        ? analysis.financialAnalysis
        : formatFinancialAnalysis(analysis.financialAnalysis);
    case 'riskAssessment':
      return typeof analysis.riskAssessment === 'string'
        ? analysis.riskAssessment
        : formatRiskAssessment(analysis.riskAssessment);
    default:
      return JSON.stringify(analysis[section as keyof DueDiligenceReportType], null, 2);
  }
}

function formatFinancialAnalysis(analysis: any): string {
  if (!analysis?.metrics) return 'No financial data available';
  
  return Object.entries(analysis.metrics)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function formatRiskAssessment(assessment: any): string {
  if (!assessment?.riskFactors) return 'No risk assessment available';
  
  return Object.entries(assessment.riskFactors)
    .map(([category, risks]) => {
      const riskList = Array.isArray(risks) ? risks.join(', ') : risks;
      return `${category.toUpperCase()}:\n${riskList}`;
    })
    .join('\n\n');
}
