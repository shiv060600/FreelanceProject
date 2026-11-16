'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, isNavActive } from './nav-items'
import { BrandLink } from './brand'

/** Below `md` the icon rail is replaced by a slide-in drawer. */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <BrandLink />
        </div>
        <nav className="space-y-1 p-3">
          {[...NAV_ITEMS, null, ...SECONDARY_NAV_ITEMS].map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} className="my-3 h-px bg-sidebar-border" />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isNavActive(pathname, item) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isNavActive(pathname, item)
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-muted',
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>
                  <span className="block leading-tight">{item.label}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{item.description}</span>
                </span>
              </Link>
            ),
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
