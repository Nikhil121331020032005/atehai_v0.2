
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, setDoc, getDoc, writeBatch, collection } from 'firebase/firestore';
import { MOCK_BUDGETS } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/about', '/subscription'];

const createInitialUserData = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const batch = writeBatch(db);
        
        batch.set(userDocRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            currency: 'USD',
            isPremium: false,
            resetsThisMonth: 0,
        });

        const budgetsColRef = collection(userDocRef, 'budgets');
        MOCK_BUDGETS.forEach(budget => {
            const newBudgetRef = doc(budgetsColRef);
            batch.set(newBudgetRef, budget);
        });

        await batch.commit();
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createInitialUserData(user);
        setUser(user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (user && isPublicRoute && pathname !== '/about' && pathname !== '/subscription') {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);


  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const logout = () => {
    return signOut(auth);
  }

  const handleSendPasswordResetEmail = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  }

  const value = { user, isLoading, login, signup, logout, sendPasswordResetEmail: handleSendPasswordResetEmail };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-64 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
