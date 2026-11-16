import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  id: T
  label: string
  /** Optional count shown as a small badge, e.g. "Overdue 3". */
  count?: number
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  /** Accessible name for the group. */
  label: string
  className?: string
}

/** A compact pill group for switching between a few views or filters. */
export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1', className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === o.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
          {o.count != null && (
            <span
              className={cn(
                'rounded-full px-1.5 text-xs tabular-nums',
                value === o.id ? 'bg-muted text-foreground' : 'bg-background/60 text-muted-foreground',
              )}
            >
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
