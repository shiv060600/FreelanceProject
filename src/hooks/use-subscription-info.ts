'use client'
import { createClient } from "../../supabase/client";
import { useState } from "react";


export function useSubscriptionInfo(userId: string | undefined){
    const [loading,setLoading] = useState<boolean>(false);
    const supabase = createClient();

    //Want to return 
    //Subscription (as text)
    //Expert Freelancer
    //Seasoned Freelancer
    //New Freelancer
    //Free

    const getSubscriptionType = async(userIdParam: string) => {
        if (!userIdParam) {
            return null;
        }

        setLoading(true);
        try {
            const {data:userData,error} = await supabase
                .from('users')
                .select('subscription')
                .eq('user_id', userIdParam)
                .maybeSingle(); // Use maybeSingle() to handle case where user doesn't exist yet

            if (error){
                console.error('Error fetching subscription:', error);
                setLoading(false);
                return null;
            }

            setLoading(false);
            // Return the subscription value, defaulting to 'Free' if not found
            return userData ? [{ subscription: userData.subscription || 'Free' }] : [{ subscription: 'Free' }];
        } catch (error) {
            console.error('Error fetching subscription:', error);
            setLoading(false);
            return null;
        }
    }

    return {
        loading,
        getSubscriptionType
    }

}
