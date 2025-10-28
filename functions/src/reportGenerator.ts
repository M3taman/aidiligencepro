import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from 'firebase-functions/v2/https';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generatePdfReport(reportText: string): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  page.drawText(reportText, {
    x: 50,
    y: height - 4 * fontSize,
    font,
    fontSize,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}

export const generateReport = onCall(async (request) => {
  try {
    const { reportData } = request.data;

    if (!reportData) {
      throw new functions.https.HttpsError('invalid-argument', 'Report data is required');
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    let y = height - 40;

    const drawText = (text: string, x: number, yPos: number, size = fontSize) => {
      page.drawText(text, { x, y: yPos, font, size, color: rgb(0, 0, 0) });
      return size + 5;
    };

    y -= drawText(`Due Diligence Report: ${reportData.companyName || 'Unknown Company'}`, 50, y, 18);
    y -= 20;

    if (reportData.ticker) {
      y -= drawText(`Ticker: ${reportData.ticker}`, 50, y);
    }
    y -= drawText(`Generated At: ${new Date(reportData.generatedAt || Date.now()).toLocaleString()}`, 50, y);
    y -= 20;

    if (reportData.executiveSummary) {
      y -= drawText('Executive Summary', 50, y, 14);
      y -= drawText(reportData.executiveSummary, 50, y);
      y -= 20;
    }

    if (reportData.recommendation) {
      y -= drawText('Recommendation', 50, y, 14);
      y -= drawText(`${reportData.recommendation} (Confidence: ${reportData.confidence || 'N/A'}%)`, 50, y);
      y -= 20;
    }

    if (reportData.riskRating) {
      y -= drawText('Risk Rating', 50, y, 14);
      y -= drawText(reportData.riskRating, 50, y);
      y -= 20;
    }

    if (reportData.keyFindings && Array.isArray(reportData.keyFindings)) {
      y -= drawText('Key Findings', 50, y, 14);
      reportData.keyFindings.forEach((finding: string) => {
        y -= drawText(`- ${finding}`, 60, y);
      });
    }

    const pdfBytes = await pdfDoc.save();

    logger.info('PDF report generated successfully', { 
      companyName: reportData.companyName,
      size: pdfBytes.length 
    });

    return { pdf: Buffer.from(pdfBytes).toString('base64') };
  } catch (error) {
    logger.error('Error generating PDF report:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate PDF report');
  }
});