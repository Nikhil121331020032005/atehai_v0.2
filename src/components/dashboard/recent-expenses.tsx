'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

type RecentExpensesProps = {
  expenses: Expense[];
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = expenses.slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your last 10 expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    <CategoryIcon name={expense.category} className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{expense.category}</p>
                  </div>
                  <div className="font-medium text-right">{formatCurrency(expense.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[350px] items-center justify-center">
              <p className="text-muted-foreground">No recent expenses.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
