import OpenAI from 'openai';
import { PDFDocument } from 'pdf-lib';
import { WebClient } from '@slack/web-api';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const slack = new WebClient(process.env.SLACK_TOKEN);

import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAlphaVantageData } from '@/lib/api';

export async function analyzeSECFiling(pdfUrl: string, companyTicker: string) {
  try {
    // 1. Fetch PDF
    const response = await fetch(pdfUrl);
    const pdfBuffer = await response.arrayBuffer();
    
    // 2. Extract full text using pdfjs
    const loadingTask = pdfjsLib.getDocument({data: pdfBuffer});
    const pdf = await loadingTask.promise;
    let fullText = '';

    // Process in chunks to avoid memory issues
    const CHUNK_SIZE = 20; // pages per chunk
    for (let i = 1; i <= pdf.numPages; i += CHUNK_SIZE) {
      const endPage = Math.min(i + CHUNK_SIZE - 1, pdf.numPages);
      const pages = await Promise.all(
        Array.from({length: endPage - i + 1}, (_, idx) => 
          pdf.getPage(i + idx).then(page => 
            page.getTextContent().then(content => 
              content.items.map(item => item.str).join(' ')
            )
          )
        )
      );
      // Filter for TextItem type and extract text
      // Directly extract text from pages
      for (const pageText of pages) {
        const textItems = pageText.split(' ').filter(Boolean);
        fullText += textItems.join(' ') + ' ';
      }
    }

    // 3. Get financial data from Alpha Vantage
    const financialData = await getAlphaVantageData(companyTicker);

    // 4. AI Analysis with full context
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{
        role: "system",
        content: `Analyze SEC filing with financial context. Extract:
        1) Key financial metrics (compare to: ${JSON.stringify(financialData)})
        2) Material risks 
        3) Notable changes from previous filings
        4) Generate executive summary
        Return structured JSON output matching DueDiligenceResponse type.`
      }, {
        role: "user",
        content: fullText
      }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(analysis.choices[0].message?.content || '{}');

    // 5. Store in Firestore
    const reportRef = doc(db, 'reports', `${companyTicker}_${Date.now()}`);
    await setDoc(reportRef, {
      ...result,
      companyTicker,
      timestamp: new Date().toISOString(),
      rawText: fullText.substring(0, 10000) // Store first 10k chars
    });

    return result;
  } catch (error) {
    console.error('SEC analysis failed:', error);
    throw error;
  }
}
