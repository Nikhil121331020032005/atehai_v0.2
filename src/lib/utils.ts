import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Currency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'USD') {
  // Use a specific locale that properly displays INR symbol
  const locale = currency === 'INR' ? 'hi-IN' : 'en-US';
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
  
  // Ensure INR shows ₹ symbol correctly
  if (currency === 'INR' && !formatted.includes('₹')) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return formatted;
}
