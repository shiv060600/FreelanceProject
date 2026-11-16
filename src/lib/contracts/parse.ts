/**
 * Tiny parser for the contract text format (a restricted Markdown). Shared
 * by the on-screen preview and the PDF so both render identically.
 *
 * It also tolerates contracts saved before this format existed: ALL-CAPS
 * numbered lines ("1. PARTIES") are treated as headings and anything else is
 * a plain paragraph.
 */
export type ContractBlock =
  | { type: 'title'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'spacer' }

export interface InlineSegment {
  text: string
  bold: boolean
  /** A "[placeholder]" the user still needs to fill in. */
  placeholder: boolean
}

const LEGACY_HEADING = /^\d+\.\s+[A-Z][A-Z0-9 ,&'/()-]{2,}$/
const PLACEHOLDER = /\[[^\]\n]{2,80}\]/g

export function parseContract(text: string): ContractBlock[] {
  const blocks: ContractBlock[] = []
  for (const raw of (text ?? '').replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      if (blocks.length && blocks[blocks.length - 1].type !== 'spacer') blocks.push({ type: 'spacer' })
    } else if (/^# /.test(trimmed)) {
      blocks.push({ type: 'title', text: trimmed.slice(2).trim() })
    } else if (/^## /.test(trimmed)) {
      blocks.push({ type: 'heading', text: trimmed.slice(3).trim() })
    } else if (/^### /.test(trimmed)) {
      blocks.push({ type: 'subheading', text: trimmed.slice(4).trim() })
    } else if (/^([-•]|\*(?!\*))\s+/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^([-•]|\*)\s+/, '') })
    } else if (LEGACY_HEADING.test(trimmed)) {
      blocks.push({ type: 'heading', text: trimmed })
    } else {
      blocks.push({ type: 'paragraph', text: trimmed })
    }
  }
  while (blocks.length && blocks[blocks.length - 1].type === 'spacer') blocks.pop()
  return blocks
}

/** Split a line into plain / **bold** / [placeholder] runs. */
export function parseInline(text: string): InlineSegment[] {
  const out: InlineSegment[] = []
  const pattern = /\*\*(.+?)\*\*|(\[[^\]\n]{2,80}\])/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), bold: false, placeholder: false })
    if (m[1] !== undefined) out.push({ text: m[1], bold: true, placeholder: false })
    else out.push({ text: m[2], bold: false, placeholder: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false, placeholder: false })
  return out
}

export function findPlaceholders(text: string): string[] {
  return Array.from(new Set((text ?? '').match(PLACEHOLDER) ?? []))
}

/** Plain text for list-card previews: no markers, no HTML. */
export function stripContractMarkup(text: string): string {
  return (text ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
