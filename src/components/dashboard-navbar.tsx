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
import { UserCircle, FileText, Users, BarChart, Zap, FileSignature } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session state immediately
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }
    
    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    try{
    await supabase.auth.signOut()
    window.location.href="/"
    } catch(error){
      console.log(`error signing out ${error}`)
    }
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
  }


  if (isLoading || !user) {
    return (
      <nav className="nav-container">
        <div className="nav-content">
          <div className="flex items-center gap-6">
            <div className="nav-brand opacity-50">
              FreelanceFlow
            </div>
            <div className="flex items-center gap-6">
              <div className="nav-link opacity-50">
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
              <div className="nav-link opacity-50">
                <Users className="h-5 w-5" />
                <span>Clients</span>
              </div>
              <div className="nav-link opacity-50">
                <FileText className="h-5 w-5" />
                <span>Invoices</span>
              </div>
              <div className="nav-link opacity-50">
                <FileSignature className="h-5 w-5" />
                <span>Contracts</span>
              </div>
              <div className="nav-link opacity-50">
                <Zap className="h-5 w-5" />
                <span>Lead Generator</span>
              </div>
            </div>
          </div>
          <div className="nav-actions">
            <Button variant="ghost" size="icon" className="btn btn-ghost opacity-50" disabled>
              <UserCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>
    )
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
            <Link href="/dashboard/contracts" className={`nav-link ${isActive('/dashboard/contracts') ? 'nav-link-active' : ''}`}>
              <FileSignature className="h-5 w-5" />
              <span>Contracts</span>
            </Link>
            <Link href="/dashboard/lead-generator" className={`nav-link ${isActive('/dashboard/lead-generator') ? 'nav-link-active' : ''}`}>
              <Zap className="h-5 w-5" />
              <span>Lead Generator</span>
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
