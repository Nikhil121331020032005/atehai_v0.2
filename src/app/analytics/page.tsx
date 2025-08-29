'use client';

import AppLayout from "@/components/app-layout";
import { TrendsChart } from "@/components/dashboard/trends-chart";
import { useAppContext } from "@/context/app-context";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  return (
    <AppLayout pageTitle="Financial Analytics">
      <Suspense fallback={<PageSkeleton />}>
        <AnalyticsClient />
      </Suspense>
    </AppLayout>
  );
}

function AnalyticsClient() {
  const { expenses, income, isLoading } = useAppContext();

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Financial Trends & Analytics</h2>
        <p className="text-muted-foreground">
          Analyze your financial patterns across different time periods
        </p>
      </div>
      
      <TrendsChart expenses={expenses} income={income} />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}