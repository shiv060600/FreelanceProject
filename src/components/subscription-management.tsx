"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CreditCard, Settings, AlertCircle, ExternalLink } from "lucide-react";

interface SubscriptionManagementProps {
    user: User;
    subscription: {
        subscription: string | null;
        subscription_status: string | null;
    };
}

export default function SubscriptionManagement({ user, subscription }: SubscriptionManagementProps) {
    const handleManageSubscription = () => {
        // Open Stripe billing portal directly
        window.open('https://billing.stripe.com/p/login/test_5kQ9AT9Gsdjq6ELgAggjC00', '_blank');
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'trialing':
                return 'bg-blue-100 text-blue-800';
            case 'past_due':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
            case 'incomplete_expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getInvoiceLimit = (plan: string | null) => {
        switch (plan) {
            case 'New Freelancer':
                return '50';
            case 'Seasoned Freelancer':
                return '125';
            case 'Expert Freelancer':
                return '500';
            default:
                return '10';
        }
    };

    // Only show if user has a paid subscription
    if (!subscription.subscription || subscription.subscription === 'Free') {
        return null;
    }

    return (
        <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Your Current Subscription
                    </CardTitle>
                    <CardDescription>
                        Manage your subscription, billing, and payment methods
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">
                                    {subscription.subscription || 'Free Plan'}
                                </span>
                                <Badge className={getStatusColor(subscription.subscription_status)}>
                                    {subscription.subscription_status || 'active'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Invoice limit: {getInvoiceLimit(subscription.subscription)} invoices
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                                onClick={handleManageSubscription}
                                className="flex items-center gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                Manage Subscription
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    
                    {subscription.subscription_status === 'past_due' && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm text-yellow-800">
                                Your subscription payment is past due. Please update your payment method.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 