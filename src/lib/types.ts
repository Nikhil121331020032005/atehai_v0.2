import type { LucideIcon } from 'lucide-react';

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
  | 'Other';

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
