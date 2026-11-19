'use client'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, FileText, Info, Loader2, Sparkles, Square, Wand2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useCreateContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-user'
import { useClients } from '@/hooks/use-clients'
import { useAiContractGenerate } from '@/hooks/use-ai-contract-generate'
import { useSubscriptionInfo } from '@/hooks/use-subscription-info'
import { useUserAiUsage } from '@/hooks/use-user-ai-usage'
import {
  CONTRACT_TYPES,
  DEFAULT_CONTRACT_TYPE,
  LENGTHS,
  TONES,
  getContractType,
  type LengthId,
  type ToneId,
} from '@/lib/contracts/catalog'
import { formatLimit, getAiDailyLimit } from '@/lib/contracts/limits'
import { JURISDICTION_LABELS } from '@/lib/legal/jurisdictions'
import { Checkbox } from '@/components/ui/checkbox'
import { LEGAL_GUIDE_HREF } from '@/components/legal/legal-disclaimer'
import { DraftingNotes } from './drafting-notes'
import { getPromptGuide } from './contract-prompt-guides'
import { ContractEditor } from './contract-editor'

interface CreateContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Mode = 'manual' | 'ai'

const ACK_KEY = 'ff:ai-contract-ack:v1'

/** Small segmented control used for tone / length. */
function Segmented<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T
  onChange: (v: T) => void
  options: readonly { id: T; label: string; hint: string }[]
  disabled?: boolean
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          title={o.hint}
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            value === o.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const CreateContractDialog = ({ open, onOpenChange }: CreateContractDialogProps) => {
  const [mode, setMode] = useState<Mode>('ai')
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // AI options
  const [contractType, setContractType] = useState<string>(DEFAULT_CONTRACT_TYPE)
  const [details, setDetails] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [tone, setTone] = useState<ToneId>('formal')
  const [length, setLength] = useState<LengthId>('standard')
  const [showGuide, setShowGuide] = useState(false)
  const [refineText, setRefineText] = useState('')
  const [subscriptionType, setSubscriptionType] = useState('Free')
  // The AI's "before you send" checklist. Shown beside the draft, never saved in the contract.
  const [notes, setNotes] = useState<string[]>([])
  // Must be acknowledged once per browser session before generating.
  const [acknowledged, setAcknowledged] = useState(false)

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: user, isLoading: userLoading } = useUser()
  const createContract = useCreateContract()
  const { data: clients = [], isLoading: clientsLoading } = useClients(user?.id || '')
  const { generateAiContract, refineAiContract, cancel, loading: aiLoading } = useAiContractGenerate()
  const { data: aiUsage } = useUserAiUsage(user?.id || '')
  const { getSubscriptionType } = useSubscriptionInfo(user?.id)

  useEffect(() => {
    if (!user?.id || userLoading) return
    getSubscriptionType(user.id)
      .then((rows) => setSubscriptionType(rows?.[0]?.subscription || 'Free'))
      .catch(() => setSubscriptionType('Free'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userLoading])

  // Don't leave a generation running if the dialog is closed.
  useEffect(() => {
    if (!open) cancel()
  }, [open, cancel])

  useEffect(() => {
    try {
      setAcknowledged(sessionStorage.getItem(ACK_KEY) === '1')
    } catch {
      /* storage unavailable: the checkbox just won't be remembered */
    }
  }, [])

  const acknowledge = (checked: boolean) => {
    setAcknowledged(checked)
    try {
      if (checked) sessionStorage.setItem(ACK_KEY, '1')
      else sessionStorage.removeItem(ACK_KEY)
    } catch {
      /* ignore */
    }
  }

  const limit = getAiDailyLimit(subscriptionType)
  const used = aiUsage || 0
  const canUseAi = used < limit
  const usagePct = Number.isFinite(limit) ? Math.min(100, (used / limit) * 100) : 0
  const selectedClient = clients.find((c: any) => c.id === clientId)
  const typeDef = getContractType(contractType)
  const hasDraft = content.trim().length > 0

  const refreshUsage = () => {
    if (user?.id) queryClient.invalidateQueries({ queryKey: ['user-ai-usage', user.id] })
  }

  const fail = (description: string) => toast({ title: 'Error', description, variant: 'destructive' })

  const handleGenerate = async () => {
    if (!title.trim() || !clientId || !details.trim()) {
      return fail('Add a title, choose a client and describe the deal first.')
    }
    if (!canUseAi) {
      return fail("You've used all your AI generations for today. They reset daily at 00:00 GMT.")
    }
    if (!acknowledged) {
      return fail('Please tick the box confirming you understand this is an AI draft and that you will review it.')
    }
    setContent('')
    setNotes([])
    try {
      const result = await generateAiContract(
        {
          title: title.trim(),
          contractType,
          details: details.trim(),
          clientName: selectedClient?.name || '',
          clientCompany: selectedClient?.company || undefined,
          clientEmail: selectedClient?.email || undefined,
          jurisdiction: jurisdiction.trim() || undefined,
          tone,
          length,
        },
        { onText: setContent },
      )
      setNotes(result.notes)
      toast({ title: 'Draft ready', description: 'Read the checklist below, fill in any highlighted gaps, then review it carefully before saving.' })
    } catch (e: any) {
      fail(e.message)
    } finally {
      refreshUsage()
    }
  }

  const handleRefine = async () => {
    if (!refineText.trim() || !hasDraft) return
    if (!canUseAi) {
      return fail("You've used all your AI generations for today. They reset daily at 00:00 GMT.")
    }
    const previous = content
    try {
      setContent('')
      const result = await refineAiContract(
        { currentContract: previous, instruction: refineText.trim(), jurisdiction: jurisdiction.trim() || undefined },
        { onText: setContent },
      )
      if (result.notes.length) setNotes(result.notes)
      setRefineText('')
    } catch (e: any) {
      setContent(previous) // don't lose the draft if the change fails
      fail(e.message)
    } finally {
      refreshUsage()
    }
  }

  const reset = () => {
    setTitle('')
    setClientId('')
    setContent('')
    setDetails('')
    setJurisdiction('')
    setRefineText('')
    setNotes([])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return fail('User not authenticated')
    if (!title.trim() || !content.trim() || !clientId) return fail('Please add a title, a client and the contract text.')

    setIsSaving(true)
    try {
      await createContract.mutateAsync({
        user_id: user.id,
        client_id: clientId,
        title: title.trim(),
        content,
      })
      toast({ title: 'Contract saved', description: 'You can preview, download or send it from the list.' })
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating contract:', error)
      fail('Failed to save the contract. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const busy = aiLoading || isSaving

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[92vh] overflow-y-auto sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>New contract</DialogTitle>
          <DialogDescription>
            Write one yourself or let AI draft it from a few details. You review everything before it's saved.
          </DialogDescription>
        </DialogHeader>

        {/* Mode switch */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(
            [
              { id: 'ai', label: 'Generate with AI', icon: Sparkles },
              { id: 'manual', label: 'Write manually', icon: FileText },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => setMode(id)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                mode === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Basics */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Contract title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website redesign – Acme"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId} disabled={clientsLoading || clients.length === 0}>
                <SelectTrigger id="client">
                  <SelectValue
                    placeholder={clientsLoading ? 'Loading clients…' : clients.length ? 'Select a client' : 'No clients yet'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                      {client.company ? ` (${client.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI inputs */}
          {mode === 'ai' && (
            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Bot className="h-4 w-4 text-primary" />
                  AI generations today
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn('h-full rounded-full transition-all', canUseAi ? 'bg-primary' : 'bg-destructive')}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                  <span className={cn('font-mono', !canUseAi && 'text-destructive')}>
                    {used} / {formatLimit(limit)}
                  </span>
                  <span>{subscriptionType} plan</span>
                </div>
              </div>
              {!canUseAi && (
                <p className="text-xs text-destructive">
                  Daily limit reached — resets at 00:00 GMT. You can still write a contract manually, or upgrade your plan.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contract type</Label>
                  <Select value={contractType} onValueChange={setContractType} disabled={busy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{typeDef.description}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Governing law</Label>
                  <Input
                    id="jurisdiction"
                    list="jurisdictions"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g. California, USA"
                    disabled={busy}
                  />
                  <datalist id="jurisdictions">
                    {JURISDICTION_LABELS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <p className="text-xs text-muted-foreground">Drives country- and state-specific drafting. Leave blank to get a [placeholder].</p>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Segmented value={tone} onChange={setTone} options={TONES} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>Length</Label>
                  <Segmented value={length} onChange={setLength} options={LENGTHS} disabled={busy} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="details">Deal details</Label>
                  <button
                    type="button"
                    onClick={() => setShowGuide((s) => !s)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                    What should I include?
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showGuide && 'rotate-180')} />
                  </button>
                </div>
                {showGuide && (
                  <div className="whitespace-pre-line rounded-lg border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                    {getPromptGuide(contractType).prompt}
                  </div>
                )}
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Scope, price, timeline, revisions, who owns the work, anything unusual…"
                  className="min-h-[110px]"
                  disabled={busy}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card p-3 text-xs leading-relaxed">
                <Checkbox
                  checked={acknowledged}
                  onCheckedChange={(c) => acknowledge(c === true)}
                  className="mt-0.5"
                  aria-describedby="ack-text"
                />
                <span id="ack-text">
                  I understand this is an <strong>AI-generated draft, not legal advice</strong>. FreelanceFlow doesn’t review contracts. I’m
                  responsible for reading and checking the contract (and getting a lawyer’s advice where needed) before I send or sign it.{' '}
                  <Link
                    href={LEGAL_GUIDE_HREF}
                    target="_blank"
                    className="font-medium underline underline-offset-2 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read the legal guide
                  </Link>
                </span>
              </label>

              <div className="flex items-center justify-end gap-3">
                {aiLoading ? (
                  <Button type="button" variant="outline" onClick={cancel} className="shrink-0 gap-2">
                    <Square className="h-3.5 w-3.5" /> Stop
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={busy || !canUseAi || !acknowledged}
                    title={acknowledged ? undefined : 'Tick the box above to continue'}
                    className="shrink-0 gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {hasDraft ? 'Regenerate' : 'Generate draft'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Contract text */}
          {(mode === 'manual' || hasDraft || aiLoading) && (
            <div className="space-y-3">
              <Label htmlFor="content" className="flex items-center gap-2">
                Contract text
                {aiLoading && (
                  <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {content ? 'Writing…' : 'Reviewing your details and planning the clauses…'}
                  </span>
                )}
              </Label>
              <ContractEditor
                id="content"
                value={content}
                onChange={setContent}
                streaming={aiLoading}
                placeholder="Enter the contract text…"
              />

              {mode === 'ai' && !aiLoading && <DraftingNotes notes={notes} />}

              {mode === 'ai' && hasDraft && !aiLoading && (
                <div className="flex gap-2">
                  <Input
                    value={refineText}
                    onChange={(e) => setRefineText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleRefine()
                      }
                    }}
                    placeholder='Ask for a change, e.g. "add a 1.5% monthly late fee" or "make the IP clause simpler"'
                    disabled={!canUseAi}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRefine}
                    disabled={!refineText.trim() || !canUseAi}
                    className="shrink-0 gap-2"
                  >
                    <Wand2 className="h-4 w-4" /> Apply
                  </Button>
                </div>
              )}
              {mode === 'ai' && hasDraft && !aiLoading && (
                <p className="text-xs text-muted-foreground">Each change request counts as one AI generation.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim() || !content.trim() || !clientId}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Save contract'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateContractDialog
