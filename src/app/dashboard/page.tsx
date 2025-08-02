import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon, UserCircle, DollarSign, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import '@/styles/components.css';
import { stat } from "fs";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user stats including lifetime earnings
  const { data: userStats } = await supabase
    .from('users')
    .select('lifetime_earnings, total_paid_invoices')
    .eq('user_id', user.id)
    .single();

  // Get current draft invoices (unpaid)
  const { data: invoiceStats } = await supabase
    .from('invoices')
    .select('total, status')
    .eq('user_id', user.id)
    .eq('status', 'draft'); 

  const currentDraftStats = invoiceStats?.reduce((stats, currentInvoice) => {
    stats.totalToBeMade += currentInvoice.total;
    stats.draft += 1;
    return stats;
  }, { totalToBeMade: 0, draft: 0 }) || { totalToBeMade: 0, draft: 0 };

  // Combine lifetime and current stats
  const allMoneyStats = {
    totalMade: userStats?.lifetime_earnings || 0,
    totalToBeMade: currentDraftStats.totalToBeMade
  };

  const allInvoiceStats = {
    paid: userStats?.total_paid_invoices || 0,
    draft: currentDraftStats.draft
  };



  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>Welcome back! Here's your overview.</span>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="font-semibold text-xl">Lifetime Earnings</h2>
                  <p className="text-3xl font-bold">${allMoneyStats?.totalMade.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{allInvoiceStats?.paid} paid invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <h2 className="font-semibold text-xl">Draft Revenue</h2>
                  <p className="text-3xl font-bold">${allMoneyStats?.totalToBeMade.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">From draft invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-xl">Draft Invoices</h2>
                  <p className="text-3xl font-bold">{allInvoiceStats?.draft}</p>
                  <p className="text-sm text-muted-foreground">Ready to be sent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
