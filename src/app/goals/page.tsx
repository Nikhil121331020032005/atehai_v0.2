'use client';

import AppLayout from "@/components/app-layout";
import { GoalsClient } from "@/components/goals/goals-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsPage() {
  return (
    <AppLayout pageTitle="Financial Goals">
      <Suspense fallback={<PageSkeleton />}>
        <GoalsClient />
      </Suspense>
    </AppLayout>
  );
}

function PageSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }
