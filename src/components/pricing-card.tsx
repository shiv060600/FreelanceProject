"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card";
import { createClient } from "@/lib/supabase-browser";

export default function PricingCard({ item, user }: {
    item: any,
    user: User | null
}) {
    const supabase = createClient();

    // Handle checkout process
    const handleCheckout = async (priceId: string) => {
        if (!user) {
            // Redirect to login if user is not authenticated
            window.location.href = "/sign-up";
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('stripe-billing', {
                body: {
                    action: 'create_checkout',
                    price_id: priceId,
                    user_id: user.id,
                    return_url: `${window.location.origin}/dashboard`,
                },
                headers: {
                    'X-Customer-Email': user.email || '',
                }
            });

            if (error) {
                throw error;
            }

            // Redirect to Stripe checkout
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    };

    return (
        <Card className={`w-full max-w-[350px] relative overflow-hidden ${item.popular ? 'border-2 border-primary shadow-xl md:scale-105' : 'border border-border'}`}>
            {item.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-50 dark:to-purple-500/10 opacity-30" />
            )}
            <CardHeader className="relative">
                {item.popular && (
                    <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4">
                        Most Popular
                    </div>
                )}
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{item.name}</CardTitle>
                <CardDescription className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-foreground">${item?.amount / 100}</span>
                    <span className="text-muted-foreground">/{item?.interval}</span>
                </CardDescription>
            </CardHeader>
            <CardFooter className="relative">
                <Button
                    onClick={async () => {
                        await handleCheckout(item.id)
                    }}
                    className={`w-full py-6 text-lg font-medium`}
                >
                    Get Started
                </Button>
            </CardFooter>
        </Card>
    )
}