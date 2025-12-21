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
  console.warn('[Genkit] Missing GEMINI_API_KEY - AI features will be disabled');
} else {
  // Safe logging: only show that key exists and its length, never the actual key
  console.log('[Genkit] API key loaded successfully (length:', apiKey.length, 'chars)');
  
  try {
    // Initialize Genkit only if API key is present
    // Note: Genkit should work in serverless environments, but we handle errors gracefully
    aiInstance = genkit({
      plugins: [
        googleAI({
          apiKey: apiKey,
        }),
      ],
      model: 'googleai/gemini-1.5-flash', // Using 1.5-flash for better free tier compatibility
    });
    
    // Verify that the instance has the required methods
    if (!aiInstance || typeof aiInstance.definePrompt !== 'function') {
      console.warn('[Genkit] Genkit instance created but missing required methods');
      aiInstance = null;
    }
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.warn('[Genkit] Failed to initialize Genkit:', errorDetails);
    aiInstance = null;
  }
}

// Export ai instance - will be null if not initialized, but typed as genkit instance
// The suggest-category flow checks for definePrompt method before using it
export const ai = aiInstance as ReturnType<typeof genkit> | null;
