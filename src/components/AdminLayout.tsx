import { Outlet, Link } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { useAuth } from '@/stores/auth'
import { Bell, Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto bg-slate-50 w-full flex flex-col relative">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-slate-500" />
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-500 hover:bg-slate-100 rounded-full"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                  </Button>
                  <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-slate-700 leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{user?.role}</p>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="default" className="bg-[#00a884] hover:bg-[#008f6f]">
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                </Link>
              )}
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full pb-20">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
