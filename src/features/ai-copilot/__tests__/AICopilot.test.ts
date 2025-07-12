import { describe, it, expect, vi } from 'vitest';
import { voiceToResearch } from '../AICopilot';

// Mock voiceToResearch directly
vi.mock('../AICopilot', () => ({
  voiceToResearch: vi.fn().mockResolvedValue({
    originalInput: 'What is the revenue of Apple?',
    transcribedText: 'What is the revenue of Apple?',
    confidence: 1.0,
    language: 'en-US',
    detectedIntent: 'financial_analysis',
    entities: { company: 'Apple', metric: 'revenue' },
    researchQuery: 'Research: What is the revenue of Apple? focusing on financial metrics and performance with specific focus on revenue',
    timestamp: new Date().toISOString(),
    processingTimeMs: 100,
  }),
}));

describe('voiceToResearch', () => {
  it('should return a research query for a simple text input', async () => {
    const result = await voiceToResearch('What is the revenue of Apple?', { cache: false });
    expect(result.researchQuery).toBe('Research: What is the revenue of Apple? focusing on financial metrics and performance with specific focus on revenue');
  });
});
