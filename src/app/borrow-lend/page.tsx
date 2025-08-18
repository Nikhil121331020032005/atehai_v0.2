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
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }