import { redirect } from 'next/navigation'
import { createClient } from '../../../../supabase/server'
import SalesAnalytics from '@/components/analytics/sales-analytics'
import type { AnalyticsInvoice } from '@/lib/analytics'

export const metadata = { title: 'Sales analytics · Freelance Flow' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // All of a freelancer's invoices: a few hundred rows at most, so filtering
  // and aggregating in the browser keeps every filter change instant.
  const { data, error } = await supabase
    .from('invoices')
    .select('id,invoice_number,client_id,status,total,issue_date,due_date,clients(name)')
    .eq('user_id', user.id)
    .order('due_date', { ascending: false })
    .limit(5000)

  if (error) {
    console.error('Failed to load invoices for analytics:', error.message)
    throw new Error('Could not load your sales data. Please try again.')
  }

  const invoices: AnalyticsInvoice[] = (data ?? []).map((row: any) => {
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients
    return {
      id: row.id,
      invoice_number: row.invoice_number,
      client_id: row.client_id ?? null,
      client_name: client?.name ?? 'Unknown client',
      status: row.status === 'paid' ? 'paid' : 'draft',
      total: Number(row.total) || 0,
      issue_date: String(row.issue_date).slice(0, 10),
      due_date: String(row.due_date).slice(0, 10),
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <SalesAnalytics invoices={invoices} />
    </div>
  )
}
