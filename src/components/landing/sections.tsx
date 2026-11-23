import { BarChart3, Check, ChevronDown, FileSignature, Moon, Receipt, Scale, Search, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductFrame } from './product-frame'
import { AnalyticsPreview } from './analytics-preview'
import { ClientsPreview, ContractPreview, InvoicesPreview } from './previews'

function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-balance text-lg text-muted-foreground">{children}</p>}
    </div>
  )
}

const SHOWCASE: {
  id: string
  eyebrow: string
  title: string
  body: string
  points: string[]
  frameTitle: string
  label: string
  preview: React.ReactNode
}[] = [
  {
    id: 'invoices',
    eyebrow: 'Invoices',
    title: 'Know who owes you, at a glance',
    body: 'Overdue invoices stand out the moment you open the page, and marking one paid takes a single click.',
    points: ['Draft, sent, overdue and paid states', 'Days overdue and due-soon hints', 'Download any invoice as a PDF'],
    frameTitle: 'freelanceflow.app/invoices',
    label: 'Preview of the invoices screen with overdue invoices highlighted',
    preview: <InvoicesPreview />,
  },
  {
    id: 'contracts',
    eyebrow: 'Contracts',
    title: 'Draft a contract in seconds, then check it properly',
    body: 'Describe the job and get a complete first draft. Anything it could not know is highlighted for you to fill in, with a short checklist of what to confirm before you send.',
    points: ['Highlighted blanks you cannot miss', '“Before you send” review checklist', 'Download as PDF, or edit and keep a library'],
    frameTitle: 'freelanceflow.app/contracts',
    label: 'Preview of an AI-drafted website design contract with highlighted blanks and a review checklist',
    preview: <ContractPreview />,
  },
  {
    id: 'clients',
    eyebrow: 'Clients',
    title: 'Every client, and what they owe, in one list',
    body: 'See what each client has paid, what is still outstanding and who is late, without digging through old emails.',
    points: ['Paid vs outstanding per client', 'Overdue clients flagged in red', 'Search and sort as your list grows'],
    frameTitle: 'freelanceflow.app/clients',
    label: 'Preview of the clients screen showing amounts paid and owed per client',
    preview: <ClientsPreview />,
  },
  {
    id: 'analytics',
    eyebrow: 'Analytics',
    title: 'See where your money actually comes from',
    body: 'Break revenue down by client or by month, compare it with the previous period and spot a client you rely on too heavily.',
    points: ['Filter by date range and client', 'Revenue by client or over time', 'Compare with the previous period'],
    frameTitle: 'freelanceflow.app/analytics',
    label: 'Preview of the analytics page with a revenue chart broken down by client',
    preview: <AnalyticsPreview />,
  },
]

export function Showcase() {
  return (
    <section id="features" className="scroll-mt-20 border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="What you get" title="Everything a solo business needs, nothing it doesn’t">
          Four tools that work together, so a client you add shows up on your invoices, your contracts and your analytics.
        </SectionHeading>
        <div className="space-y-24">
          {SHOWCASE.map((s, i) => (
            <div key={s.id} className="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
              <div className={cn('lg:col-span-2', i % 2 === 1 && 'lg:order-2')}>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{s.eyebrow}</p>
                <h3 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h3>
                <p className="mt-3 text-muted-foreground">{s.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn('lg:col-span-3', i % 2 === 1 && 'lg:order-1',)}>
                <ProductFrame title={s.frameTitle} label={s.label}>
                  {s.preview}
                </ProductFrame>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const MORE = [
  { icon: Search, title: 'Lead generator', body: 'Find potential clients and keep the promising ones in one place.' },
  { icon: Scale, title: 'Legal guide', body: 'Plain-English notes on freelance contracts by country and state. Information, not legal advice.' },
  { icon: Moon, title: 'Light and dark', body: 'Follows your system setting, or pick one yourself.' },
  { icon: Users, title: 'Sign in with Google or Apple', body: 'No password to create, forget or reset.' },
]

export function MoreFeatures() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="And the small things that save time" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MORE.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { icon: Users, title: 'Sign in', body: 'Continue with Google or Apple. Your account is ready straight away.' },
  { icon: FileSignature, title: 'Add a client and a contract', body: 'Describe the job and let AI draft the contract. Fill in the highlighted blanks.' },
  { icon: Receipt, title: 'Send invoices', body: 'Create an invoice, download the PDF and mark it paid when the money arrives.' },
  { icon: BarChart3, title: 'Watch it add up', body: 'Your dashboard and analytics update as you go.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="How it works" title="From sign-in to first invoice in minutes" />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Do I need a password?',
    a: 'No. You sign in with your Google or Apple account. We only receive your name, email address and profile photo, and we never post anything.',
  },
  {
    q: 'Is it free?',
    a: 'Yes, you can start for free with a limited number of invoices and a daily allowance of AI contract drafts. Paid plans raise those limits.',
  },
  {
    q: 'Are the AI contracts legally binding?',
    a: 'They are drafts to get you started. FreelanceFlow is a software tool, not a law firm: we do not review contracts or give legal advice, and what is enforceable depends on where you and your client are. Fill in the highlighted blanks, read it carefully and have a lawyer check anything important before you send it.',
  },
  {
    q: 'Does it work in dark mode?',
    a: 'Yes. It follows your device setting by default and you can switch at any time from the top bar.',
  },
  {
    q: 'What happens to my data?',
    a: 'Your clients, invoices and contracts are stored in your account and are only visible to you.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="divide-y rounded-2xl border bg-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-4 pb-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-fuchsia-500/10 px-6 py-14 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Spend less time on admin, get paid sooner</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Create your free account with Google or Apple and send your first invoice today.</p>
        <div className="mx-auto mt-8 max-w-xl">{children}</div>
      </div>
    </section>
  )
}

