'use client'

import { CheckCircle2, Download, Eye, Loader2, Mail, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClientAvatar } from '@/components/shared/client-avatar'
import { cn } from '@/lib/utils'
import { formatDate, money2 } from '@/lib/format'
import { clientNameOf, dueHint, invoiceAmount, invoiceState, type InvoiceLike } from '@/lib/invoice-utils'
import { StatusBadge } from './status-badge'

export interface InvoiceListHandlers {
  onPreview: (invoice: any) => void
  onDelete: (invoice: any) => void
  onDownload: (invoice: any) => void
  onEmail: (invoice: any) => void
  /** paid=true marks as paid, paid=false moves it back to draft. */
  onSetPaid: (invoice: any, paid: boolean) => void
  onEdit: (invoice: any) => void
}

interface InvoiceListProps extends InvoiceListHandlers {
  invoices: InvoiceLike[]
  today: string
  /** Invoice id currently being updated / exported, to show a spinner. */
  pendingId: string | null
  /** Disable PDF-based actions until the sender's profile has loaded. */
  pdfReady: boolean
}

const HINT_TONE = { muted: 'text-muted-foreground', warning: 'text-warning', danger: 'text-destructive' } as const

function DueCell({ invoice, today }: { invoice: InvoiceLike; today: string }) {
  const hint = dueHint(invoice, today)
  return (
    <div>
      <div className="tabular-nums">{formatDate(invoice.due_date)}</div>
      {hint && <div className={cn('text-xs font-medium', HINT_TONE[hint.tone])}>{hint.text}</div>}
    </div>
  )
}

function RowMenu({
  invoice,
  paid,
  pending,
  pdfReady,
  h,
}: {
  invoice: any
  paid: boolean
  pending: boolean
  pdfReady: boolean
  h: InvoiceListHandlers
}) {
  const needsClient = !invoice.clients
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${invoice.invoice_number}`}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={() => h.onPreview(invoice)} disabled={!pdfReady || needsClient} className="gap-2">
          <Eye className="h-4 w-4" /> Preview
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => h.onEdit(invoice)} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => h.onDownload(invoice)} disabled={!pdfReady || needsClient} className="gap-2">
          <Download className="h-4 w-4" /> Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => h.onEmail(invoice)} disabled={!pdfReady || needsClient} className="gap-2">
          <Mail className="h-4 w-4" /> Email to client
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => h.onSetPaid(invoice, !paid)} className="gap-2">
          {paid ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {paid ? 'Mark as unpaid' : 'Mark as paid'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => h.onDelete(invoice)}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MarkPaidButton({ invoice, pending, onSetPaid }: { invoice: any; pending: boolean; onSetPaid: InvoiceListHandlers['onSetPaid'] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => onSetPaid(invoice, true)}
      className="h-8 gap-1.5"
      aria-label={`Mark ${invoice.invoice_number} as paid`}
    >
      <CheckCircle2 className="h-3.5 w-3.5" /> Mark paid
    </Button>
  )
}

export function InvoiceList({ invoices, today, pendingId, pdfReady, ...h }: InvoiceListProps) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-6 text-xs uppercase tracking-wide">Invoice</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Client</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Issued</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Due</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">Amount</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
              <TableHead className="pr-4 text-right text-xs uppercase tracking-wide">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice: any) => {
              const state = invoiceState(invoice, today)
              const pending = pendingId === invoice.id
              return (
                <TableRow key={invoice.id} className={cn(pending && 'opacity-60')}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      onClick={() => h.onPreview(invoice)}
                      disabled={!pdfReady || !invoice.clients}
                      className="block text-left font-semibold hover:text-primary disabled:pointer-events-none"
                    >
                      {invoice.invoice_number}
                    </button>
                    {invoice.invoice_name && (
                      <div className="max-w-[16rem] truncate text-xs text-muted-foreground">{invoice.invoice_name}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <ClientAvatar name={clientNameOf(invoice)} className="h-7 w-7 text-[11px]" />
                      <span className="max-w-[12rem] truncate font-medium">{clientNameOf(invoice)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(invoice.issue_date)}</TableCell>
                  <TableCell>
                    <DueCell invoice={invoice} today={today} />
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{money2(invoiceAmount(invoice))}</TableCell>
                  <TableCell>
                    <StatusBadge state={state} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {state !== 'paid' && <MarkPaidButton invoice={invoice} pending={pending} onSetPaid={h.onSetPaid} />}
                      <RowMenu invoice={invoice} paid={state === 'paid'} pending={pending} pdfReady={pdfReady} h={h} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {invoices.map((invoice: any) => {
          const state = invoiceState(invoice, today)
          const pending = pendingId === invoice.id
          return (
            <li key={invoice.id} className={cn('rounded-xl border bg-card p-4', pending && 'opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ClientAvatar name={clientNameOf(invoice)} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{clientNameOf(invoice)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.invoice_number}
                      {invoice.invoice_name ? ` · ${invoice.invoice_name}` : ''}
                    </p>
                  </div>
                </div>
                <RowMenu invoice={invoice} paid={state === 'paid'} pending={pending} pdfReady={pdfReady} h={h} />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-bold tabular-nums">{money2(invoiceAmount(invoice))}</p>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <DueCell invoice={invoice} today={today} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge state={state} />
                  {state !== 'paid' && <MarkPaidButton invoice={invoice} pending={pending} onSetPaid={h.onSetPaid} />}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
