import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import '@/styles/components.css';
import DashboardNavbar from "@/components/dashboard-navbar";
import LeadGeneratorPage from "@/components/lead-generator/lead-generator-page";



export default async function LeadGeneration(){
    const supabase = await createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user){
        return redirect("/sign-in");
    }

    return (
        <>
        <DashboardNavbar/>
        <div className="container mx-auto px-4 py-8">
            <LeadGeneratorPage/>
        </div>
        </>
    )
}
