'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { DollarSign, Target, TrendingDown } from 'lucide-react';
import type { Expense, Budget } from '@/lib/types';

type BudgetOverviewProps = {
  expenses: Expense[];
  budgets: Budget[];
};

export function BudgetOverview({ expenses, budgets }: BudgetOverviewProps) {
  const { currency } = useAppContext();

  const { totalSpent, totalBudget, remainingBudget } = useMemo(() => {
    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const remaining = budget - spent;

    return {
      totalSpent: spent,
      totalBudget: budget,
      remainingBudget: remaining,
    };
  }, [expenses, budgets]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent, currency)}</div>
          <p className="text-xs text-muted-foreground">this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget, currency)}</div>
          <p className="text-xs text-muted-foreground">for this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remainingBudget, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {remainingBudget >= 0 ? 'under budget' : 'over budget'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}