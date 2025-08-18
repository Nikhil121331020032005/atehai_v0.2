'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons';
import { CATEGORIES } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

export default function CategoryDetailPage() {
  const params = useParams();
  const { expenses, isLoading, currency } = useAppContext();
  const categoryName = decodeURIComponent(params.category as string);

  const categoryDetails = useMemo(() => {
    return CATEGORIES.find(cat => cat.name === categoryName);
  }, [categoryName]);

  const categoryExpenses = useMemo(() => {
    return expenses
      .filter(expense => expense.category === categoryName)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [expenses, categoryName]);

  const totalSpent = useMemo(() => {
    return categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [categoryExpenses]);

  if (isLoading) {
    return (
       <AppLayout pageTitle="Category Details">
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-64" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </AppLayout>
    );
  }

  if (!categoryDetails) {
    return (
      <AppLayout pageTitle="Error">
        <p>Category not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={`Category: ${categoryName}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <CategoryIcon name={categoryDetails.name} className="h-10 w-10 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">{categoryDetails.name}</h1>
            <p className="text-muted-foreground">
              Total spent: {formatCurrency(totalSpent, currency)}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>All transactions for {categoryName}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryExpenses.length > 0 ? (
                  categoryExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{format(parseISO(expense.date), 'PPP')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount, currency)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No expenses in this category yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
