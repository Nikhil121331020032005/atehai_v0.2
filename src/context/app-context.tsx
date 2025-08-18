
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Expense, Budget, Currency, BorrowLend, Emi, Income, Goal, IncomeStatus, Profile } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { CATEGORIES, MOCK_BUDGETS } from '@/lib/data';
import { format, startOfMonth, isSameMonth, parseISO } from 'date-fns';

interface AppContextType {
  expenses: Expense[];
  budgets: Budget[];
  borrowLend: BorrowLend[];
  emis: Emi[];
  income: Income[];
  goals: Goal[];
  profile: Profile | null;
  currency: Currency;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateBudgets: (newBudgets: Budget[]) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  isLoading: boolean;
  addBorrowLend: (item: Omit<BorrowLend, 'id' | 'status' | 'date'>) => Promise<void>;
  updateBorrowLendStatus: (id: string, status: 'Paid' | 'Pending') => Promise<void>;
  deleteBorrowLend: (id: string) => Promise<void>;
  addEmi: (item: Omit<Emi, 'id'>) => Promise<void>;
  updateEmi: (id: string, updates: Partial<Emi>) => Promise<void>;
  deleteEmi: (id: string) => Promise<void>;
  payEmi: (emi: Emi) => Promise<void>;
  addIncome: (item: Omit<Income, 'id'>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateIncomeStatus: (id: string, status: IncomeStatus) => Promise<void>;
  updateProfile: (data: Omit<Profile, 'email'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [borrowLend, setBorrowLend] = useState<BorrowLend[]>([]);
  const [emis, setEmis] = useState<Emi[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckedMonth, setLastCheckedMonth] = useState<string | null>(null);

  const archiveOldExpenses = useCallback(async (userId: string) => {
    const now = new Date();
    const currentMonthKey = format(now, 'yyyy-MM');

    // Prevent re-running archive for the same month
    if (lastCheckedMonth === currentMonthKey) return; 

    const userDocRef = doc(db, 'users', userId);
    const expensesColRef = collection(userDocRef, 'expenses');
    const q = query(expensesColRef);
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    let hasOldExpenses = false;

    querySnapshot.forEach(doc => {
      const expense = doc.data() as Expense;
      const expenseDate = parseISO(expense.date);
      if (!isSameMonth(now, expenseDate)) {
        hasOldExpenses = true;
        const archiveMonthKey = format(expenseDate, 'yyyy-MM');
        const archiveDocRef = doc(userDocRef, 'monthlyArchives', archiveMonthKey, 'expenses', doc.id);
        batch.set(archiveDocRef, expense);
        batch.delete(doc.ref);
      }
    });

    if (hasOldExpenses) {
      await batch.commit();
      console.log('Old expenses have been archived.');
    }
    
    // Update the last checked month
    const profileRef = doc(db, 'users', userId);
    await setDoc(profileRef, { lastCheckedMonth: currentMonthKey }, { merge: true });
    setLastCheckedMonth(currentMonthKey);

  }, [lastCheckedMonth]);


  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const dataCollections = ['expenses', 'budgets', 'borrowLend', 'emis', 'income', 'goals'];
      const setters:any = {
        expenses: setExpenses,
        budgets: setBudgets,
        borrowLend: setBorrowLend,
        emis: setEmis,
        income: setIncome,
        goals: setGoals,
      };

      const unsubscribes = dataCollections.map(col => {
        const colRef = collection(db, 'users', user.uid, col);
        return onSnapshot(colRef, snapshot => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
          setters[col](data);
        });
      });

      const userProfileUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        const data = doc.data();
        if (data) {
          setCurrency(data.currency || 'USD');
          setLastCheckedMonth(data.lastCheckedMonth || null);
          setProfile({
            email: user.email || '',
            name: data.name,
            age: data.age,
            gender: data.gender,
          })
        }
      });
      
      archiveOldExpenses(user.uid).finally(() => setIsLoading(false));
      
      return () => {
        unsubscribes.forEach(unsub => unsub());
        userProfileUnsubscribe();
      };
    } else {
      // Clear data when user logs out
      setExpenses([]);
      setBudgets([]);
      setBorrowLend([]);
      setEmis([]);
      setIncome([]);
      setGoals([]);
      setProfile(null);
      setCurrency('USD');
      setIsLoading(true);
    }
  }, [user, archiveOldExpenses]);

  const addDocForUser = async (collectionName: string, data: object) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(db, 'users', user.uid, collectionName), data);
  };
  
  const deleteDocForUser = async (collectionName: string, docId: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteDoc(doc(db, 'users', user.uid, collectionName, docId));
  }

  const updateDocForUser = async (collectionName: string, docId: string, data: object) => {
    if (!user) throw new Error("User not authenticated");
    await updateDoc(doc(db, 'users', user.uid, collectionName, docId), data);
  }
  
  const addExpense = async (expense: Omit<Expense, 'id'>) => addDocForUser('expenses', expense);

  const updateBudgets = async (newBudgets: Budget[]) => {
    if (!user) throw new Error("User not authenticated");
    const batch = writeBatch(db);
    const budgetsColRef = collection(db, 'users', user.uid, 'budgets');
    
    // First, delete all existing budget documents for the user
    const existingBudgetsSnapshot = await getDocs(budgetsColRef);
    existingBudgetsSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // Now, add the new budget documents
    newBudgets.forEach(budget => {
        const newDocRef = doc(budgetsColRef);
        batch.set(newDocRef, budget);
    });

    await batch.commit();
  };
  
  const handleSetCurrency = async (c: Currency) => {
    if (!user) throw new Error("User not authenticated");
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { currency: c });
    setCurrency(c);
  };

  // Profile Management
  const updateProfile = async (data: Omit<Profile, 'email'>) => {
    if (!user) throw new Error("User not authenticated");
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, data);
  };

  // Income Management
  const addIncome = async (item: Omit<Income, 'id'>) => addDocForUser('income', item);
  const deleteIncome = async (id: string) => deleteDocForUser('income', id);
  const updateIncomeStatus = async (id: string, status: IncomeStatus) => updateDocForUser('income', id, { status });

  // Borrow & Lend Management
  const addBorrowLend = async (item: Omit<BorrowLend, 'id' | 'status' | 'date'>) => {
    const newItem: Omit<BorrowLend, 'id'> = {
      ...item,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    await addDocForUser('borrowLend', newItem);

    if (item.type === 'lend') {
        await addExpense({
            description: `Lent to ${item.person}`,
            amount: item.amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Lending',
        });
    }
  };

  const updateBorrowLendStatus = async (id: string, status: 'Paid' | 'Pending') => {
    const item = borrowLend.find(i => i.id === id);
    if (!item || item.status === status) return;
    await updateDocForUser('borrowLend', id, { status });

    if (status === 'Paid') {
        if (item.type === 'borrow') {
          await addExpense({
            description: `Repayment to ${item.person}`,
            amount: item.amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Lending',
          });
        } else { // type === 'lend'
          await addExpense({
            description: `Repayment from ${item.person}`,
            amount: -item.amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Lending'
          });
          await addIncome({
            source: 'Other',
            bank: `Repayment from ${item.person}`,
            amount: item.amount,
            date: new Date().toISOString().split('T')[0],
            status: 'Received'
          });
        }
      }
  };

  const deleteBorrowLend = async (id: string) => deleteDocForUser('borrowLend', id);

  // EMI Management
  const addEmi = async (item: Omit<Emi, 'id'>) => addDocForUser('emis', item);
  const updateEmi = async (id: string, updates: Partial<Emi>) => updateDocForUser('emis', id, updates);
  const payEmi = async (emi: Emi) => {
    if (emi.tenure > 0) {
      await updateEmi(emi.id, { tenure: emi.tenure - 1 });
      await addExpense({
        description: `EMI for ${emi.name}`,
        amount: emi.amount,
        date: new Date().toISOString().split('T')[0],
        category: 'EMI'
      });
    }
  };
  const deleteEmi = async (id: string) => deleteDocForUser('emis', id);

  // Goal Management
  const addGoal = async (goal: Omit<Goal, 'id'>) => addDocForUser('goals', goal);
  const updateGoal = async (id: string, updates: Partial<Goal>) => updateDocForUser('goals', id, updates);
  const deleteGoal = async (id: string) => deleteDocForUser('goals', id);


  return (
    <AppContext.Provider value={{
      expenses,
      budgets,
      borrowLend,
      emis,
      income,
      goals,
      profile,
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
      updateProfile,
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
