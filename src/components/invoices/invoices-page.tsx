'use client'

import { Button } from "@/components/ui/button"
import { Plus, FileText, Download, Mail, Trash, Pencil, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import CreateInvoiceDialog from "./create-invoice-dialog"
import EditInvoiceDialog from "./edit-invoice-dialog"
import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoicePDF from './invoice-pdf'
import { useInvoicePDF } from '../../hooks/use-invoice-pdf'
import { useState } from "react"
import { DeleteInvoiceDialog } from "./delete-invoice-dialog"
// React Query hooks
import { useUser } from '@/hooks/use-user'
import { useQueryClient } from '@tanstack/react-query'
import { 
  useInvoices, 
  useUserSubscription, 
  useInvoiceCount, 
  useCanCreateInvoice,
  useSendInvoice,
  useUpdateInvoice
} from '@/hooks/use-invoices'

export default function InvoicesPage() {
  const router = useRouter()
  const { userInfo, loading: userInfoLoading } = useInvoicePDF()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  
  // React Query hooks
  const { data: user, isLoading: userLoading } = useUser()
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices(user?.id || '')
  const { data: subscription } = useUserSubscription(user?.id || '')
  const { data: invoiceCount } = useInvoiceCount(user?.id || '')
  const { canCreate, currentCount, maxInvoices } = useCanCreateInvoice(user?.id || '')
  const sendInvoice = useSendInvoice();
  const updateInvoice = useUpdateInvoice();

  //master loading state
  const isLoading = userLoading || invoicesLoading

  const createNewInvoice = async () => {
    if (!user) {
      router.push('/sign-in')
      return
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    try {
      await sendInvoice.mutateAsync({ id: invoiceId, userId: user.id })
      console.log('Invoice sent successfully')
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Failed to send invoice. Please try again.')
    }
  }


  const handleUpdateInvoice = async(invoiceId:string) => {
    if (!user){
      router.push('/sign-in')
      return
    }
    try {
      await updateInvoice.mutateAsync({ 
        id: invoiceId,
        user_id: user.id,  // Use user_id to match the interface
        status: 'paid'     
      })

    }catch(error){
      console.error('Failed to update invoice:', error)
    }
  }

  //display clean spinner if masterloading
  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading user data...</span>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
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
    )
  }

 
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoices</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your invoices.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Loading state for invoices
  if (invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading invoices...</span>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading invoices...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (invoicesError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="flex items-center gap-2">
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading invoices: {invoicesError.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          <CreateInvoiceDialog onSuccess={() => {
            // Invalidate and refetch invoices to show new invoice
            queryClient.invalidateQueries({ queryKey: ['invoices', user.id] })
          }}>
            <Button onClick={createNewInvoice} disabled={!canCreate || isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </CreateInvoiceDialog>
        </div>
      </div>

      {currentCount >= maxInvoices && (
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
                {!invoices || invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No invoices yet
                    </td>
                  </tr>
                ) : (
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
                            onSuccess={() => {
                              // Invalidate and refetch invoices to show updated data
                              queryClient.invalidateQueries({ queryKey: ['invoices', user.id] })
                            }}
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
                            onClick={() => handleSendInvoice(invoice.id)}
                            disabled={sendInvoice.isPending}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DeleteInvoiceDialog
        invoice={selectedInvoice}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}/>
    </div>
  )
} 
