import { createClient } from "../../../supabase/server";
import { InfoIcon, DollarSign, FileText, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import '@/styles/components.css';

interface ClientInfo {
  name: string | null;
  lifetime_client_earnings?: number | 0;
}

interface EnrichedInvoice {
  user_id: string;
  client_id: string;
  status: string;
  due_date: number;
  clients: ClientInfo | null;
  total: number;
}

interface ClientYearlySales {
  x: Array<string>;
  y: Array<number>;
  name: string;
  type: 'bar';
}

export default async function Dashboard() {
  const supabase = await createClient();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const previousYearDate = new Date(currentDate);
  previousYearDate.setFullYear(currentDate.getFullYear()-1)
  //parse date for supabase format
  const previousYearISO = previousYearDate.toISOString().slice(0,10);
  const {data:{user}} = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  //Invoice data for graphing + stats
  const {data:allInvoiceData,error:allInvoiceDataError} = await supabase
    .from('invoices')
    .select('user_id,client_id,status,total,due_date,clients(name,lifetime_client_earnings)')
    .eq('user_id',user.id)
    .gt('due_date',previousYearISO)

  
  if (!allInvoiceData || allInvoiceDataError){
    console.error(`error fetching stats ${allInvoiceDataError.message}`)
    throw new Error(`error fetching stats ${allInvoiceDataError.message}`)
  }
  //Lifetime Earnings and Paid Invoices
  const { data: userStats , error : userStatsError } = await supabase
    .from('users')
    .select('lifetime_earnings, total_paid_invoices')
    .eq('user_id', user.id)
    .single();
  
  if (userStatsError || !userStats){
    console.error(`error fetching stats ${userStatsError.message}`)
    throw new Error(`error fetching stats ${userStatsError.message}`)
  }


  const draftInvoices = allInvoiceData?.filter((invoice)=>{
    return invoice.status === 'draft'
  })
  const currentDraftStats = draftInvoices?.reduce((stats, currentInvoice) => {
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
      <div className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4 pb-2">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Welcome back! Here's your business overview.
              </p>
            </div>
            <div className="bg-gradient-to-r from-primary/5 to-purple-50/80 dark:to-purple-500/10 backdrop-blur-sm text-sm p-4 px-5 rounded-xl text-foreground/80 flex gap-3 items-center border border-primary/20 shadow-sm">
              <InfoIcon size="16" className="text-primary flex-shrink-0" />
              <span className="font-medium">Your business insights and analytics at a glance</span>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-background to-emerald-50/30 dark:to-emerald-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/30 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/15 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                  <DollarSign className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-foreground/80 mb-1">Lifetime Earnings</h2>
                  <p className="text-4xl font-bold text-foreground mb-1">${allMoneyStats?.totalMade.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground font-medium">{allInvoiceStats?.paid} paid invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-background to-amber-50/30 dark:to-amber-500/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-500/30 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-500/15 rounded-xl border border-amber-200 dark:border-amber-500/30">
                  <DollarSign className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-foreground/80 mb-1">Draft Revenue</h2>
                  <p className="text-4xl font-bold text-foreground mb-1">${allMoneyStats?.totalToBeMade.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground font-medium">From draft invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-background to-primary/5 rounded-2xl p-6 border border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-foreground/80 mb-1">Draft Invoices</h2>
                  <p className="text-4xl font-bold text-foreground mb-1">{allInvoiceStats?.draft}</p>
                  <p className="text-sm text-muted-foreground font-medium">Ready to be sent</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            href="/dashboard/analytics"
            className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Sales analytics</h2>
                <p className="text-sm text-muted-foreground">Revenue by month and client, with filters and CSV export.</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </>
  );
}
