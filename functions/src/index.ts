// functions/src/index.ts
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

//const MODEL_NAME = "gemini-1.5-pro-latest";
const MODEL_NAME = "gemini-1.0-pro";

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);


export const generateText = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to use this function."
    );
  }

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