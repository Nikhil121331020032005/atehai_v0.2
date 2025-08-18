'use client';

import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

export function EmiClient() {
  const { emis, isLoading, currency } = useAppContext();

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-muted-foreground">Your ongoing monthly installments.</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {emis.length > 0 ? (
          emis.map(emi => (
            <Card key={emi.id}>
              <CardHeader>
                <CardTitle>{emi.name}</CardTitle>
                <CardDescription>{emi.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{formatCurrency(emi.amount, currency)}</p>
                <p className="text-sm text-muted-foreground">Due on: {emi.dueDate}</p>
                <p className="text-sm text-muted-foreground">Remaining: {emi.tenure} months</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground md:col-span-3 text-center">You have no EMIs tracked.</p>
        )}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-72" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
