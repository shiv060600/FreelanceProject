'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Download, Mail, Trash, Pencil, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import CreateInvoiceDialog from "./create-invoice-dialog"
import EditInvoiceDialog from "./edit-invoice-dialog"
import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoicePDF from './invoice-pdf'
import { useInvoicePDF } from '../../hooks/use-invoice-pdf'

interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'paid';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data (not in DB but added by your code)
  clients?: {
    id: string;
    name: string;
  };
  invoice_items?: Array<{
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    invoice_name?: string;
  }>;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any []>([])
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [maxInvoices, setMaxInvoices] = useState(10)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { userInfo, loading: userInfoLoading } = useInvoicePDF()

  // Initial load
  useEffect(() => {
    loadInvoiceData()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    loadInvoiceData()
  }

  async function loadInvoiceData() {
    try {
      // Use Promise.all for better performance
      await Promise.all([
        fetchInvoiceCount(),
        fetchInvoiceLimit(),
        fetchInvoices()
      ])
    } catch (error) {
      console.error('Error loading invoice data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchInvoiceLimit(){
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('Could not get user:', userError?.message)
        return
      }

      // Check subscription directly from subscriptions table
      const { data: subscriptionData, error: dbError } = await supabase
        .from('subscriptions')
        .select('stripe_price_id, status, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (dbError) {
        console.log('No active subscription found:', dbError.message)
        setMaxInvoices(2); // Default to free tier
        return
      }
      
      if (subscriptionData) {
        const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
        
        // Check if subscription is active OR cancelled but still in billing period
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const hasAccess = status === 'active' || 
                         (status === 'canceled' && cancel_at_period_end && current_period_end > now);
        
        if (hasAccess) {
          // Map price IDs to invoice limits
          switch (stripe_price_id) {
            case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
              setMaxInvoices(40); // Expert Freelancer
              break;
            case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
              setMaxInvoices(20); // Seasoned Freelancer
              break;
            case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
              setMaxInvoices(10); // New Freelancer
              break;
            // Legacy price IDs (keep for backwards compatibility)
            case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
              setMaxInvoices(40); // Expert Freelancer
              break;
            case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
              setMaxInvoices(20); // Seasoned Freelancer
              break;
            case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
              setMaxInvoices(10); // New Freelancer
              break;
            default:
              setMaxInvoices(2); // Free tier
          }
        } else {
          setMaxInvoices(2); // Subscription expired or inactive
        }
      } else {
        setMaxInvoices(2); // No subscription
      }
    } catch (error) {
      console.error('Unexpected error in fetchInvoiceLimit:', error);
      setMaxInvoices(2);
    }
  }

  // Log maxInvoices when it changes
  useEffect(() => {
    if (maxInvoices !== 10 || !loading) { // Only log when it's not the default value or when loading is complete
      console.log('Current max invoices:', maxInvoices);
    }
  }, [maxInvoices, loading]);

  async function fetchInvoiceCount() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.log('Could not get user:', userError?.message)
        return
      }

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('invoice_count')
        .eq('user_id', user.id)
        .single()

      if (dbError) {
        console.error('Error fetching invoice count:', dbError)
        setInvoiceCount(0);
        return
      }

      if (userData) {
        setInvoiceCount(userData.invoice_count || 0)
      }
    } catch (error) {
      console.error('Unexpected error in fetchInvoiceCount:', error);
      setInvoiceCount(0);
    }
  }

  async function fetchInvoices() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.log('Could not get user:', userError?.message)
        return
      }

      // Simplified query - get basic invoice data first
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, invoice_number, client_id, issue_date, due_date, total, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError)
        return
      }

      if (!invoicesData || invoicesData.length === 0) {
        setInvoices([])
        return
      }

      // Get unique client IDs and invoice IDs for separate queries
      const clientIds = Array.from(new Set(invoicesData.map(inv => inv.client_id).filter(Boolean)))
      const invoiceIds = invoicesData.map(inv => inv.id)

      // Fetch clients and invoice items separately (smaller queries)
      const [clientsData, itemsData] = await Promise.all([
        clientIds.length > 0 ? supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds) : Promise.resolve({ data: [] }),
        
        supabase
          .from('invoice_items')
          .select('invoice_id, id, invoice_name')
          .in('invoice_id', invoiceIds)
      ])

      // Manually join the data
      const clientsMap = new Map(clientsData.data?.map(c => [c.id, c]) || [])
      const itemsMap = new Map()
      
      itemsData.data?.forEach(item => {
        if (!itemsMap.has(item.invoice_id)) {
          itemsMap.set(item.invoice_id, [])
        }
        itemsMap.get(item.invoice_id).push(item)
      })

      const enrichedInvoices = invoicesData.map(invoice => ({
        ...invoice,
        clients: clientsMap.get(invoice.client_id) || null,
        invoice_items: itemsMap.get(invoice.id) || []
      }))

      setInvoices(enrichedInvoices)
     
    } catch (error) {
      console.error('Unexpected error in fetchInvoices:', error)
      setInvoices([])
    }
  }
  const createNewInvoice = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/sign-in')
        return
      }
    } catch (error) {
      console.error('Error in createNewInvoice:', error)
      alert('Failed to create invoice. Please try again.')
    }
  }

  const downloadInvoice = (invoice: any) => {
    // This function will be replaced by the PDFDownloadLink component
    console.log('Downloading invoice:', invoice.invoice_number)
  }

  const sendInvoice = (invoiceId: string) => {
    // Send invoice logic here
  }


  const deleteInvoice = async (invoiceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/dashboard/invoices");
      return;
    }

    try {
      // First, delete all invoice items for this invoice
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (itemsError) {
        console.error('Error deleting invoice items:', itemsError);
        alert('Failed to delete invoice items. Please try again.');
        return;
      }

      // Then, delete the invoice
      const { data: deletedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (invoiceError) {
        console.error('Error deleting invoice:', invoiceError);
        alert('Failed to delete invoice. Please try again.');
        return;
      }

      // Update invoice count
      await supabase
        .from('users')
        .update({ invoice_count: invoiceCount - 1 })
        .eq('user_id', user.id);

      // Refresh data
      handleRefresh();

      console.log('Invoice deleted successfully');
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  }
  const cancreateInvoice = invoiceCount < maxInvoices;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <CreateInvoiceDialog onSuccess={handleRefresh}>
            <Button onClick={createNewInvoice} disabled = {!cancreateInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </CreateInvoiceDialog>
        </div>
      </div>

      {invoiceCount >= maxInvoices && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached your free invoice limit ({maxInvoices}). Upgrade to create more invoices.
          </AlertDescription>
        </Alert>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Invoice #</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Start Date</th>
                  <th className="text-left py-3 px-4">Due Date</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No invoices yet
                    </td>
                  </tr>
                ) :
                  invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-3 px-4">{invoice.invoice_number}</td>
                      <td className="py-3 px-4">{invoice.invoice_items?.[0]?.invoice_name || 'N/A'}</td>
                      <td className="py-3 px-4">{invoice.clients?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${invoice.total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <EditInvoiceDialog 
                            invoice={invoice}
                            onSuccess={handleRefresh}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </EditInvoiceDialog>
                          <PDFDownloadLink
                            document={<InvoicePDF invoice={invoice} userInfo={userInfo} />}
                            fileName={`invoice-${invoice.invoice_number || 'unknown'}.pdf`}
                          >
                            {({ loading }) => (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={loading || userInfoLoading || !invoice?.id}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </PDFDownloadLink>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendInvoice(invoice.id)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteInvoice(invoice.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 
