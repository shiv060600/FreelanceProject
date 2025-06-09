import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";

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

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg">{profile?.full_name || profile?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
} 