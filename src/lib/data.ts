import type { Category, Expense, Budget, CategoryName, BorrowLend, Emi, Income, EmiCategory, IncomeSource, Goal } from './types';
import type { Asset, Liability, DashboardWidget } from './types';
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
  HandCoins,
  Receipt,
  Target,
  Briefcase,
  PenTool,
  School,
  Activity,
  Landmark,
  PiggyBank
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
  { name: 'Lending', icon: HandCoins, color: '#f472b6' },
  { name: 'EMI', icon: Receipt, color: '#6ee7b7' },
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
  if (category.name === 'Lending') amount = 300;
  if (category.name === 'EMI') amount = 800;
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

export const INCOME_SOURCES: IncomeSource[] = ['Salary', 'Freelance', 'Internship', 'Investments', 'Fixed Deposit', 'Recurring Deposit', 'Other'];

export const MOCK_INCOME: Income[] = [
    { id: 'inc1', source: 'Fixed Deposit', amount: 150, date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), bank: 'Capital One', status: 'Received' },
    { id: 'inc2', source: 'Recurring Deposit', amount: 75, date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), bank: 'Chase Bank', status: 'Received' },
    { id: 'inc3', source: 'Salary', amount: 5000, date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), bank: 'Bank of America', status: 'Pending' },
];

export const MOCK_GOALS: Goal[] = [
    { id: 'goal1', name: 'Vacation to Hawaii', targetAmount: 5000, currentAmount: 1200, deadline: format(addMonths(new Date(), 12), 'yyyy-MM-dd') },
    { id: 'goal2', name: 'New Laptop', targetAmount: 2000, currentAmount: 1800, deadline: format(addMonths(new Date(), 2), 'yyyy-MM-dd') },
    { id: 'goal3', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 7500, deadline: format(addMonths(new Date(), 24), 'yyyy-MM-dd') },
];

export const ASSET_TYPES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'gold', label: 'Gold' },
  { value: 'mutual-funds', label: 'Mutual Funds' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'other', label: 'Other' },
] as const;

export const LIABILITY_TYPES = [
  { value: 'home-loan', label: 'Home Loan' },
  { value: 'car-loan', label: 'Car Loan' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
] as const;

export const MOCK_ASSETS: Asset[] = [
  { id: 'asset1', name: 'Apple Stock', type: 'stocks', currentValue: 15000, purchaseValue: 12000, purchaseDate: '2024-01-15' },
  { id: 'asset2', name: 'Bitcoin', type: 'crypto', currentValue: 8500, purchaseValue: 7000, purchaseDate: '2024-03-10' },
  { id: 'asset3', name: 'Apartment', type: 'real-estate', currentValue: 250000, purchaseValue: 220000, purchaseDate: '2023-06-01' },
  { id: 'asset4', name: 'Emergency Fund', type: 'savings', currentValue: 10000 },
];

export const MOCK_LIABILITIES: Liability[] = [
  { id: 'liability1', name: 'Home Mortgage', type: 'home-loan', currentBalance: 180000, originalAmount: 200000, interestRate: 3.5 },
  { id: 'liability2', name: 'Car Loan', type: 'car-loan', currentBalance: 15000, originalAmount: 25000, interestRate: 4.2 },
  { id: 'liability3', name: 'Credit Card', type: 'credit-card', currentBalance: 2500, interestRate: 18.9 },
];

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'expenses', type: 'expenses', title: 'Recent Expenses', position: { x: 0, y: 0, w: 6, h: 4 }, isVisible: true },
  { id: 'spending-chart', type: 'spending-chart', title: 'Spending by Category', position: { x: 6, y: 0, w: 6, h: 4 }, isVisible: true },
  { id: 'net-worth', type: 'net-worth', title: 'Net Worth Overview', position: { x: 0, y: 4, w: 12, h: 3 }, isVisible: true },
  { id: 'goals', type: 'goals', title: 'Financial Goals', position: { x: 0, y: 7, w: 6, h: 4 }, isVisible: true },
  { id: 'emis', type: 'emis', title: 'EMI Overview', position: { x: 6, y: 7, w: 6, h: 4 }, isVisible: true },
];
