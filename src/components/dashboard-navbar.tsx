'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, FileText, Users, BarChart } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
  }

  if (!user) {
    return null
  }

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="flex items-center gap-6">
          <Link href="/" prefetch className="nav-brand">
            FreelanceFlow
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}>
              <BarChart className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/clients" className={`nav-link ${isActive('/dashboard/clients') ? 'nav-link-active' : ''}`}>
              <Users className="h-5 w-5" />
              <span>Clients</span>
            </Link>
            <Link href="/dashboard/invoices" className={`nav-link ${isActive('/dashboard/invoices') ? 'nav-link-active' : ''}`}>
              <FileText className="h-5 w-5" />
              <span>Invoices</span>
            </Link>
          </div>
        </div>
        <div className="nav-actions">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="btn btn-ghost">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dropdown-content">
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProfileClick}>
                Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
