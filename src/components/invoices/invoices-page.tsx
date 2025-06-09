'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Download, Mail, Trash} from "lucide-react"
import { createClient } from "../../../supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Redirect } from "next"

interface Invoice {
  id: string;
  invoice_number: string;
  client_name?: string;
  issue_date: string;
  total: number;
  status: 'draft' | 'pending' | 'paid';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [maxInvoices, setMaxInvoices] = useState(10)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchInvoices()
    fetchInvoiceLimit()
  }, [])

  async function fetchInvoiceLimit() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('invoice_count, max_invoices')
      .eq('id', user.id)
      .single()

    if (userData) {
      setInvoiceCount(userData.invoice_count || 0)
      setMaxInvoices(userData.max_invoices || 10)
    }
  }

  async function fetchInvoices() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setInvoices(data)
    }
  }

  const createNewInvoice = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }

      // Check if user has reached their invoice limit
      if (invoiceCount >= maxInvoices) {
        alert(`You've reached your free invoice limit (${maxInvoices}). Please upgrade to create more invoices.`)
        return
      }

      // Create new invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: `INV-${Date.now()}`,
          issue_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          status: 'draft',
          subtotal: 0,
          total: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invoice:', error)
        return
      }

      // Update invoice count
      await supabase
        .from('users')
        .update({ invoice_count: invoiceCount + 1 })
        .eq('id', user.id)

      // Refresh data without navigation
      await Promise.all([
        fetchInvoiceLimit(),
        fetchInvoices()
      ])

      // Show success message
      alert('Invoice created successfully!')
    } catch (error) {
      console.error('Error in createNewInvoice:', error)
      alert('Failed to create invoice. Please try again.')
    }
  }

  const downloadInvoice = (invoiceId: string) => {
    // Download invoice logic here
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

    const { data: deletedInvoice, error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting invoice:', error);
      return;
    }

    // Update invoice count
    await supabase
      .from('users')
      .update({ invoice_count: invoiceCount - 1 })
      .eq('id', user.id);

    // Refresh both invoice count and list concurrently
    await Promise.all([
      fetchInvoiceLimit(),
      fetchInvoices()
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={createNewInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
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
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No invoices yet
                    </td>
                  </tr>
                ) :
                  invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-3 px-4">{invoice.invoice_number}</td>
                      <td className="py-3 px-4">{invoice.client_name}</td>
                      <td className="py-3 px-4">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${invoice.total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadInvoice(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
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