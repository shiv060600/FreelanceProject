'use client'

import { Eye, Mail, MoreHorizontal, Pencil, Phone, Trash2 } from 'lucide-react'
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
import { formatDate, money } from '@/lib/format'
import { EMPTY_STATS, type ClientStats } from '@/lib/invoice-utils'
import type { Client } from '@/types/client'

export interface ClientListHandlers {
  onView: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

interface ClientListProps extends ClientListHandlers {
  clients: Client[]
  stats: Map<string, ClientStats>
}

function ContactLinks({ client, className }: { client: Client; className?: string }) {
  if (!client.email && !client.phone) return <span className="text-muted-foreground">—</span>
  return (
    <div className={cn('flex flex-col gap-0.5 text-sm', className)}>
      {client.email && (
        <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1.5 truncate hover:text-primary">
          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{client.email}</span>
        </a>
      )}
      {client.phone && (
        <a href={`tel:${client.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {client.phone}
        </a>
      )}
    </div>
  )
}

function RowMenu({ client, h }: { client: Client; h: ClientListHandlers }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${client.name}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => h.onView(client)} className="gap-2">
          <Eye className="h-4 w-4" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => h.onEdit(client)} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => h.onDelete(client)} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Owed({ stats }: { stats: ClientStats }) {
  if (stats.outstanding <= 0) return <span className="text-muted-foreground">—</span>
  return (
    <span className={cn('font-medium tabular-nums', stats.overdue > 0 ? 'text-destructive' : 'text-warning')}>
      {money(stats.outstanding)}
      {stats.overdue > 0 && <span className="block text-xs font-normal">{money(stats.overdue)} overdue</span>}
    </span>
  )
}

export default function ClientList({ clients, stats, ...h }: ClientListProps) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-6 text-xs uppercase tracking-wide">Client</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Contact</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Invoices</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">Paid</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">Outstanding</TableHead>
              <TableHead className="pr-4 text-right text-xs uppercase tracking-wide">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const s = stats.get(client.id) ?? EMPTY_STATS
              return (
                <TableRow key={client.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={client.name} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => h.onView(client)}
                          className="block max-w-[14rem] truncate text-left font-semibold hover:text-primary"
                        >
                          {client.name}
                        </button>
                        {client.company && (
                          <div className="max-w-[14rem] truncate text-xs text-muted-foreground">{client.company}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[16rem]">
                    <ContactLinks client={client} />
                  </TableCell>
                  <TableCell>
                    {s.invoices > 0 ? (
                      <>
                        <div className="tabular-nums">{s.invoices}</div>
                        <div className="text-xs text-muted-foreground">Last: {formatDate(s.lastInvoice)}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">None yet</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.paid > 0 ? <span className="font-medium">{money(s.paid)}</span> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Owed stats={s} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowMenu client={client} h={h} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {clients.map((client) => {
          const s = stats.get(client.id) ?? EMPTY_STATS
          return (
            <li key={client.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ClientAvatar name={client.name} />
                  <div className="min-w-0">
                    <button type="button" onClick={() => h.onView(client)} className="block max-w-full truncate text-left font-semibold">
                      {client.name}
                    </button>
                    {client.company && <p className="truncate text-xs text-muted-foreground">{client.company}</p>}
                  </div>
                </div>
                <RowMenu client={client} h={h} />
              </div>
              <ContactLinks client={client} className="mt-3" />
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Invoices</dt>
                  <dd className="font-medium tabular-nums">{s.invoices}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Paid</dt>
                  <dd className="font-medium tabular-nums">{s.paid > 0 ? money(s.paid) : '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Outstanding</dt>
                  <dd>
                    <Owed stats={s} />
                  </dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </>
  )
}
