
'use client';

import AppLayout from "@/components/app-layout";
import { BudgetClient } from "@/components/budgets/budget-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/lib/data";

export default function BudgetsPage() {
  return (
    <AppLayout pageTitle="Budgets">
      <Suspense fallback={<BudgetSkeleton />}>
        <BudgetClient />
      </Suspense>
    </AppLayout>
  );
}

const budgetableCategories = CATEGORIES;

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {budgetableCategories.map((cat) => (
          <Skeleton key={cat.name} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
