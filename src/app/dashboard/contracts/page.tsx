import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import ContractsPage from "@/components/contracts/contracts-page";
import DashboardNavbar from "@/components/dashboard-navbar";
import '@/styles/components.css';

export default async function Contracts() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    return (
        <>
            <DashboardNavbar />
            <div className="container mx-auto px-4 py-8">
                <ContractsPage />
            </div>
        </>
    );
}
