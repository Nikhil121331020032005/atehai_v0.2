import type { LucideIcon } from 'lucide-react';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

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
};