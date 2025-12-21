'use server';

/**
 * @fileOverview Suggests an expense category based on the expense description.
 *
 * - suggestCategory - A function that suggests an expense category.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestCategoryInputSchema = z.object({
  description: z.string().describe('The description of the expense.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z.string().describe('The suggested expense category.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

// Check if Genkit is initialized (has definePrompt method)
// ai will be null if GEMINI_API_KEY is missing
const isGenkitInitialized = ai !== null && typeof ai.definePrompt === 'function' && typeof ai.defineFlow === 'function';

let prompt: any = null;
let suggestCategoryFlow: any = null;
let initializationError: string | null = null;

if (isGenkitInitialized && ai) {
  try {
    prompt = ai.definePrompt({
      name: 'suggestCategoryPrompt',
      input: {schema: SuggestCategoryInputSchema},
      output: {schema: SuggestCategoryOutputSchema},
      prompt: `Given the following expense description, suggest a relevant expense category.
Description: {{{description}}}

Possible categories: Groceries, Utilities, Rent, Transportation, Entertainment, Dining, Shopping, Travel, Education, Healthcare, Insurance, Personal Care, Investments, Other

Suggest one of the categories above, and nothing else.`,
    });

    if (!prompt) {
      throw new Error('Failed to create prompt');
    }

    suggestCategoryFlow = ai.defineFlow(
      {
        name: 'suggestCategoryFlow',
        inputSchema: SuggestCategoryInputSchema,
        outputSchema: SuggestCategoryOutputSchema,
      },
      async (input: SuggestCategoryInput) => {
        if (!prompt) {
          throw new Error('Prompt not initialized');
        }
        const {output} = await prompt(input);
        if (!output) {
          throw new Error('No output from prompt');
        }
        return output;
      }
    );

    if (!suggestCategoryFlow) {
      throw new Error('Failed to create flow');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    initializationError = errorMsg;
    console.warn('[suggest-category] Failed to initialize Genkit flow - AI feature disabled:', errorMsg);
    prompt = null;
    suggestCategoryFlow = null;
  }
} else {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[suggest-category] Genkit not initialized - Missing GEMINI_API_KEY');
  } else {
    console.warn('[suggest-category] Genkit not initialized - Instance missing required methods');
  }
}

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  // Check if Genkit is properly initialized
  if (!isGenkitInitialized) {
    const reason = !process.env.GEMINI_API_KEY
      ? 'Missing GEMINI_API_KEY'
      : 'Genkit instance missing required methods';
    console.warn(`[suggest-category] Genkit not initialized - ${reason}`);
    throw new Error('AI service is not configured. GEMINI_API_KEY is missing.');
  }
  
  if (!suggestCategoryFlow) {
    const reason = initializationError || 'Flow initialization failed';
    console.warn(`[suggest-category] Genkit flow not available - ${reason}`);
    throw new Error('AI service is not configured. GEMINI_API_KEY is missing.');
  }
  
  // Execute the flow with error handling
  try {
    const result = await suggestCategoryFlow(input);
    
    // Validate result structure
    if (!result || typeof result !== 'object') {
      console.warn('[suggest-category] Invalid result structure from Genkit flow:', typeof result);
      throw new Error('Invalid response from AI service');
    }
    
    if (!result.category || typeof result.category !== 'string') {
      console.warn('[suggest-category] Missing or invalid category in result:', result);
      throw new Error('Invalid response from AI service');
    }
    
    return result;
  } catch (error) {
    // Preserve quota/rate limit errors for proper handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorString = String(error);
    
    // Check if it's a quota/rate limit error - preserve it
    if (errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') ||
        errorString.includes('Quota exceeded') ||
        errorString.includes('Too Many Requests')) {
      // Re-throw as-is so API route can handle it properly
      throw error;
    }
    
    // Log other errors
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.warn('[suggest-category] Error executing Genkit flow:', {
      message: errorMessage,
      stack: errorStack ? errorStack.split('\n').slice(0, 3).join('\n') : undefined,
    });
    throw error;
  }
}
