'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/data';
import { useAppContext } from '@/context/app-context';
import { useRouter } from 'next/navigation';

type SpendingChartProps = {
  expenses: Expense[];
};

export function SpendingChart({ expenses }: SpendingChartProps) {
  const { currency } = useAppContext();
  const router = useRouter();

  const data = useMemo(() => {
    const categorySpending = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categorySpending)
      .map(([name, total]) => ({
        name,
        total,
        fill: CATEGORIES.find(c => c.name === name)?.color || '#9ca3af',
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);
  
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const categoryName = data.activePayload[0].payload.name;
      router.push(`/expenses/${categoryName}`);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>An overview of your expenses this month. Click a bar for details.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
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
                cursor={{ fill: 'hsl(var(--muted))', cursor: 'pointer' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number) => [formatCurrency(value, currency), 'Total Spent']}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-muted-foreground">No expenses to display yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
