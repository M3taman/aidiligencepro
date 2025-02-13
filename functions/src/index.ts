
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-pro";
const API_KEY = "AIzaSyDQTEHDGhtEC0lpY41t4HZvFyPJd-HX0-M";
const genAI = new GoogleGenerativeAI(API_KEY);

const researchSources = [
  "SEC EDGAR Filings",
  "Bloomberg Financial Data",
  "Crunchbase Company Profiles",
  "Yahoo Finance",
  "Google News",
  "LinkedIn Company Insights",
  "Glassdoor Company Reviews",
  "Patent and Trademark Databases"
];

export const generateDueDiligence = functions
  .runWith({
    cors: {
      origin: ["https://419e6187-8142-4fcb-8486-c7d352111a8e.lovableproject.com"],
      methods: ['POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    }
  })
  .https.onCall(async (data, context) => {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `
      Perform a comprehensive due diligence analysis for: ${data.company}
      
      RESEARCH METHODOLOGY:
      - Utilize multiple authoritative sources: ${researchSources.join(", ")}
      - Cross-reference and validate information
      - Provide real-time insights
      - Maintain objectivity

      ANALYSIS FRAMEWORK:
      1. Company Overview
         - Corporate history
         - Structure
         - Leadership

      2. Financial Health
         - Revenue trends
         - Profitability
         - Balance sheet
         - Cash flow

      3. Market Position
         - Industry standing
         - Market share
         - Differentiation

      4. Risk Evaluation
         - Operational risks
         - Financial risks
         - Compliance
         - External factors

      5. Growth Potential
         - Strategies
         - Innovation
         - Opportunities

      6. Competition
         - Direct competitors
         - SWOT analysis
         - Strategic position

      7. Regulatory Insights
         - Compliance status
         - Challenges
         - Governance
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      return { data: analysis };
    } catch (error: any) {
      console.error("Gemini API error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error generating analysis.",
        error
      );
    }
});

export const generateText = functions
  .runWith({
    cors: {
      origin: ["https://419e6187-8142-4fcb-8486-c7d352111a8e.lovableproject.com"],
      methods: ['POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    }
  })
  .https.onCall(async (data, context) => {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = data.prompt;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return { data: text };
    } catch (error: any) {
      console.error("Gemini API error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error generating text.",
        error
      );
    }
});
