import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * The Freelance Flow logo. Renders /icon.svg, the exact file used as the
 * browser-tab icon, so the site and the tab can never drift apart.
 * (Edit src/app/icon.svg to change the logo everywhere.)
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.svg"
      alt=""
      aria-hidden
      width={36}
      height={36}
      className={cn('h-9 w-9 shrink-0 rounded-[10px]', className)}
    />
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
