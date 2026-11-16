import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { parseContract, parseInline } from '@/lib/contracts/parse'

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) => {
        if (seg.placeholder) {
          return (
            <mark
              key={i}
              className="rounded bg-amber-200/80 px-1 font-medium text-amber-950 ring-1 ring-amber-400/60"
              title="Fill this in before sending"
            >
              {seg.text}
            </mark>
          )
        }
        return seg.bold ? <strong key={i}>{seg.text}</strong> : <Fragment key={i}>{seg.text}</Fragment>
      })}
    </>
  )
}

/**
 * On-screen rendering of a contract. It's deliberately "paper": always a white
 * page with dark text, even in dark mode, so what you see matches the PDF.
 */
export function ContractDocument({ text, className }: { text: string; className?: string }) {
  const blocks = parseContract(text)

  return (
    <article
      className={cn(
        'rounded-md border border-border bg-white px-8 py-8 font-serif text-[13.5px] leading-relaxed text-neutral-900 shadow-sm',
        className,
      )}
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'title':
            return (
              <h1 key={i} className="mb-5 text-center text-lg font-bold tracking-wide">
                <Inline text={block.text} />
              </h1>
            )
          case 'heading':
            return (
              <h2 key={i} className="mb-1 mt-6 text-[13px] font-bold uppercase tracking-wide">
                <Inline text={block.text} />
              </h2>
            )
          case 'subheading':
            return (
              <h3 key={i} className="mb-1 mt-3 font-semibold">
                <Inline text={block.text} />
              </h3>
            )
          case 'bullet':
            return (
              <p key={i} className="my-1 flex gap-2 pl-6">
                <span aria-hidden>•</span>
                <span>
                  <Inline text={block.text} />
                </span>
              </p>
            )
          case 'spacer':
            return <div key={i} className="h-1.5" />
          default:
            return (
              <p key={i} className="my-1 text-justify">
                <Inline text={block.text} />
              </p>
            )
        }
      })}
      {blocks.length === 0 && <p className="text-neutral-400">Nothing to preview yet.</p>}
    </article>
  )
}
