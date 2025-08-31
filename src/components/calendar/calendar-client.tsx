'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons';
import { format, parseISO, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { CalendarDays, Calculator } from 'lucide-react';
import type { Expense } from '@/lib/types';

export function CalendarClient() {
  const { expenses, currency, isLoading } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isRangeMode, setIsRangeMode] = useState(false);

  const expensesByDate = useMemo(() => {
    const grouped: { [key: string]: Expense[] } = {};
    expenses.forEach(expense => {
      const dateKey = expense.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    return grouped;
  }, [expenses]);

  const selectedDateExpenses = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return expensesByDate[dateKey] || [];
  }, [selectedDate, expensesByDate]);

  const rangeExpenses = useMemo(() => {
    if (!isRangeMode || !dateRange.from || !dateRange.to) return [];
    
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      });
    });
  }, [isRangeMode, dateRange, expenses]);

  const rangeTotalAmount = useMemo(() => {
    return rangeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [rangeExpenses]);

  const selectedDateTotal = useMemo(() => {
    return selectedDateExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [selectedDateExpenses]);

  const getDayExpenseTotal = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayExpenses = expensesByDate[dateKey] || [];
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (isRangeMode) {
      if (!dateRange.from || (dateRange.from && dateRange.to) || !date) {
        setDateRange({ from: date, to: undefined });
      } else if (date >= dateRange.from) {
        setDateRange({ from: dateRange.from, to: date });
      } else {
        setDateRange({ from: date, to: undefined });
      }
    } else {
      setSelectedDate(date);
    }
  };

  const toggleMode = () => {
    setIsRangeMode(!isRangeMode);
    setDateRange({ from: undefined, to: undefined });
    setSelectedDate(new Date());
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Expense Calendar</h2>
          <p className="text-muted-foreground">
            {isRangeMode 
              ? 'Select a date range to view expenses between those days'
              : 'Click on any date to view expenses for that day'
            }
          </p>
        </div>
        <Button onClick={toggleMode} variant="outline">
          {isRangeMode ? (
            <>
              <CalendarDays className="mr-2 h-4 w-4" />
              Single Day Mode
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Date Range Mode
            </>
          )}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {isRangeMode ? 'Select Date Range' : 'Select Date'}
            </CardTitle>
            <CardDescription>
              {isRangeMode 
                ? 'Click to select start and end dates'
                : 'Click on a date to view expenses'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode={isRangeMode ? "range" : "single"}
              selected={isRangeMode ? dateRange : selectedDate}
              onSelect={handleDateSelect as any}
              className="rounded-md border"
              modifiers={{
                hasExpenses: (date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  return (expensesByDate[dateKey]?.length || 0) > 0;
                }
              }}
              modifiersStyles={{
                hasExpenses: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold',
                }
              }}
            />
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                <span>Days with expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isRangeMode ? 'Range Summary' : 'Daily Summary'}
            </CardTitle>
            <CardDescription>
              {isRangeMode 
                ? dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`
                  : 'Select a date range to see summary'
                : selectedDate 
                  ? format(selectedDate, 'PPP')
                  : 'Select a date to see expenses'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRangeMode ? (
              <div className="space-y-4">
                {dateRange.from && dateRange.to ? (
                  <>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold">{formatCurrency(rangeTotalAmount, currency)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rangeExpenses.length} transaction{rangeExpenses.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {rangeExpenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <CategoryIcon name={expense.category} className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{expense.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(expense.date), 'MMM dd')} • {expense.category}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">{formatCurrency(expense.amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {!dateRange.from 
                        ? 'Select a start date to begin'
                        : 'Select an end date to complete the range'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDate && selectedDateExpenses.length > 0 ? (
                  <>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total for {format(selectedDate, 'MMM dd')}</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedDateTotal, currency)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedDateExpenses.length} transaction{selectedDateExpenses.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedDateExpenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <CategoryIcon name={expense.category} className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{expense.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="font-medium">{formatCurrency(expense.amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {selectedDate 
                        ? 'No expenses recorded for this date'
                        : 'Select a date to view expenses'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isRangeMode && dateRange.from && dateRange.to && rangeExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Expenses by category for the selected date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(
                rangeExpenses.reduce((acc, expense) => {
                  acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([,a], [,b]) => b - a)
                .map(([category, total]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={category as any} className="h-5 w-5" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(total, currency)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}