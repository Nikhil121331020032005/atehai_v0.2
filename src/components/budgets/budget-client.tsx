
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/context/app-context';
import { CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const budgetSchema = z.object({
  category: z.string(),
  amount: z.coerce.number().min(0, 'Budget must be non-negative.'),
});

const formSchema = z.object({
  budgets: z.array(budgetSchema),
});

const budgetableCategories = CATEGORIES.filter(c => c.name !== 'Lending' && c.name !== 'EMI');

export function BudgetClient() {
  const { budgets: contextBudgets, updateBudgets, isLoading, currency } = useAppContext();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budgets: [],
    }
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'budgets',
  });

  useEffect(() => {
    if (contextBudgets.length > 0) {
      const allBudgets = budgetableCategories.map(cat => {
        const existingBudget = contextBudgets.find(b => b.category === cat.name);
        return {
          category: cat.name,
          amount: existingBudget?.amount ?? 0,
        };
      });
      replace(allBudgets);
    }
  }, [contextBudgets, replace]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateBudgets(data.budgets.filter(b => b.amount >= 0));
    toast({
      title: 'Budgets Updated',
      description: 'Your new budget settings have been saved.',
    });
  };

  if (isLoading) {
    return <BudgetSkeleton />;
  }

  const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).formatToParts(1).find(part => part.type === 'currency')?.value || '$';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-muted-foreground">Set your monthly spending goals.</h2>
          <Button type="submit">Save Changes</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fields.map((field, index) => {
            const categoryInfo = CATEGORIES.find(c => c.name === field.category);
            if (!categoryInfo) return null;

            return (
              <Card key={field.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{categoryInfo.name}</CardTitle>
                  <CategoryIcon name={categoryInfo.name} className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name={`budgets.${index}.amount`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Budget for {categoryInfo.name}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
                            <Input
                              type="number"
                              className="pl-7"
                              placeholder="0.00"
                              {...formField}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </form>
    </Form>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {budgetableCategories.map((cat) => (
          <Card key={cat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
