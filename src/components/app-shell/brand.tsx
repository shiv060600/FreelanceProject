import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Square logo mark. Pure CSS/SVG so there is no image asset to go missing. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-sm',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h12a4 4 0 0 1 0 8H8" />
        <path d="M11 12l-3 3 3 3" />
      </svg>
    </span>
  )
}

export function BrandLink({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <BrandMark />
      <span className="text-base">FreelanceFlow</span>
    </Link>
  )
}
