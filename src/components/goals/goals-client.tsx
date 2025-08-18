
'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Edit, Target } from 'lucide-react';
import { AddGoalDialog } from './add-goal-dialog';
import { Progress } from '@/components/ui/progress';
import { format, parseISO } from 'date-fns';
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

export function GoalsClient() {
  const { goals, isLoading, currency, deleteGoal } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  }

  const handleAdd = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-muted-foreground">Track and manage your financial goals.</h2>
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Goal
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.length > 0 ? (
            goals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                    <Card key={goal.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Target className="h-6 w-6 text-primary" />
                                    <div>
                                        <CardTitle>{goal.name}</CardTitle>
                                        <CardDescription>Deadline: {format(parseISO(goal.deadline), 'PPP')}</CardDescription>
                                    </div>
                                </div>
                                <div className='flex'>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
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
                                                This action cannot be undone. This will permanently delete this goal.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteGoal(goal.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-2xl font-bold">{formatCurrency(goal.currentAmount, currency)}</span>
                                    <span className="text-sm text-muted-foreground"> of {formatCurrency(goal.targetAmount, currency)}</span>
                                </div>
                                <Progress value={progress} />
                                <p className="text-xs text-right mt-1 text-muted-foreground">{progress.toFixed(0)}% complete</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            })
            ) : (
            <div className="text-muted-foreground md:col-span-3 text-center py-12">
                <p>You have no financial goals set.</p>
                <Button variant="link" onClick={handleAdd}>Set your first goal</Button>
            </div>
            )}
        </div>
        <AddGoalDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
            goal={editingGoal}
        />
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
                <div className='flex justify-between items-start'>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className='space-y-2'>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <div className='flex'>
                       <Skeleton className="h-8 w-8" />
                       <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className='mb-1 space-y-2'>
                    <Skeleton className="h-7 w-1/2" />
                </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4 ml-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    