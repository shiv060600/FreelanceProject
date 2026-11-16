import { cn } from '@/lib/utils'
import type { InvoiceState } from '@/lib/invoice-utils'

const STYLES: Record<InvoiceState, { label: string; classes: string; dot: string }> = {
  paid: { label: 'Paid', classes: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  overdue: { label: 'Overdue', classes: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  draft: { label: 'Draft', classes: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
}

export function StatusBadge({ state, className }: { state: InvoiceState; className?: string }) {
  const s = STYLES[state]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', s.classes, className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}
