'use client';

import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export function IncomeClient() {
  const { income, isLoading, currency } = useAppContext();

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-muted-foreground">Track your income from various sources.</h2>
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>A log of your earnings from bank schemes and other sources.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {income.length > 0 ? (
                income.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.source}</TableCell>
                    <TableCell>{item.bank}</TableCell>
                    <TableCell>{format(parseISO(item.date), 'PPP')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount, currency)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No income recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-72" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
