
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Expense, Budget, Currency, BorrowLend, Emi, Income, Goal, IncomeStatus, Profile } from '@/lib/types';
import { useAuth } from './auth-context';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format, startOfMonth, isSameMonth, parseISO } from 'date-fns';
import { MOCK_BUDGETS, MOCK_EXPENSES } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
  updateBudgets: (newBudgets: Pick<Budget, 'category' | 'amount'>[]) => Promise<void>;
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
  updateProfile: (data: Partial<Omit<Profile, 'email'>>, newAvatar?: File | null) => Promise<void>;
  resetMonthlyData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [borrowLend, setBorrowLend] = useState<BorrowLend[]>([]);
  const [emis, setEmis] = useState<Emi[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);
  
  const clearState = useCallback(() => {
    setExpenses([]);
    setBudgets([]);
    setBorrowLend([]);
    setEmis([]);
    setIncome([]);
    setGoals([]);
    setProfile(null);
    setCurrency('USD');
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      clearState(); // Clear any mock data from guest session

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
          setProfile({
            email: user.email || '',
            name: data.name,
            age: data.age,
            gender: data.gender,
            avatarUrl: data.avatarUrl,
          })
        }
      });
      
      setIsLoading(false);
      
      return () => {
        unsubscribes.forEach(unsub => unsub());
        userProfileUnsubscribe();
        clearState();
      };
    } else {
      // Use mock data for logged-out users
      clearState();
      setExpenses(MOCK_EXPENSES);
      setBudgets(MOCK_BUDGETS as any);
      setIsLoading(false);
    }
  }, [user, clearState]);

  const requireAuth = (action: Function) => {
    return (...args: any[]) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in or sign up to perform this action.",
        });
        router.push('/login');
        return Promise.reject(new Error("User not authenticated"));
      }
      return action(...args);
    };
  };

  const addDocForUser = async (collectionName: string, data: object) => {
    await addDoc(collection(db, 'users', user!.uid, collectionName), data);
  };
  
  const deleteDocForUser = async (collectionName: string, docId: string) => {
    await deleteDoc(doc(db, 'users', user!.uid, collectionName, docId));
  }

  const updateDocForUser = async (collectionName: string, docId: string, data: object) => {
    await updateDoc(doc(db, 'users', user!.uid, collectionName, docId), data);
  }
  
  const addExpense = requireAuth(async (expense: Omit<Expense, 'id'>) => addDocForUser('expenses', expense));

  const updateBudgets = requireAuth(async (newBudgets: Pick<Budget, 'category' | 'amount'>[]) => {
    const batch = writeBatch(db);
    const budgetsColRef = collection(db, 'users', user!.uid, 'budgets');
    
    const existingBudgetsSnapshot = await getDocs(budgetsColRef);
    const existingBudgetsMap = new Map(existingBudgetsSnapshot.docs.map(d => [d.data().category, d.id]));

    newBudgets.forEach(budget => {
        const docId = existingBudgetsMap.get(budget.category);
        const docRef = docId ? doc(budgetsColRef, docId) : doc(budgetsColRef);
        batch.set(docRef, { category: budget.category, amount: budget.amount }, { merge: true });
    });

    await batch.commit();
  });
  
  const handleSetCurrency = requireAuth(async (c: Currency) => {
    const userDocRef = doc(db, 'users', user!.uid);
    await updateDoc(userDocRef, { currency: c });
    setCurrency(c);
  });

  const updateProfile = requireAuth(async (data: Partial<Omit<Profile, 'email'>>, newAvatar?: File | null) => {
    const userDocRef = doc(db, 'users', user!.uid);

    let avatarUrl;
    if (newAvatar) {
        const storageRef = ref(storage, `profile-pictures/${user!.uid}`);
        await uploadBytes(storageRef, newAvatar);
        avatarUrl = await getDownloadURL(storageRef);
    }
    
    const dataToUpdate: any = { ...data };
    if (avatarUrl) {
        dataToUpdate.avatarUrl = avatarUrl;
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
        await updateDoc(userDocRef, dataToUpdate);
    }
  });

  const addIncome = requireAuth(async (item: Omit<Income, 'id'>) => addDocForUser('income', item));
  const deleteIncome = requireAuth(async (id: string) => deleteDocForUser('income', id));
  const updateIncomeStatus = requireAuth(async (id: string, status: IncomeStatus) => updateDocForUser('income', id, { status }));

  const addBorrowLend = requireAuth(async (item: Omit<BorrowLend, 'id' | 'status' | 'date'>) => {
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
  });

  const updateBorrowLendStatus = requireAuth(async (id: string, status: 'Paid' | 'Pending') => {
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
      } else {
        await addIncome({
          source: 'Other',
          bank: `Repayment from ${item.person}`,
          amount: item.amount,
          date: new Date().toISOString().split('T')[0],
          status: 'Received'
        });
        // Add a negative expense to offset the original lending expense
        await addExpense({
            description: `Repayment received from ${item.person}`,
            amount: -item.amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Lending'
        });
      }
    }
  });

  const deleteBorrowLend = requireAuth(async (id: string) => deleteDocForUser('borrowLend', id));

  const addEmi = requireAuth(async (item: Omit<Emi, 'id'>) => addDocForUser('emis', item));
  const updateEmi = requireAuth(async (id: string, updates: Partial<Emi>) => updateDocForUser('emis', id, updates));
  const payEmi = requireAuth(async (emi: Emi) => {
    if (emi.tenure > 0) {
      await updateEmi(emi.id, { tenure: emi.tenure - 1 });
      await addExpense({
        description: `EMI for ${emi.name}`,
        amount: emi.amount,
        date: new Date().toISOString().split('T')[0],
        category: 'EMI'
      });
    }
  });
  const deleteEmi = requireAuth(async (id: string) => deleteDocForUser('emis', id));

  const addGoal = requireAuth(async (goal: Omit<Goal, 'id'>) => addDocForUser('goals', goal));
  const updateGoal = requireAuth(async (id: string, updates: Partial<Goal>) => updateDocForUser('goals', id, updates));
  const deleteGoal = requireAuth(async (id: string) => deleteDocForUser('goals', id));

  const resetMonthlyData = requireAuth(async () => {
    const batch = writeBatch(db);
    const collectionsToDelete = ['expenses', 'income', 'borrowLend'];

    for (const collectionName of collectionsToDelete) {
      const colRef = collection(db, 'users', user!.uid, collectionName);
      const snapshot = await getDocs(colRef);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    const goalsColRef = collection(db, 'users', user!.uid, 'goals');
    const goalsSnapshot = await getDocs(goalsColRef);
    goalsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { currentAmount: 0 });
    });

    await batch.commit();
  });

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
      resetMonthlyData,
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
