'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Asset, Liability } from '@/lib/types';

type NetWorthWidgetProps = {
  assets: Asset[];
  liabilities: Liability[];
};

export function NetWorthWidget({ assets, liabilities }: NetWorthWidgetProps) {
  const { currency } = useAppContext();

  const { totalAssets, totalLiabilities, netWorth, assetGrowth } = useMemo(() => {
    const assetsValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const liabilitiesValue = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
    const net = assetsValue - liabilitiesValue;
    
    // Calculate growth from purchase values
    const totalPurchaseValue = assets.reduce((sum, asset) => sum + (asset.purchaseValue || asset.currentValue), 0);
    const growth = totalPurchaseValue > 0 ? ((assetsValue - totalPurchaseValue) / totalPurchaseValue) * 100 : 0;
    
    return {
      totalAssets: assetsValue,
      totalLiabilities: liabilitiesValue,
      netWorth: net,
      assetGrowth: growth,
    };
  }, [assets, liabilities]);

  const assetAllocation = useMemo(() => {
    if (totalAssets === 0) return [];
    
    const allocation = assets.reduce((acc, asset) => {
      const type = asset.type;
      acc[type] = (acc[type] || 0) + asset.currentValue;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(allocation).map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalAssets) * 100,
    }));
  }, [assets, totalAssets]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Net Worth Overview
        </CardTitle>
        <CardDescription>Your total financial position</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalAssets, currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilities, currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth, currency)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Asset Growth</span>
            <div className="flex items-center gap-1">
              {assetGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${assetGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {assetGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <Progress value={Math.min(Math.abs(assetGrowth), 100)} className="h-2" />
        </div>

        {assetAllocation.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Asset Allocation</h4>
            {assetAllocation.slice(0, 3).map(({ type, percentage }) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="capitalize">{type.replace('-', ' ')}</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}