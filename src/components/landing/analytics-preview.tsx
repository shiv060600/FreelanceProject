'use client'

import dynamic from 'next/dynamic'
import { TrendingUp, Trophy, Wallet } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import { money } from '@/lib/format'
import { SAMPLE_PAID_COUNT, SAMPLE_PAID_TOTAL, SAMPLE_SERIES } from './sample-data'

// recharts is large, and this sits well below the fold: load it only when the page is ready for it.
const RevenueChart = dynamic(() => import('@/components/analytics/revenue-chart').then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
})

/** Analytics: revenue by client over time. */
export function AnalyticsPreview() {
  const top = SAMPLE_SERIES.rows.reduce((s, r) => s + (r['Northwind Digital'] as number), 0)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Wallet} label="Paid revenue" value={money(SAMPLE_PAID_TOTAL)} delta={0.12} />
        <StatCard icon={Trophy} label="Top client" value="Northwind" sub={`${money(top)} · ${Math.round((top / SAMPLE_PAID_TOTAL) * 100)}%`} />
        <StatCard icon={TrendingUp} label="Avg. invoice" value={money(SAMPLE_PAID_TOTAL / SAMPLE_PAID_COUNT)} />
      </div>
      <div className="rounded-xl border p-3">
        <RevenueChart series={SAMPLE_SERIES} view="client" />
      </div>
    </div>
  )
}

