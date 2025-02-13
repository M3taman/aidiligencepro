
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cors from 'cors';

const MODEL_NAME = "gemini-pro";
const API_KEY = "AIzaSyDQTEHDGhtEC0lpY41t4HZvFyPJd-HX0-M";
const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize CORS middleware
const corsHandler = cors({
  origin: true, // This enables CORS for all origins
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

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

export const generateDueDiligence = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const data = request.body;
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

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();
      response.json({ data: analysis });
    } catch (error) {
      console.error("Error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});

export const generateText = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const data = request.body;
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(data.prompt);
      const text = result.response.text();
      response.json({ data: text });
    } catch (error) {
      console.error("Error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
});
