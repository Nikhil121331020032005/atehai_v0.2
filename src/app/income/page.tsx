
import AppLayout from "@/components/app-layout";
import { IncomeClient } from "@/components/income/income-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncomePage() {
  return (
    <AppLayout pageTitle="Income Tracking">
      <Suspense fallback={<PageSkeleton />}>
        <IncomeClient />
      </Suspense>
    </AppLayout>
  );
}

function PageSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

    