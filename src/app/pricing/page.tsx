import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../../supabase/server";
import SubscriptionManagement from "@/components/subscription-management";

export default async function Pricing() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get current user subscription if logged in
    let currentSubscription = null;
    if (user) {
        // Get subscription from subscriptions table
        const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('stripe_price_id, status, current_period_end, cancel_at_period_end')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (subscriptionData) {
            const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
            
            // Check if subscription is active OR cancelled but still in billing period
            const now = Math.floor(Date.now() / 1000);
            const hasAccess = status === 'active' || 
                             (status === 'canceled' && cancel_at_period_end && current_period_end > now);
            
            if (hasAccess) {
                // Map price IDs to plan names
                let planName = 'Free';
                switch (stripe_price_id) {
                    case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
                        planName = 'Expert Freelancer';
                        break;
                    case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
                        planName = 'Seasoned Freelancer';
                        break;
                    case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
                        planName = 'New Freelancer';
                        break;
                    // Legacy price IDs (keep for backwards compatibility)
                    case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
                        planName = 'Expert Freelancer';
                        break;
                    case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
                        planName = 'Seasoned Freelancer';
                        break;
                    case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
                        planName = 'New Freelancer';
                        break;
                }
                
                currentSubscription = {
                    subscription: planName,
                    subscription_status: status
                };
            }
        }
    }

    const { data: plans, error } = await supabase.functions.invoke('supabase-functions-get-plans');
    const filteredplans = plans.filter((item:any) => {return item.name !== 'Shilajit Tea'})
    
    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
                    <p className="text-xl text-muted-foreground">
                        Choose the perfect plan for your needs
                    </p>
                </div>



                {/* Show current subscription status if user is logged in */}
                {user && currentSubscription && (
                    <SubscriptionManagement 
                        user={user} 
                        subscription={currentSubscription}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {filteredplans?.map((item: any) => (
                        <PricingCard key={item.id} item={item} user={user} />
                    ))}
                </div>
            </div>
        </>
    );
}