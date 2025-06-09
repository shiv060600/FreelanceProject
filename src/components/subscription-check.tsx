import { redirect } from 'next/navigation';
import { checkUserSubscription } from '@/app/actions';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface SubscriptionCheckProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export async function SubscriptionCheck({
    children,
    redirectTo = '/pricing'
}: SubscriptionCheckProps) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/sign-in');
    }

    // Check subscription directly in the database
    const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (subError || !subscription) {
        console.log('No active subscription found, redirecting to pricing');
        redirect(redirectTo);
    }

    return <>{children}</>;
}
