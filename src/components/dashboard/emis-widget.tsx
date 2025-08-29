'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Emi } from '@/lib/types';

type EmisWidgetProps = {
  emis: Emi[];
};

export function EmisWidget({ emis }: EmisWidgetProps) {
  const { currency } = useAppContext();
  const activeEmis = emis.filter(emi => emi.tenure > 0).slice(0, 3);
  const totalMonthlyEmi = activeEmis.reduce((sum, emi) => sum + emi.amount, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          EMI Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly EMI Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalMonthlyEmi, currency)}</p>
          </div>
          
          {activeEmis.length > 0 ? (
            <div className="space-y-3">
              {activeEmis.map(emi => (
                <div key={emi.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{emi.name}</p>
                    <p className="text-xs text-muted-foreground">{emi.tenure} months left</p>
                  </div>
                  <span className="font-medium">{formatCurrency(emi.amount, currency)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No active EMIs</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}