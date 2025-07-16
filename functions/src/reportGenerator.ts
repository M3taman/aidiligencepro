import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
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

import { onCall } from 'firebase-functions/v2/https';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generateReport = onCall(async (request) => {
  const { reportData } = request.data;

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

  y -= drawText(`Due Diligence Report: ${reportData.companyName}`, 50, y, 18);
  y -= 20;

  y -= drawText(`Ticker: ${reportData.ticker}`, 50, y);
  y -= drawText(`Generated At: ${new Date(reportData.generatedAt).toLocaleString()}`, 50, y);
  y -= 20;

  y -= drawText('Executive Summary', 50, y, 14);
  y -= drawText(reportData.executiveSummary, 50, y);
  y -= 20;

  y -= drawText('Recommendation', 50, y, 14);
  y -= drawText(`${reportData.recommendation} (Confidence: ${reportData.confidence}%)`, 50, y);
  y -= 20;

  y -= drawText('Risk Rating', 50, y, 14);
  y -= drawText(reportData.riskRating, 50, y);
  y -= 20;

  y -= drawText('Key Findings', 50, y, 14);
  reportData.keyFindings.forEach((finding: string) => {
    y -= drawText(`- ${finding}`, 60, y);
  });

  const pdfBytes = await pdfDoc.save();

  return { pdf: Buffer.from(pdfBytes).toString('base64') };
});