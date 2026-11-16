'use client'

import { AlertTriangle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { findPlaceholders } from '@/lib/contracts/parse'
import { ContractDocument } from './contract-document'

interface ContractEditorProps {
  value: string
  onChange: (value: string) => void
  /** True while the AI is still writing: locks editing. */
  streaming?: boolean
  disabled?: boolean
  id?: string
  placeholder?: string
}

/** Edit / Preview tabs for contract text, with a count of unfilled [placeholders]. */
export function ContractEditor({ value, onChange, streaming, disabled, id, placeholder }: ContractEditorProps) {
  const placeholders = findPlaceholders(value)

  return (
    <Tabs defaultValue="edit" className="w-full">
      <div className="mb-2 flex items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {!streaming && placeholders.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {placeholders.length} {placeholders.length === 1 ? 'item' : 'items'} to fill in
          </span>
        )}
      </div>

      <TabsContent value="edit" className="mt-0">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={streaming}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[340px] font-mono text-xs leading-relaxed"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Formatting: <code className="rounded bg-muted px-1">## 1. HEADING</code> for sections,{' '}
          <code className="rounded bg-muted px-1">**bold**</code> for defined terms,{' '}
          <code className="rounded bg-muted px-1">[Square brackets]</code> for things still to fill in.
        </p>
      </TabsContent>

      <TabsContent value="preview" className="mt-0">
        <div className="max-h-[420px] overflow-y-auto rounded-md bg-muted/50 p-3 scrollbar-thin">
          <ContractDocument text={value} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
