'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Expense, Budget } from '@/lib/types';
import { MOCK_EXPENSES, MOCK_BUDGETS } from '@/lib/data';

interface AppContextType {
  expenses: Expense[];
  budgets: Budget[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateBudgets: (newBudgets: Budget[]) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      const storedBudgets = localStorage.getItem('budgets');

      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      } else {
        setExpenses(MOCK_EXPENSES);
      }

      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        setBudgets(MOCK_BUDGETS);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setExpenses(MOCK_EXPENSES);
      setBudgets(MOCK_BUDGETS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets, isLoading]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: new Date().toISOString() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
  };

  return (
    <AppContext.Provider value={{ expenses, budgets, addExpense, updateBudgets, isLoading }}>
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
