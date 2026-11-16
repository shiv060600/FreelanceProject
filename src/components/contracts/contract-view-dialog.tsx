'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, Download, Loader2, Mail, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClientAvatar } from '@/components/shared/client-avatar'
import { formatDate } from '@/lib/format'
import { clientNameOf, contractMeta } from '@/lib/contracts/library'
import { ContractDocument } from './contract-document'
import { ContractPDF } from './contract-pdf'
import { pdfContractOf, userNameOf } from './contract-pdf-actions'

// The PDF viewer is heavy and browser-only, so load it only if someone opens that tab.
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((m) => m.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing PDF…
    </div>
  ),
})

interface ContractViewDialogProps {
  contract: any | null
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (contract: any) => void
  onDownload: (contract: any) => void
  onEmail: (contract: any) => void
  busy: boolean
}

export function ContractViewDialog({ contract, user, open, onOpenChange, onEdit, onDownload, onEmail, busy }: ContractViewDialogProps) {
  const [tab, setTab] = useState('document')
  useEffect(() => {
    if (open) setTab('document')
  }, [open, contract?.id])

  if (!contract) return null
  const meta = contractMeta(contract)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-4xl flex-col gap-0 p-0">
        <DialogHeader className="space-y-3 border-b p-5 pr-12 text-left">
          <div className="flex items-start gap-3">
            <ClientAvatar name={clientNameOf(contract)} className="mt-0.5" />
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg leading-tight">{contract.title}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {clientNameOf(contract)}
                {contract.clients?.company ? ` · ${contract.clients.company}` : ''} · {formatDate(contract.created_at)} · ~{meta.pages}{' '}
                {meta.pages === 1 ? 'page' : 'pages'}
              </DialogDescription>
            </div>
          </div>
          {meta.placeholders.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="min-w-0">
                <p className="font-medium">
                  {meta.placeholders.length} {meta.placeholders.length === 1 ? 'item' : 'items'} still to fill in before you send this
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {meta.placeholders.map((p) => (
                    <code key={p} className="rounded bg-amber-200/70 px-1.5 py-0.5 text-xs text-amber-950">
                      {p}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b px-5 py-2">
            <TabsList>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="pdf">PDF preview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="document" className="mt-0 min-h-0 flex-1 overflow-y-auto bg-muted/40 p-4 scrollbar-thin sm:p-6">
            <ContractDocument text={contract.content ?? ''} className="mx-auto max-w-[44rem]" />
          </TabsContent>
          <TabsContent value="pdf" className="mt-0 min-h-0 flex-1 bg-muted/40 p-3">
            <div className="h-full overflow-hidden rounded-md border bg-white">
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <ContractPDF contract={pdfContractOf(contract)} userName={userNameOf(user)} userEmail={user?.email || ''} />
              </PDFViewer>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t p-3">
          <Button variant="ghost" onClick={() => onEdit(contract)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={() => onEmail(contract)} disabled={busy} className="gap-2">
            <Mail className="h-4 w-4" /> Email to client
          </Button>
          <Button onClick={() => onDownload(contract)} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
