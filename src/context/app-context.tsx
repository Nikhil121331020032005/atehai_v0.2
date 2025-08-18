'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Expense, Budget, Currency, BorrowLend, Emi, Income, Goal, IncomeStatus } from '@/lib/types';
import { MOCK_EXPENSES, MOCK_BUDGETS, MOCK_BORROW_LEND, MOCK_EMIS, MOCK_INCOME, MOCK_GOALS } from '@/lib/data';

interface AppContextType {
  expenses: Expense[];
  budgets: Budget[];
  borrowLend: BorrowLend[];
  emis: Emi[];
  income: Income[];
  goals: Goal[];
  currency: Currency;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateBudgets: (newBudgets: Budget[]) => void;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
  addBorrowLend: (item: Omit<BorrowLend, 'id' | 'status' | 'date'>) => void;
  updateBorrowLendStatus: (id: string, status: 'Paid' | 'Pending') => void;
  deleteBorrowLend: (id: string) => void;
  addEmi: (item: Omit<Emi, 'id'>) => void;
  updateEmi: (id: string, updates: Partial<Emi>) => void;
  deleteEmi: (id: string) => void;
  payEmi: (emi: Emi) => void;
  addIncome: (item: Omit<Income, 'id'>) => void;
  deleteIncome: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateIncomeStatus: (id: string, status: IncomeStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [borrowLend, setBorrowLend] = useState<BorrowLend[]>([]);
  const [emis, setEmis] = useState<Emi[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem('budgets');
      const storedCurrency = localStorage.getItem('currency');
      const storedBorrowLend = localStorage.getItem('borrowLend');
      const storedEmis = localStorage.getItem('emis');
      const storedIncome = localStorage.getItem('income');
      const storedGoals = localStorage.getItem('goals');
      const storedExpenseArchive = localStorage.getItem('expenseArchive');
      const lastVisitedMonth = localStorage.getItem('lastVisitedMonth');

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      let currentExpenses = [];
      const expenseArchive = storedExpenseArchive ? JSON.parse(storedExpenseArchive) : {};

      if (lastVisitedMonth && lastVisitedMonth !== currentMonth) {
        // New month, archive old expenses
        const oldExpenses = localStorage.getItem('expenses');
        if (oldExpenses) {
          expenseArchive[lastVisitedMonth] = JSON.parse(oldExpenses);
          localStorage.setItem('expenseArchive', JSON.stringify(expenseArchive));
        }
        currentExpenses = []; // Start fresh
      } else {
        const storedExpenses = localStorage.getItem('expenses');
        currentExpenses = storedExpenses ? JSON.parse(storedExpenses) : MOCK_EXPENSES;
      }
      
      localStorage.setItem('lastVisitedMonth', currentMonth);
      setExpenses(currentExpenses);

      setBudgets(storedBudgets ? JSON.parse(storedBudgets) : MOCK_BUDGETS);
      setCurrency(storedCurrency ? JSON.parse(storedCurrency) : 'USD');
      setBorrowLend(storedBorrowLend ? JSON.parse(storedBorrowLend) : MOCK_BORROW_LEND);
      setEmis(storedEmis ? JSON.parse(storedEmis) : MOCK_EMIS);
      setIncome(storedIncome ? JSON.parse(storedIncome) : MOCK_INCOME);
      setGoals(storedGoals ? JSON.parse(storedGoals) : MOCK_GOALS);

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setExpenses(MOCK_EXPENSES);
      setBudgets(MOCK_BUDGETS);
      setCurrency('USD');
      setBorrowLend(MOCK_BORROW_LEND);
      setEmis(MOCK_EMIS);
      setIncome(MOCK_INCOME);
      setGoals(MOCK_GOALS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (!isLoading) localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses, isLoading]);
  useEffect(() => { if (!isLoading) localStorage.setItem('budgets', JSON.stringify(budgets)); }, [budgets, isLoading]);
  useEffect(() => { if (!isLoading) localStorage.setItem('currency', JSON.stringify(currency)); }, [currency, isLoading]);
  useEffect(() => { if (!isLoading) localStorage.setItem('borrowLend', JSON.stringify(borrowLend)); }, [borrowLend, isLoading]);
  useEffect(() => { if (!isLoading) localStorage.setItem('emis', JSON.stringify(emis)); }, [emis, isLoading]);
  useEffect(() => { if (!isLoading) localStorage.setItem('income', JSON.stringify(income)); }, [income, isLoading]);
  useEffect(() => { if (!isLoading) localStorage.setItem('goals', JSON.stringify(goals)); }, [goals, isLoading]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: new Date().toISOString() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateBudgets = (newBudgets: Budget[]) => setBudgets(newBudgets);
  const handleSetCurrency = (c: Currency) => setCurrency(c);

  // Income Management
  const addIncome = (item: Omit<Income, 'id'>) => {
    const newIncome = {
        ...item,
        id: new Date().toISOString(),
    };
    setIncome(prev => [newIncome, ...prev]);
  }

  const deleteIncome = (id: string) => setIncome(prev => prev.filter(item => item.id !== id));

  const updateIncomeStatus = (id: string, status: IncomeStatus) => {
    setIncome(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };


  // Borrow & Lend Management
  const addBorrowLend = (item: Omit<BorrowLend, 'id' | 'status' | 'date'>) => {
    const newItem: BorrowLend = {
      ...item,
      id: new Date().toISOString(),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    setBorrowLend(prev => [newItem, ...prev]);

    if (item.type === 'lend') {
        addExpense({
            description: `Lent to ${item.person}`,
            amount: item.amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Lending',
        });
    } else { // type === 'borrow'
        addIncome({
          source: 'Other',
          bank: `Borrowed from ${item.person}`,
          amount: item.amount,
          date: new Date().toISOString().split('T')[0],
          status: 'Received',
        });
    }
  };

  const updateBorrowLendStatus = (id: string, status: 'Paid' | 'Pending') => {
    const item = borrowLend.find(i => i.id === id);
    if (!item || item.status === status) return;

    setBorrowLend(prev => prev.map(i => i.id === id ? { ...i, status } : i));

    if (status === 'Paid') {
      if (item.type === 'borrow') {
        addExpense({
          description: `Repayment to ${item.person}`,
          amount: item.amount,
          date: new Date().toISOString().split('T')[0],
          category: 'Lending',
        });
      } else { // type === 'lend'
        addExpense({
          description: `Repayment from ${item.person}`,
          amount: -item.amount, // Negative expense to offset the original loan
          date: new Date().toISOString().split('T')[0],
          category: 'Lending'
        });
        addIncome({
          source: 'Other',
          bank: `Repayment from ${item.person}`,
          amount: item.amount,
          date: new Date().toISOString().split('T')[0],
          status: 'Received'
        });
      }
    }
  };

  const deleteBorrowLend = (id: string) => setBorrowLend(prev => prev.filter(item => item.id !== id));

  // EMI Management
  const addEmi = (item: Omit<Emi, 'id'>) => {
    const newEmi = { ...item, id: new Date().toISOString() };
    setEmis(prev => [newEmi, ...prev]);
  };

  const updateEmi = (id: string, updates: Partial<Emi>) => {
    setEmis(prev => prev.map(emi => emi.id === id ? { ...emi, ...updates } : emi));
  };
  
  const payEmi = (emi: Emi) => {
    if (emi.tenure > 0) {
      updateEmi(emi.id, { tenure: emi.tenure - 1 });
      addExpense({
        description: `EMI for ${emi.name}`,
        amount: emi.amount,
        date: new Date().toISOString().split('T')[0],
        category: 'EMI'
      });
    }
  };

  const deleteEmi = (id: string) => setEmis(prev => prev.filter(item => item.id !== id));
  

  // Goal Management
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: new Date().toISOString() };
    setGoals(prev => [newGoal, ...prev]);
  };
  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));


  return (
    <AppContext.Provider value={{
      expenses,
      budgets,
      borrowLend,
      emis,
      income,
      goals,
      currency,
      addExpense,
      updateBudgets,
      setCurrency: handleSetCurrency,
      isLoading,
      addBorrowLend,
      updateBorrowLendStatus,
      deleteBorrowLend,
      addEmi,
      updateEmi,
      deleteEmi,
      payEmi,
      addIncome,
      deleteIncome,
      addGoal,
      updateGoal,
      deleteGoal,
      updateIncomeStatus,
    }}>
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
