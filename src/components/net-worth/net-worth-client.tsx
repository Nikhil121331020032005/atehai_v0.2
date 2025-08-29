'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AssetsTable } from './assets-table';
import { LiabilitiesTable } from './liabilities-table';
import { NetWorthChart } from './net-worth-chart';
import { AddAssetDialog } from './add-asset-dialog';
import { AddLiabilityDialog } from './add-liability-dialog';

export function NetWorthClient() {
  const { assets, liabilities, currency, isLoading } = useAppContext();
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isLiabilityDialogOpen, setIsLiabilityDialogOpen] = useState(false);

  const { totalAssets, totalLiabilities, netWorth, assetGrowth } = useMemo(() => {
    const assetsValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const liabilitiesValue = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
    const net = assetsValue - liabilitiesValue;
    
    const totalPurchaseValue = assets.reduce((sum, asset) => sum + (asset.purchaseValue || asset.currentValue), 0);
    const growth = totalPurchaseValue > 0 ? ((assetsValue - totalPurchaseValue) / totalPurchaseValue) * 100 : 0;
    
    return {
      totalAssets: assetsValue,
      totalLiabilities: liabilitiesValue,
      netWorth: net,
      assetGrowth: growth,
    };
  }, [assets, liabilities]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAssets, currency)}</div>
            <p className="text-xs text-muted-foreground">
              Growth: {assetGrowth >= 0 ? '+' : ''}{assetGrowth.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities, currency)}</div>
            <p className="text-xs text-muted-foreground">Outstanding debts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            {netWorth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Assets - Liabilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Net Worth Chart */}
      <NetWorthChart assets={assets} liabilities={liabilities} />

      {/* Assets and Liabilities Tables */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Your Assets</h3>
              <p className="text-sm text-muted-foreground">Track your investments and valuable possessions</p>
            </div>
            <Button onClick={() => setIsAssetDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
          <AssetsTable assets={assets} />
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Your Liabilities</h3>
              <p className="text-sm text-muted-foreground">Manage your debts and outstanding balances</p>
            </div>
            <Button onClick={() => setIsLiabilityDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Liability
            </Button>
          </div>
          <LiabilitiesTable liabilities={liabilities} />
        </TabsContent>
      </Tabs>

      <AddAssetDialog isOpen={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen} />
      <AddLiabilityDialog isOpen={isLiabilityDialogOpen} onOpenChange={setIsLiabilityDialogOpen} />
    </div>
  );
}