'use client'

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
        <div className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Clients</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage your client relationships
                </p>
              </div>
              <div className="flex items-center gap-3">
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
            
            <div className="bg-card rounded-xl shadow-md border border-border/60">
              <div className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading user data...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // User not found
  if (!user) {
    return (
      <>
        <div className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Clients</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage your client relationships
                </p>
              </div>
            </div>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to view your clients.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    );
  }

  // Loading state for clients
  if (clientsLoading) {
    return (
      <>
        <div className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Clients</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage your client relationships
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading clients...</span>
                </div>
                <AddClientDialog>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </AddClientDialog>
              </div>
            </div>
            
            <div className="bg-card rounded-xl shadow-md border border-border/60">
              <div className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading clients...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (clientsError) {
    return (
      <>
        <div className="w-full">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Clients</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage your client relationships
                </p>
              </div>
              <AddClientDialog>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
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
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex justify-between items-center pb-2">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Clients</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Manage your client relationships
              </p>
            </div>
            <AddClientDialog>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </AddClientDialog>
          </div>

          {/* Clients List */}
          <ClientList clients={clients || []} />
        </div>
      </div>
    </>
  );
}