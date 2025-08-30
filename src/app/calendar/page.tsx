'use client';

import AppLayout from "@/components/app-layout";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarPage() {
  return (
    <AppLayout pageTitle="Expense Calendar">
      <Suspense fallback={<PageSkeleton />}>
        <CalendarClient />
      </Suspense>
    </AppLayout>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}