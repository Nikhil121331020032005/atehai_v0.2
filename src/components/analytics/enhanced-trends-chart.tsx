'use client';

import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Expense, Income } from '@/lib/types';
import { 
  format, 
  parseISO, 
  eachDayOfInterval,
  eachMonthOfInterval,
  isValid
} from 'date-fns';

interface EnhancedTrendsChartProps {
  expenses: Expense[];
  income: Income[];
  dateRange: { start: Date; end: Date };
  timeRange: 'weekly' | 'monthly' | 'yearly';
  isLoading: boolean;
}

// Helper function to safely parse and validate dates
const safeParseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }
  
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Failed to parse date:', dateString, error);
    return null;
  }
};

export function EnhancedTrendsChart({ 
  expenses, 
  income, 
  dateRange, 
  timeRange,
  isLoading 
}: EnhancedTrendsChartProps) {
  const { currency } = useAppContext();

  const data = useMemo(() => {
    if (isLoading) return [];

    let intervals: Date[] = [];
    let formatStr = '';

    switch (timeRange) {
      case 'weekly':
        intervals = eachDayOfInterval({ 
          start: dateRange.start, 
          end: dateRange.end 
        });
        formatStr = 'EEE';
        break;
      case 'monthly':
        intervals = eachDayOfInterval({ 
          start: dateRange.start, 
          end: dateRange.end 
        });
        formatStr = 'MMM dd';
        break;
      case 'yearly':
        intervals = eachMonthOfInterval({ 
          start: dateRange.start, 
          end: dateRange.end 
        });
        formatStr = 'MMM';
        break;
    }

    return intervals.map(date => {
      const dayExpenses = expenses
        .filter(expense => {
          const expenseDate = safeParseDate(expense.date);
          if (!expenseDate) return false;
          
          try {
            return timeRange === 'yearly' 
              ? format(expenseDate, 'yyyy-MM') === format(date, 'yyyy-MM')
              : format(expenseDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          } catch (error) {
            console.warn('Error comparing expense date:', expense.date, error);
            return false;
          }
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      const dayIncome = income
        .filter(item => {
          const incomeDate = safeParseDate(item.date);
          if (!incomeDate) return false;
          
          try {
            return item.status === 'Received' && (
              timeRange === 'yearly' 
                ? format(incomeDate, 'yyyy-MM') === format(date, 'yyyy-MM')
                : format(incomeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
          } catch (error) {
            console.warn('Error comparing income date:', item.date, error);
            return false;
          }
        })
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        name: format(date, formatStr),
        expenses: dayExpenses,
        income: dayIncome,
        netFlow: dayIncome - dayExpenses,
      };
    });
  }, [expenses, income, dateRange, timeRange, isLoading]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
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
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))' }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))' }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="netFlow" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))' }}
                name="Net Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <p>No data available for the selected time period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}