
'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { AddEmiDialog } from './add-emi-dialog';
import { useToast } from '@/hooks/use-toast';
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

export function EmiClient() {
  const { emis, isLoading, currency, payEmi, deleteEmi } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handlePayEmi = (emi: any) => {
    if(emi.tenure > 0) {
      payEmi(emi);
      toast({
        title: 'EMI Paid!',
        description: 'An expense has been recorded and tenure reduced.',
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'EMI Already Completed',
            description: 'This EMI has no remaining tenure.',
        });
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-muted-foreground">Your ongoing monthly installments.</h2>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add EMI
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {emis.length > 0 ? (
            emis.map(emi => (
                <Card key={emi.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{emi.name}</CardTitle>
                                <CardDescription>{emi.category}</CardDescription>
                            </div>
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
                                        This action cannot be undone. This will permanently delete this EMI record.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteEmi(emi.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <p className="text-3xl font-bold">{formatCurrency(emi.amount, currency)}</p>
                        <p className="text-sm text-muted-foreground">Due on: {emi.dueDate}</p>
                        <p className="text-sm text-muted-foreground">
                            Remaining: <span className="font-semibold">{emi.tenure}</span> months
                        </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button className="w-full" onClick={() => handlePayEmi(emi)} disabled={emi.tenure === 0}>
                           {emi.tenure > 0 ? 'Mark as Paid for this Month' : 'EMI Completed'}
                        </Button>
                    </div>
                </Card>
            ))
            ) : (
            <div className="text-muted-foreground md:col-span-3 text-center py-12">
                <p>You have no EMIs tracked.</p>
                <Button variant="link" onClick={() => setIsDialogOpen(true)}>Add your first EMI</Button>
            </div>
            )}
        </div>
        <AddEmiDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <div className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

    