'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Expense, Budget, Currency, BorrowLend, Emi, Income } from '@/lib/types';
import { MOCK_EXPENSES, MOCK_BUDGETS, MOCK_BORROW_LEND, MOCK_EMIS, MOCK_INCOME } from '@/lib/data';

interface AppContextType {
  expenses: Expense[];
  budgets: Budget[];
  borrowLend: BorrowLend[];
  emis: Emi[];
  income: Income[];
  currency: Currency;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateBudgets: (newBudgets: Budget[]) => void;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [borrowLend, setBorrowLend] = useState<BorrowLend[]>([]);
  const [emis, setEmis] = useState<Emi[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      const storedBudgets = localStorage.getItem('budgets');
      const storedCurrency = localStorage.getItem('currency');
      const storedBorrowLend = localStorage.getItem('borrowLend');
      const storedEmis = localStorage.getItem('emis');
      const storedIncome = localStorage.getItem('income');

      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : MOCK_EXPENSES);
      setBudgets(storedBudgets ? JSON.parse(storedBudgets) : MOCK_BUDGETS);
      setCurrency(storedCurrency ? JSON.parse(storedCurrency) : 'USD');
      setBorrowLend(storedBorrowLend ? JSON.parse(storedBorrowLend) : MOCK_BORROW_LEND);
      setEmis(storedEmis ? JSON.parse(storedEmis) : MOCK_EMIS);
      setIncome(storedIncome ? JSON.parse(storedIncome) : MOCK_INCOME);

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setExpenses(MOCK_EXPENSES);
      setBudgets(MOCK_BUDGETS);
      setCurrency('USD');
      setBorrowLend(MOCK_BORROW_LEND);
      setEmis(MOCK_EMIS);
      setIncome(MOCK_INCOME);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('borrowLend', JSON.stringify(borrowLend));
  }, [borrowLend, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('emis', JSON.stringify(emis));
  }, [emis, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('income', JSON.stringify(income));
  }, [income, isLoading]);


  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: new Date().toISOString() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
  };
  
  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
  };

  return (
    <AppContext.Provider value={{ expenses, budgets, borrowLend, emis, income, currency, addExpense, updateBudgets, setCurrency: handleSetCurrency, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
