'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
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
    if (data && data.name) {
      router.push(`/expenses/${data.name}`);
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
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <XAxis 
                type="number" 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value as number, currency).replace(/(\.00|,\d*)$/, '')}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number) => [formatCurrency(value, currency), 'Total Spent']}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer">
              </Bar>
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
