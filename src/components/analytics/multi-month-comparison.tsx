'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { format, subMonths } from 'date-fns';
import { TrendingUp, Calendar } from 'lucide-react';

export function MultiMonthComparison() {
  const { getArchivedData, currency } = useAppContext();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [monthsToShow, setMonthsToShow] = useState(6);

  useEffect(() => {
    const loadMonthlyData = async () => {
      setIsLoading(true);
      try {
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < monthsToShow; i++) {
          const monthDate = subMonths(now, i);
          const monthKey = format(monthDate, 'yyyy-MM');
          
          try {
            const archivedData = await getArchivedData(monthKey);
            if (archivedData && Object.keys(archivedData).length > 0) {
              const totalExpenses = archivedData.expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;
              const totalIncome = archivedData.income?.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0;
              
              data.push({
                month: format(monthDate, 'MMM yyyy'),
                expenses: totalExpenses,
                income: totalIncome,
                netFlow: totalIncome - totalExpenses,
                hasData: true
              });
            } else {
              data.push({
                month: format(monthDate, 'MMM yyyy'),
                expenses: 0,
                income: 0,
                netFlow: 0,
                hasData: false
              });
            }
          } catch (error) {
            data.push({
              month: format(monthDate, 'MMM yyyy'),
              expenses: 0,
              income: 0,
              netFlow: 0,
              hasData: false
            });
          }
        }
        
        setMonthlyData(data.reverse()); // Show oldest to newest
      } catch (error) {
        console.error('Error loading monthly data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthlyData();
  }, [getArchivedData, monthsToShow]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasAnyData = monthlyData.some(month => month.hasData);

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Multi-Month Comparison
          </CardTitle>
          <CardDescription>
            Compare your financial performance across multiple months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No historical data available for comparison</p>
              <p className="text-sm">Data will appear here after monthly resets</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Multi-Month Comparison
            </CardTitle>
            <CardDescription>
              Compare your financial performance across multiple months
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={monthsToShow === 3 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMonthsToShow(3)}
            >
              3 Months
            </Button>
            <Button
              variant={monthsToShow === 6 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMonthsToShow(6)}
            >
              6 Months
            </Button>
            <Button
              variant={monthsToShow === 12 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMonthsToShow(12)}
            >
              12 Months
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              stroke="#888888"
              fontSize={12}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
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
            <Bar 
              dataKey="income" 
              fill="hsl(var(--chart-1))" 
              name="Income"
              opacity={0.8}
            />
            <Bar 
              dataKey="expenses" 
              fill="hsl(var(--chart-2))" 
              name="Expenses"
              opacity={0.8}
            />
            <Bar 
              dataKey="netFlow" 
              fill="hsl(var(--chart-3))" 
              name="Net Flow"
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                monthlyData.reduce((sum, month) => sum + month.income, 0),
                currency
              )}
            </div>
            <div className="text-sm text-muted-foreground">Total Income</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                monthlyData.reduce((sum, month) => sum + month.expenses, 0),
                currency
              )}
            </div>
            <div className="text-sm text-muted-foreground">Total Expenses</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className={`text-2xl font-bold ${
              monthlyData.reduce((sum, month) => sum + month.netFlow, 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(
                monthlyData.reduce((sum, month) => sum + month.netFlow, 0),
                currency
              )}
            </div>
            <div className="text-sm text-muted-foreground">Total Net Flow</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
