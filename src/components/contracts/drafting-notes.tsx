import { ClipboardCheck } from 'lucide-react'

/**
 * The AI's "before you send" checklist. Shown next to the draft, never saved
 * inside the contract. These are prompts to check, not advice or assurances.
 */
export function DraftingNotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null
  return (
    <aside aria-label="Before you send" className="rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ClipboardCheck className="h-4 w-4 text-primary" />
        Before you send: things to check
      </div>
      <ul className="mt-2.5 space-y-1.5 text-sm leading-relaxed">
        {notes.map((n, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{n}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        These are prompts from the AI, not legal advice, and they are not saved with the contract. Nobody at FreelanceFlow has reviewed this draft.
      </p>
    </aside>
  )
}
