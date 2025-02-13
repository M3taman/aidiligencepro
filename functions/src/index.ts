
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cors from 'cors';

const MODEL_NAME = "gemini-1.0-pro-latest"; // Using the latest Gemini model
const API_KEY = "AIzaSyDQTEHDGhtEC0lpY41t4HZvFyPJd-HX0-M";
const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize CORS middleware
const corsHandler = cors({
  origin: true,
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
  "Patent and Trademark Databases",
  "Industry Reports",
  "Market Research Publications",
  "Social Media Sentiment Analysis",
  "Regulatory Filings"
];

export const generateDueDiligence = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const data = request.body;
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `
        Perform an extensive due diligence analysis for: ${data.company}
        
        COMPREHENSIVE ANALYSIS FRAMEWORK:

        1. Executive Summary
           - Key findings and recommendations
           - Investment thesis
           - Risk summary
           - Valuation overview

        2. Company Overview
           - Corporate history and milestones
           - Organizational structure
           - Key management profiles
           - Corporate culture assessment
           - Mission and vision analysis

        3. Market Analysis
           - Industry size and growth rates
           - Market share analysis
           - Competitive landscape
           - Market trends and dynamics
           - Entry barriers
           - Geographic presence

        4. Financial Analysis
           - Revenue streams and growth
           - Profitability metrics (EBITDA, Net Margin)
           - Balance sheet strength
           - Cash flow analysis
           - Working capital management
           - Capital structure
           - Key financial ratios
           - Historical performance trends

        5. Business Model
           - Value proposition
           - Revenue model
           - Cost structure
           - Customer segments
           - Distribution channels
           - Key partnerships
           - Scalability potential

        6. Competitive Analysis
           - Direct competitors
           - Indirect competitors
           - Competitive advantages
           - SWOT analysis
           - Market positioning
           - Differentiation factors

        7. Technology & Innovation
           - Technology stack
           - R&D capabilities
           - Innovation pipeline
           - Patents and IP
           - Digital transformation initiatives
           - Technical debt assessment

        8. Risk Assessment
           - Operational risks
           - Financial risks
           - Market risks
           - Regulatory risks
           - Reputational risks
           - Cybersecurity risks
           - Environmental risks
           - Mitigation strategies

        9. Growth Opportunities
           - Expansion strategies
           - New markets
           - Product development
           - M&A potential
           - Strategic partnerships
           - Innovation opportunities

        10. Regulatory & Compliance
            - Regulatory framework
            - Compliance status
            - Legal issues
            - Environmental compliance
            - Industry-specific regulations
            - Pending legislation impact

        11. ESG Analysis
            - Environmental impact
            - Social responsibility
            - Governance structure
            - Sustainability initiatives
            - Stakeholder relationships
            - ESG metrics and ratings

        12. Future Outlook
            - Growth projections
            - Market evolution
            - Strategic initiatives
            - Potential challenges
            - Success factors

        METHODOLOGY:
        - Cross-reference multiple sources: ${researchSources.join(", ")}
        - Utilize real-time data and latest market information
        - Apply industry-standard analytical frameworks
        - Consider both quantitative and qualitative factors
        - Validate information across multiple reliable sources
        - Provide actionable insights and recommendations

        Please provide a detailed, well-structured analysis with specific insights and data points where available. Include relevant metrics, comparisons, and industry benchmarks.
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
