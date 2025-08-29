'use client';

import AppLayout from "@/components/app-layout";
import { NetWorthClient } from "@/components/net-worth/net-worth-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NetWorthPage() {
  return (
    <AppLayout pageTitle="Net Worth Tracker">
      <Suspense fallback={<PageSkeleton />}>
        <NetWorthClient />
      </Suspense>
    </AppLayout>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}