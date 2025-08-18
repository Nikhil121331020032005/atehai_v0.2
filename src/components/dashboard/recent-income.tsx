'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Income } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Landmark } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/context/app-context';
import { format, parseISO } from 'date-fns';

type RecentIncomeProps = {
  income: Income[];
};

export function RecentIncome({ income }: RecentIncomeProps) {
  const { currency } = useAppContext();
  const recentIncome = income.slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Income</CardTitle>
        <CardDescription>Your last 10 income transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {recentIncome.length > 0 ? (
            <div className="space-y-4">
              {recentIncome.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    <Landmark className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{item.source}</p>
                    <p className="text-xs text-muted-foreground">{item.bank} on {format(parseISO(item.date), 'PPP')}</p>
                  </div>
                  <div className="font-medium text-right text-green-600">
                    +{formatCurrency(item.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[350px] items-center justify-center">
              <p className="text-muted-foreground">No recent income.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
