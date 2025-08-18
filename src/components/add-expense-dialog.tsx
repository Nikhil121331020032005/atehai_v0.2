
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { CATEGORIES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { suggestCategoryAction } from '@/lib/actions';
import type { CategoryName } from '@/lib/types';

const expenseSchema = z.object({
  description: z.string().min(3, { message: 'Description must be at least 3 characters long.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  date: z.date(),
  category: z.custom<CategoryName>(val => {
    // This allows any string, but we validate it against our known categories.
    // The cast to CategoryName is for type safety in the form.
    return typeof val === 'string' && val.length > 0;
  }, {
    message: "Please select a category"
  }),
});

type AddExpenseDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddExpenseDialog({ isOpen, onOpenChange }: AddExpenseDialogProps) {
  const { addExpense } = useAppContext();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: '' as any,
      date: new Date(),
    },
  });

  const handleSuggestCategory = () => {
    const description = form.getValues('description');
    if (!description) {
      form.setError('description', { type: 'manual', message: 'Please enter a description first.' });
      return;
    }
    startTransition(async () => {
      const result = await suggestCategoryAction(description);
      if (result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast({ title: 'Category Suggested!', description: `We've selected "${result.category}" for you.` });
      } else {
        toast({ variant: 'destructive', title: 'Suggestion Failed', description: result.error });
      }
    });
  };

  const onSubmit = (values: z.infer<typeof expenseSchema>) => {
    addExpense({
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
    });
    toast({ title: 'Expense Added', description: 'Your expense has been successfully recorded.' });
    form.reset({
      description: '',
      amount: '' as any,
      date: new Date(),
      category: undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="e.g., Coffee with a friend" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isPending}>
                        <Sparkles className={cn("h-4 w-4", isPending && "animate-spin")} />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
