import Link from 'next/link'
import { ArrowLeft, FileSignature, Receipt, ShieldCheck, TrendingUp } from 'lucide-react'
import { BrandLink } from '@/components/app-shell/brand'
import { ThemeToggle } from '@/components/theme-toggle'

const BENEFITS = [
  { icon: FileSignature, title: 'Contracts in seconds', body: 'AI drafts that follow your local rules, with a checklist before you send.' },
  { icon: Receipt, title: 'Invoices that get paid', body: 'See who owes you, flag overdue, mark paid in one click.' },
  { icon: TrendingUp, title: 'Know where revenue comes from', body: 'Revenue by client and period, with filters and CSV export.' },
]

/** Two-column sign-in / sign-up layout: product pitch on the left, the form on the right. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <BrandLink className="relative text-white" />

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">Run your freelance business in one place.</h2>
          <ul className="mt-10 space-y-6">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/80">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-sm text-white/80">
          <ShieldCheck className="h-4 w-4" /> No password to remember. We only see your name, email and photo.
        </p>
      </aside>

      <section className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </section>
    </main>
  )
}
