'use client'
import { createClient } from "../../supabase/client";

const supabase = createClient();

export default async function useUserAiUsage(){
    const {data:{user}} = await supabase.auth.getUser();
    const userId = user?.id;

    const {data:usage} = await supabase.rpc('handle_ai_usage',{
        user_id_param: userId
    })

    return usage;
}
