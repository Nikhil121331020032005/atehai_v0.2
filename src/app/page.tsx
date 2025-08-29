
'use client';

import AppLayout from "@/components/app-layout";
import { CustomizableDashboard } from "@/components/dashboard/customizable-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gem } from "lucide-react";

export default function DashboardPage() {
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

        <CustomizableDashboard />
      </div>
    </AppLayout>
  );
}
