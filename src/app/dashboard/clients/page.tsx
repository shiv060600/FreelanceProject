import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ClientList from "@/components/clients/client-list";
import AddClientDialog from "@/components/clients/add-client-dialog";

const ClientsPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Clients</h1>
              <p className="text-muted-foreground mt-1">Manage your client relationships</p>
            </div>
            <AddClientDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </AddClientDialog>
          </div>

          {/* Clients List */}
          <ClientList clients={clients || []} />
        </div>
      </main>
    </>
  );
}

export default ClientsPage;