'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Search, Sun, Monitor, UserCircle } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from './nav-items'

/** ⌘K / Ctrl+K quick navigation + theme switching. */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // `key` can be undefined on synthetic keydown events (e.g. browser autofill).
      if (e.key?.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const run = useCallback((fn: () => void) => {
    setOpen(false)
    fn()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 justify-start gap-2 px-3 text-muted-foreground sm:flex"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left font-normal">Search or jump to…</span>
        <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a page or action…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Go to">
            {[...NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.description}`}
                onSelect={() => run(() => router.push(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
            <CommandItem value="profile account settings" onSelect={() => run(() => router.push('/dashboard/profile'))}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem value="light theme" onSelect={() => run(() => setTheme('light'))}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </CommandItem>
            <CommandItem value="dark theme" onSelect={() => run(() => setTheme('dark'))}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </CommandItem>
            <CommandItem value="system theme" onSelect={() => run(() => setTheme('system'))}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
