'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search, X } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/context/app-context';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isValid } from 'date-fns';

type RecentExpensesProps = {
  expenses: Expense[];
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

// Helper function to safely format dates
const safeFormatDate = (dateString: string | null | undefined, formatStr: string): string => {
  const date = safeParseDate(dateString);
  if (!date) {
    return 'Invalid Date';
  }
  
  try {
    return format(date, formatStr);
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return 'Invalid Date';
  }
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const { currency } = useAppContext();
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filter out expenses with invalid dates first
  const validExpenses = expenses.filter(expense => safeParseDate(expense.date) !== null);

  const filteredExpenses = isSearchActive && (searchStartDate || searchEndDate)
    ? validExpenses.filter(expense => {
        const expenseDate = safeParseDate(expense.date);
        if (!expenseDate) return false;
        
        try {
          const start = searchStartDate ? startOfDay(parseISO(searchStartDate)) : null;
          const end = searchEndDate ? endOfDay(parseISO(searchEndDate)) : null;
          
          if (start && end) {
            return isWithinInterval(expenseDate, { start, end });
          } else if (start) {
            return expenseDate >= start;
          } else if (end) {
            return expenseDate <= end;
          }
          return true;
        } catch (error) {
          console.warn('Error filtering expense by date range:', expense.date, error);
          return false;
        }
      })
    : validExpenses.slice(0, 10);

  const handleSearch = () => {
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    setIsSearchActive(false);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {isSearchActive ? 'Filtered Expenses' : 'Recent Transactions'}
        </CardTitle>
        <CardDescription>
          {isSearchActive 
            ? `Found ${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? 's' : ''}`
            : 'Your last 10 expenses.'
          }
        </CardDescription>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-xs">From Date</Label>
              <Input
                id="start-date"
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-xs">To Date</Label>
              <Input
                id="end-date"
                type="date"
                value={searchEndDate}
                onChange={(e) => setSearchEndDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch} 
              size="sm" 
              className="flex-1 h-8"
              disabled={!searchStartDate && !searchEndDate}
            >
              <Search className="h-3 w-3 mr-1" />
              Search
            </Button>
            {isSearchActive && (
              <Button 
                onClick={handleClearSearch} 
                variant="outline" 
                size="sm" 
                className="h-8"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-full">
                    <CategoryIcon name={expense.category} className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category} • {safeFormatDate(expense.date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="font-medium text-right">{formatCurrency(expense.amount, currency)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-muted-foreground">
                {isSearchActive ? 'No expenses found for the selected date range.' : 'No recent expenses.'}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}