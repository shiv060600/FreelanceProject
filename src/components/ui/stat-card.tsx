import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { percent } from '@/lib/format'

type Tone = 'default' | 'danger' | 'warning' | 'success'

const TONE_VALUE: Record<Tone, string> = {
  default: '',
  danger: 'text-destructive',
  warning: 'text-warning',
  success: 'text-success',
}
const TONE_ICON: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  danger: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  /** Fractional change vs a previous period (0.12 = +12%). */
  delta?: number | null
  tone?: Tone
  /** Makes the whole card a button, e.g. to apply a filter. */
  onClick?: () => void
  active?: boolean
}

/** One headline number. Used by Analytics, Invoices and Clients. */
export function StatCard({ icon: Icon, label, value, sub, delta, tone = 'default', onClick, active }: StatCardProps) {
  const body = (
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', TONE_ICON[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className={cn('mt-2 truncate text-2xl font-bold tracking-tight tabular-nums', TONE_VALUE[tone])}>{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {delta != null && (
          <span className={cn('inline-flex items-center gap-0.5 font-medium', delta >= 0 ? 'text-success' : 'text-destructive')}>
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {percent(Math.abs(delta))}
          </span>
        )}
        {sub && <span className="truncate">{sub}</span>}
      </div>
    </CardContent>
  )

  if (!onClick) return <Card>{body}</Card>

  return (
    <Card className={cn('transition-shadow hover:shadow-md', active && 'ring-2 ring-primary')}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {body}
      </button>
    </Card>
  )
}
