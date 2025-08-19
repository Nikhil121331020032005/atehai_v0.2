
'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddIncomeDialog } from './add-income-dialog';
import { Badge } from '@/components/ui/badge';
import type { IncomeStatus } from '@/lib/types';
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

export function IncomeClient() {
  const { income, isLoading, currency, deleteIncome, updateIncomeStatus } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusChange = (id: string, currentStatus: IncomeStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Received' : 'Pending';
    updateIncomeStatus(id, newStatus);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-muted-foreground">Track your income from various sources.</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Income
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>A log of your earnings from various sources.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table className="min-w-[650px]">
                    <TableHeader>
                    <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Bank/Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {income.length > 0 ? (
                        income.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.source}</TableCell>
                            <TableCell>{item.bank}</TableCell>
                            <TableCell>{format(parseISO(item.date), 'PPP')}</TableCell>
                            <TableCell>
                            <Badge 
                                variant={item.status === 'Received' ? 'secondary' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleStatusChange(item.id, item.status)}
                            >
                                {item.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount, currency)}</TableCell>
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
                                        This action cannot be undone. This will permanently delete this income record.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteIncome(item.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No income recorded yet.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
      <AddIncomeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2">
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <div className="flex justify-end w-1/6">
                          <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

    