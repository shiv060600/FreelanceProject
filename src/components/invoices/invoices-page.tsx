'use client'

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Download, Mail, Trash, Pencil, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { SortHeader } from "@/components/ui/sort-header"
import CreateInvoiceDialog from "./create-invoice-dialog"
import EditInvoiceDialog from "./edit-invoice-dialog"
import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoicePDF from './invoice-pdf'
import { useInvoicePDF } from '../../hooks/use-invoice-pdf'
import { DeleteInvoiceDialog } from "./delete-invoice-dialog"
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

type SortDirection = 'asc' | 'desc' | null

export default function InvoicesPage() {
  const router = useRouter()
  const { userInfo, loading: userInfoLoading } = useInvoicePDF()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: SortDirection }>({
    key: 'created_at',
    direction: 'desc'
  })

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // Cycle through: desc -> asc -> null -> desc
        if (prevConfig.direction === 'desc') return { key, direction: 'asc' }
        if (prevConfig.direction === 'asc') return { key: null, direction: null }
        return { key, direction: 'desc' }
      }
      return { key, direction: 'desc' }
    })
  }
  
  // React Query hooks
  const { data: user, isLoading: userLoading } = useUser();
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices(user?.id || '');
  const { data: subscription } = useUserSubscription(user?.id || '');
  const { data: invoiceCount } = useInvoiceCount(user?.id || '');
  const { canCreate, currentCount, maxInvoices } = useCanCreateInvoice(user?.id || '');
  const sendInvoice = useSendInvoice();
  const updateInvoice = useUpdateInvoice();

  //Master loading state
  const isLoading = userLoading || invoicesLoading

  // Filter and sort invoices useMemo
  const filteredAndSortedInvoices = useMemo(() => {
    if (!invoices) return []
    
    let result = [...invoices]

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        (invoice.invoice_items?.[0]?.invoice_name && 
         invoice.invoice_items[0].invoice_name.toLowerCase().includes(searchLower)) ||
        (invoice.clients?.name && 
         invoice.clients.name.toLowerCase().includes(searchLower))
      )
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortConfig.key) {
          case 'issue_date':
            aValue = new Date(a.issue_date).getTime()
            bValue = new Date(b.issue_date).getTime()
            break
          case 'due_date':
            aValue = new Date(a.due_date).getTime()
            bValue = new Date(b.due_date).getTime()
            break
          case 'total':
            aValue = a.total
            bValue = b.total
            break
          case 'created_at':
            aValue = new Date(a.created_at).getTime()
            bValue = new Date(b.created_at).getTime()
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [invoices, searchTerm, sortConfig])
  
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

  //Display spinner if loading
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
            <Button disabled = {!canCreate}>
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
            <Button disabled={!canCreate || isLoading}>
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

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <SearchInput
          placeholder="Search by invoice #, invoice name, or client..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="max-w-md"
        />
        {searchTerm && (
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedInvoices.length} of {invoices?.length || 0} invoices
          </span>
        )}
      </div>

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
                  <th className="text-left py-3 px-4">
                    <SortHeader 
                      sortKey="issue_date" 
                      currentSort={sortConfig} 
                      onSort={handleSort}
                      className="text-left"
                    >
                      Start Date
                    </SortHeader>
                  </th>
                  <th className="text-left py-3 px-4">
                    <SortHeader 
                      sortKey="due_date" 
                      currentSort={sortConfig} 
                      onSort={handleSort}
                      className="text-left"
                    >
                      Due Date
                    </SortHeader>
                  </th>
                  <th className="text-left py-3 px-4">
                    <SortHeader 
                      sortKey="total" 
                      currentSort={sortConfig} 
                      onSort={handleSort}
                      className="text-left"
                    >
                      Amount
                    </SortHeader>
                  </th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      {!invoices || invoices.length === 0 ? (
                        "No invoices yet"
                      ) : (
                        "No invoices found matching your search"
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedInvoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-3 px-4">{invoice.invoice_number}</td>
                      <td className="py-3 px-4">{invoice.invoice_items?.[0]?.invoice_name || 'N/A'}</td>
                      <td className="py-3 px-4">{invoice.clients?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${invoice.subtotal}</td>
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
