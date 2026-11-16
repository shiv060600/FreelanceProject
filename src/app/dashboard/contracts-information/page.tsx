import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import ContractsInformation from "@/components/contracts-information/contracts-information-page";
import '@/styles/components.css';
export default async function ContractsInformationPage(){
    const supabase = await createClient();
    const {data:{user}} = await supabase.auth.getUser();
    if (!user){
        return redirect("/sign-in");
    }
    return (
        <div>
            <div className="container mx-auto px-4 py-8 ">
                <ContractsInformation/>
            </div>
        </div>
    )
}

