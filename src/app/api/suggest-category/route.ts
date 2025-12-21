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
      console.error('[API] GEMINI_API_KEY is missing');
      return NextResponse.json(
        { 
          category: null, 
          error: 'AI service is not configured. Please contact support.' 
        },
        { status: 500 }
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
    const result = await suggestCategory({ description });
    const suggestedCategory = result.category as CategoryName;

    // Validate the suggested category
    if (validCategories.has(suggestedCategory)) {
      return NextResponse.json({ category: suggestedCategory });
    }

    // Fallback to 'Other' if AI suggests invalid category
    console.warn(`[API] AI suggested invalid category: "${result.category}". Using 'Other'.`);
    return NextResponse.json({ category: 'Other' });

  } catch (error) {
    console.error('[API] Error in suggest-category:', error);
    
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

