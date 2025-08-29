'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Asset, Liability } from '@/lib/types';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';

type NetWorthChartProps = {
  assets: Asset[];
  liabilities: Liability[];
};

export function NetWorthChart({ assets, liabilities }: NetWorthChartProps) {
  const { currency } = useAppContext();

  const data = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 11),
      end: now,
    });

    return months.map(month => {
      // For demo purposes, we'll simulate historical data
      // In a real app, you'd store historical snapshots
      const monthFactor = Math.random() * 0.1 + 0.95; // Simulate some variation
      
      const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue, 0) * monthFactor;
      const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0) * monthFactor;
      
      return {
        name: format(month, 'MMM yyyy'),
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
      };
    });
  }, [assets, liabilities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Growth</CardTitle>
        <CardDescription>Track your financial progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value as number, currency).replace(/(\.00|,\d*)$/, '')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value, currency), 
                name === 'netWorth' ? 'Net Worth' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="assets"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="liabilities"
              stackId="2"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}