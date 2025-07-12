interface VoiceToResearchOptions {
  cache?: boolean;
}

export async function voiceToResearch(text: string, options?: VoiceToResearchOptions) {
  return {
    originalInput: text,
    transcribedText: text,
    confidence: 1.0,
    language: 'en-US',
    detectedIntent: 'unknown',
    entities: {},
    researchQuery: `Research: ${text}`,
    timestamp: new Date().toISOString(),
    processingTimeMs: 0,
  };
}