'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, AlertTriangle, Plus, SearchX, Trophy, Users, Wallet } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { Segmented } from '@/components/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useDebounce } from '@/hooks/use-debounce'
import { useClients } from '@/hooks/use-clients'
import { useInvoices } from '@/hooks/use-invoices'
import { useUser } from '@/hooks/use-user'
import { todayISO } from '@/lib/analytics'
import { money, percent } from '@/lib/format'
import {
  filterClients,
  sortClients,
  statsByClient,
  type ClientFilter,
  type ClientSort,
} from '@/lib/invoice-utils'
import AddClientDialog from './add-client-dialog'
import ClientList from './client-list'
import ClientDetailDialog from './client-detail-dialog'
import DeleteClientDialog from './delete-client-dialog'
import EditClientDialog from './edit-client-dialog'
import type { Client } from '@/types/client'

const SORTS: { id: ClientSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'revenue', label: 'Most revenue' },
  { id: 'outstanding', label: 'Most owed' },
]

function PageHeader({ action }: { action: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone you work with, and what they've paid or still owe.</p>
      </div>
      {action}
    </header>
  )
}

const addClientButton = (
  <AddClientDialog>
    <Button className="gap-2">
      <Plus className="h-4 w-4" /> Add client
    </Button>
  </AddClientDialog>
)

export default function ClientsPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [filter, setFilter] = useState<ClientFilter>('all')
  const [sort, setSort] = useState<ClientSort>('newest')
  // One dialog for the whole list, mounted only for the selected client.
  const [dialog, setDialog] = useState<{ type: 'view' | 'edit' | 'delete'; client: Client } | null>(null)
  const closeDialog = (open: boolean) => !open && setDialog(null)

  const { data: user, isLoading: userLoading } = useUser()
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients(user?.id || '')
  // Same query the Invoices page uses, so React Query shares the cache.
  const { data: invoices } = useInvoices(user?.id || '')

  const today = useMemo(() => todayISO(), [])
  const all = clients ?? []
  const stats = useMemo(() => statsByClient((invoices ?? []) as any[], today), [invoices, today])

  const totals = useMemo(() => {
    let paid = 0
    let outstanding = 0
    let owing = 0
    let top: { name: string; paid: number } | null = null
    for (const c of all) {
      const s = stats.get(c.id)
      if (!s) continue
      paid += s.paid
      outstanding += s.outstanding
      if (s.outstanding > 0) owing++
      if (s.paid > 0 && (!top || s.paid > top.paid)) top = { name: c.name, paid: s.paid }
    }
    return { paid, outstanding, owing, top }
  }, [all, stats])

  const counts = useMemo(
    () => ({
      all: all.length,
      owes: all.filter((c) => (stats.get(c.id)?.outstanding ?? 0) > 0).length,
      none: all.filter((c) => !stats.get(c.id)?.invoices).length,
    }),
    [all, stats],
  )

  const rows = useMemo(
    () => sortClients(filterClients(all, stats, { query: debouncedQuery, filter }), stats, sort),
    [all, stats, debouncedQuery, filter, sort],
  )

  if (!userLoading && !user) {
    router.push('/sign-in')
    return null
  }

  if (userLoading || clientsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader action={<Button disabled className="gap-2"><Plus className="h-4 w-4" /> Add client</Button>} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <div className="space-y-2 rounded-xl border bg-card p-4">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      </div>
    )
  }

  if (clientsError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader action={addClientButton} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading clients: {(clientsError as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader action={addClientButton} />

      {all.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card">
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add a client to start sending them contracts and invoices. You'll see what each one has paid and still owes right here."
          >
            {addClientButton}
          </EmptyState>
        </div>
      ) : (
        <>
          <section aria-label="Client totals" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Clients"
              value={String(all.length)}
              sub={counts.none ? `${counts.none} with no invoices yet` : 'All have invoices'}
            />
            <StatCard
              icon={Wallet}
              label="Total paid"
              value={money(totals.paid)}
              sub="Across all clients"
              tone="success"
            />
            <StatCard
              icon={AlertTriangle}
              label="Owed to you"
              value={money(totals.outstanding)}
              sub={totals.owing ? `${totals.owing} ${totals.owing === 1 ? 'client owes' : 'clients owe'} you. Click to review` : 'Nobody owes you'}
              tone={totals.outstanding > 0 ? 'warning' : 'default'}
              onClick={totals.owing ? () => setFilter('owes') : undefined}
              active={filter === 'owes'}
            />
            <StatCard
              icon={Trophy}
              label="Top client"
              value={totals.top?.name ?? '—'}
              sub={totals.top ? `${money(totals.top.paid)} · ${percent(totals.paid ? totals.top.paid / totals.paid : 0)} of revenue` : 'No paid invoices yet'}
            />
          </section>

          <section aria-label="Filters" className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search clients…"
              value={query}
              onChange={setQuery}
              className="w-full sm:w-80"
            />
            <Segmented
              label="Show clients"
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All', count: counts.all },
                { id: 'owes', label: 'Owes you', count: counts.owes },
                { id: 'none', label: 'No invoices', count: counts.none },
              ]}
            />
            <Select value={sort} onValueChange={(v) => setSort(v as ClientSort)}>
              <SelectTrigger className="h-9 w-full sm:ml-auto sm:w-44" aria-label="Sort clients">
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
          </section>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card">
              <EmptyState icon={SearchX} title="No clients match" description="Try a different search, or clear the filters.">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setFilter('all')
                  }}
                >
                  Clear filters
                </Button>
              </EmptyState>
            </div>
          ) : (
            <>
              <ClientList
                clients={rows}
                stats={stats}
                onView={(client) => setDialog({ type: 'view', client })}
                onEdit={(client) => setDialog({ type: 'edit', client })}
                onDelete={(client) => setDialog({ type: 'delete', client })}
              />
              <p className="text-sm text-muted-foreground">
                Showing {rows.length} of {all.length} {all.length === 1 ? 'client' : 'clients'}
              </p>
            </>
          )}
        </>
      )}

      {dialog?.type === 'view' && <ClientDetailDialog key={dialog.client.id} client={dialog.client} open onOpenChange={closeDialog} />}
      {dialog?.type === 'edit' && <EditClientDialog key={dialog.client.id} client={dialog.client} open onOpenChange={closeDialog} />}
      {dialog?.type === 'delete' && <DeleteClientDialog key={dialog.client.id} client={dialog.client} open onOpenChange={closeDialog} />}
    </div>
  )
}
