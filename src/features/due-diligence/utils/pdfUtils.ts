import jsPDF from "jspdf";

/**
 * Adds the AI Diligence logo to the PDF header.
 * @param doc jsPDF instance
 * @param x left margin
 * @param y top margin
 * @param width desired width of the logo in pt
 */
export async function addAiDiligenceLogoToPDF(doc: jsPDF, x = 20, y = 10, width = 50) {
  try {
    // Assume logo.svg is publicly served from /logo.svg
    const response = await fetch("/logo.svg");
    const svgText = await response.text();
    const imgData = "data:image/svg+xml;base64," + btoa(svgText);
    doc.addImage(imgData, "SVG", x, y, width, width * 0.3);
  } catch (err) {
    console.warn("Could not load logo for PDF", err);
  }
}

/**
 * Renders a repeating diagonal watermark containing the site URL.
 */
export function addWatermarkAndBacklink(doc: jsPDF) {
  const watermarkText = "aidiligence.pro";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setTextColor(150);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
    angle: 45,
    align: "center",
    opacity: 0.1 as any, // jsPDF typings lack opacity but runtime supports
  } as any);
}
