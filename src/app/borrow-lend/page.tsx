
'use client';

import AppLayout from "@/components/app-layout";
import { BorrowLendClient } from "@/components/borrow-lend/borrow-lend-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BorrowLendPage() {
  return (
    <AppLayout pageTitle="Borrow & Lend">
      <Suspense fallback={<PageSkeleton />}>
        <BorrowLendClient />
      </Suspense>
    </AppLayout>
  );
}

function PageSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
      </div>
    )
  }
