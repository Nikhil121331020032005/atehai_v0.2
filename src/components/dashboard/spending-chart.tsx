'use client';

import { useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
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
        value: total,
        fill: CATEGORIES.find(c => c.name === name)?.color || '#9ca3af',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);
  
  const handlePieClick = (data: any) => {
    if (data && data.name) {
      router.push(`/expenses/${data.name}`);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Category Spending</CardTitle>
        <CardDescription>A pie-chart view of your expenses. Click a slice for details.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                onClick={handlePieClick}
                labelLine={false}
                label={({ name, percent, value }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="cursor-pointer" />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number) => [formatCurrency(value, currency), 'Total Spent']}
              />
            </PieChart>
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
