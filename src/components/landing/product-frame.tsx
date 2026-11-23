import { cn } from '@/lib/utils'

/**
 * Browser-style window around a live preview of the app. It is decorative
 * (the content is marked aria-hidden) but exposed to screen readers as one
 * labelled image, so it is described once instead of read out as sample data.
 */
export function ProductFrame({
  title,
  label,
  children,
  className,
  bodyClassName,
}: {
  title: string
  label: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn('overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10 ring-1 ring-black/5 dark:ring-white/5', className)}
    >
      <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="mx-auto rounded-md bg-background/80 px-3 py-0.5 text-[11px] font-medium text-muted-foreground">{title}</span>
        <span className="w-9" aria-hidden />
      </div>
      <div aria-hidden className={cn('pointer-events-none select-none p-4 sm:p-5', bodyClassName)}>
        {children}
      </div>
    </figure>
  )
}
