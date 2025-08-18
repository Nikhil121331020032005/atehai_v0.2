
'use server';

import { suggestCategory } from '@/ai/flows/suggest-category';
import type { CategoryName } from './types';
import { CATEGORIES } from './data';
import { auth, db } from './firebase';
import { headers } from 'next/headers';
import { Cashfree } from 'cashfree-pg';
import { doc, getDoc } from 'firebase/firestore';

const validCategories = new Set(CATEGORIES.map(c => c.name));

// The Cashfree configuration is kept here for when you're ready to go live.
// Make sure to fill in your credentials in the .env file at that time.
Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Use .PRODUCTION for live

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

export async function createCheckoutSession(): Promise<{ session_id: string } | { error: string }> {
  const user = auth.currentUser;

  if (!user) {
    return { error: 'You must be logged in to subscribe.' };
  }
  
  const origin = headers().get('origin') || 'http://localhost:9002';
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userProfile = userDoc.data();

  const orderId = `order_${Date.now()}`;

  const request = {
    order_id: orderId,
    order_amount: 2.99,
    order_currency: "INR",
    order_note: "Atehai Premium Membership",
    customer_details: {
        customer_id: user.uid,
        customer_email: user.email || '',
        customer_phone: "9876543210", // Placeholder, ideally get from profile
        customer_name: userProfile?.name || user.email?.split('@')[0] || 'Valued User'
    },
    order_meta: {
        return_url: `${origin}/profile?order_id={order_id}`,
    },
    order_tags: {
      userId: user.uid
    }
  };

  try {
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    if (response.data && response.data.payment_session_id) {
        return { session_id: response.data.payment_session_id };
    }
    return { error: 'Could not create a checkout session.' };
  } catch (error: any) {
    console.error('Cashfree Error:', error.response.data);
    return { error: 'An error occurred while creating the checkout session.' };
  }
}
