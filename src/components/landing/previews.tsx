import { AlertTriangle, CheckCircle2, Download, Receipt, Users, Wallet } from 'lucide-react'
import { ClientAvatar } from '@/components/shared/client-avatar'
import { StatusBadge } from '@/components/invoices/status-badge'
import { ContractDocument } from '@/components/contracts/contract-document'
import { DraftingNotes } from '@/components/contracts/drafting-notes'
import { StatCard } from '@/components/ui/stat-card'
import { cn } from '@/lib/utils'
import { money, money2 } from '@/lib/format'
import {
  SAMPLE_CLIENTS,
  SAMPLE_CONTRACT,
  SAMPLE_INVOICES,
  SAMPLE_NOTES,
  SAMPLE_OVERDUE_TOTAL,
  SAMPLE_PAID_TOTAL,
  SAMPLE_UNPAID_TOTAL,
} from './sample-data'

const HINT_TONE = { muted: 'text-muted-foreground', warning: 'text-warning', danger: 'text-destructive' } as const

/** Pure-CSS bars: the hero loads no chart library. */
function MiniBars() {
  const bars = [38, 52, 44, 61, 49, 70, 58, 66, 74, 82, 69, 90]
  return (
    <div className="flex h-36 items-end gap-1.5 sm:gap-2">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-primary" style={{ height: `${h}%`, opacity: 0.55 + (i / bars.length) * 0.45 }} />
      ))}
    </div>
  )
}

function InvoiceRow({ inv, compact }: { inv: (typeof SAMPLE_INVOICES)[number]; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0">
      <ClientAvatar name={inv.client} className="h-8 w-8 text-[11px]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{inv.client}</p>
        <p className="truncate text-xs leading-tight text-muted-foreground">{inv.number}</p>
      </div>
      {!compact && (
        <div className="hidden text-right text-xs sm:block">
          <p className="tabular-nums text-muted-foreground">{inv.due}</p>
          {inv.hint && <p className={cn('font-medium', HINT_TONE[inv.hintTone ?? 'muted'])}>{inv.hint}</p>}
        </div>
      )}
      <p className="w-24 text-right text-sm font-semibold tabular-nums">{money2(inv.amount)}</p>
      <StatusBadge state={inv.state} />
    </div>
  )
}

/** Hero: the dashboard at a glance. */
export function DashboardPreview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Paid revenue" value={money(SAMPLE_PAID_TOTAL)} delta={0.12} tone="success" />
        <StatCard icon={Receipt} label="Outstanding" value={money(SAMPLE_UNPAID_TOTAL)} sub="3 unpaid invoices" tone="warning" />
        <StatCard icon={AlertTriangle} label="Overdue" value={money(SAMPLE_OVERDUE_TOTAL)} sub="1 past due" tone="danger" />
        <StatCard icon={Users} label="Clients" value="8" sub="All have invoices" />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border p-4 lg:col-span-3">
          <p className="text-sm font-semibold">Paid revenue over time</p>
          <p className="mb-3 text-xs text-muted-foreground">Per month · by due date</p>
          <MiniBars />
        </div>
        <div className="rounded-xl border lg:col-span-2">
          <p className="border-b px-3 py-2.5 text-sm font-semibold">Recent invoices</p>
          {SAMPLE_INVOICES.slice(0, 4).map((i) => (
            <InvoiceRow key={i.number} inv={i} compact />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Invoices: overdue flagged, mark paid in one click. */
export function InvoicesPreview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Receipt} label="Outstanding" value={money(SAMPLE_UNPAID_TOTAL)} tone="warning" />
        <StatCard icon={AlertTriangle} label="Overdue" value={money(SAMPLE_OVERDUE_TOTAL)} tone="danger" />
        <StatCard icon={CheckCircle2} label="Paid" value={money(SAMPLE_PAID_TOTAL)} tone="success" />
      </div>
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 text-xs font-medium">
        {[
          ['All', 5, true],
          ['Draft', 2, false],
          ['Overdue', 1, false],
          ['Paid', 2, false],
        ].map(([label, n, on]) => (
          <span key={String(label)} className={cn('rounded-md px-2.5 py-1', on ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            {label} <span className="ml-1 rounded-full bg-muted px-1.5 tabular-nums">{n}</span>
          </span>
        ))}
      </div>
      <div className="rounded-xl border">
        {SAMPLE_INVOICES.map((i) => (
          <div key={i.number} className="flex items-center">
            <div className="flex-1">
              <InvoiceRow inv={i} />
            </div>
            {i.state !== 'paid' && (
              <span className="mr-3 hidden items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium md:inline-flex">
                <CheckCircle2 className="h-3 w-3" /> Mark paid
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Clients: what each has paid and still owes. */
export function ClientsPreview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Clients" value="8" sub="Top 4 shown" />
        <StatCard icon={Wallet} label="Owed to you" value={money(SAMPLE_UNPAID_TOTAL)} sub="3 clients owe you" tone="warning" />
      </div>
      <div className="rounded-xl border">
        {SAMPLE_CLIENTS.map((c) => (
          <div key={c.name} className="flex items-center gap-3 border-b px-3 py-3 last:border-b-0">
            <ClientAvatar name={c.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.company}</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-semibold tabular-nums">{money(c.paid)} <span className="font-normal text-muted-foreground">paid</span></p>
              {c.outstanding > 0 ? (
                <p className={cn('font-medium tabular-nums', c.overdue > 0 ? 'text-destructive' : 'text-warning')}>
                  {money(c.outstanding)} {c.overdue > 0 ? 'overdue' : 'owed'}
                </p>
              ) : (
                <p className="text-muted-foreground">Settled</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Contracts: the AI draft with its highlighted blanks and the review checklist. */
export function ContractPreview() {
  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 font-medium text-warning">
          <AlertTriangle className="h-3 w-3" /> 2 to fill in
        </span>
        <span className="text-muted-foreground">Website redesign · ~1 page</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium">
          <Download className="h-3 w-3" /> Download PDF
        </span>
      </div>
      <div className="relative max-h-[27rem] overflow-hidden rounded-lg">
        <ContractDocument text={SAMPLE_CONTRACT} className="text-[12.5px]" />
        {/* The contract sheet is white in both themes, so the fade is white too. */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </div>
      <div className="mt-3">
        <DraftingNotes notes={SAMPLE_NOTES} />
      </div>
    </div>
  )
}

