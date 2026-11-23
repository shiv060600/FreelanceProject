'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useToast } from '@/components/ui/use-toast'
import { oauthErrorMessage, providerName, type OAuthProvider } from '@/lib/auth/providers'
import { cn } from '@/lib/utils'
import { AppleIcon, GoogleIcon } from './brand-icons'

interface OAuthButtonsProps {
  /** Only providers switched on in Supabase are passed in, so every button shown will work. */
  providers: { google: boolean; apple: boolean }
  /** Where to land after signing in. Must be a same-site path; the callback re-checks it. */
  next?: string
  /** "stack" fills the width; "row" puts buttons side by side from the sm breakpoint up. */
  layout?: 'stack' | 'row'
  className?: string
}

export function OAuthButtons({ providers, next = '/dashboard', layout = 'stack', className }: OAuthButtonsProps) {
  const [pending, setPending] = useState<OAuthProvider | null>(null)
  const { toast } = useToast()

  const start = async (provider: OAuthProvider) => {
    setPending(provider)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          // Let people with several Google accounts pick one instead of silently using the last.
          ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
        },
      })
      if (error) throw error
      // On success the browser is already navigating to the provider; keep the spinner.
    } catch (e: any) {
      console.error(`${provider} sign-in failed:`, e?.message)
      setPending(null)
      toast({ title: 'Sign-in failed', description: oauthErrorMessage(provider, e?.message), variant: 'destructive' })
    }
  }

  const buttons: { id: OAuthProvider; icon: React.ReactNode; className: string }[] = []
  if (providers.google) {
    buttons.push({
      id: 'google',
      icon: <GoogleIcon className="h-5 w-5" />,
      // White in both themes: Google's own guidance for its button.
      className: 'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50',
    })
  }
  if (providers.apple) {
    buttons.push({
      id: 'apple',
      icon: <AppleIcon className="h-5 w-5" />,
      // Apple's guidance: black on light backgrounds, white on dark.
      className: 'border border-transparent bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200',
    })
  }
  if (buttons.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-3', layout === 'row' && 'sm:flex-row', className)}>
      {buttons.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => start(b.id)}
          disabled={pending !== null}
          className={cn(
            // No flex-1 in the stacked (column) layout: its zero flex-basis would collapse the height.
            'inline-flex h-12 w-full items-center whitespace-nowrap justify-center gap-3 rounded-xl px-5 text-[15px] font-semibold shadow-sm transition-colors',
            layout === 'row' && 'sm:flex-1',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-70',
            b.className,
          )}
        >
          {pending === b.id ? <Loader2 className="h-5 w-5 animate-spin" /> : b.icon}
          Continue with {providerName(b.id)}
        </button>
      ))}
    </div>
  )
}
