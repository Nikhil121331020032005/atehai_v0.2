/**
 * Server-only Genkit configuration for Gemini AI.
 * This file must only be imported in server-side code (API routes, server actions).
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure this is only run on the server
if (typeof window !== 'undefined') {
  throw new Error('genkit.ts must only be imported in server-side code');
}

// Validate API key at initialization
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('[Genkit] GEMINI_API_KEY is not set in environment variables');
  // Log partial key for debugging (first 4 chars) without exposing the full key
  console.error('[Genkit] Environment check: GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
} else {
  // Safe logging: only show that key exists and its length, never the actual key
  console.log('[Genkit] API key loaded successfully (length:', apiKey.length, 'chars)');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey || '', // Will fail gracefully if missing
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Using gemini-2.0-flash as requested
});
