
'use client';

import AppLayout from "@/components/app-layout";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { useAppContext } from "@/context/app-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gem } from "lucide-react";

export default function DashboardPage() {
  const { expenses, budgets, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <div className="space-y-6">
          <Alert className="border-primary/50 text-primary">
            <Gem className="h-4 w-4" />
            <AlertTitle className="font-semibold">Welcome to Atehai!</AlertTitle>
            <AlertDescription>
              This is your financial dashboard. Add expenses to get started.
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <Alert className="border-primary/50 text-primary">
            <Gem className="h-4 w-4" />
            <AlertTitle className="font-semibold">Welcome to Atehai!</AlertTitle>
            <AlertDescription>
              This is your financial dashboard. Add expenses to get started.
            </AlertDescription>
        </Alert>

        <BudgetOverview expenses={expenses} budgets={budgets} />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SpendingChart expenses={expenses} />
          </div>
          <div className="lg:col-span-2">
            <RecentExpenses expenses={expenses} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
