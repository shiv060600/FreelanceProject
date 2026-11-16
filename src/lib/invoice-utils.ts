/**
 * Pure helpers for the Invoices and Clients screens. No React, no Supabase,
 * no imports, so it can be unit-tested with plain Node.
 */

export type InvoiceState = 'paid' | 'overdue' | 'draft'
export type StatusFilter = 'all' | InvoiceState
export type InvoiceSort = 'newest' | 'oldest' | 'due' | 'amount_desc' | 'amount_asc' | 'client'

export interface InvoiceLike {
  id: string
  invoice_number: string
  invoice_name?: string | null
  client_id?: string | null
  status: string
  total?: number | string | null
  subtotal?: number | string | null
  issue_date: string
  due_date: string
  created_at?: string
  clients?: { id?: string; name?: string | null } | null
}

const dayMs = 86_400_000
const toUtc = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
export const daysBetween = (a: string, b: string) => Math.round((toUtc(b) - toUtc(a)) / dayMs)

export const invoiceAmount = (inv: Pick<InvoiceLike, 'total' | 'subtotal'>) =>
  Number(inv.total || inv.subtotal || 0) || 0

export const clientNameOf = (inv: InvoiceLike) => inv.clients?.name || 'Unknown client'

/**
 * The DB only stores draft/paid. "Overdue" is derived: not paid, and the due
 * date is before today.
 */
export function invoiceState(inv: Pick<InvoiceLike, 'status' | 'due_date'>, today: string): InvoiceState {
  if (inv.status === 'paid') return 'paid'
  return inv.due_date.slice(0, 10) < today ? 'overdue' : 'draft'
}

export type Tone = 'muted' | 'warning' | 'danger'

/** Short "when" hint under the due date, or null when it adds nothing. */
export function dueHint(inv: Pick<InvoiceLike, 'status' | 'due_date'>, today: string): { text: string; tone: Tone } | null {
  if (inv.status === 'paid') return null
  const days = daysBetween(today, inv.due_date)
  if (days < 0) return { text: `${-days} day${days === -1 ? '' : 's'} overdue`, tone: 'danger' }
  if (days === 0) return { text: 'Due today', tone: 'warning' }
  if (days <= 14) return { text: `Due in ${days} day${days === 1 ? '' : 's'}`, tone: days <= 3 ? 'warning' : 'muted' }
  return null
}

export function countByState(invoices: InvoiceLike[], today: string): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = { all: invoices.length, paid: 0, overdue: 0, draft: 0 }
  for (const inv of invoices) counts[invoiceState(inv, today)]++
  return counts
}

export interface InvoiceSummary {
  outstanding: { amount: number; count: number }
  overdue: { amount: number; count: number }
  paid: { amount: number; count: number }
}

/** "Outstanding" is everything unpaid, so it includes the overdue amount. */
export function summarizeInvoices(invoices: InvoiceLike[], today: string): InvoiceSummary {
  const s: InvoiceSummary = {
    outstanding: { amount: 0, count: 0 },
    overdue: { amount: 0, count: 0 },
    paid: { amount: 0, count: 0 },
  }
  for (const inv of invoices) {
    const amount = invoiceAmount(inv)
    const state = invoiceState(inv, today)
    if (state === 'paid') {
      s.paid.amount += amount
      s.paid.count++
      continue
    }
    s.outstanding.amount += amount
    s.outstanding.count++
    if (state === 'overdue') {
      s.overdue.amount += amount
      s.overdue.count++
    }
  }
  return s
}

export function filterInvoices(
  invoices: InvoiceLike[],
  f: { query: string; status: StatusFilter; clientId: string; today: string },
): InvoiceLike[] {
  const q = f.query.trim().toLowerCase()
  return invoices.filter((inv) => {
    if (f.status !== 'all' && invoiceState(inv, f.today) !== f.status) return false
    if (f.clientId !== 'all' && inv.client_id !== f.clientId) return false
    if (!q) return true
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.invoice_name ?? '').toLowerCase().includes(q) ||
      clientNameOf(inv).toLowerCase().includes(q)
    )
  })
}

export function sortInvoices(invoices: InvoiceLike[], sort: InvoiceSort): InvoiceLike[] {
  const created = (i: InvoiceLike) => i.created_at ?? i.issue_date
  const cmp: Record<InvoiceSort, (a: InvoiceLike, b: InvoiceLike) => number> = {
    newest: (a, b) => created(b).localeCompare(created(a)),
    oldest: (a, b) => created(a).localeCompare(created(b)),
    due: (a, b) => a.due_date.localeCompare(b.due_date),
    amount_desc: (a, b) => invoiceAmount(b) - invoiceAmount(a),
    amount_asc: (a, b) => invoiceAmount(a) - invoiceAmount(b),
    client: (a, b) => clientNameOf(a).localeCompare(clientNameOf(b)),
  }
  return [...invoices].sort(cmp[sort])
}

// ---------------------------------------------------------------- clients ----

export interface ClientStats {
  invoices: number
  paid: number
  outstanding: number
  overdue: number
  /** Latest issue date, or null if the client has no invoices. */
  lastInvoice: string | null
}

export const EMPTY_STATS: ClientStats = { invoices: 0, paid: 0, outstanding: 0, overdue: 0, lastInvoice: null }

export function statsByClient(invoices: InvoiceLike[], today: string): Map<string, ClientStats> {
  const map = new Map<string, ClientStats>()
  for (const inv of invoices) {
    if (!inv.client_id) continue
    const s = map.get(inv.client_id) ?? { ...EMPTY_STATS }
    const amount = invoiceAmount(inv)
    const state = invoiceState(inv, today)
    s.invoices++
    if (state === 'paid') s.paid += amount
    else {
      s.outstanding += amount
      if (state === 'overdue') s.overdue += amount
    }
    if (!s.lastInvoice || inv.issue_date > s.lastInvoice) s.lastInvoice = inv.issue_date
    map.set(inv.client_id, s)
  }
  return map
}

export type ClientSort = 'newest' | 'name' | 'revenue' | 'outstanding'
export type ClientFilter = 'all' | 'owes' | 'none'

export interface ClientLike {
  id: string
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  created_at: string
}

export function filterClients<C extends ClientLike>(
  clients: C[],
  stats: Map<string, ClientStats>,
  f: { query: string; filter: ClientFilter },
): C[] {
  const q = f.query.trim().toLowerCase()
  return clients.filter((c) => {
    const s = stats.get(c.id) ?? EMPTY_STATS
    if (f.filter === 'owes' && s.outstanding <= 0) return false
    if (f.filter === 'none' && s.invoices > 0) return false
    if (!q) return true
    return [c.name, c.company, c.email, c.phone].some((v) => (v ?? '').toLowerCase().includes(q))
  })
}

export function sortClients<C extends ClientLike>(clients: C[], stats: Map<string, ClientStats>, sort: ClientSort): C[] {
  const s = (c: C) => stats.get(c.id) ?? EMPTY_STATS
  const cmp: Record<ClientSort, (a: C, b: C) => number> = {
    newest: (a, b) => b.created_at.localeCompare(a.created_at),
    name: (a, b) => a.name.localeCompare(b.name),
    revenue: (a, b) => s(b).paid - s(a).paid || a.name.localeCompare(b.name),
    outstanding: (a, b) => s(b).outstanding - s(a).outstanding || a.name.localeCompare(b.name),
  }
  return [...clients].sort(cmp[sort])
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** Stable 0-359 hue so the same client always gets the same avatar colour. */
export function avatarHue(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}
