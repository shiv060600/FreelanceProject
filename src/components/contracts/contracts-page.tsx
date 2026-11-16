'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  CalendarPlus,
  FileSignature,
  FileText,
  Plus,
  Scale,
  SearchX,
  Sparkles,
  Users,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { Segmented } from '@/components/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useToast } from '@/components/ui/use-toast'
import { useAiAllowance } from '@/hooks/use-ai-allowance'
import { useCanCreateContract, useContracts } from '@/hooks/use-contracts'
import { useDebounce } from '@/hooks/use-debounce'
import { useUser } from '@/hooks/use-user'
import { todayISO } from '@/lib/analytics'
import { saveBlob } from '@/lib/download'
import { formatLimit } from '@/lib/contracts/limits'
import {
  clientNameOf,
  contractFileName,
  contractMeta,
  filterContracts,
  sortContracts,
  summarizeContracts,
  type ContractFilter,
  type ContractSort,
} from '@/lib/contracts/library'
import { ContractCard } from './contract-card'
import { buildContractPdf } from './contract-pdf-actions'
import { ContractViewDialog } from './contract-view-dialog'
import CreateContractDialog from './create-contract-dialog'
import { DeleteContractDialog } from './delete-contract-dialog'
import { EditContractDialog } from './edit-contract-dialog'

const PAGE_SIZE = 12

const SORTS: { id: ContractSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'title', label: 'Title (A–Z)' },
  { id: 'client', label: 'Client (A–Z)' },
]

function PageHeader({ action }: { action: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Draft with AI or write your own, then preview, download and send.</p>
      </div>
      {action}
    </header>
  )
}

export default function ContractsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [filter, setFilter] = useState<ContractFilter>('all')
  const [clientId, setClientId] = useState('all')
  const [sort, setSort] = useState<ContractSort>('newest')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const [createOpen, setCreateOpen] = useState(false)
  const [viewing, setViewing] = useState<any>(null)
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<any>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const { data: user, isLoading: userLoading } = useUser()
  const { data: contracts, isLoading: contractsLoading, error: contractsError } = useContracts(user?.id || '')
  const { canCreate, currentCount, maxContracts } = useCanCreateContract(user?.id || '')
  const ai = useAiAllowance(user?.id || '')

  const today = useMemo(() => todayISO(), [])
  const all = (contracts ?? []) as any[]

  // Computing a contract's excerpt/placeholders means parsing its text; do it once per contract.
  const metaById = useMemo(() => new Map(all.map((c) => [c.id, contractMeta(c)])), [all])
  const metaOf = (c: { id: string }) => metaById.get(c.id) ?? contractMeta(c as any)

  const summary = useMemo(() => summarizeContracts(all, today, metaOf), [all, today, metaById])

  const clients = useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of all) if (c.client_id) seen.set(c.client_id, clientNameOf(c))
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [all])

  const rows = useMemo(
    () => sortContracts(filterContracts(all, { query: debouncedQuery, filter, clientId }, metaOf), sort),
    [all, debouncedQuery, filter, clientId, sort, metaById],
  )
  const shown = rows.slice(0, visible)
  const filtersActive = query !== '' || filter !== 'all' || clientId !== 'all'

  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setVisible(PAGE_SIZE)
  }
  const resetFilters = () => {
    setQuery('')
    setFilter('all')
    setClientId('all')
    setVisible(PAGE_SIZE)
  }

  // ---- actions --------------------------------------------------------------

  const handleDownload = async (contract: any) => {
    setPendingId(contract.id)
    try {
      saveBlob(await buildContractPdf(contract, user), contractFileName(contract))
    } catch (error) {
      console.error('Failed to build contract PDF:', error)
      toast({ title: 'Could not create the PDF', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setPendingId(null)
    }
  }

  /**
   * mailto: links can't carry attachments, and the old version put a blob: URL in
   * the body, which only opens in the sender's own browser tab. Save the PDF, open
   * a draft email, and tell the user to attach it.
   */
  const handleEmail = async (contract: any) => {
    setPendingId(contract.id)
    try {
      const fileName = contractFileName(contract)
      saveBlob(await buildContractPdf(contract, user), fileName)
      const name = user?.user_metadata?.full_name || user?.email || ''
      const subject = `Contract: ${contract.title}`
      const body =
        `Hi ${contract.clients?.name ?? 'there'},\n\n` +
        `Please find the contract "${contract.title}" attached for your review. ` +
        `Let me know if you have any questions or would like changes.\n\nThank you,\n${name}`
      window.location.href = `mailto:${contract.clients?.email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      toast({ title: 'PDF saved to your downloads', description: `Attach ${fileName} to the email that just opened.` })
    } catch (error) {
      console.error('Failed to prepare contract email:', error)
      toast({ title: 'Could not prepare the email', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setPendingId(null)
    }
  }

  const openEdit = (contract: any) => {
    setViewing(null)
    setEditing(contract)
  }

  // ---- states ---------------------------------------------------------------

  if (!userLoading && !user) {
    router.push('/sign-in')
    return null
  }

  const newButton = (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" className="gap-2">
        <Link href="/dashboard/contracts-information">
          <Scale className="h-4 w-4" /> Legal guide
        </Link>
      </Button>
      <Button onClick={() => setCreateOpen(true)} disabled={!canCreate || userLoading} className="gap-2" title={canCreate ? undefined : 'Contract limit reached'}>
        <Plus className="h-4 w-4" /> New contract
      </Button>
    </div>
  )

  if (userLoading || contractsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader action={<Button disabled className="gap-2"><Plus className="h-4 w-4" /> New contract</Button>} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-60 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (contractsError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader action={newButton} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading contracts: {(contractsError as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader action={newButton} />

      {!canCreate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            Contract limit reached ({currentCount}/{maxContracts}). Upgrade to add more.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>
      )}

      {all.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card">
          <EmptyState
            icon={FileSignature}
            title="No contracts yet"
            description="Describe the deal and AI drafts a contract in seconds, or write one yourself. Anything you still need to fill in is highlighted."
          >
            <Button onClick={() => setCreateOpen(true)} disabled={!canCreate} className="gap-2">
              <Sparkles className="h-4 w-4" /> Create your first contract
            </Button>
          </EmptyState>
        </div>
      ) : (
        <>
          <section aria-label="Contract totals" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Contracts"
              value={String(summary.total)}
              sub={`${summary.clients} ${summary.clients === 1 ? 'client' : 'clients'}`}
            />
            <StatCard
              icon={AlertTriangle}
              label="Need attention"
              value={String(summary.attention)}
              sub={summary.attention ? 'Have blanks to fill in. Click to review' : 'Everything is complete'}
              tone={summary.attention ? 'warning' : 'success'}
              onClick={summary.attention ? () => withReset(setFilter)('attention') : undefined}
              active={filter === 'attention'}
            />
            <StatCard
              icon={CalendarPlus}
              label="Added this month"
              value={String(summary.thisMonth)}
              sub={new Date(`${today}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <StatCard
              icon={Sparkles}
              label="AI drafts left today"
              value={ai.loading ? '—' : `${Number.isFinite(ai.limit) ? ai.remaining : '∞'}`}
              sub={ai.loading ? undefined : `${ai.used} of ${formatLimit(ai.limit)} used · ${ai.plan} plan`}
              tone={!ai.loading && ai.remaining === 0 ? 'danger' : 'default'}
              onClick={canCreate && ai.remaining > 0 ? () => setCreateOpen(true) : undefined}
            />
          </section>

          <section aria-label="Filters" className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search contracts…"
              value={query}
              onChange={withReset(setQuery)}
              className="w-full sm:w-72"
            />
            <Segmented
              label="Show contracts"
              value={filter}
              onChange={withReset(setFilter)}
              options={[
                { id: 'all', label: 'All', count: summary.total },
                { id: 'attention', label: 'Need attention', count: summary.attention },
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
              <Select value={sort} onValueChange={(v) => setSort(v as ContractSort)}>
                <SelectTrigger className="h-9 min-w-0 flex-1 sm:w-44 sm:flex-none" aria-label="Sort contracts">
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
                title="No contracts match"
                description="Try a different search (it looks inside the contract text too), or clear the filters."
              >
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((contract: any) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    meta={metaOf(contract)}
                    pending={pendingId === contract.id}
                    onView={setViewing}
                    onEdit={openEdit}
                    onDownload={handleDownload}
                    onEmail={handleEmail}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
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

      <CreateContractDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ContractViewDialog
        contract={viewing}
        user={user}
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        onEdit={openEdit}
        onDownload={handleDownload}
        onEmail={handleEmail}
        busy={!!viewing && pendingId === viewing.id}
      />

      {editing && (
        <EditContractDialog contract={editing} open onOpenChange={(o) => !o && setEditing(null)} />
      )}

      <DeleteContractDialog contract={deleting} open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} />
    </div>
  )
}
