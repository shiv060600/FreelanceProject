/**
 * The model returns the contract followed by a short "before you send" checklist:
 *
 *   ...final clause of the contract...
 *   <<<DRAFTING_NOTES>>>
 *   - Fill in ...
 *   - Confirm ...
 *
 * The notes are shown in the app next to the draft but are never saved inside
 * the contract text. Pure helpers (no imports) so they can be unit-tested.
 */

export const NOTES_MARKER = '<<<DRAFTING_NOTES>>>'

export interface SplitDraft {
  /** The contract text only. */
  contract: string
  /** Checklist items, one per bullet. */
  notes: string[]
}

/** Length of the longest suffix of `text` that is a proper prefix of the marker (e.g. "<<<DRAFT"). */
function partialMarkerLength(text: string) {
  const max = Math.min(NOTES_MARKER.length - 1, text.length)
  for (let k = max; k > 0; k--) {
    if (text.endsWith(NOTES_MARKER.slice(0, k))) return k
  }
  return 0
}

function parseNotes(block: string): string[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^([-*•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
}

/**
 * Splits raw model output into contract and notes.
 * While streaming (`final` false), a half-arrived marker at the very end is
 * hidden so "<<<DRAFT" never flashes at the bottom of the contract.
 */
export function splitDraft(raw: string, { final = false }: { final?: boolean } = {}): SplitDraft {
  const at = raw.indexOf(NOTES_MARKER)
  if (at === -1) {
    const hold = final ? 0 : partialMarkerLength(raw)
    return { contract: raw.slice(0, raw.length - hold).trimEnd(), notes: [] }
  }
  return {
    contract: raw.slice(0, at).trimEnd(),
    notes: parseNotes(raw.slice(at + NOTES_MARKER.length)),
  }
}
