'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Asset } from '@/lib/types';

type SavingsWidgetProps = {
  assets: Asset[];
};

export function SavingsWidget({ assets }: SavingsWidgetProps) {
  const { currency } = useAppContext();
  const totalSavings = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Savings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Savings</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings, currency)}</p>
          </div>
          
          {assets.length > 0 ? (
            <div className="space-y-3">
              {assets.slice(0, 3).map(asset => (
                <div key={asset.id} className="flex justify-between items-center">
                  <span className="font-medium text-sm">{asset.name}</span>
                  <span className="font-medium">{formatCurrency(asset.currentValue, currency)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No savings tracked</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}