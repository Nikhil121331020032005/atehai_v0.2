/**
 * Server-only Genkit configuration for Gemini AI.
 * This file must only be imported in server-side code (API routes, server actions).
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure this is only run on the server (warn instead of throw to avoid crashes)
if (typeof window !== 'undefined') {
  console.warn('[Genkit] Warning: genkit.ts should only be imported in server-side code');
}

// Validate API key at initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiInstance: ReturnType<typeof genkit> | null = null;

if (!apiKey) {
  console.warn('[Genkit] GEMINI_API_KEY env var missing, Genkit AI features will be disabled');
} else {
  // Safe logging: only show that key exists and its length, never the actual key
  console.log('[Genkit] API key loaded successfully (length:', apiKey.length, 'chars)');
  
  try {
    // Initialize Genkit only if API key is present
    aiInstance = genkit({
      plugins: [
        googleAI({
          apiKey: apiKey,
        }),
      ],
      model: 'googleai/gemini-2.0-flash',
    });
  } catch (error) {
    console.warn('[Genkit] Failed to initialize Genkit:', error);
    aiInstance = null;
  }
}

// Export ai instance - will be null if not initialized, but typed as genkit instance
// The suggest-category flow checks for definePrompt method before using it
export const ai = aiInstance as ReturnType<typeof genkit> | null;
