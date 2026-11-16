/**
 * Pure calculation helpers for the Sales Analytics page. No React, no
 * Supabase, no `@/` imports, so it can be unit-tested with plain Node.
 *
 * All dates are 'YYYY-MM-DD' strings compared lexicographically, so there
 * are no timezone surprises.
 */

export type Granularity = 'week' | 'month' | 'quarter'
/** paid = money received, outstanding = draft invoices, invoiced = both */
export type Metric = 'paid' | 'outstanding' | 'invoiced'
export type DateBasis = 'due_date' | 'issue_date'
export type RangePreset = 'last30' | 'last90' | 'last12' | 'ytd' | 'lastYear' | 'all' | 'custom'

export interface AnalyticsInvoice {
  id: string
  invoice_number: string
  client_id: string | null
  client_name: string
  status: 'paid' | 'draft'
  total: number
  issue_date: string
  due_date: string
}

/** Inclusive bounds; null = unbounded. */
export interface DateRange {
  start: string | null
  end: string | null
}

export interface Filters {
  range: DateRange
  /** Empty = all clients. */
  clientIds: string[]
  basis: DateBasis
}

// ---------------------------------------------------------------- dates ----

const pad = (n: number) => String(n).padStart(2, '0')
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const format = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`

export const addDays = (iso: string, n: number) => {
  const d = parse(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return format(d)
}

/** Month arithmetic anchored to the 1st, so Jan 31 + 1 month can't overflow. */
export const addMonths = (iso: string, n: number) => {
  const d = parse(iso)
  return format(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)))
}

export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86_400_000)

/** Today in the user's local timezone as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function presetRange(preset: RangePreset, today: string): DateRange {
  const year = Number(today.slice(0, 4))
  switch (preset) {
    case 'last30':
      return { start: addDays(today, -29), end: today }
    case 'last90':
      return { start: addDays(today, -89), end: today }
    case 'last12':
      return { start: addMonths(`${today.slice(0, 7)}-01`, -11), end: today }
    case 'ytd':
      return { start: `${year}-01-01`, end: today }
    case 'lastYear':
      return { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` }
    case 'all':
    case 'custom':
    default:
      return { start: null, end: null }
  }
}

/** Equal-length window immediately before `range`; null when unbounded. */
export function previousRange(range: DateRange): DateRange | null {
  if (!range.start || !range.end) return null
  const length = daysBetween(range.start, range.end) + 1
  const end = addDays(range.start, -1)
  return { start: addDays(end, -(length - 1)), end }
}

// ------------------------------------------------------------- bucketing ----

export function bucketStart(iso: string, g: Granularity) {
  const d = parse(iso)
  if (g === 'week') {
    const dow = (d.getUTCDay() + 6) % 7 // Monday = 0
    return addDays(iso, -dow)
  }
  if (g === 'month') return `${iso.slice(0, 7)}-01`
  const q = Math.floor(d.getUTCMonth() / 3)
  return format(new Date(Date.UTC(d.getUTCFullYear(), q * 3, 1)))
}

export function nextBucket(bucket: string, g: Granularity) {
  if (g === 'week') return addDays(bucket, 7)
  return addMonths(bucket, g === 'month' ? 1 : 3)
}

export function bucketLabel(bucket: string, g: Granularity) {
  const d = parse(bucket)
  const m = d.getUTCMonth()
  if (g === 'quarter') return `Q${Math.floor(m / 3) + 1} ${d.getUTCFullYear()}`
  if (g === 'week') return `${MONTHS[m]} ${d.getUTCDate()}`
  return `${MONTHS[m]} ${String(d.getUTCFullYear()).slice(2)}`
}

// ------------------------------------------------------------- filtering ----

export const matchesMetric = (inv: AnalyticsInvoice, metric: Metric) =>
  metric === 'invoiced' || (metric === 'paid' ? inv.status === 'paid' : inv.status === 'draft')

export function filterInvoices(invoices: AnalyticsInvoice[], f: Filters): AnalyticsInvoice[] {
  const { start, end } = f.range
  const clients = f.clientIds.length ? new Set(f.clientIds) : null
  return invoices.filter((inv) => {
    const date = inv[f.basis]
    if (start && date < start) return false
    if (end && date > end) return false
    if (clients && !(inv.client_id && clients.has(inv.client_id))) return false
    return true
  })
}

/** Pick a sensible bucket size for the span being shown. */
export function autoGranularity(range: DateRange, invoices: AnalyticsInvoice[], basis: DateBasis): Granularity {
  let { start, end } = range
  if (!start || !end) {
    const dates = invoices.map((i) => i[basis]).sort()
    start = start ?? dates[0] ?? null
    end = end ?? dates[dates.length - 1] ?? null
  }
  if (!start || !end) return 'month'
  const days = daysBetween(start, end) + 1
  if (days <= 100) return 'week'
  if (days <= 800) return 'month'
  return 'quarter'
}

// ---------------------------------------------------------------- series ----

export interface SeriesRow {
  bucket: string
  label: string
  total: number
  [series: string]: string | number
}

export interface Series {
  rows: SeriesRow[]
  /** Client names, biggest first; the long tail is folded into "Other". */
  keys: string[]
}

export const OTHER_KEY = 'Other'

export function buildSeries(
  invoices: AnalyticsInvoice[],
  opts: { metric: Metric; basis: DateBasis; range: DateRange; granularity: Granularity; topN?: number },
): Series {
  const { metric, basis, range, granularity: g, topN = 5 } = opts
  const relevant = invoices.filter((i) => matchesMetric(i, metric))
  const dates = relevant.map((i) => i[basis]).sort()

  const start = range.start ?? dates[0]
  const end = range.end ?? dates[dates.length - 1]
  if (!start || !end || start > end) return { rows: [], keys: [] }

  // Rank clients by the metric so the biggest get their own colour.
  const totals = new Map<string, number>()
  for (const inv of relevant) totals.set(inv.client_name, (totals.get(inv.client_name) ?? 0) + inv.total)
  const ranked = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).map(([name]) => name)
  const top = ranked.slice(0, topN)
  const hasOther = ranked.length > topN
  const keys = hasOther ? [...top, OTHER_KEY] : top

  // Contiguous buckets so months with no sales still show as zero.
  const rows = new Map<string, SeriesRow>()
  for (let b = bucketStart(start, g); b <= end; b = nextBucket(b, g)) {
    const row: SeriesRow = { bucket: b, label: bucketLabel(b, g), total: 0 }
    for (const k of keys) row[k] = 0
    rows.set(b, row)
  }

  for (const inv of relevant) {
    const date = inv[basis]
    if (date < start || date > end) continue
    const row = rows.get(bucketStart(date, g))
    if (!row) continue
    const key = top.includes(inv.client_name) ? inv.client_name : OTHER_KEY
    row[key] = (row[key] as number) + inv.total
    row.total += inv.total
  }
  return { rows: Array.from(rows.values()), keys }
}

// ------------------------------------------------------------- summaries ----

export interface Summary {
  paid: number
  outstanding: number
  count: number
  average: number
  topClient: { name: string; value: number; share: number } | null
}

export function summarize(invoices: AnalyticsInvoice[], metric: Metric): Summary {
  let paid = 0
  let outstanding = 0
  const perClient = new Map<string, number>()
  let count = 0
  let metricTotal = 0

  for (const inv of invoices) {
    if (inv.status === 'paid') paid += inv.total
    else outstanding += inv.total
    if (!matchesMetric(inv, metric)) continue
    count++
    metricTotal += inv.total
    perClient.set(inv.client_name, (perClient.get(inv.client_name) ?? 0) + inv.total)
  }

  const [name, value] = Array.from(perClient.entries()).sort((a, b) => b[1] - a[1])[0] ?? []
  return {
    paid,
    outstanding,
    count,
    average: count ? metricTotal / count : 0,
    topClient: name !== undefined && metricTotal > 0 ? { name, value, share: value / metricTotal } : null,
  }
}

export interface ClientRow {
  clientId: string | null
  name: string
  invoices: number
  paid: number
  outstanding: number
  average: number
  /** Share of the selected metric across all clients, 0..1. */
  share: number
}

export function byClient(invoices: AnalyticsInvoice[], metric: Metric): ClientRow[] {
  const map = new Map<string, ClientRow & { metricTotal: number; metricCount: number }>()
  for (const inv of invoices) {
    const key = inv.client_id ?? inv.client_name
    const row = map.get(key) ?? {
      clientId: inv.client_id, name: inv.client_name, invoices: 0, paid: 0, outstanding: 0,
      average: 0, share: 0, metricTotal: 0, metricCount: 0,
    }
    if (matchesMetric(inv, metric)) {
      row.invoices++
      row.metricTotal += inv.total
      row.metricCount++
    }
    if (inv.status === 'paid') row.paid += inv.total
    else row.outstanding += inv.total
    map.set(key, row)
  }
  const rows = Array.from(map.values()).filter((r) => r.metricCount > 0)
  const grand = rows.reduce((s, r) => s + r.metricTotal, 0)
  return rows
    .map(({ metricTotal, metricCount, ...r }) => ({
      ...r,
      average: metricCount ? metricTotal / metricCount : 0,
      share: grand ? metricTotal / grand : 0,
    }))
    .sort((a, b) => (metric === 'outstanding' ? b.outstanding - a.outstanding : metric === 'paid' ? b.paid - a.paid : b.paid + b.outstanding - (a.paid + a.outstanding)))
}

/** Fractional change, or null when there's nothing to compare against. */
export function pctChange(current: number, previous: number): number | null {
  return previous > 0 ? (current - previous) / previous : null
}

// ------------------------------------------------------------------- csv ----

const csvCell = (v: string | number) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(invoices: AnalyticsInvoice[]) {
  const header = ['Invoice #', 'Client', 'Status', 'Issue date', 'Due date', 'Total']
  const lines = invoices.map((i) => [i.invoice_number, i.client_name, i.status, i.issue_date, i.due_date, i.total.toFixed(2)])
  return [header, ...lines].map((r) => r.map(csvCell).join(',')).join('\n')
}
