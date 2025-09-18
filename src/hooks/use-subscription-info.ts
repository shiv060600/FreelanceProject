'use client'
import { createClient } from "../../supabase/client";
import { useState } from "react";


export function useSubscriptionInfo(userId:string){
    const [loading,setLoading] = useState<boolean>(false);
    const supbabse = createClient();

    if(!userId){
        throw new Error('must include userId')
    }

    //Want to return 
    //Subscription (as text)
    //Expert Freelancer
    //Seasoned Freelancer
    //New Freelancer
    //Free

    const getSubscriptionType = async(userId:string) => {
        setLoading(true);
        const {data:subscription,error} = await supbabse
        .from('users')
        .select('subscription')
        .eq('user_id',userId)

        if (error){
            setLoading(false);
            throw error
        }

        if (!subscription){
            setLoading(false);
            throw new Error('failed to get subscription type')
        }
        setLoading(false);
        return subscription
    }

    return {
        loading,
        getSubscriptionType
    }

}
