const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

/** $1,234 */
export const money = (n: number) => usd0.format(n)
/** $1,234.56 */
export const money2 = (n: number) => usd2.format(n)
/** $1.2K */
export const moneyCompact = (n: number) => compact.format(n)
export const percent = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * 'YYYY-MM-DD' (or a full ISO timestamp) -> "Nov 16, 2026".
 * Reads the calendar date straight from the string, so it never shifts by a
 * day because of the viewer's timezone (unlike `new Date(str).toLocale…`).
 */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return '—'
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
