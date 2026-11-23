import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { ProductFrame } from './product-frame'
import { DashboardPreview } from './previews'

/** Sign-up call to action: social buttons when enabled, otherwise a plain link to the sign-up page. */
export function SignUpCta({ providers, signedIn, className }: { providers: { google: boolean; apple: boolean }; signedIn: boolean; className?: string }) {
  if (signedIn) {
    return (
      <Button asChild size="lg" className={className}>
        <Link href="/dashboard">
          Open your dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    )
  }
  if (providers.google || providers.apple) return <OAuthButtons providers={providers} layout="row" className={className} />
  return (
    <Button asChild size="lg" className={className}>
      <Link href="/sign-up">
        Get started free <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  )
}

export function Hero({ providers, signedIn }: { providers: { google: boolean; apple: boolean }; signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-10%,hsl(var(--primary)/0.18),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Free to start · No credit card
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Run your freelance business{' '}
            <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">from one place</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Send invoices, keep track of clients, draft contracts with AI and see exactly where your money comes from. Sign in with Google or Apple in a few seconds.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SignUpCta providers={providers} signedIn={signedIn} />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />
            We only receive your name, email and photo. No password to manage.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div aria-hidden className="absolute -inset-x-6 -top-6 bottom-0 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
          <ProductFrame title="freelanceflow.app/dashboard" label="Preview of the FreelanceFlow dashboard showing revenue, outstanding invoices and recent activity">
            <DashboardPreview />
          </ProductFrame>
        </div>
      </div>
    </section>
  )
}
