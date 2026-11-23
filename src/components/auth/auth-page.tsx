import Link from 'next/link'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { signInAction } from '@/app/actions'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getProviderAvailability, hasSocialProvider } from '@/lib/auth/providers'
import { OAuthButtons } from './oauth-buttons'
import { AuthShell } from './auth-shell'

type SearchParams = { [key: string]: string | string[] | undefined }
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function Notice({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const styles = {
    error: 'border-destructive/30 bg-destructive/10 text-destructive',
    success: 'border-success/30 bg-success/10 text-success',
    info: 'border-border bg-muted text-muted-foreground',
  }[tone]
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? CheckCircle2 : Info
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

/**
 * Shared page for /sign-in and /sign-up. With OAuth there is no difference
 * between the two flows (a first-time Google/Apple sign-in creates the
 * account), so they differ only in wording.
 */
export async function AuthPage({ mode, searchParams }: { mode: 'sign-in' | 'sign-up'; searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const error = first(sp.error)
  const success = first(sp.success)
  const info = first(sp.message)
  const next = first(sp.next)

  const providers = await getProviderAvailability()
  const social = hasSocialProvider(providers)
  const signUp = mode === 'sign-up'

  return (
    <AuthShell>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{signUp ? 'Create your free account' : 'Welcome back'}</h1>
        <p className="text-sm text-muted-foreground">
          {social
            ? 'Continue with your Google or Apple account. No password to remember.'
            : signUp
              ? 'Sign-up is opening very soon.'
              : 'Sign in to your account.'}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {error && <Notice tone="error">{error}</Notice>}
        {success && <Notice tone="success">{success}</Notice>}
        {info && <Notice tone="info">{info}</Notice>}

        {social ? (
          <OAuthButtons providers={providers} next={next && next.startsWith('/') ? next : '/dashboard'} />
        ) : signUp ? (
          <Notice tone="info">Google and Apple sign-in aren’t switched on yet, so new accounts can’t be created right now. Please check back shortly.</Notice>
        ) : (
          // Safety net: until a social provider is enabled in Supabase, existing
          // email accounts can still get in. This disappears by itself afterwards.
          <form action={signInAction} className="space-y-4">
            <Notice tone="info">Google and Apple sign-in are being set up. Existing accounts can sign in with email for now.</Notice>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Your password" required autoComplete="current-password" />
            </div>
            <SubmitButton className="h-11 w-full" pendingText="Signing in…">
              Sign in
            </SubmitButton>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {signUp ? (
          <>
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create a free account
            </Link>
          </>
        )}
      </p>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        We only receive your name, email and profile photo, and we never post anything. FreelanceFlow is a software tool, not a law firm: it
        doesn’t review contracts or give legal advice.
      </p>
    </AuthShell>
  )
}
