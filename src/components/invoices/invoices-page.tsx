'use client'
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Download, Mail, Trash, Pencil, RefreshCw, Eye} from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { SortHeader } from "@/components/ui/sort-header"
import CreateInvoiceDialog from "./create-invoice-dialog"
import EditInvoiceDialog from "./edit-invoice-dialog"
import InvoicePreview from "./invoice-preview"
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
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState<boolean>(false);
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
  const { userInfo, loading: userInfoLoading } = useInvoicePDF()
  const userInfoForPdf = { 
      name: userInfo.name || 'not set',
      email: userInfo.email || 'not set',
      address: userInfo.address || 'not set',
      venmo_username: userInfo.venmo_username,
      cashapp_username: userInfo.cashapp_username
    };
  const { data: subscription } = useUserSubscription(user?.id || '');
  const { data: invoiceCount } = useInvoiceCount(user?.id || '');
  const { canCreate, currentCount, maxInvoices } = useCanCreateInvoice(user?.id!);
  const sendInvoice = useSendInvoice();
  const updateInvoice = useUpdateInvoice();

  //Master loading state
  const isLoading = userLoading || invoicesLoading

  // Filter and sort invoices useMemo
  const filteredAndSortedInvoices = useMemo(() => {
    if (!invoices) return []
    
    let result = [...invoices]

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
  
  const handleSendInvoice = async (invoice: any) => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    try {
      const { pdf } = await import('@react-pdf/renderer')
      
      // Create the PDF document component with userInfo and client data
      const invoicePdf = (
        <InvoicePDF 
          invoice={invoice} 
          userInfo={userInfoForPdf}
          clientData={invoice.clients ? {
            name: invoice.clients.name || 'N/A',
            email: invoice.clients.email || 'N/A',
            phone: invoice.clients.phone || 'N/A',
            company: invoice.clients.company || 'N/A',
            address: invoice.clients.address || 'N/A'
          } : undefined}
        />
      )
      
      // Generate blob from PDF component
      const invoicePdfBlob = await pdf(invoicePdf).toBlob()
      
      // Create a blob URL that can be clicked to view the PDF
      const blobUrl = URL.createObjectURL(invoicePdfBlob)
      
      // Create mailto link with the blob URL in the body
      const subject = encodeURIComponent(`Invoice ${invoice.invoice_number} - ${invoice.invoice_items?.[0]?.invoice_name || 'Invoice'}`)
      const body = encodeURIComponent(`Please review the invoice by clicking this link:\n\n${blobUrl}\n\nBest regards`)
      const to = invoice.clients?.email || ''
      const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`
      
      // Open default email client with the blob URL in the body
      window.location.href = mailtoLink
      
      // Note: DO NOT revoke the URL - it needs to stay valid for the recipient to click
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Failed to open email client')
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
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your invoice payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          <CreateInvoiceDialog onSuccess={() => {
            // Invalidate and refetch invoices to show new invoice
            queryClient.invalidateQueries({ queryKey: ['invoices', user.id] })
            queryClient.invalidateQueries({queryKey:["invoice-count",user.id]})
          }}>
            <Button disabled={!canCreate || isLoading} className="shadow-sm">
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
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-4 border border-blue-100/50">
        <div className="flex items-center gap-4 flex-1">
          <SearchInput
            placeholder="Search by invoice #, invoice name, or client..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md bg-white shadow-sm"
          />
          {searchTerm && (
            <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-md shadow-sm">
              {filteredAndSortedInvoices.length} of {invoices?.length || 0} invoices
            </span>
          )}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gradient-to-r from-gray-50 to-gray-50/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Invoice #</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  <SortHeader 
                    sortKey="issue_date" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                    className="text-left"
                  >
                    Start Date
                  </SortHeader>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  <SortHeader 
                    sortKey="due_date" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                    className="text-left"
                  >
                    Due Date
                  </SortHeader>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  <SortHeader 
                    sortKey="total" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                    className="text-left"
                  >
                    Amount
                  </SortHeader>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-base font-medium">
                        {!invoices || invoices.length === 0 ? (
                          "No invoices yet"
                        ) : (
                          "No invoices found matching your search"
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedInvoices.map((invoice: any) => (
                  <tr 
                    key={invoice.id} 
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {invoice.invoice_number}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{invoice.invoice_items?.[0]?.invoice_name || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{invoice.clients?.name || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-600">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-gray-600">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(invoice.total || invoice.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        invoice.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
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
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </EditInvoiceDialog>
                        <PDFDownloadLink
                          document={
                            <InvoicePDF 
                              invoice={invoice} 
                              userInfo={userInfoForPdf}
                              clientData={invoice.clients ? {
                                name: invoice.clients.name || 'N/A',
                                email: invoice.clients.email || 'N/A',
                                phone: invoice.clients.phone || 'N/A',
                                company: invoice.clients.company || 'N/A',
                                address: invoice.clients.address || 'N/A'
                              } : undefined}
                            />
                          }
                          fileName={`invoice-${invoice.invoice_number || 'unknown'}.pdf`}
                        >
                          {({ loading }) => (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={loading || userInfoLoading || !invoice?.id || !invoice.clients}
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </PDFDownloadLink>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendInvoice(invoice)}
                          disabled={userInfoLoading || !invoice?.id || !invoice.clients}
                          className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={()=>{
                            setSelectedInvoice(invoice);
                            setInvoicePreviewOpen(!invoicePreviewOpen);
                          }}
                          disabled={userInfoLoading || !invoice?.id || !invoice.clients}
                          className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4"/>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setDeleteDialogOpen(true)
                          }}
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-colors"
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
      <DeleteInvoiceDialog
        invoice={selectedInvoice}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}/>
      
      <InvoicePreview
        invoice = {selectedInvoice}
        open = {invoicePreviewOpen}
        setOpen= {setInvoicePreviewOpen}
        userInfoForPdf= {userInfoForPdf}
      />
    </div>
  )
} 
