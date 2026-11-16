import { avatarHue, initials } from '@/lib/invoice-utils'
import { cn } from '@/lib/utils'

/** Round initials badge with a colour derived from the name (stable per client). */
export function ClientAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        'bg-[hsl(var(--h)_70%_50%/0.15)] text-[hsl(var(--h)_60%_36%)] dark:text-[hsl(var(--h)_80%_72%)]',
        className,
      )}
      style={{ ['--h' as string]: avatarHue(name) }}
    >
      {initials(name)}
    </span>
  )
}
