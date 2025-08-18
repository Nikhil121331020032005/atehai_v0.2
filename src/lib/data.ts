import type { Category, Expense, Budget, CategoryName, BorrowLend, Emi, Income, EmiCategory, IncomeSource } from './types';
import {
  ShoppingCart,
  Zap,
  Home,
  Car,
  Ticket,
  UtensilsCrossed,
  ShoppingBag,
  Plane,
  BookOpen,
  HeartPulse,
  Shield,
  Smile,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';
import { subDays, format, addMonths } from 'date-fns';

export const CATEGORIES: Category[] = [
  { name: 'Groceries', icon: ShoppingCart, color: '#4ade80' },
  { name: 'Utilities', icon: Zap, color: '#fb923c' },
  { name: 'Rent', icon: Home, color: '#38bdf8' },
  { name: 'Transportation', icon: Car, color: '#f87171' },
  { name: 'Entertainment', icon: Ticket, color: '#c084fc' },
  { name: 'Dining', icon: UtensilsCrossed, color: '#facc15' },
  { name: 'Shopping', icon: ShoppingBag, color: '#a78bfa' },
  { name: 'Travel', icon: Plane, color: '#22d3ee' },
  { name: 'Education', icon: BookOpen, color: '#34d399' },
  { name: 'Healthcare', icon: HeartPulse, color: '#fb7185' },
  { name: 'Insurance', icon: Shield, color: '#60a5fa' },
  { name: 'Personal Care', icon: Smile, color: '#e879f9' },
  { name: 'Investments', icon: TrendingUp, color: '#a3e635' },
  { name: 'Other', icon: MoreHorizontal, color: '#9ca3af' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: '1', description: 'Weekly groceries', amount: 75.50, date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), category: 'Groceries' },
  { id: '2', description: 'Electricity bill', amount: 120.00, date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), category: 'Utilities' },
  { id: '3', description: 'Dinner with friends', amount: 55.20, date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), category: 'Dining' },
  { id: '4', description: 'New pair of shoes', amount: 99.99, date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), category: 'Shopping' },
  { id: '5', description: 'Monthly rent', amount: 1200.00, date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), category: 'Rent' },
  { id: '6', description: 'Gas for car', amount: 45.00, date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), category: 'Transportation' },
  { id: '7', description: 'Movie tickets', amount: 30.00, date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), category: 'Entertainment' },
];

export const MOCK_BUDGETS: Budget[] = CATEGORIES.map(category => {
  let amount = 200;
  if (category.name === 'Rent') amount = 1200;
  if (category.name === 'Groceries') amount = 400;
  if (category.name === 'Utilities') amount = 150;
  return { category: category.name, amount };
});

export const MOCK_BORROW_LEND: BorrowLend[] = [
  { id: 'bl1', type: 'borrow', person: 'John Doe', amount: 500, date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), status: 'Pending', dueDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd') },
  { id: 'bl2', type: 'lend', person: 'Jane Smith', amount: 250, date: format(subDays(new Date(), 15), 'yyyy-MM-dd'), status: 'Pending', dueDate: format(addMonths(new Date(), 2), 'yyyy-MM-dd') },
  { id: 'bl3', type: 'borrow', person: 'Local Bank', amount: 10000, date: format(subDays(new Date(), 90), 'yyyy-MM-dd'), status: 'Paid', dueDate: format(subDays(new Date(), 10), 'yyyy-MM-dd') },
];

export const EMI_CATEGORIES: EmiCategory[] = ['Home Loan', 'Car Loan', 'Gadget', 'Other'];

export const MOCK_EMIS: Emi[] = [
    { id: 'emi1', name: 'MacBook Pro', category: 'Gadget', amount: 250, dueDate: '5th of every month', tenure: 6 },
    { id: 'emi2', name: 'Honda Civic', category: 'Car Loan', amount: 450, dueDate: '15th of every month', tenure: 24 },
    { id: 'emi3', name: 'Apartment', category: 'Home Loan', amount: 1500, dueDate: '1st of every month', tenure: 180 },
];

export const INCOME_SOURCES: IncomeSource[] = ['Fixed Deposit', 'Recurring Deposit', 'Other'];

export const MOCK_INCOME: Income[] = [
    { id: 'inc1', source: 'Fixed Deposit', amount: 150, date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), bank: 'Capital One' },
    { id: 'inc2', source: 'Recurring Deposit', amount: 75, date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), bank: 'Chase Bank' },
];
