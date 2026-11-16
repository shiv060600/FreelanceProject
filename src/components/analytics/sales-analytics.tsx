'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, FileText, Receipt, TrendingUp, Trophy, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  autoGranularity,
  buildSeries,
  byClient,
  filterInvoices,
  pctChange,
  presetRange,
  previousRange,
  summarize,
  todayISO,
  toCsv,
  type AnalyticsInvoice,
  type Metric,
} from '@/lib/analytics'
import { AnalyticsFilters, DEFAULT_FILTERS, type FilterState } from './analytics-filters'
import { ClientBreakdown } from './client-breakdown'
import { RevenueChart } from './revenue-chart'
import { money, percent } from '@/lib/format'
import { StatCard } from '@/components/ui/stat-card'
import { Segmented } from '@/components/ui/segmented'

const METRIC_NOUN: Record<Metric, string> = { paid: 'paid', outstanding: 'outstanding', invoiced: 'invoiced' }

function downloadCsv(invoices: AnalyticsInvoice[]) {
  const url = URL.createObjectURL(new Blob([toCsv(invoices)], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-${todayISO()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SalesAnalytics({ invoices }: { invoices: AnalyticsInvoice[] }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [chartView, setChartView] = useState<'client' | 'total'>('client')

  // "Today" is the visitor's local date; resolve it after mount so the
  // server render and first client render agree.
  const [today, setToday] = useState<string | null>(null)
  useEffect(() => setToday(todayISO()), [])

  const clients = useMemo(() => {
    const seen = new Map<string, string>()
    for (const i of invoices) if (i.client_id) seen.set(i.client_id, i.client_name)
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [invoices])

  const view = useMemo(() => {
    if (!today) return null
    const range = filters.preset === 'custom' ? filters.custom : presetRange(filters.preset, today)
    const scope = { clientIds: filters.clientIds, basis: filters.basis }
    const filtered = filterInvoices(invoices, { ...scope, range })
    const prev = previousRange(range)
    const prevFiltered = prev ? filterInvoices(invoices, { ...scope, range: prev }) : null

    const summary = summarize(filtered, filters.metric)
    const prevSummary = prevFiltered ? summarize(prevFiltered, filters.metric) : null
    const granularity = filters.groupBy === 'auto' ? autoGranularity(range, filtered, filters.basis) : filters.groupBy

    return {
      filtered,
      summary,
      paidDelta: prevSummary ? pctChange(summary.paid, prevSummary.paid) : null,
      series: buildSeries(filtered, { metric: filters.metric, basis: filters.basis, range, granularity }),
      rows: byClient(filtered, filters.metric),
      granularity,
    }
  }, [invoices, filters, today])

  // ---- No invoices at all: guide them instead of showing empty charts ------
  if (invoices.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Sales analytics</h1>
        <p className="text-sm text-muted-foreground">
          Once you create invoices, you'll see revenue over time, what's outstanding, and which clients bring in the most.
        </p>
        <Button asChild>
          <Link href="/dashboard/invoices">Create your first invoice</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue by period and client. Filter to see exactly what you need.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          disabled={!view || view.filtered.length === 0}
          onClick={() => view && downloadCsv(view.filtered)}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </header>

      <AnalyticsFilters value={filters} onChange={setFilters} clients={clients} />

      {!view ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : view.filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No invoices match these filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a wider date range, a different "date based on" setting, or clear the client filter.
            </p>
            <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Reset filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon={Wallet}
              label="Paid revenue"
              value={money(view.summary.paid)}
              delta={view.paidDelta}
              sub={view.paidDelta != null ? 'vs previous period' : undefined}
            />
            <StatCard icon={Receipt} label="Outstanding" value={money(view.summary.outstanding)} sub="Draft invoices" />
            <StatCard
              icon={FileText}
              label={`Invoices (${METRIC_NOUN[filters.metric]})`}
              value={String(view.summary.count)}
              sub={`${view.rows.length} ${view.rows.length === 1 ? 'client' : 'clients'}`}
            />
            <StatCard icon={TrendingUp} label="Average invoice" value={money(view.summary.average)} sub={`${METRIC_NOUN[filters.metric]} invoices`} />
            <StatCard
              icon={Trophy}
              label="Top client"
              value={view.summary.topClient?.name ?? '—'}
              sub={view.summary.topClient ? `${money(view.summary.topClient.value)} · ${percent(view.summary.topClient.share)}` : undefined}
            />
          </section>

          <Card>
            <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>
                  {filters.metric === 'paid' ? 'Paid revenue' : filters.metric === 'outstanding' ? 'Outstanding' : 'Total invoiced'} over time
                </CardTitle>
                <CardDescription>
                  Per {view.granularity} · based on {filters.basis === 'due_date' ? 'due' : 'issue'} date
                </CardDescription>
              </div>
              <Segmented
                label="Chart view"
                value={chartView}
                onChange={setChartView}
                options={[
                  { id: 'client', label: 'By client' },
                  { id: 'total', label: 'Total' },
                ]}
              />
            </CardHeader>
            <CardContent>
              <RevenueChart series={view.series} view={chartView} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Click a column to sort.</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientBreakdown rows={view.rows} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
