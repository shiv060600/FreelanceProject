'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, isNavActive, type NavItem } from './nav-items'
import { BrandMark } from './brand'
import { UserMenu } from './user-menu'

/**
 * Desktop sidebar.
 *
 * Collapsed it's a 64px icon rail. On hover (or keyboard focus) it expands
 * to 256px *over* the page content — the content never reflows — and each
 * item reveals its label plus a short description of where it goes.
 */
export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Primary"
      className={cn(
        'group/sidebar fixed inset-y-0 left-0 z-40 hidden w-16 overflow-hidden md:block',
        'border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        'transition-[width,box-shadow] duration-200 ease-out motion-reduce:transition-none',
        'hover:w-64 hover:shadow-2xl hover:shadow-black/10 focus-within:w-64 focus-within:shadow-2xl focus-within:shadow-black/10',
        'dark:hover:shadow-black/50 dark:focus-within:shadow-black/50',
      )}
    >
      <div className="flex h-full w-64 flex-col">
        {/* Brand */}
        <Link
          href="/"
          className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-3.5 outline-none focus-visible:bg-sidebar-accent"
        >
          <BrandMark />
          <span className="whitespace-nowrap text-base font-semibold tracking-tight text-foreground opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
            FreelanceFlow
          </span>
        </Link>

        {/* Primary navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} active={isNavActive(pathname, item)} />
          ))}

          <div className="my-3 h-px bg-sidebar-border" />

          {SECONDARY_NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} active={isNavActive(pathname, item)} />
          ))}
        </nav>

        {/* Account */}
        <div className="shrink-0 border-t border-sidebar-border p-2">
          <UserMenu variant="sidebar" />
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-2.5 py-2 outline-none transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-muted hover:text-foreground',
      )}
    >
      {active && (
        <span className="absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon className="h-5 w-5 shrink-0" />
      <span className="min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
        <span className="block text-sm font-medium leading-tight">{item.label}</span>
        <span className="block truncate text-xs font-normal leading-tight text-muted-foreground">
          {item.description}
        </span>
      </span>
    </Link>
  )
}
