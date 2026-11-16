import {
  LayoutDashboard,
  Users,
  Receipt,
  FileSignature,
  BarChart3,
  Scale,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  /** One-liner shown when the sidebar expands, so people know what they're clicking */
  description: string
  icon: LucideIcon
  /** Match nested routes too (e.g. /dashboard/contracts/123) */
  matchNested?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Earnings & activity overview',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/clients',
    label: 'Clients',
    description: 'Contacts, companies & history',
    icon: Users,
    matchNested: true,
  },
  {
    href: '/dashboard/invoices',
    label: 'Invoices',
    description: 'Create, send & track payments',
    icon: Receipt,
    matchNested: true,
  },
  {
    href: '/dashboard/contracts',
    label: 'Contracts',
    description: 'Draft with AI, preview & send',
    icon: FileSignature,
    matchNested: true,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    description: 'Sales by client & period',
    icon: BarChart3,
  },
]

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard/contracts-information',
    label: 'Legal Guide',
    description: 'E-signature rules by country',
    icon: Scale,
  },
]

export function isNavActive(pathname: string, item: NavItem) {
  if (pathname === item.href) return true
  return !!item.matchNested && pathname.startsWith(item.href + '/')
}

/** Human-readable title for the top bar, derived from the route. */
export function getPageTitle(pathname: string) {
  const all = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS]
  const match = all.find((i) => isNavActive(pathname, i))
  if (match) return match.label
  if (pathname.startsWith('/dashboard/profile')) return 'Profile'
  if (pathname.startsWith('/dashboard/lead-generator')) return 'Lead Generator'
  return 'Dashboard'
}
