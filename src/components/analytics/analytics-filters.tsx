'use client'

import { ChevronDown, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Segmented } from '@/components/ui/segmented'
import type { DateBasis, DateRange, Granularity, Metric, RangePreset } from '@/lib/analytics'

export type GroupBy = 'auto' | Granularity

export interface FilterState {
  preset: RangePreset
  custom: DateRange
  clientIds: string[]
  metric: Metric
  basis: DateBasis
  groupBy: GroupBy
}

export const DEFAULT_FILTERS: FilterState = {
  preset: 'last12',
  custom: { start: null, end: null },
  clientIds: [],
  metric: 'paid',
  basis: 'due_date',
  groupBy: 'auto',
}

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: 'last30', label: '30 days' },
  { id: 'last90', label: '90 days' },
  { id: 'last12', label: '12 months' },
  { id: 'ytd', label: 'This year' },
  { id: 'lastYear', label: 'Last year' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
]

const METRICS: { id: Metric; label: string }[] = [
  { id: 'paid', label: 'Paid' },
  { id: 'outstanding', label: 'Outstanding' },
  { id: 'invoiced', label: 'All invoiced' },
]

interface FiltersProps {
  value: FilterState
  onChange: (next: FilterState) => void
  clients: { id: string; name: string }[]
}

export function AnalyticsFilters({ value, onChange, clients }: FiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch })
  const dirty = JSON.stringify(value) !== JSON.stringify(DEFAULT_FILTERS)

  const toggleClient = (id: string) =>
    set({ clientIds: value.clientIds.includes(id) ? value.clientIds.filter((c) => c !== id) : [...value.clientIds, id] })

  const clientLabel =
    value.clientIds.length === 0
      ? 'All clients'
      : value.clientIds.length === 1
        ? clients.find((c) => c.id === value.clientIds[0])?.name ?? '1 client'
        : `${value.clientIds.length} clients`

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Date range"
          value={value.preset}
          onChange={(preset) => set({ preset })}
          options={PRESETS}
        />

        {value.preset === 'custom' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="From date"
              value={value.custom.start ?? ''}
              max={value.custom.end ?? undefined}
              onChange={(e) => set({ custom: { ...value.custom, start: e.target.value || null } })}
              className="h-9 w-[9.5rem]"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              aria-label="To date"
              value={value.custom.end ?? ''}
              min={value.custom.start ?? undefined}
              onChange={(e) => set({ custom: { ...value.custom, end: e.target.value || null } })}
              className="h-9 w-[9.5rem]"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="space-y-1.5">
          <Label className="block text-xs text-muted-foreground">Clients</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-48 justify-between gap-2 font-normal">
                <span className="flex min-w-0 items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{clientLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <div className="mb-1 flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">Filter by client</span>
                {value.clientIds.length > 0 && (
                  <button type="button" onClick={() => set({ clientIds: [] })} className="text-xs text-primary hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-64 space-y-0.5 overflow-y-auto scrollbar-thin">
                {clients.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No clients yet.</p>}
                {clients.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                    <Checkbox checked={value.clientIds.includes(c.id)} onCheckedChange={() => toggleClient(c.id)} />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs text-muted-foreground">Show</Label>
          <Segmented label="Metric" value={value.metric} onChange={(metric) => set({ metric })} options={METRICS} />
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs text-muted-foreground">Date based on</Label>
          <Select value={value.basis} onValueChange={(basis) => set({ basis: basis as DateBasis })}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Due date</SelectItem>
              <SelectItem value="issue_date">Issue date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs text-muted-foreground">Group by</Label>
          <Select value={value.groupBy} onValueChange={(groupBy) => set({ groupBy: groupBy as GroupBy })}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dirty && (
          <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)} className="ml-auto h-9 gap-1.5 text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        )}
      </div>
    </div>
  )
}
