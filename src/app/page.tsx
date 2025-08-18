
import AppLayout from "@/components/app-layout";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gem } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Dashboard">
      <Alert className="mb-6 border-primary/50 text-primary">
          <Gem className="h-4 w-4" />
          <AlertTitle className="font-semibold">Welcome, Early Adopter!</AlertTitle>
          <AlertDescription>
            As a thank you for joining us early, you have complimentary access to all premium features. Enjoy!
          </AlertDescription>
      </Alert>
      <DashboardClient />
    </AppLayout>
  );
}
