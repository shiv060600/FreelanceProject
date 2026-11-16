import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { UserCircle, Calendar, Mail, CreditCard,DollarSign } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSubscriptionAccess } from "@/utils/subscription";
import PaymentLinksForm from "@/components/profile/payment-links-form";
import '@/styles/components.css';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data , error} = await supabase.auth.getUser();
  if (error) {
    console.log('Signing Functionality failed either due to incorrect credentials or login')
    return redirect("/sign-in");
  }
  const user = data.user;
  
  if (!user) {
    console.log('Signing Functionality failed either due to incorrect credentials or login')
    return redirect("/sign-in");
  }

  // Fetch user profile data
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (profileError){
    console.log('could not get profile')
    return redirect("/")
  }

  // Get subscription from subscriptions table
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('stripe_price_id, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const subscriptionAccess = getSubscriptionAccess(subscriptionData);


  return (
    <>
      <div className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="pb-2">
            <h1 className="text-4xl font-bold text-foreground">Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-2">View and manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border/60 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-50/50 dark:to-purple-500/10 border-b border-border">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  Account Information
                </CardTitle>
                <CardDescription className="mt-2">Your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Full Name</p>
                  <p className="text-lg font-medium text-foreground">{profile?.full_name || profile?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Email</p>
                  <p className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Account Created</p>
                  <p className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border/60 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50/50 dark:from-purple-500/10 to-pink-50/50 dark:to-pink-500/10 border-b border-border">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/15 rounded-lg border border-purple-200 dark:border-purple-500/30">
                    <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Subscription Details
                </CardTitle>
                <CardDescription className="mt-2">Your current plan and invoice limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Current Plan</p>
                  <p className="text-lg font-bold text-foreground">{subscriptionAccess.planName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    subscriptionAccess.status === 'active' 
                      ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                      : 'bg-muted text-foreground/80 border border-border'
                  }`}>
                    {subscriptionAccess.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Invoice Limit</p>
                  <p className="text-lg font-bold text-foreground">{subscriptionAccess.invoiceLimit}</p>
                </div>
                <div className="pt-2">
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all w-full">
                      Manage Subscription
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          <PaymentLinksForm userId={user.id} />
        </div>
        </div>
      </>
  );
} 