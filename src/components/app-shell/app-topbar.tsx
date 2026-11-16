'use client'

import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { getPageTitle } from './nav-items'
import { MobileNav } from './mobile-nav'
import { CommandPalette } from './command-palette'
import { UserMenu } from './user-menu'
import { BrandMark } from './brand'

export function AppTopbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6">
      <MobileNav />
      <BrandMark className="h-7 w-7 rounded-md md:hidden" />

      <h1 className="truncate text-sm font-semibold tracking-tight">{getPageTitle(pathname)}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        <CommandPalette />
        <ThemeToggle />
        <div className="md:hidden">
          <UserMenu variant="topbar" />
        </div>
      </div>
    </header>
  )
}
