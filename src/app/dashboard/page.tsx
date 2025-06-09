import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon, UserCircle, DollarSign, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import '@/styles/components.css';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch dashboard statistics
  const { data: invoiceStats } = await supabase
    .from('invoices')
    .select('total, status')
    .eq('user_id', user.id);

  const totalEarnings = (invoiceStats ?? []).reduce((acc, curr) => acc + (curr.status === 'paid' ? Number(curr.total) : 0), 0);
  const unpaidInvoices = (invoiceStats ?? []).filter(inv => inv.status === 'unpaid').length;

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
              <span>Welcome back! Here's your overview for this month.</span>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="font-semibold text-xl">Total Earnings</h2>
                  <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="font-semibold text-xl">Unpaid Invoices</h2>
                  <p className="text-3xl font-bold">{unpaidInvoices}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
