import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'

/**
 * Dashboard chrome: hover-expanding sidebar on the left, sticky top bar,
 * and the page content. The content is offset by the collapsed rail width
 * only (md:pl-16) because the expanded sidebar overlays it.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-h-screen flex-col md:pl-16">
        <AppTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
