import AppLayout from "@/components/app-layout";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Dashboard">
      <DashboardClient />
    </AppLayout>
  );
}
