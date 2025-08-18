'use server';

import { suggestCategory } from '@/ai/flows/suggest-category';
import type { CategoryName } from './types';
import { CATEGORIES } from './data';
import { stripe } from './stripe';
import { auth } from './firebase';
import { headers } from 'next/headers';

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

export async function createCheckoutSession(): Promise<{ sessionId: string } | { error: string }> {
  const user = auth.currentUser;

  if (!user) {
    return { error: 'You must be logged in to subscribe.' };
  }
  
  const origin = headers().get('origin') || 'http://localhost:9002';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Atehai Premium Membership',
              description: 'Unlock all premium features of Atehai.',
            },
            unit_amount: 299, // $2.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        userId: user.uid,
      }
    });

    if (!session.id) {
        return { error: 'Could not create a checkout session.' };
    }

    return { sessionId: session.id };
  } catch (error) {
    console.error('Stripe Error:', error);
    return { error: 'An error occurred while creating the checkout session.' };
  }
}
