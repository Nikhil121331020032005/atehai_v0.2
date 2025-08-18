
import AppLayout from "@/components/app-layout";
import { EmiClient } from "@/components/emis/emi-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmiPage() {
  return (
    <AppLayout pageTitle="EMI Tracking">
      <Suspense fallback={<PageSkeleton />}>
        <EmiClient />
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

    