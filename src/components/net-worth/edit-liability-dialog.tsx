'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { LIABILITY_TYPES } from '@/lib/data';
import type { Liability, LiabilityType } from '@/lib/types';

const liabilitySchema = z.object({
  name: z.string().min(2, { message: 'Liability name must be at least 2 characters.' }),
  type: z.custom<LiabilityType>(val => typeof val === 'string' && val, {
    message: "Please select a liability type"
  }),
  currentBalance: z.coerce.number().positive({ message: 'Current balance must be positive.' }),
  originalAmount: z.coerce.number().optional(),
  interestRate: z.coerce.number().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

type EditLiabilityDialogProps = {
  liability: Liability | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function EditLiabilityDialog({ liability, isOpen, onOpenChange }: EditLiabilityDialogProps) {
  const { updateLiability } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof liabilitySchema>>({
    resolver: zodResolver(liabilitySchema),
  });

  useEffect(() => {
    if (liability && isOpen) {
      form.reset({
        name: liability.name,
        type: liability.type,
        currentBalance: liability.currentBalance,
        originalAmount: liability.originalAmount,
        interestRate: liability.interestRate,
        dueDate: liability.dueDate || '',
        description: liability.description || '',
      });
    }
  }, [liability, isOpen, form]);

  const onSubmit = (values: z.infer<typeof liabilitySchema>) => {
    if (!liability) return;
    
    updateLiability(liability.id, values);
    toast({ title: 'Liability Updated', description: 'Your liability has been successfully updated.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Liability</DialogTitle>
          <DialogDescription>
            Update the details of your liability.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liability Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Home Mortgage, Credit Card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liability Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select liability type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LIABILITY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="originalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate % (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 15th of every month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about this liability..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Update Asset</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}