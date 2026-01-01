import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon, DollarSign, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import '@/styles/components.css';
import AnalyticsSection from "@/components/dashboard/analytics-section";

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
  //create and build 12m rolling array
  const twelveMonthRolling = new Map<number,number>();
  const x = new Array();
  for(let i = 0 ; i < 12 ; i++){
    let calculatedMonth = currentMonth - i;
    let calculatedYear = currentYear;
    if (calculatedMonth <= 0){
      calculatedMonth += 12;
      calculatedYear -= 1;
    }
    twelveMonthRolling.set(calculatedYear*100 + calculatedMonth,i)
    x.push(calculatedMonth.toString() + '-' + calculatedYear.toString());
  }
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

  //detailed invoicing for plotting
  const enrichedInvoices: EnrichedInvoice[] = (allInvoiceData as Array<any>)
    .filter((invoice) => invoice.status === 'paid')
    .map((invoice) => {
      // Defensive: due_date may be string or Date
      const dueDateStr = typeof invoice.due_date === 'string' ? invoice.due_date : String(invoice.due_date);
      const year = dueDateStr.slice(0, 4);
      const month = dueDateStr.slice(5, 7);
      const yearMonth = Number(year) * 100 + Number(month);
      return {
        user_id: invoice.user_id,
        client_id: invoice.client_id,
        status: invoice.status,
        due_date: yearMonth,
        clients: invoice.clients,
        total: invoice.total,
      };
    });

  const clientsYearlySalesData = new Map<string,ClientYearlySales>();
  
  enrichedInvoices.forEach((invoice)=>{
    if(!clientsYearlySalesData.get(invoice.client_id)){
      clientsYearlySalesData.set(invoice.client_id,{
        x: [...x],
        y: new Array(12).fill(0),
        name:invoice?.clients?.name ?? "Unknown",
        type:'bar'
      })
    }
    const currentClientData:ClientYearlySales = clientsYearlySalesData.get(invoice.client_id)!;
    currentClientData.y[twelveMonthRolling.get(invoice.due_date)!] += invoice.total;
    clientsYearlySalesData.set(invoice.client_id,currentClientData);
  });

  // Prepare data for recharts (after map is populated)
  const rechartsData: Array<{ month: string } & { [client: string]: number }> = [];
  for (let i = 0; i < x.length; i++) {
    const monthObj: { month: string } & { [client: string]: number } = { month: x[i] };
    for (const client of Array.from(clientsYearlySalesData.values())) {
      monthObj[client.name] = client.y[i] || 0;
    }
    rechartsData.push(monthObj);

  
  };
  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4 pb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Welcome back! Here's your business overview.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm text-sm p-4 px-5 rounded-xl text-gray-700 flex gap-3 items-center border border-blue-100/50 shadow-sm">
              <InfoIcon size="16" className="text-blue-600 flex-shrink-0" />
              <span className="font-medium">Your business insights and analytics at a glance</span>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-6 border border-emerald-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-200">
                  <DollarSign className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-gray-700 mb-1">Lifetime Earnings</h2>
                  <p className="text-4xl font-bold text-gray-900 mb-1">${allMoneyStats?.totalMade.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground font-medium">{allInvoiceStats?.paid} paid invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-6 border border-amber-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl border border-amber-200">
                  <DollarSign className="h-7 w-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-gray-700 mb-1">Draft Revenue</h2>
                  <p className="text-4xl font-bold text-gray-900 mb-1">${allMoneyStats?.totalToBeMade.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground font-medium">From draft invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 border border-blue-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-gray-700 mb-1">Draft Invoices</h2>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{allInvoiceStats?.draft}</p>
                  <p className="text-sm text-muted-foreground font-medium">Ready to be sent</p>
                </div>
              </div>
            </div>
          </div>
          
          <AnalyticsSection 
            rechartsData={rechartsData} 
            clientsYearlySalesData={clientsYearlySalesData}
          />
        </div>
      </main>
    </>
  );
}
