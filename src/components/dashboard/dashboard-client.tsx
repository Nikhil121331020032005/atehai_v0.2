'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { StatsCards } from './stats-cards';
import { SpendingChart } from './spending-chart';
import { RecentExpenses } from './recent-expenses';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardClient() {
  const { expenses, budgets, isLoading } = useAppContext();

  const { totalSpent, totalBudget } = useMemo(() => {
    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    return {
      totalSpent: spent,
      totalBudget: budget,
    };
  }, [expenses, budgets]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <StatsCards
        totalSpent={totalSpent}
        totalBudget={totalBudget}
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SpendingChart expenses={expenses} />
        </div>
        <div className="lg:col-span-2">
          <RecentExpenses expenses={expenses} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Skeleton className="h-96 rounded-lg" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
