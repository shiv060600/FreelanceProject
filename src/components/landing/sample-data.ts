import type { InvoiceState } from '@/lib/invoice-utils'
import type { Series } from '@/lib/analytics'

/**
 * Sample data for the landing-page previews. The previews render the real
 * app components with this data, so they never go stale like screenshots do.
 * Totals below are consistent with each other (outstanding = the unpaid rows).
 */

export const SAMPLE_INVOICES: { number: string; client: string; amount: number; state: InvoiceState; hint?: string; hintTone?: 'danger' | 'warning' | 'muted'; due: string }[] = [
  { number: 'INV-202611-01', client: 'Northwind Digital', amount: 3200, state: 'draft', hint: 'Due today', hintTone: 'warning', due: 'Nov 20, 2026' },
  { number: 'INV-202610-02', client: 'Bluefin Coffee', amount: 2900, state: 'overdue', hint: '12 days overdue', hintTone: 'danger', due: 'Nov 8, 2026' },
  { number: 'INV-202611-02', client: 'Helix Biotech', amount: 2100, state: 'draft', hint: 'Due in 4 days', hintTone: 'muted', due: 'Nov 24, 2026' },
  { number: 'INV-202609-01', client: 'Lumen Learning', amount: 3600, state: 'paid', due: 'Oct 12, 2026' },
  { number: 'INV-202608-03', client: 'Rossi & Partners', amount: 1200, state: 'paid', due: 'Sep 4, 2026' },
]

export const SAMPLE_CLIENTS: { name: string; company: string; paid: number; outstanding: number; overdue: number }[] = [
  { name: 'Priya Natarajan', company: 'Northwind Digital', paid: 35200, outstanding: 3200, overdue: 0 },
  { name: 'Marcus Webb', company: 'Bluefin Coffee Roasters', paid: 9050, outstanding: 2900, overdue: 2900 },
  { name: 'Tomasz Kowalski', company: 'Helix Biotech', paid: 11150, outstanding: 2100, overdue: 0 },
  { name: 'Aisha Rahman', company: 'Lumen Learning', paid: 14400, outstanding: 0, overdue: 0 },
]

export const SAMPLE_CONTRACT = `# WEBSITE REDESIGN SERVICE AGREEMENT

This Freelance Service Agreement (the **"Agreement"**) is entered into as of November 20, 2026 by and between Jordan Lee (the **"Freelancer"**) and Priya Natarajan of Northwind Digital (the **"Client"**).

## 1. SCOPE OF SERVICES

1.1 The Freelancer will design and build a five-page marketing website (the **"Services"**), including two rounds of revisions.

1.2 The Client will review each deliverable within 5 business days, after which it is deemed accepted.

## 2. FEES AND PAYMENT

2.1 The Client will pay a total fee of [Total fee], with 50% due on signing and the balance on delivery.

2.2 Invoices are due within 15 days. Late amounts accrue interest at the lesser of 1.5% per month or the maximum rate permitted by law.

## 3. INTELLECTUAL PROPERTY

3.1 Ownership of the final deliverables transfers to the Client upon full payment. The Freelancer keeps their pre-existing tools and may show the work in a portfolio.

## 4. GOVERNING LAW

4.1 This Agreement is governed by the laws of [Governing jurisdiction].`

export const SAMPLE_NOTES = [
  'Fill in [Total fee] and [Governing jurisdiction].',
  'Confirm the 15-day payment term and the 1.5% late-payment interest.',
  'Check the freelance contract rules for your state before sending.',
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const CLIENT_KEYS = ['Northwind Digital', 'Helix Biotech', 'Lumen Learning', 'Bluefin Coffee', 'Other']
// rows: clients, columns: months
const GRID = [
  [3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200],
  [0, 4800, 0, 0, 3600, 0, 0, 0, 2750, 0],
  [3600, 0, 3600, 0, 0, 0, 1950, 0, 0, 0],
  [2400, 2400, 2400, 0, 0, 0, 0, 1850, 0, 0],
  [0, 500, 1200, 3250, 1500, 800, 0, 1100, 900, 600],
]

export const SAMPLE_SERIES: Series = {
  keys: CLIENT_KEYS,
  rows: MONTHS.map((label, i) => {
    const row: Series['rows'][number] = { bucket: `2026-${String(i + 1).padStart(2, '0')}-01`, label, total: 0 }
    CLIENT_KEYS.forEach((k, j) => {
      row[k] = GRID[j][i]
      row.total += GRID[j][i]
    })
    return row
  }),
}

/** Number of paid invoices behind the series: every non-zero cell is one invoice. */
export const SAMPLE_PAID_COUNT = GRID.flat().filter((v) => v > 0).length
export const SAMPLE_PAID_TOTAL = SAMPLE_SERIES.rows.reduce((s, r) => s + r.total, 0)
export const SAMPLE_UNPAID_TOTAL = SAMPLE_INVOICES.filter((i) => i.state !== 'paid').reduce((s, i) => s + i.amount, 0)
export const SAMPLE_OVERDUE_TOTAL = SAMPLE_INVOICES.filter((i) => i.state === 'overdue').reduce((s, i) => s + i.amount, 0)
