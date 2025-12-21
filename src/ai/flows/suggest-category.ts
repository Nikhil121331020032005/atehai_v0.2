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
const isGenkitInitialized = ai !== null && typeof ai.definePrompt === 'function';

let prompt: any = null;
let suggestCategoryFlow: any = null;

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

    suggestCategoryFlow = ai!.defineFlow(
      {
        name: 'suggestCategoryFlow',
        inputSchema: SuggestCategoryInputSchema,
        outputSchema: SuggestCategoryOutputSchema,
      },
      async (input: SuggestCategoryInput) => {
        const {output} = await prompt(input);
        return output!;
      }
    );
  } catch (error) {
    console.warn('[suggest-category] Failed to initialize Genkit flow - AI feature disabled:', error);
    prompt = null;
    suggestCategoryFlow = null;
  }
} else {
  console.warn('[suggest-category] Genkit not initialized - Missing GEMINI_API_KEY');
}

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  if (!isGenkitInitialized || !suggestCategoryFlow) {
    throw new Error('AI service is not configured. GEMINI_API_KEY is missing.');
  }
  return suggestCategoryFlow(input);
}
