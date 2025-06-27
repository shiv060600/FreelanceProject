'use client'

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Client } from "@/types/client"
import { format } from "date-fns"
import { createClient } from "../../../supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Phone, MapPin, Calendar, ClipboardList } from "lucide-react"

interface ClientDetailDialogProps {
  client: Client;
  children: React.ReactNode;
}

export default function ClientDetailDialog({ client, children }: ClientDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState<{
    lifetime_client_earnings: number;
    lifetime_client_paid_invoices: number;
  } | null>(null)
  const supabase = createClient()


  async function fetchClientStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Error fetching user in fetchClientStats')
      return
    }

    // Fetch client lifetime stats from the clients table
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('lifetime_client_earnings, lifetime_client_paid_invoices')
      .eq('id', client.id)
      .eq('user_id', user.id)
      .single()
    
    if (clientError) {
      console.error('Error fetching client stats:', clientError);
      return;
    }
    
    if (clientData) {
      setStats({
        lifetime_client_earnings: clientData.lifetime_client_earnings || 0,
        lifetime_client_paid_invoices: clientData.lifetime_client_paid_invoices || 0
      });
    }
  }
  
  function handleOpen(openState: boolean) {
    setOpen(openState);
    if (openState) {
      fetchClientStats();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{client.name}</DialogTitle>
          <DialogDescription>
            Client details and summary
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {client.company && (
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p>{client.company}</p>
                </div>
              </div>
            )}
            
            {client.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{client.email}</p>
                </div>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p>{client.phone}</p>
                </div>
              </div>
            )}
            
            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p>{client.address}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Client Since</p>
                <p>{format(new Date(client.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
          
          {client.notes && (
            <div className="flex items-start gap-2 pt-2">
              <ClipboardList className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
              </div>
            </div>
          )}
          
          {stats && (
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">Client Summary</h3>
              <div className="grid grid-cols-2 gap-3">                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Lifetime Paid Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats.lifetime_client_paid_invoices}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Lifetime Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">${stats.lifetime_client_earnings.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 