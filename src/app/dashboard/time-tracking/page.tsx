import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import TimeTrackingPage from "@/components/time-tracking/time-tracking-page";
import { SubscriptionCheck } from "@/components/subscription-check";
import DashboardNavbar from "@/components/dashboard-navbar";

export default async function TimeTracking() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
        <DashboardNavbar/>
        <div className="container mx-auto px-4 py-8">
        <TimeTrackingPage />
        </div>
    </SubscriptionCheck>
  );
} 