'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

export function BorrowLendClient() {
  const { borrowLend, isLoading, currency } = useAppContext();

  const { borrowed, lent } = useMemo(() => {
    const borrowed = borrowLend.filter(item => item.type === 'borrow');
    const lent = borrowLend.filter(item => item.type === 'lend');
    return { borrowed, lent };
  }, [borrowLend]);
  
  const totalBorrowed = useMemo(() => borrowed.filter(i => i.status === 'Pending').reduce((sum, item) => sum + item.amount, 0), [borrowed]);
  const totalLent = useMemo(() => lent.filter(i => i.status === 'Pending').reduce((sum, item) => sum + item.amount, 0), [lent]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Money Borrowed</CardTitle>
                    <CardDescription>Total outstanding: {formatCurrency(totalBorrowed, currency)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionTable items={borrowed} currency={currency} />
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Money Lent</CardTitle>
                    <CardDescription>Total pending: {formatCurrency(totalLent, currency)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionTable items={lent} currency={currency} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

function TransactionTable({ items, currency }: { items: any[], currency: string }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.length > 0 ? items.map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.person}</TableCell>
                        <TableCell>{formatCurrency(item.amount, currency as any)}</TableCell>
                        <TableCell><Badge variant={item.status === 'Paid' ? 'secondary' : 'destructive'}>{item.status}</Badge></TableCell>
                        <TableCell>{format(parseISO(item.dueDate), 'PPP')}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No transactions yet.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

function PageSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
