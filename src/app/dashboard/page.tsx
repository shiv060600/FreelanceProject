import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon, UserCircle, DollarSign, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import '@/styles/components.css';
import { stat } from "fs";
import { Delta } from "quill";

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


export default async function Dashboard() {
  const supabase = await createClient();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const previousYearDate = new Date(currentDate);
  previousYearDate.setFullYear(currentDate.getFullYear()-1)
  //parse date for supabase format
  const previousYearISO = previousYearDate.toISOString().slice(0,10);
  //create and build 12m rolling array
  const twelveMonthRolling = new Array();
  for(let i = 0 ; i < 12 ; i++){
    let calculatedMonth = currentMonth - i;
    let calculatedYear = currentYear;
    if (calculatedMonth <= 0){
      calculatedMonth += 12;
      calculatedYear -= 1;
    }
    twelveMonthRolling.push(calculatedYear*100 + calculatedMonth)
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
  const groupedByClientAndMonth = new Map<string, {
    client_id: string,
    client_name: string,
    yearMonth: number,
    total: number
  }>();

  enrichedInvoices.forEach((invoice) => {
    // Defensive: clients may be null or missing name
    let client_name: string;
    if (invoice.clients && typeof invoice.clients.name === 'string') {
      client_name = invoice.clients.name;
    } else {
      client_name = 'Unknown';
    }
    const client_id = invoice.client_id;
    const yearMonth = invoice.due_date;
    const uniqueKey = `${client_id}_${yearMonth}`;
    if(!groupedByClientAndMonth.get(uniqueKey)){
      groupedByClientAndMonth.set(uniqueKey,{
        client_id : client_id,
        client_name : client_name,
        yearMonth : yearMonth,
        total : 0
      })
    }
    groupedByClientAndMonth.get(uniqueKey)!.total += invoice.total;
  });
    



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
