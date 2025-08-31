
'use client';

import AppLayout from "@/components/app-layout";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { useAppContext } from "@/context/app-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Gem, RotateCcw, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { format, isFirstDayOfMonth } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  const { expenses, budgets, isLoading } = useAppContext();
  const [showResetNotification, setShowResetNotification] = useState(false);

  useEffect(() => {
    // Check if it's the first day of the month and show notification
    if (isFirstDayOfMonth(new Date())) {
      setShowResetNotification(true);
      // Hide notification after 10 seconds
      const timer = setTimeout(() => setShowResetNotification(false), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

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

        {showResetNotification && (
          <Alert className="border-green-500/50 text-green-600">
            <RotateCcw className="h-4 w-4" />
            <AlertTitle className="font-semibold">Monthly Reset Complete!</AlertTitle>
            <AlertDescription>
              Your {format(new Date(), 'MMMM yyyy')} data has been automatically archived and reset. You can view archived data in your profile.
            </AlertDescription>
          </Alert>
        )}

        <BudgetOverview expenses={expenses} budgets={budgets} />
        
        {/* Quick Actions */}
        <div className="flex gap-4">
          <Link href="/analytics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
        
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
