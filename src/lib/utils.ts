import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Currency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'USD') {
  let locale = 'en-US';
  if (currency === 'INR') locale = 'en-IN';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
