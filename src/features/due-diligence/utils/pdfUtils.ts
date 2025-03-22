import { jsPDF } from 'jspdf';

/**
 * Add the AI Diligence Pro logo to a PDF document
 */
export const addAiDiligenceLogoToPDF = (doc: jsPDF, x: number, y: number, width: number = 50): void => {
  // In a real implementation, this would add an actual logo image
  // For now, we'll just add text as a placeholder
  const originalFontSize = doc.getFontSize();
  
  doc.setFontSize(16);
  doc.setTextColor(66, 133, 244); // Blue color
  doc.text('AI Diligence Pro', x, y);
  
  // Reset font size
  doc.setFontSize(originalFontSize);
  doc.setTextColor(0, 0, 0); // Reset to black
};

/**
 * Add a header to the PDF document
 */
export const addPDFHeader = (doc: jsPDF, title: string): void => {
  // Add logo
  addAiDiligenceLogoToPDF(doc, 140, 15);
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
};

/**
 * Add a footer to the PDF document
 */
export const addPDFFooter = (doc: jsPDF, pageNumber: number, totalPages: number): void => {
  const footerText = `Page ${pageNumber} of ${totalPages} | AI Diligence Pro | Confidential`;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(footerText, 105, 285, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 280, 190, 280);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
};

/**
 * Format text for PDF with proper line breaks
 */
export const formatTextForPDF = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(text, maxWidth);
};

/**
 * Add a section to the PDF document
 */
export const addPDFSection = (
  doc: jsPDF, 
  title: string, 
  content: string, 
  startY: number, 
  maxWidth: number = 170
): number => {
  // Add section title
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, 20, startY);
  
  // Add section content
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const contentLines = formatTextForPDF(doc, content, maxWidth);
  doc.text(contentLines, 20, startY + 10);
  
  // Return the new Y position after this section
  return startY + 10 + (contentLines.length * 5);
};
