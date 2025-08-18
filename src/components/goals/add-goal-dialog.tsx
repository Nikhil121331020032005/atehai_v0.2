
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';
import type { Goal } from '@/lib/types';


const goalSchema = z.object({
  name: z.string().min(3, { message: 'Goal name must be at least 3 characters.' }),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be a positive number.' }),
  currentAmount: z.coerce.number().min(0, { message: 'Current amount cannot be negative.' }),
  deadline: z.date(),
}).refine(data => data.currentAmount <= data.targetAmount, {
    message: "Current amount cannot exceed target amount",
    path: ["currentAmount"],
});


type AddGoalDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  goal?: Goal | null;
};

export function AddGoalDialog({ isOpen, onOpenChange, goal }: AddGoalDialogProps) {
  const { addGoal, updateGoal } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: '' as any,
      currentAmount: 0,
      deadline: new Date(),
    },
  });

  useEffect(() => {
    if (goal && isOpen) {
      form.reset({
        ...goal,
        deadline: new Date(goal.deadline)
      });
    } else if (!goal && isOpen) {
        form.reset({
            name: '',
            targetAmount: '' as any,
            currentAmount: 0,
            deadline: new Date(),
        });
    }
  }, [goal, isOpen, form]);


  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    const formattedValues = {
        ...values,
        deadline: format(values.deadline, 'yyyy-MM-dd'),
    }

    if (goal) {
      updateGoal(goal.id, formattedValues);
      toast({ title: 'Goal Updated', description: 'Your financial goal has been updated.' });
    } else {
      addGoal(formattedValues);
      toast({ title: 'Goal Added', description: 'Your new financial goal has been set.' });
    }

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            {goal ? 'Update the details of your financial goal.' : 'Set a new financial goal to work towards.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., European Vacation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Target Amount</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="currentAmount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Current Amount</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
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
                        disabled={date => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{goal ? 'Save Changes' : 'Add Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
