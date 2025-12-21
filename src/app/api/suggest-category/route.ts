/**
 * API route for suggesting expense categories using Gemini AI.
 * This route ensures all Gemini calls run strictly on the server.
 * 
 * POST /api/suggest-category
 * Body: { description: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { suggestCategory } from '@/ai/flows/suggest-category';
import { CATEGORIES } from '@/lib/data';
import type { CategoryName } from '@/lib/types';

// Ensure this route only runs on the server
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const validCategories = new Set(CATEGORIES.map(c => c.name));

export async function POST(request: NextRequest) {
  try {
    // Verify API key is available (safe check without exposing key)
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[API] Missing GEMINI_API_KEY - AI feature disabled');
      return NextResponse.json(
        { 
          category: null, 
          error: 'AI service is not configured. Please select a category manually.' 
        },
        { status: 503 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          category: null, 
          error: 'Invalid request format.' 
        },
        { status: 400 }
      );
    }

    const { description } = body;

    // Validate input
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { 
          category: null, 
          error: 'Description cannot be empty.' 
        },
        { status: 400 }
      );
    }

    // Call the Genkit flow (server-side only)
    let result;
    try {
      result = await suggestCategory({ description });
    } catch (genkitError) {
      // Handle Genkit-specific errors
      const genkitErrorMessage = genkitError instanceof Error ? genkitError.message : 'Unknown Genkit error';
      const genkitErrorString = String(genkitError);
      
      console.warn('[API] Genkit flow error:', genkitErrorMessage);
      
      // Check for quota/rate limit errors
      if (genkitErrorMessage.includes('429') || 
          genkitErrorMessage.includes('quota') || 
          genkitErrorMessage.includes('rate limit') ||
          genkitErrorString.includes('Quota exceeded') ||
          genkitErrorString.includes('Too Many Requests')) {
        console.warn('[API] Gemini API quota/rate limit exceeded');
        return NextResponse.json(
          { 
            category: null, 
            error: 'AI service is temporarily unavailable due to high demand. Please select a category manually.' 
          },
          { status: 503 }
        );
      }
      
      // If it's a configuration error, return 503
      if (genkitErrorMessage.includes('not configured') || genkitErrorMessage.includes('GEMINI_API_KEY')) {
        return NextResponse.json(
          { 
            category: null, 
            error: 'AI service is not configured. Please select a category manually.' 
          },
          { status: 503 }
        );
      }
      
      // Re-throw to be caught by outer catch block
      throw genkitError;
    }
    
    const suggestedCategory = result.category as CategoryName;

    // Validate the suggested category
    if (validCategories.has(suggestedCategory)) {
      return NextResponse.json({ category: suggestedCategory });
    }

    // Fallback to 'Other' if AI suggests invalid category
    console.warn(`[API] AI suggested invalid category: "${result.category}". Using 'Other'.`);
    return NextResponse.json({ category: 'Other' });

  } catch (error) {
    // Log error details server-side for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[API] Error in suggest-category:', {
      message: errorMessage,
      stack: errorStack,
      // Don't log the full error object as it might contain sensitive info
    });
    
    // Return user-friendly error without exposing internal details
    return NextResponse.json(
      { 
        category: null, 
        error: 'Failed to suggest a category. Please select one manually.' 
      },
      { status: 500 }
    );
  }
}

