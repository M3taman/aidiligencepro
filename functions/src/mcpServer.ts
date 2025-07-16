
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Pre-canned responses for specific companies to make the demo more compelling
const companyDataStore: { [key: string]: any } = {
  "apple": {
    reportSummary: "Apple Inc. shows strong market performance, driven by iPhone sales and services growth. Analyst sentiment is overwhelmingly positive, though some concerns about supply chain resilience remain. Regulatory scrutiny in the EU and US is a key area to watch.",
    sentiment: 0.85,
    prediction: "Strong Buy",
    confidence: 0.92,
    keyMetrics: {
      "P/E Ratio": 28.5,
      "Market Cap": "$2.9T",
      "Dividend Yield": "0.5%",
      "52-Week High": "$198.23",
    },
    sentimentHistory: [0.6, 0.65, 0.7, 0.8],
  },
  "tesla": {
    reportSummary: "Tesla, Inc. continues to dominate the EV market but faces increasing competition. Production scaling and battery technology are key strengths. High stock volatility and dependence on Elon Musk's leadership are notable risks. Sentiment is mixed but leans positive.",
    sentiment: 0.65,
    prediction: "Hold",
    confidence: 0.88,
    keyMetrics: {
      "P/E Ratio": 75.2,
      "Market Cap": "$850B",
      "Dividend Yield": "N/A",
      "52-Week High": "$299.29",
    },
    sentimentHistory: [0.7, 0.5, 0.6, 0.55],
  },
  "default": {
    reportSummary: "This is a sample AI-generated report summary for the requested company. It highlights market position, recent performance, and potential risks, providing a concise overview for due diligence.",
    sentiment: 0.75,
    prediction: "Positive",
    confidence: 0.9,
    keyMetrics: {
        "P/E Ratio": "25.1",
        "Market Cap": "$1.2T",
        "Dividend Yield": "1.2%",
        "52-Week High": "$150.00",
    },
    sentimentHistory: [0.4, 0.5, 0.6, 0.7],
  }
};

export const getMCPData = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated before proceeding
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const companyName = (data.company || '').toLowerCase();
  const reportData = companyDataStore[companyName] || companyDataStore["default"];

  // Simulate network delay for a more realistic experience
  await new Promise(resolve => setTimeout(resolve, 1500));

  return reportData;
});
