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
    totalHours: number;
    invoiceCount: number;
    totalBilled: number;
  } | null>(null)
  const supabase = createClient()

  async function fetchClientStats() {
    // Fetch time logs to calculate hours
    const { data: timeLogs, error: timeError } = await supabase
      .from('time_logs')
      .select('duration_minutes')
      .eq('client_id', client.id);
    
    if (timeError) {
      console.error('Error fetching time logs:', timeError);
      return;
    }
    
    const totalHours = timeLogs?.reduce(
      (sum, log) => sum + (log.duration_minutes || 0), 0
    ) / 60 || 0;
    
    // Fetch invoices
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('total')
      .eq('client_id', client.id);
    
    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError);
      return;
    }
    
    const totalBilled = invoices?.reduce(
      (sum, invoice) => sum + Number(invoice.total), 0
    ) || 0;
    
    setStats({
      totalHours: parseFloat(totalHours.toFixed(2)),
      invoiceCount: invoices?.length || 0,
      totalBilled: parseFloat(totalBilled.toFixed(2))
    });
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
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Total Hours</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats.invoiceCount}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Total Billed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">${stats.totalBilled.toFixed(2)}</p>
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