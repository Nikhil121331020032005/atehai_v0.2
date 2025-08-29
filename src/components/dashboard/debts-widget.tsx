'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Liability } from '@/lib/types';

type DebtsWidgetProps = {
  liabilities: Liability[];
};

export function DebtsWidget({ liabilities }: DebtsWidgetProps) {
  const { currency } = useAppContext();
  const totalDebt = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Total Debts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt, currency)}</p>
          </div>
          
          {liabilities.length > 0 ? (
            <div className="space-y-3">
              {liabilities.slice(0, 3).map(liability => (
                <div key={liability.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{liability.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {liability.type.replace('-', ' ')}
                    </p>
                  </div>
                  <span className="font-medium text-red-600">
                    {formatCurrency(liability.currentBalance, currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No debts tracked</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}