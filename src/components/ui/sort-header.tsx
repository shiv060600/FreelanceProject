'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "./button"

type SortDirection = 'asc' | 'desc' | null

interface SortHeaderProps {
  children: React.ReactNode
  sortKey: string
  currentSort: { key: string | null; direction: SortDirection }
  onSort: (key: string) => void
  className?: string
}

export function SortHeader({ children, sortKey, currentSort, onSort, className }: SortHeaderProps) {
  const isActive = currentSort.key === sortKey
  const direction = isActive ? currentSort.direction : null

  const getSortIcon = () => {
    if (!isActive || direction === null) return ArrowUpDown
    return direction === 'asc' ? ArrowUp : ArrowDown
  }

  const SortIcon = getSortIcon()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(sortKey)}
      className={`h-auto p-2 font-semibold hover:bg-muted/50 ${className}`}
    >
      <span>{children}</span>
      <SortIcon className={`ml-2 h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
    </Button>
  )
}