'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { OTHER_KEY, type Series } from '@/lib/analytics'
import { money, moneyCompact } from '@/lib/format'

// Theme tokens, so the chart follows light/dark mode automatically.
const PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
const OTHER_COLOR = 'hsl(var(--muted-foreground) / 0.5)'

export const seriesColor = (key: string, index: number) => (key === OTHER_KEY ? OTHER_COLOR : PALETTE[index % PALETTE.length])

function ChartTooltip({ active, payload, label, keys }: any) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((p: any) => p.value > 0).reverse()
  const total = rows.reduce((s: number, p: any) => s + p.value, 0)
  return (
    <div className="min-w-[10rem] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="mb-1.5 font-medium">{label}</p>
      {rows.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
            {p.dataKey === 'total' ? 'Total' : p.dataKey}
          </span>
          <span className="font-medium tabular-nums">{money(p.value)}</span>
        </div>
      ))}
      {rows.length > 1 && keys.length > 1 && (
        <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{money(total)}</span>
        </div>
      )}
    </div>
  )
}

interface RevenueChartProps {
  series: Series
  /** "client": stacked by client. "total": one bar per period. */
  view: 'client' | 'total'
}

export function RevenueChart({ series, view }: RevenueChartProps) {
  const hasData = series.rows.some((r) => r.total > 0)
  if (!hasData) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Nothing to chart for these filters.
      </div>
    )
  }

  const keys = view === 'client' ? series.keys : ['total']

  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series.rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(v) => moneyCompact(v)}
            />
            <Tooltip cursor={{ fill: 'hsl(var(--muted) / 0.6)' }} content={<ChartTooltip keys={keys} />} />
            {keys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="revenue"
                fill={seriesColor(key, i)}
                radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0}
                maxBarSize={56}
                animationDuration={350}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {view === 'client' && series.keys.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {series.keys.map((key, i) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: seriesColor(key, i) }} />
              {key}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
