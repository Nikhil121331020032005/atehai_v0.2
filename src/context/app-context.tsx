
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import type { Expense, Budget, Currency, BorrowLend, Emi, Income, Goal, IncomeStatus, Profile } from '@/lib/types';
import type { Asset, Liability, DashboardWidget, TimeRange } from '@/lib/types';
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
  getDocs,
  getDoc,
  serverTimestamp,
  increment,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format, startOfMonth, isSameMonth, parseISO, addMonths, isFirstDayOfMonth, subMonths } from 'date-fns';
import { MOCK_BUDGETS, MOCK_EXPENSES, MOCK_BORROW_LEND, MOCK_EMIS, MOCK_INCOME, MOCK_GOALS, MOCK_ASSETS, MOCK_LIABILITIES, DEFAULT_WIDGETS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AppContextType {
  expenses: Expense[];
  budgets: Budget[];
  borrowLend: BorrowLend[];
  emis: Emi[];
  income: Income[];
  goals: Goal[];
  assets: Asset[];
  liabilities: Liability[];
  dashboardWidgets: DashboardWidget[];
  profile: Profile | null;
  currency: Currency;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addLiability: (liability: Omit<Liability, 'id'>) => Promise<void>;
  updateLiability: (id: string, updates: Partial<Liability>) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;
  updateDashboardWidgets: (widgets: DashboardWidget[]) => Promise<void>;
  updateProfile: (data: Partial<Omit<Profile, 'email'>>, newAvatar?: File | null) => Promise<void>;
  resetMonthlyData: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  getArchivedData: (month: string) => Promise<any>;
  performAutomaticMonthlyReset: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [borrowLend, setBorrowLend] = useState<BorrowLend[]>([]);
  const [emis, setEmis] = useState<Emi[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const unsubscribes = useRef<(() => void)[]>([]);

  const clearState = useCallback(() => {
    setExpenses([]);
    setBudgets([]);
    setBorrowLend([]);
    setEmis([]);
    setIncome([]);
    setGoals([]);
    setAssets([]);
    setLiabilities([]);
    setDashboardWidgets([]);
    setProfile(null);
    setCurrency('USD');
  }, []);
  
  const setupGuestData = () => {
    clearState();
    setExpenses(MOCK_EXPENSES);
    setBudgets(MOCK_BUDGETS);
    setBorrowLend(MOCK_BORROW_LEND);
    setEmis(MOCK_EMIS);
    setIncome(MOCK_INCOME);
    setGoals(MOCK_GOALS);
    setAssets(MOCK_ASSETS);
    setLiabilities(MOCK_LIABILITIES);
    setDashboardWidgets(DEFAULT_WIDGETS);
    setProfile({ email: '', isPremium: true });
    setIsDataLoading(false);
  }

  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }

    if (!user || !db) {
      if (unsubscribes.current.length > 0) {
        unsubscribes.current.forEach(unsub => unsub());
        unsubscribes.current = [];
      }
      setupGuestData();
      return;
    }
    
    if (unsubscribes.current.length > 0) {
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);

    const dataCollections = ['expenses', 'budgets', 'borrowLend', 'emis', 'income', 'goals', 'assets', 'liabilities'];
    const setters:any = {
      expenses: setExpenses,
      budgets: setBudgets,
      borrowLend: setBorrowLend,
      emis: setEmis,
      income: setIncome,
      goals: setGoals,
      assets: setAssets,
      liabilities: setLiabilities,
    };

    const newUnsubscribes = dataCollections.map(col => {
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
          isPremium: true,
          resetsThisMonth: data.resetsThisMonth || 0,
          subscriptionEndDate: data.subscriptionEndDate,
          dashboardWidgets: data.dashboardWidgets || DEFAULT_WIDGETS,
        })
        setDashboardWidgets(data.dashboardWidgets || DEFAULT_WIDGETS);
      }
      setIsDataLoading(false);
    });
    
    newUnsubscribes.push(userProfileUnsubscribe);
    unsubscribes.current = newUnsubscribes;

    return () => {
      unsubscribes.current.forEach(unsub => unsub());
      unsubscribes.current = [];
    };
  }, [user, isAuthLoading, clearState]);

  const requireAuth = (action: Function) => {
    return (...args: any[]) => {
      if (!user || !db) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in or sign up to perform this action.",
        });
        router.push('/login');
        return Promise.resolve();
      }
      return action(...args);
    };
  };

  const addDocForUser = async (collectionName: string, data: object) => {
    await addDoc(collection(db!, 'users', user!.uid, collectionName), data);
  };
  
  const deleteDocForUser = async (collectionName: string, docId: string) => {
    await deleteDoc(doc(db!, 'users', user!.uid, collectionName, docId));
  }

  const updateDocForUser = async (collectionName: string, docId: string, data: object) => {
    await updateDoc(doc(db!, 'users', user!.uid, collectionName, docId), data);
  }
  
  const addExpense = requireAuth(async (expense: Omit<Expense, 'id'>) => addDocForUser('expenses', expense));
  const deleteExpense = requireAuth(async (id: string) => deleteDocForUser('expenses', id));

  const updateBudgets = requireAuth(async (newBudgets: Pick<Budget, 'category' | 'amount'>[]) => {
    const batch = writeBatch(db!);
    const budgetsColRef = collection(db!, 'users', user!.uid, 'budgets');
    
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
    const userDocRef = doc(db!, 'users', user!.uid);
    await updateDoc(userDocRef, { currency: c });
    setCurrency(c);
  });

  const updateProfile = requireAuth(async (data: Partial<Omit<Profile, 'email'>>, newAvatar?: File | null) => {
    const userDocRef = doc(db!, 'users', user!.uid);

    let avatarUrl;
    if (newAvatar && storage) {
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

  const addAsset = requireAuth(async (asset: Omit<Asset, 'id'>) => addDocForUser('assets', asset));
  const updateAsset = requireAuth(async (id: string, updates: Partial<Asset>) => updateDocForUser('assets', id, updates));
  const deleteAsset = requireAuth(async (id: string) => deleteDocForUser('assets', id));

  const addLiability = requireAuth(async (liability: Omit<Liability, 'id'>) => addDocForUser('liabilities', liability));
  const updateLiability = requireAuth(async (id: string, updates: Partial<Liability>) => updateDocForUser('liabilities', id, updates));
  const deleteLiability = requireAuth(async (id: string) => deleteDocForUser('liabilities', id));

  const updateDashboardWidgets = requireAuth(async (widgets: DashboardWidget[]) => {
    const userDocRef = doc(db!, 'users', user!.uid);
    await updateDoc(userDocRef, { dashboardWidgets: widgets });
    setDashboardWidgets(widgets);
  });

  const resetMonthlyData = requireAuth(async () => {
    if (!profile) return;
    
    if (!profile.isPremium) {
        if (profile.resetsThisMonth && profile.resetsThisMonth >= 2) {
            toast({
                variant: 'destructive',
                title: 'Reset Limit Reached',
                description: 'You have reached the monthly limit for data resets. Upgrade to premium for unlimited resets.',
            });
            return;
        }
    }

    const batch = writeBatch(db!);
    const collectionsToDelete = ['expenses', 'income', 'borrowLend', 'assets', 'liabilities'];

    for (const collectionName of collectionsToDelete) {
      const colRef = collection(db!, 'users', user!.uid, collectionName);
      const snapshot = await getDocs(colRef);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    const goalsColRef = collection(db!, 'users', user!.uid, 'goals');
    const goalsSnapshot = await getDocs(goalsColRef);
    goalsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { currentAmount: 0 });
    });

    const userDocRef = doc(db!, 'users', user!.uid);
    batch.update(userDocRef, { resetsThisMonth: increment(1) });

    await batch.commit();
  });

  // Automatic monthly reset functionality
  const performAutomaticMonthlyReset = requireAuth(async () => {
    if (!user || !db) return;

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const lastMonthKey = format(lastMonth, 'yyyy-MM');
    
    // Check if we've already processed this month
    const userDocRef = doc(db, 'users', user.uid);
    const archiveQuery = query(collection(db, 'users', user.uid, 'monthlyArchives'), where('month', '==', lastMonthKey));
    const archiveSnapshot = await getDocs(archiveQuery);
    
    if (!archiveSnapshot.empty) {
      return; // Already processed this month
    }

    // Check if there's any data to archive
    let hasDataToArchive = false;
    const collectionsToArchive = ['expenses', 'income', 'borrowLend', 'assets', 'liabilities'];
    
    for (const collectionName of collectionsToArchive) {
      const colRef = collection(db, 'users', user.uid, collectionName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        hasDataToArchive = true;
        break;
      }
    }

    // If no data to archive, just reset the counter
    if (!hasDataToArchive) {
      await updateDoc(userDocRef, { resetsThisMonth: 0 });
      return;
    }

    // Archive last month's data
    const batch = writeBatch(db);
    
    for (const collectionName of collectionsToArchive) {
      const colRef = collection(db, 'users', user.uid, collectionName);
      const snapshot = await getDocs(colRef);
      
      if (!snapshot.empty) {
        // Create archive entry
        const archiveRef = doc(collection(db, 'users', user.uid, 'monthlyArchives'));
        batch.set(archiveRef, {
          month: lastMonthKey,
          collection: collectionName,
          data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          archivedAt: serverTimestamp(),
        });
        
        // Delete current data
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
      }
    }

    // Reset goals current amounts
    const goalsColRef = collection(db, 'users', user.uid, 'goals');
    const goalsSnapshot = await getDocs(goalsColRef);
    goalsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { currentAmount: 0 });
    });

    // Reset the resetsThisMonth counter
    batch.update(userDocRef, { resetsThisMonth: 0 });

    await batch.commit();
    
    toast({
      title: 'Monthly Reset Complete',
      description: `Your ${format(lastMonth, 'MMMM yyyy')} data has been archived and current month data has been reset.`,
    });
  });

  // Check for automatic monthly reset on app load and daily
  useEffect(() => {
    if (!user || !db) return;

    const checkAndPerformMonthlyReset = async () => {
      const now = new Date();
      
      // Check if it's the first day of the month
      if (isFirstDayOfMonth(now)) {
        // Check if we've already processed today
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();
        const lastResetDate = userData?.lastAutomaticReset;
        
        if (lastResetDate) {
          const lastReset = new Date(lastResetDate);
          const today = new Date();
          
          // If we've already reset today, don't do it again
          if (format(lastReset, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
            return;
          }
        }
        
        await performAutomaticMonthlyReset();
        
        // Update the last reset date
        await updateDoc(userDocRef, { lastAutomaticReset: now.toISOString() });
      }
    };

    // Check immediately on load
    checkAndPerformMonthlyReset();

    // Set up daily check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const dailyCheck = setTimeout(() => {
      checkAndPerformMonthlyReset();
      
      // Set up recurring daily check
      const dailyInterval = setInterval(checkAndPerformMonthlyReset, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(dailyCheck);
  }, [user, db, performAutomaticMonthlyReset]);
  
  const upgradeToPremium = requireAuth(async () => {
    const userDocRef = doc(db!, 'users', user!.uid);
    await updateDoc(userDocRef, { isPremium: true });
    toast({ title: "Success", description: "You are now a premium user." });
  });

  const getArchivedData = requireAuth(async (month: string) => {
    if (!user || !db) return null;
    
    try {
      // Validate month format before querying
      if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
        console.warn('Invalid month format for archive query:', month);
        return {};
      }

      // 1) Preferred: doc ID is the month key (YYYY-MM) and contains arrays directly
      const monthDocRef = doc(db, 'users', user.uid, 'monthlyArchives', month);
      const monthDocSnap = await getDoc(monthDocRef);
      if (monthDocSnap.exists()) {
        const data = monthDocSnap.data() as any;
        const result: any = {};
        if (Array.isArray(data.expenses)) result.expenses = data.expenses;
        if (Array.isArray(data.income)) result.income = data.income;
        if (Array.isArray(data.borrowLend)) result.borrowLend = data.borrowLend;
        if (Array.isArray(data.assets)) result.assets = data.assets;
        if (Array.isArray(data.liabilities)) result.liabilities = data.liabilities;
        if (Object.keys(result).length > 0) return result;
      }

      // 2) Legacy/fallback: multiple docs with shape { month, collection, data: [] }
      const archiveQuery = query(collection(db, 'users', user.uid, 'monthlyArchives'), where('month', '==', month));
      const archiveSnapshot = await getDocs(archiveQuery);

      const archivedData: any = {};
      archiveSnapshot.docs.forEach(d => {
        try {
          const data = d.data();
          if (data.collection && Array.isArray(data.data)) {
            archivedData[data.collection] = data.data;
          }
        } catch (error) {
          console.warn('Error processing archived document:', d.id, error);
        }
      });

      return archivedData;
    } catch (error) {
      console.error('Error getting archived data:', error);
      return {};
    }
  });


  return (
    <AppContext.Provider value={{
      expenses,
      budgets,
      borrowLend,
      emis,
      income,
      goals,
      assets,
      liabilities,
      dashboardWidgets,
      profile,
      currency,
      addExpense,
      deleteExpense,
      updateBudgets,
      setCurrency: handleSetCurrency,
      isLoading: isAuthLoading || isDataLoading,
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
      addAsset,
      updateAsset,
      deleteAsset,
      addLiability,
      updateLiability,
      deleteLiability,
      updateDashboardWidgets,
      updateProfile,
      resetMonthlyData,
      upgradeToPremium,
      getArchivedData,
      performAutomaticMonthlyReset,
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
