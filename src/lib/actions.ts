
'use server';

import { suggestCategory } from '@/ai/flows/suggest-category';
import type { CategoryName } from './types';
import { CATEGORIES } from './data';

const validCategories = new Set(CATEGORIES.map(c => c.name));

export async function suggestCategoryAction(description: string): Promise<{ category: CategoryName | null; error?: string }> {
  if (!description.trim()) {
    return { category: null, error: 'Description cannot be empty.' };
  }

  try {
    const result = await suggestCategory({ description });
    const suggestedCategory = result.category as CategoryName;

    if (validCategories.has(suggestedCategory)) {
      return { category: suggestedCategory };
    }
    console.warn(`AI suggested an invalid category: "${result.category}". Falling back to 'Other'.`);
    return { category: 'Other' };
  } catch (error) {
    console.error('Error suggesting category:', error);
    return { category: null, error: 'Failed to suggest a category. Please select one manually.' };
  }
}
