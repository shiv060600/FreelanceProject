'use client'

import { AlertTriangle, Download, Eye, Loader2, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClientAvatar } from '@/components/shared/client-avatar'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { clientNameOf, type ContractMeta } from '@/lib/contracts/library'

export interface ContractCardHandlers {
  onView: (contract: any) => void
  onEdit: (contract: any) => void
  onDownload: (contract: any) => void
  onEmail: (contract: any) => void
  onDelete: (contract: any) => void
}

interface ContractCardProps extends ContractCardHandlers {
  contract: any
  meta: ContractMeta
  /** True while this contract's PDF is being generated. */
  pending: boolean
}

export function ContractCard({ contract, meta, pending, ...h }: ContractCardProps) {
  const client = clientNameOf(contract)
  const todo = meta.placeholders.length

  return (
    <article className={cn('flex flex-col rounded-xl border bg-card transition-shadow hover:shadow-md', pending && 'opacity-70')}>
      <button
        type="button"
        onClick={() => h.onView(contract)}
        className="flex flex-1 flex-col gap-3 rounded-t-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2.5">
          <ClientAvatar name={client} className="h-8 w-8 text-[11px]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{client}</p>
            {contract.clients?.company && (
              <p className="truncate text-xs leading-tight text-muted-foreground">{contract.clients.company}</p>
            )}
          </div>
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{contract.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {meta.excerpt || <em>No content yet</em>}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-1 text-xs text-muted-foreground">
          <span>{formatDate(contract.created_at)}</span>
          <span aria-hidden>·</span>
          <span>
            ~{meta.pages} {meta.pages === 1 ? 'page' : 'pages'}
          </span>
          {todo > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 font-medium text-warning">
              <AlertTriangle className="h-3 w-3" />
              {todo} to fill in
            </span>
          )}
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <Button variant="ghost" size="sm" onClick={() => h.onView(contract)} className="gap-1.5">
          <Eye className="h-4 w-4" /> View
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => h.onDownload(contract)}
            disabled={pending}
            aria-label={`Download ${contract.title} as PDF`}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`More actions for ${contract.title}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => h.onEdit(contract)} className="gap-2">
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => h.onEmail(contract)} disabled={pending} className="gap-2">
                <Mail className="h-4 w-4" /> Email to client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => h.onDelete(contract)} className="gap-2 text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  )
}
