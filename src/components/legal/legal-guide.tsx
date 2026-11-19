'use client'

import { useState } from 'react'
import { AlertTriangle, Check, FileText, Globe, ListChecks, Scale, Sparkles, X } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JURISDICTIONS, getJurisdiction, type EsignStatus } from '@/lib/legal/jurisdictions'
import {
  AI_CANNOT,
  AI_DOES,
  BINDING_ESSENTIALS,
  BINDING_VS_NOT,
  CLAUSE_CHECKLIST,
  COMMON_MISTAKES,
  RESPONSIBILITY_POINTS,
  REVIEW_CHECKLIST,
  WHEN_TO_SEE_A_LAWYER,
} from '@/lib/legal/guide-content'
import { LegalDisclaimer } from './legal-disclaimer'

const ESIGN_BADGE: Record<EsignStatus, { label: string; className: string }> = {
  valid: { label: 'Generally valid', className: 'border-success/30 bg-success/10 text-success' },
  conditional: { label: 'Valid with conditions', className: 'border-warning/30 bg-warning/10 text-warning' },
  restricted: { label: 'Restricted', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
}

const EXAMPLE = `FREELANCE SERVICE AGREEMENT

1. PARTIES
Client: XYZ Corp, 12 Main Street
Freelancer: Jane Doe, 34 Oak Avenue

2. SCOPE OF WORK
- Design and build a 5-page website
- Two rounds of revisions included
- Client approves each page within 5 business days

3. PAYMENT
- Total: $3,000 USD, 50% on signing, 50% on delivery
- Invoices are due within 15 days
- Late amounts accrue interest at the lesser of 1.5% per month or the legal maximum

4. OWNERSHIP
- Ownership of the final work passes to the client on full payment

5. ENDING THE AGREEMENT
- Either party may end this agreement with 14 days' written notice; the client pays for work done

6. GOVERNING LAW
- [State or country]`

function BulletList({ items, icon: Icon, tone }: { items: string[]; icon: typeof Check; tone: string }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{n}</span>
      <div>
        <p className="font-medium leading-tight">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

export function LegalGuide() {
  const [tab, setTab] = useState('overview')
  const [jurisdictionId, setJurisdictionId] = useState('usa')
  const j = getJurisdiction(jurisdictionId) ?? JURISDICTIONS[0]
  const groups = Array.from(new Set(JURISDICTIONS.map((x) => x.group)))

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Legal guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plain-English information on contracts for freelancers, and how our AI drafts work. Educational only.
        </p>
      </header>

      <LegalDisclaimer />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto w-max justify-start gap-1 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="basics">Contract basics</TabsTrigger>
            <TabsTrigger value="checklist">Clause checklist</TabsTrigger>
            <TabsTrigger value="location">By location</TabsTrigger>
            <TabsTrigger value="ai">Using AI drafts</TabsTrigger>
          </TabsList>
        </div>

        {/* ---------------------------------------------------------------- overview */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">How a FreelanceFlow contract works</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Step n={1} title="You describe the deal" body="Pick a contract type, your governing law, and tell us the scope, price and timeline." />
              <Step n={2} title="AI writes a first draft" body="It follows a drafting standard and the rules we have for your location, and leaves [placeholders] for anything it was not told." />
              <Step n={3} title="You review and edit" body="Read the “before you send” checklist, fill in the gaps, and change anything that is not right." />
              <Step n={4} title="You decide, then send" body="Download the PDF or email it. Whether it is ready to send or sign is your call." />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Check className="h-4 w-4 text-success" /> What we provide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList
                  icon={Check}
                  tone="text-success"
                  items={['Software to draft, store, preview, download and send contracts.', 'AI-assisted first drafts.', 'General, educational information in this guide.']}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <X className="h-4 w-4 text-destructive" /> What we do not do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList
                  icon={X}
                  tone="text-destructive"
                  items={[
                    'Review, verify, approve or guarantee any contract.',
                    'Give legal advice or form an attorney–client relationship.',
                    'Check whether a contract is enforceable where you live.',
                    'Verify who signs a contract, or what they agreed.',
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------ basics */}
        <TabsContent value="basics" className="mt-4 space-y-6">
          <div>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <Scale className="h-4 w-4" /> What makes a contract binding?
            </h2>
            <p className="mb-3 text-sm text-muted-foreground">The details vary by country, but most legal systems look for these.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {BINDING_ESSENTIALS.map((p) => (
                <Card key={p.title}>
                  <CardContent className="p-4">
                    <p className="font-medium">{p.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usually binding</CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList icon={Check} tone="text-success" items={BINDING_VS_NOT.usuallyBinding} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Often not binding</CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList icon={X} tone="text-muted-foreground" items={BINDING_VS_NOT.oftenNotBinding} />
              </CardContent>
            </Card>
          </div>
          <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">{BINDING_VS_NOT.caution}</p>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" /> Common freelance contract mistakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulletList icon={AlertTriangle} tone="text-warning" items={COMMON_MISTAKES} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> A simple example
              </CardTitle>
              <CardDescription>Illustrative only. Not a template to copy, and not suitable for every situation.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed">{EXAMPLE}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --------------------------------------------------------------- checklist */}
        <TabsContent value="checklist" className="mt-4 space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ListChecks className="h-4 w-4" /> The clauses most freelance contracts should cover, and what to look for in each.
          </p>
          <Accordion type="multiple" defaultValue={['scope', 'money']} className="space-y-3">
            {CLAUSE_CHECKLIST.map((g) => (
              <AccordionItem key={g.id} value={g.id} className="rounded-xl border bg-card px-4">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">{g.title}</AccordionTrigger>
                <AccordionContent>
                  <dl className="space-y-4 pb-2">
                    {g.items.map((item) => (
                      <div key={item.name}>
                        <dt className="font-medium">{item.name}</dt>
                        <dd className="mt-0.5 text-sm text-muted-foreground">{item.what}</dd>
                        <dd className="mt-1 text-sm">
                          <span className="font-medium text-primary">Look for: </span>
                          {item.lookFor}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {/* ---------------------------------------------------------------- location */}
        <TabsContent value="location" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" /> Rules by location
              </CardTitle>
              <CardDescription>
                Choose where the work or your client is based. When you pick the same place as your contract’s governing law, our AI applies the
                matching rules below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="max-w-sm space-y-2">
                <Label htmlFor="jurisdiction">Location</Label>
                <Select value={jurisdictionId} onValueChange={setJurisdictionId}>
                  <SelectTrigger id="jurisdiction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) =>
                      JURISDICTIONS.filter((x) => x.group === g).map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.label}
                        </SelectItem>
                      )),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Electronic signatures</p>
                  <Badge variant="outline" className={`mt-2 ${ESIGN_BADGE[j.esign.status].className}`}>
                    {ESIGN_BADGE[j.esign.status].label}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">{j.esign.summary}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Language</p>
                  <p className="mt-2 text-sm text-muted-foreground">{j.language}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Good to know</p>
                <BulletList icon={Check} tone="text-primary" items={j.rules} />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Always double-check</p>
                <BulletList icon={AlertTriangle} tone="text-warning" items={j.watch} />
              </div>

              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                This summary is general and may be incomplete or out of date. Laws also differ by city and industry. Place not listed? Contracts still
                work: the AI uses neutral terms and flags that the governing-law clause needs confirming.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------------- AI */}
        <TabsContent value="ai" className="mt-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" /> What the AI does
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList icon={Check} tone="text-success" items={AI_DOES} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What it cannot do</CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList icon={X} tone="text-destructive" items={AI_CANNOT} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Before you send or sign: your review checklist</CardTitle>
              <CardDescription>Every contract, every time, however it was written.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm leading-relaxed">
                {REVIEW_CHECKLIST.map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">When to talk to a lawyer</CardTitle>
              <CardDescription>We strongly recommend professional advice if any of these apply.</CardDescription>
            </CardHeader>
            <CardContent>
              <BulletList icon={AlertTriangle} tone="text-warning" items={WHEN_TO_SEE_A_LAWYER} />
            </CardContent>
          </Card>

          <Card className="border-warning/40 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-base">Who is responsible</CardTitle>
            </CardHeader>
            <CardContent>
              <BulletList icon={AlertTriangle} tone="text-warning" items={RESPONSIBILITY_POINTS} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
