import type { LucideIcon } from 'lucide-react';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'BRL' | 'ZAR';

export type CategoryName = 
  | 'Groceries' 
  | 'Utilities' 
  | 'Rent' 
  | 'Transportation' 
  | 'Entertainment' 
  | 'Dining' 
  | 'Shopping' 
  | 'Travel' 
  | 'Education' 
  | 'Healthcare' 
  | 'Insurance' 
  | 'Personal Care' 
  | 'Investments' 
  | 'Other'
  | 'Lending'
  | 'EMI';

export type Category = {
  name: CategoryName;
  icon: LucideIcon;
  color: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: CategoryName;
};

export type Budget = {
  id: string;
  category: CategoryName;
  amount: number;
};

export type BorrowLendStatus = 'Pending' | 'Paid';

export type BorrowLend = {
  id: string;
  type: 'borrow' | 'lend';
  person: string;
  amount: number;
  date: string;
  status: BorrowLendStatus;
  dueDate: string;
};

export type EmiCategory = 'Home Loan' | 'Car Loan' | 'Gadget' | 'Other';

export type Emi = {
  id: string;
  name: string;
  category: EmiCategory;
  amount: number;
  dueDate: string;
  tenure: number; // in months
};

export type IncomeSource = 'Salary' | 'Freelance' | 'Internship' | 'Investments' |'Fixed Deposit' | 'Recurring Deposit' | 'Other';
export type IncomeStatus = 'Pending' | 'Received';

export type Income = {
  id: string;
  source: IncomeSource;
  amount: number;
  date: string;
  bank: string;
  status: IncomeStatus;
};

export type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
};

export type Profile = {
    name?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    email: string;
    avatarUrl?: string;
    isPremium?: boolean;
    resetsThisMonth?: number;
    subscriptionEndDate?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
};

export type AssetType = 'stocks' | 'crypto' | 'real-estate' | 'gold' | 'mutual-funds' | 'savings' | 'other';
export type LiabilityType = 'home-loan' | 'car-loan' | 'personal-loan' | 'credit-card' | 'other';

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  currentValue: number;
  purchaseValue?: number;
  purchaseDate?: string;
  description?: string;
};

export type Liability = {
  id: string;
  name: string;
  type: LiabilityType;
  currentBalance: number;
  originalAmount?: number;
  interestRate?: number;
  dueDate?: string;
  description?: string;
};

export type DashboardWidget = {
  id: string;
  type: 'expenses' | 'savings' | 'debts' | 'emis' | 'income' | 'goals' | 'net-worth' | 'spending-chart';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean;
};

export type TimeRange = 'weekly' | 'monthly' | 'yearly';
