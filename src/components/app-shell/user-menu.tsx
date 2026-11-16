'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function initialsOf(name?: string | null, email?: string | null) {
  const source = (name || email || '?').trim()
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase()
}

interface UserMenuProps {
  /** "sidebar": full-width row that reveals name/email on expand. "topbar": avatar only. */
  variant: 'sidebar' | 'topbar'
}

export function UserMenu({ variant }: UserMenuProps) {
  const router = useRouter()
  const { data: user } = useUser()
  const supabase = createClient()

  const fullName: string | undefined = user?.user_metadata?.full_name
  const email = user?.email ?? ''
  const initials = initialsOf(fullName, email)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      window.location.href = '/'
    }
  }

  const avatar = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
      {initials}
    </span>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'sidebar' ? (
          <button
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left outline-none transition-colors',
              'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label="Account menu"
          >
            {avatar}
            <span className="min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
              <span className="block truncate text-sm font-medium leading-tight text-foreground">
                {fullName || 'Account'}
              </span>
              <span className="block truncate text-xs leading-tight text-muted-foreground">{email}</span>
            </span>
          </button>
        ) : (
          <button
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Account menu"
          >
            {avatar}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        side={variant === 'sidebar' ? 'right' : 'bottom'}
        className="w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{fullName || 'Account'}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="gap-2">
          <UserIcon className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
