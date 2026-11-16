/**
 * Pure helpers for the Contracts library screen: search, filter, sort, and the
 * little facts a card shows (excerpt, length, unfilled placeholders).
 * No React and no Supabase, so it can be unit-tested with plain Node.
 */
import { findPlaceholders, parseContract, parseInline, stripContractMarkup } from './parse'

export interface ContractLike {
  id: string
  title: string
  content?: string | null
  client_id?: string | null
  created_at: string
  clients?: { id?: string; name?: string | null; company?: string | null; email?: string | null } | null
}

export type ContractSort = 'newest' | 'oldest' | 'title' | 'client'
export type ContractFilter = 'all' | 'attention'

export const clientNameOf = (c: ContractLike) => c.clients?.name || 'Unknown client'

export interface ContractMeta {
  /** Unique "[placeholder]" items still to be filled in. */
  placeholders: string[]
  words: number
  /** Rough printed length (~500 words per page). */
  pages: number
  excerpt: string
}

const WORDS_PER_PAGE = 500

/** Older contracts were saved as HTML by a rich-text editor; flatten tags before reading them. */
const flatten = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')

export function excerptOf(content: string | null | undefined, max = 190) {
  const parts: string[] = []
  let length = 0
  for (const block of parseContract(flatten(content ?? ''))) {
    // The title is shown on the card already, and headings make poor prose.
    if (block.type !== 'paragraph' && block.type !== 'bullet') continue
    const text = parseInline(block.text).map((s) => s.text).join('')
    // Older contracts open with a plain ALL-CAPS title line instead of "# Title".
    if (parts.length === 0 && text.length <= 100 && /[A-Z]/.test(text) && text === text.toUpperCase()) continue
    parts.push(text)
    length += text.length + 1
    if (length >= max) break
  }
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim()
  return joined.length > max ? joined.slice(0, max - 1).trimEnd() + '…' : joined
}

export function contractMeta(c: Pick<ContractLike, 'content'>): ContractMeta {
  const content = c.content ?? ''
  const words = stripContractMarkup(content).split(/\s+/).filter(Boolean).length
  return {
    placeholders: findPlaceholders(flatten(content)),
    words,
    pages: Math.max(1, Math.ceil(words / WORDS_PER_PAGE)),
    excerpt: excerptOf(content),
  }
}

export function filterContracts(
  contracts: ContractLike[],
  f: { query: string; filter: ContractFilter; clientId: string },
  metaOf: (c: ContractLike) => ContractMeta = contractMeta,
): ContractLike[] {
  const q = f.query.trim().toLowerCase()
  return contracts.filter((c) => {
    if (f.clientId !== 'all' && c.client_id !== f.clientId) return false
    if (f.filter === 'attention' && metaOf(c).placeholders.length === 0) return false
    if (!q) return true
    // Searches the whole text, not just the title, so "net-30" or "indemnity" finds the right contract.
    return (
      c.title.toLowerCase().includes(q) ||
      clientNameOf(c).toLowerCase().includes(q) ||
      (c.clients?.company ?? '').toLowerCase().includes(q) ||
      stripContractMarkup(c.content ?? '').toLowerCase().includes(q)
    )
  })
}

export function sortContracts(contracts: ContractLike[], sort: ContractSort): ContractLike[] {
  const cmp: Record<ContractSort, (a: ContractLike, b: ContractLike) => number> = {
    newest: (a, b) => b.created_at.localeCompare(a.created_at),
    oldest: (a, b) => a.created_at.localeCompare(b.created_at),
    title: (a, b) => a.title.localeCompare(b.title),
    client: (a, b) => clientNameOf(a).localeCompare(clientNameOf(b)) || a.title.localeCompare(b.title),
  }
  return [...contracts].sort(cmp[sort])
}

export interface ContractSummary {
  total: number
  /** Distinct clients that have at least one contract. */
  clients: number
  /** Contracts with unfilled placeholders. */
  attention: number
  /** Created in the same calendar month as `today`. */
  thisMonth: number
}

export function summarizeContracts(
  contracts: ContractLike[],
  today: string,
  metaOf: (c: ContractLike) => ContractMeta = contractMeta,
): ContractSummary {
  const month = today.slice(0, 7)
  return {
    total: contracts.length,
    clients: new Set(contracts.map((c) => c.client_id).filter(Boolean)).size,
    attention: contracts.filter((c) => metaOf(c).placeholders.length > 0).length,
    thisMonth: contracts.filter((c) => c.created_at.slice(0, 7) === month).length,
  }
}

export function contractFileName(c: Pick<ContractLike, 'id' | 'title'>) {
  const slug = c.title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'contract'
  return `contract-${slug}-${c.id.slice(0, 8)}.pdf`
}
