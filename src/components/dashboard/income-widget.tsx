'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Income } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

type IncomeWidgetProps = {
  income: Income[];
};

export function IncomeWidget({ income }: IncomeWidgetProps) {
  const { currency } = useAppContext();
  
  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return income
      .filter(item => 
        item.status === 'Received' && 
        isWithinInterval(parseISO(item.date), { start: monthStart, end: monthEnd })
      )
      .reduce((sum, item) => sum + item.amount, 0);
  }, [income]);

  const recentIncome = income
    .filter(item => item.status === 'Received')
    .slice(0, 3);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Income This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome, currency)}</p>
          </div>
          
          {recentIncome.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Recent Income</h4>
              {recentIncome.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{item.source}</p>
                    <p className="text-xs text-muted-foreground">{item.bank}</p>
                  </div>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No income recorded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}