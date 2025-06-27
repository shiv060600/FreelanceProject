// @ts-ignore: Deno global
declare var Deno: any;

// @ts-ignore: Deno module
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno module  
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map Stripe price IDs to human-readable plan names
const getPlanName = (priceId: string): string => {
    const planNames: { [key: string]: string } = {
        'prod_SNyclMOBTiNxdL': 'New Freelancer',
        'prod_SVQriwONif10zJ': 'Seasoned Freelancer',
        'prod_SVQsv2QIziGtRD': 'Expert Freelancer',
        // Add more price ID mappings as needed
    };
    return planNames[priceId] || 'Unknown Plan';
};

// Determine if a plan should be marked as popular
const isPopularPlan = (priceId: string): boolean => {
    // Mark the Pro plan as popular
    return priceId === 'price_1QTWcJHxZBGV8xKR6hgb8P5m';
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get both products and their prices
        const products = await stripe.products.list({
            limit: 10,
        });

        // Get all prices for these products
        const prices = await stripe.prices.list({
            active: true,
            limit: 10,
        });


        // Transform the data to combine product info with pricing
        const transformedPlans = prices.data.map(price => {
            const product = products.data.find(p => p.id === price.product);
            console.log('Processing price with ID:', price.id, 'for product:', product?.name);
            
            return {
                id: price.id,
                name: product?.name || getPlanName(price.id),
                amount: price.unit_amount,
                interval: price.recurring?.interval,
                currency: price.currency,
                popular: isPopularPlan(price.id),
                productId: price.product,
                // Include other relevant fields
                ...price
            };
        });

                return new Response(
            JSON.stringify(transformedPlans),
            { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
            }
        );
    } catch (error) {
        console.error("Error getting products:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400 
            }
        );
    }
});