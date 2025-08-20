import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Currency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'USD') {
  // Special handling for INR to ensure proper ₹ symbol display
  if (currency === 'INR') {
    const formattedNumber = Math.abs(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    return `₹${amount < 0 ? '-' : ''}${formattedNumber}`;
  }
  
  // For other currencies, use standard formatting
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
  
  return formatted;
}
