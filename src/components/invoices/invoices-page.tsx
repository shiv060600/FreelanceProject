'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, AlertTriangle, CheckCircle2, FileText, Plus, Receipt, SearchX, Wallet } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Segmented } from '@/components/ui/segmented'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useToast } from '@/components/ui/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { useUser } from '@/hooks/use-user'
import { useInvoicePDF } from '@/hooks/use-invoice-pdf'
import { useCanCreateInvoice, useInvoices, useUpdateInvoice } from '@/hooks/use-invoices'
import { formatDate, money, money2 } from '@/lib/format'
import { todayISO } from '@/lib/analytics'
import {
  countByState,
  filterInvoices,
  invoiceAmount,
  sortInvoices,
  summarizeInvoices,
  type InvoiceSort,
  type StatusFilter,
} from '@/lib/invoice-utils'
import CreateInvoiceDialog from './create-invoice-dialog'
import { DeleteInvoiceDialog } from './delete-invoice-dialog'
import EditInvoiceDialog from './edit-invoice-dialog'
import InvoicePreview from './invoice-preview'
import { InvoiceList } from './invoice-list'
import { buildInvoicePdf, invoiceFileName, saveBlob } from './invoice-pdf-actions'

const PAGE_SIZE = 25

const SORTS: { id: InvoiceSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'due', label: 'Due date (soonest)' },
  { id: 'amount_desc', label: 'Amount (high to low)' },
  { id: 'amount_asc', label: 'Amount (low to high)' },
  { id: 'client', label: 'Client (A–Z)' },
]

function PageHeader({ action }: { action: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create invoices, track who owes you, and mark them paid.</p>
      </div>
      {action}
    </header>
  )
}

export default function InvoicesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [clientId, setClientId] = useState('all')
  const [sort, setSort] = useState<InvoiceSort>('newest')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const [selected, setSelected] = useState<any>(null)
  const [editing, setEditing] = useState<any>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const { data: user, isLoading: userLoading } = useUser()
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices(user?.id || '')
  const { userInfo, loading: userInfoLoading } = useInvoicePDF()
  const { canCreate, currentCount, maxInvoices } = useCanCreateInvoice(user?.id!)
  const updateInvoice = useUpdateInvoice()

  const pdfUser = useMemo(
    () => ({
      name: userInfo.name || 'not set',
      email: userInfo.email || 'not set',
      address: userInfo.address || 'not set',
      venmo_username: userInfo.venmo_username,
      cashapp_username: userInfo.cashapp_username,
    }),
    [userInfo],
  )

  const today = useMemo(() => todayISO(), [])
  const all = (invoices ?? []) as any[]

  const counts = useMemo(() => countByState(all, today), [all, today])
  const summary = useMemo(() => summarizeInvoices(all, today), [all, today])

  const clients = useMemo(() => {
    const seen = new Map<string, string>()
    for (const i of all) if (i.client_id && i.clients?.name) seen.set(i.client_id, i.clients.name)
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [all])

  const rows = useMemo(
    () => sortInvoices(filterInvoices(all, { query: debouncedQuery, status, clientId, today }), sort),
    [all, debouncedQuery, status, clientId, sort, today],
  )
  const shown = rows.slice(0, visible)
  const filtersActive = query !== '' || status !== 'all' || clientId !== 'all'

  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setClientId('all')
    setVisible(PAGE_SIZE)
  }
  // Any filter change goes back to the first page of results.
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setVisible(PAGE_SIZE)
  }

  const refresh = () => {
    if (!user) return
    queryClient.invalidateQueries({ queryKey: ['invoices', user.id] })
    queryClient.invalidateQueries({ queryKey: ['invoice-count', user.id] })
  }

  // ---- actions --------------------------------------------------------------

  const handleSetPaid = async (invoice: any, paid: boolean) => {
    if (!user) return
    setPendingId(invoice.id)
    try {
      await updateInvoice.mutateAsync({ id: invoice.id, user_id: user.id, status: paid ? 'paid' : 'draft' })
      toast({
        title: paid ? 'Marked as paid' : 'Moved back to draft',
        description: `${invoice.invoice_number} · ${money2(invoiceAmount(invoice))}`,
      })
    } catch (error) {
      console.error('Failed to update invoice status:', error)
      toast({ title: 'Could not update the invoice', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setPendingId(null)
    }
  }

  const handleDownload = async (invoice: any) => {
    setPendingId(invoice.id)
    try {
      saveBlob(await buildInvoicePdf(invoice, pdfUser), invoiceFileName(invoice))
    } catch (error) {
      console.error('Failed to build invoice PDF:', error)
      toast({ title: 'Could not create the PDF', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setPendingId(null)
    }
  }

  /**
   * mailto: links can't carry attachments, and the previous version put a
   * blob: URL in the body, which only works in the sender's own browser tab,
   * so clients got a dead link. Instead: save the PDF, open the draft email,
   * and tell the user to attach it.
   */
  const handleEmail = async (invoice: any) => {
    setPendingId(invoice.id)
    try {
      const fileName = invoiceFileName(invoice)
      saveBlob(await buildInvoicePdf(invoice, pdfUser), fileName)

      const subject = `Invoice ${invoice.invoice_number}${invoice.invoice_name ? ` – ${invoice.invoice_name}` : ''}`
      const body =
        `Hi ${invoice.clients?.name ?? 'there'},\n\n` +
        `Please find invoice ${invoice.invoice_number} for ${money2(invoiceAmount(invoice))} attached, ` +
        `due ${formatDate(invoice.due_date)}.\n\nThank you,\n${pdfUser.name}`
      window.location.href = `mailto:${invoice.clients?.email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      toast({ title: 'PDF saved to your downloads', description: `Attach ${fileName} to the email that just opened.` })
    } catch (error) {
      console.error('Failed to prepare invoice email:', error)
      toast({ title: 'Could not prepare the email', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setPendingId(null)
    }
  }

  // ---- states ---------------------------------------------------------------

  if (!userLoading && !user) {
    router.push('/sign-in')
    return null
  }

  const newInvoiceButton = (
    <CreateInvoiceDialog onSuccess={refresh}>
      <Button disabled={!canCreate || userLoading} className="gap-2" title={canCreate ? undefined : 'Invoice limit reached'}>
        <Plus className="h-4 w-4" /> New invoice
      </Button>
    </CreateInvoiceDialog>
  )

  if (userLoading || invoicesLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader action={<Button disabled className="gap-2"><Plus className="h-4 w-4" /> New invoice</Button>} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <div className="space-y-2 rounded-xl border bg-card p-4">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    )
  }

  if (invoicesError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader action={newInvoiceButton} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading invoices: {(invoicesError as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader action={newInvoiceButton} />

      {!canCreate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            You've used all {maxInvoices} invoices on your plan.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>
      )}

      {all.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card">
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Create your first invoice and it'll show up here with its status, due date and a one-click way to mark it paid."
          >
            {newInvoiceButton}
          </EmptyState>
        </div>
      ) : (
        <>
          <section aria-label="Invoice totals" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              icon={Wallet}
              label="Outstanding"
              value={money(summary.outstanding.amount)}
              sub={`${summary.outstanding.count} unpaid ${summary.outstanding.count === 1 ? 'invoice' : 'invoices'}`}
              tone="warning"
            />
            <StatCard
              icon={AlertTriangle}
              label="Overdue"
              value={money(summary.overdue.amount)}
              sub={summary.overdue.count ? `${summary.overdue.count} past due. Click to review` : 'Nothing past due'}
              tone={summary.overdue.count ? 'danger' : 'default'}
              onClick={summary.overdue.count ? () => withReset(setStatus)('overdue') : undefined}
              active={status === 'overdue'}
            />
            <StatCard
              icon={CheckCircle2}
              label="Paid"
              value={money(summary.paid.amount)}
              sub={`${summary.paid.count} paid ${summary.paid.count === 1 ? 'invoice' : 'invoices'}`}
              tone="success"
            />
            <StatCard
              icon={FileText}
              label="Total invoices"
              value={String(all.length)}
              sub={maxInvoices < 100 ? `${currentCount} of ${maxInvoices} on your plan` : 'Across all clients'}
            />
          </section>

          <section aria-label="Filters" className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search invoices…"
              value={query}
              onChange={withReset(setQuery)}
              className="w-full sm:w-72"
            />
            <Segmented
              label="Status"
              value={status}
              onChange={withReset(setStatus)}
              options={[
                { id: 'all', label: 'All', count: counts.all },
                { id: 'draft', label: 'Draft', count: counts.draft },
                { id: 'overdue', label: 'Overdue', count: counts.overdue },
                { id: 'paid', label: 'Paid', count: counts.paid },
              ]}
            />
            <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
              <Select value={clientId} onValueChange={withReset(setClientId)}>
                <SelectTrigger className="h-9 min-w-0 flex-1 sm:w-44 sm:flex-none" aria-label="Filter by client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => setSort(v as InvoiceSort)}>
                <SelectTrigger className="h-9 min-w-0 flex-1 sm:w-48 sm:flex-none" aria-label="Sort invoices">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card">
              <EmptyState
                icon={SearchX}
                title="No invoices match"
                description="Try a different search, or clear the filters to see everything."
              >
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              </EmptyState>
            </div>
          ) : (
            <>
              <InvoiceList
                invoices={shown}
                today={today}
                pendingId={pendingId}
                pdfReady={!userInfoLoading}
                onPreview={(inv) => {
                  setSelected(inv)
                  setPreviewOpen(true)
                }}
                onDelete={(inv) => {
                  setSelected(inv)
                  setDeleteOpen(true)
                }}
                onDownload={handleDownload}
                onEmail={handleEmail}
                onSetPaid={handleSetPaid}
                onEdit={setEditing}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {shown.length} of {rows.length}
                  {filtersActive && rows.length !== all.length ? ` (filtered from ${all.length})` : ''}
                </span>
                {shown.length < rows.length && (
                  <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Show more
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}

      {editing && (
        <EditInvoiceDialog
          key={editing.id}
          invoice={editing}
          open
          onOpenChange={(o) => !o && setEditing(null)}
          onSuccess={refresh}
        />
      )}
      <DeleteInvoiceDialog invoice={selected} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <InvoicePreview invoice={selected} open={previewOpen} setOpen={setPreviewOpen} userInfoForPdf={pdfUser} />
    </div>
  )
}
