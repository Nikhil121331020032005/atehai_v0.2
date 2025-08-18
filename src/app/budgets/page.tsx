import AppLayout from "@/components/app-layout";
import { BudgetClient } from "@/components/budgets/budget-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsPage() {
  return (
    <AppLayout pageTitle="Budgets">
      <Suspense fallback={<BudgetSkeleton />}>
        <BudgetClient />
      </Suspense>
    </AppLayout>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
