'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ClientRow } from '@/lib/analytics'
import { money, percent } from '@/lib/format'

type SortKey = 'name' | 'invoices' | 'paid' | 'outstanding' | 'average' | 'share'

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'name', label: 'Client' },
  { key: 'invoices', label: 'Invoices', align: 'right' },
  { key: 'paid', label: 'Paid', align: 'right' },
  { key: 'outstanding', label: 'Outstanding', align: 'right' },
  { key: 'average', label: 'Avg. invoice', align: 'right' },
  { key: 'share', label: 'Share' },
]

export function ClientBreakdown({ rows }: { rows: ClientRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows // already ranked by the selected metric
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) =>
      sort.key === 'name' ? dir * a.name.localeCompare(b.name) : dir * ((a[sort.key] as number) - (b[sort.key] as number)),
    )
  }, [rows, sort])

  const toggle = (key: SortKey) =>
    setSort((s) => (s?.key === key ? (s.dir === 'desc' ? { key, dir: 'asc' } : null) : { key, dir: key === 'name' ? 'asc' : 'desc' }))

  const totals = rows.reduce(
    (t, r) => ({ invoices: t.invoices + r.invoices, paid: t.paid + r.paid, outstanding: t.outstanding + r.outstanding }),
    { invoices: 0, paid: 0, outstanding: 0 },
  )

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No clients match these filters.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((c) => {
              const active = sort?.key === c.key
              const Icon = !active ? ArrowUpDown : sort!.dir === 'asc' ? ArrowUp : ArrowDown
              return (
                <TableHead key={c.key} className={cn(c.align === 'right' && 'text-right')} aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    type="button"
                    onClick={() => toggle(c.key)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded text-xs font-medium uppercase tracking-wide hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      c.align === 'right' && 'flex-row-reverse',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {c.label}
                    <Icon className={cn('h-3 w-3', !active && 'opacity-50')} />
                  </button>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.clientId ?? r.name}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-right tabular-nums">{r.invoices}</TableCell>
              <TableCell className="text-right tabular-nums">{money(r.paid)}</TableCell>
              <TableCell className={cn('text-right tabular-nums', r.outstanding > 0 ? 'text-warning' : 'text-muted-foreground')}>
                {money(r.outstanding)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{money(r.average)}</TableCell>
              <TableCell className="min-w-[8rem]">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, r.share * 100)}%` }} />
                  </div>
                  <span className="w-10 text-xs tabular-nums text-muted-foreground">{percent(r.share)}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="border-t bg-muted/50 text-foreground [&>tr]:hover:bg-transparent">
          <TableRow>
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{totals.invoices}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{money(totals.paid)}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{money(totals.outstanding)}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
