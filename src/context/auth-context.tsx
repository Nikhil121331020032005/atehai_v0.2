
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup'];

const createInitialUserData = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const batch = writeBatch(db);
        
        // Set up the main user document with default profile info
        batch.set(userDocRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            currency: 'USD',
        });

        // Set up default budgets in the 'budgets' subcollection
        const budgetsColRef = collection(userDocRef, 'budgets');
        MOCK_BUDGETS.forEach(budget => {
            const newBudgetRef = doc(budgetsColRef);
            batch.set(newBudgetRef, budget);
        });
        
        // Add other initial collections if needed (e.g., empty expenses)
        // For now, we'll let them be created on first use.

        await batch.commit();
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        createInitialUserData(user);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && isPublicRoute) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);


  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if(userCredential.user) {
      await createInitialUserData(userCredential.user);
    }
    return userCredential;
  }

  const logout = () => {
    return signOut(auth);
  }

  const value = { user, isLoading, login, signup, logout };

  if (isLoading || (!user && !publicRoutes.includes(pathname))) {
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
