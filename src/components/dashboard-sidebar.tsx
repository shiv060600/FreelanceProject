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
import { 
  UserCircle, 
  FileText, 
  Users, 
  BarChart, 
  Zap, 
  FileSignature, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export default function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }
    
    getInitialSession()

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
    try {
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.log(`error signing out ${error}`)
    }
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
  }

  const navigationItems = [
    { href: '/dashboard', icon: BarChart, label: 'Dashboard' },
    { href: '/dashboard/clients', icon: Users, label: 'Clients' },
    { href: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
    { href: '/dashboard/contracts', icon: FileSignature, label: 'Contracts' },
    { href: '/dashboard/lead-generator', icon: Zap, label: 'Lead Generator' },
    { href: '/dashboard/contracts-information', icon: InfoCircledIcon, label: 'Contract Info' },
  ]

  if (isLoading || !user) {
    return (
      <div className="flex">
        {/* Loading Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className={cn("font-bold text-xl text-blue-600 opacity-50", isSidebarCollapsed && "hidden")}>
              FreelanceFlow
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-50"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="mt-4 space-y-2 p-2">
            {navigationItems.map((item) => (
              <div
                key={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg opacity-50",
                  "text-gray-600"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn("transition-opacity", isSidebarCollapsed && "hidden")}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Top bar for mobile and user menu */}
        <div className={cn("flex-1 transition-all duration-300", isSidebarCollapsed ? "ml-16" : "ml-64")}>
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="md:hidden">
              <Button variant="ghost" size="sm" disabled className="opacity-50">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="opacity-50" disabled>
                <UserCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 hidden md:block",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className={cn("font-bold text-xl text-blue-600", isSidebarCollapsed && "hidden")}>
            FreelanceFlow
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex-shrink-0"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="mt-4 space-y-2 p-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive(item.href) 
                  ? "bg-blue-100 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn("transition-opacity", isSidebarCollapsed && "hidden")}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-4 left-0 right-0 p-2 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  isSidebarCollapsed ? "justify-center" : ""
                )}
              >
                <UserCircle className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{user?.email || 'User'}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={isSidebarCollapsed ? "right" : "top"}>
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="font-bold text-xl text-blue-600">
                FreelanceFlow
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="mt-4 space-y-2 p-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive(item.href) 
                      ? "bg-blue-100 text-blue-600" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-4 left-0 right-0 p-2 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <UserCircle className="h-5 w-5" />
                    <span className="truncate">{user?.email || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Top bar for mobile and spacing */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        "md:ml-64",
        isSidebarCollapsed && "md:ml-16"
      )}>
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="font-bold text-xl text-blue-600">
            FreelanceFlow
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
