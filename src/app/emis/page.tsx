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
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }