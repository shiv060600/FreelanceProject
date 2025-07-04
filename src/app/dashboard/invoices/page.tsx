import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import InvoicesPage from "@/components/invoices/invoices-page";
import DashboardNavbar from "@/components/dashboard-navbar";
import { InvoiceLimitCheck } from "@/components/invoice-limit-check";
import '@/styles/components.css';

export default async function Invoices() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <DashboardNavbar />
      <InvoiceLimitCheck>
        <div className="container mx-auto px-4 py-8">
          <InvoicesPage />
        </div>
      </InvoiceLimitCheck>
    </>
  );
} 