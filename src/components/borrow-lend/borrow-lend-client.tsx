
'use client';

import { useMemo, useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddBorrowLendDialog } from './add-borrow-lend-dialog';
import type { BorrowLend } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function BorrowLendClient() {
  const { borrowLend, isLoading, currency, updateBorrowLendStatus, deleteBorrowLend } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4"/>
          Add Entry
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Money Borrowed</CardTitle>
                      <CardDescription>Total outstanding: {formatCurrency(totalBorrowed, currency)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <TransactionTable 
                        items={borrowed} 
                        currency={currency} 
                        onStatusChange={updateBorrowLendStatus} 
                        onDelete={deleteBorrowLend}
                      />
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
                      <TransactionTable 
                        items={lent} 
                        currency={currency} 
                        onStatusChange={updateBorrowLendStatus}
                        onDelete={deleteBorrowLend}
                      />
                  </CardContent>
              </Card>
          </div>
      </div>
      <AddBorrowLendDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}

interface TransactionTableProps {
  items: BorrowLend[], 
  currency: string,
  onStatusChange: (id: string, status: 'Paid' | 'Pending') => void;
  onDelete: (id: string) => void;
}

function TransactionTable({ items, currency, onStatusChange, onDelete }: TransactionTableProps) {
  return (
      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {items.length > 0 ? items.map(item => (
                  <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.person}</TableCell>
                      <TableCell>{formatCurrency(item.amount, currency as any)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'Paid' ? 'secondary' : 'destructive'}
                          className="cursor-pointer"
                          onClick={() => onStatusChange(item.id, item.status === 'Pending' ? 'Paid' : 'Pending')}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(parseISO(item.dueDate), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                  </TableRow>
              )) : (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">No transactions yet.</TableCell>
                  </TableRow>
              )}
          </TableBody>
      </Table>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

    