import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { LEGAL_INFO_UPDATED } from '@/lib/legal/jurisdictions'
import { cn } from '@/lib/utils'

export const LEGAL_GUIDE_HREF = '/dashboard/contracts-information'

/**
 * The wording matters: it must say plainly that FreelanceFlow does not review
 * contracts, that nothing here is legal advice, and who is responsible.
 */
export function LegalDisclaimer({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="legal-disclaimer-title"
      className={cn('rounded-xl border border-warning/40 bg-warning/10 p-5', className)}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="space-y-2.5 text-sm leading-relaxed">
          <h2 id="legal-disclaimer-title" className="text-base font-semibold">
            Important: please read
          </h2>
          <p>
            <strong>FreelanceFlow is a software tool, not a law firm.</strong> Nothing in this app or on this page is legal advice, and
            using it does not create an attorney–client relationship.
          </p>
          <p>
            <strong>We do not review, verify, approve or guarantee any contract</strong> that you create, edit, generate, send or sign,
            including contracts drafted by our AI. AI drafts can contain mistakes or leave things out, may not fit your situation, and may
            not meet the laws that apply to you or your client.
          </p>
          <p>
            <strong>You are solely responsible</strong> for reading and understanding every contract before you send or sign it, and for
            deciding whether you need a qualified attorney. For high-value, long-term, cross-border or unusual agreements, we strongly
            recommend one.
          </p>
          <p className="text-muted-foreground">
            The information in this guide is general and educational. It may be out of date and has not been reviewed by a licensed
            attorney. Last updated {LEGAL_INFO_UPDATED}.
          </p>
        </div>
      </div>
    </section>
  )
}

/** One-line reminder for places where the full notice won't fit. */
export function LegalReminder({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
      AI-generated drafts are not legal advice. FreelanceFlow doesn’t review contracts: you’re responsible for checking this before you send
      or sign it.{' '}
      <Link href={LEGAL_GUIDE_HREF} className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
        Read the legal guide
      </Link>
    </p>
  )
}
