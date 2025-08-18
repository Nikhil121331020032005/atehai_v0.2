'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Expense, Income } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

type ChartProps = {
  expenses: Expense[];
  income: Income[];
};

export function IncomeVsExpenseChart({ expenses, income }: ChartProps) {
  const { currency } = useAppContext();

  const data = useMemo(() => {
    const monthlyData: { [key: string]: { name: string; income: number; expenses: number } } = {};
    const now = new Date();
    const daysInMonth = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });

    daysInMonth.forEach(day => {
      const dayStr = format(day, 'MMM dd');
      monthlyData[dayStr] = { name: dayStr, income: 0, expenses: 0 };
    });
    
    income.forEach(item => {
      const dayStr = format(new Date(item.date), 'MMM dd');
      if (monthlyData[dayStr]) {
        monthlyData[dayStr].income += item.amount;
      }
    });

    expenses.forEach(expense => {
      const dayStr = format(new Date(expense.date), 'MMM dd');
      if (monthlyData[dayStr]) {
        monthlyData[dayStr].expenses += expense.amount;
      }
    });
    
    return Object.values(monthlyData);
  }, [expenses, income]);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>An overview of your cash flow for the current month.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
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
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number, name: string) => [formatCurrency(value, currency), name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-muted-foreground">No data to display yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
