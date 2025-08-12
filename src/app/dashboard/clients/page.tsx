'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import ClientList from "@/components/clients/client-list";
import AddClientDialog from "@/components/clients/add-client-dialog";
import { useUser } from "@/hooks/use-user";
import { useClients } from "@/hooks/use-clients";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import '@/styles/components.css';

 

export default function ClientsPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients(user?.id || '');

  // Loading state for user
  if (userLoading) {
    return (
      <>
        <DashboardNavbar/>
        <main className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Clients</h1>
                <p className="text-muted-foreground mt-1">Manage your client relationships</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading user data...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // User not found
  if (!user) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Clients</h1>
                <p className="text-muted-foreground mt-1">Manage your client relationships</p>
              </div>
            </div>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to view your clients.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </>
    );
  }

  // Loading state for clients
  if (clientsLoading) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Clients</h1>
                <p className="text-muted-foreground mt-1">Manage your client relationships</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading clients...</span>
                </div>
                <AddClientDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </AddClientDialog>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading clients...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error state
  if (clientsError) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
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
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading clients: {clientsError.message}
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </>
    );
  }

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