'use client';

import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Expense, Income, TimeRange } from '@/lib/types';
import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  isValid
} from 'date-fns';

type TrendsChartProps = {
  expenses: Expense[];
  income: Income[];
};

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

export function TrendsChart({ expenses, income }: TrendsChartProps) {
  const { currency } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const data = useMemo(() => {
    const now = new Date();
    let intervals: Date[] = [];
    let formatStr = '';

    switch (timeRange) {
      case 'weekly':
        intervals = eachDayOfInterval({ 
          start: startOfWeek(now), 
          end: endOfWeek(now) 
        });
        formatStr = 'EEE';
        break;
      case 'monthly':
        intervals = eachDayOfInterval({ 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        });
        formatStr = 'MMM dd';
        break;
      case 'yearly':
        intervals = eachMonthOfInterval({ 
          start: startOfYear(now), 
          end: endOfYear(now) 
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
  }, [expenses, income, timeRange]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Financial Trends</CardTitle>
          <div className="flex gap-1">
            {(['weekly', 'monthly', 'yearly'] as TimeRange[]).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
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
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))' }}
            />
            <Line 
              type="monotone" 
              dataKey="netFlow" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-3))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}