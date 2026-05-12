import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  FileText,
  Users as UsersIcon,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Home,
  LogIn,
} from 'lucide-react'
import abapaLogo from '@/assets/abapa-7ed0c.jpeg'
import { useAuth } from '@/stores/auth'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const isAdmin = user?.role === 'Administrator'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = [
    { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Respostas', href: '/dashboard/respostas', icon: FileText, show: true },
    { name: 'Usuários', href: '/dashboard/usuarios', icon: UsersIcon, show: isAdmin },
    { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3, show: true },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: SettingsIcon, show: isAdmin },
  ]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6 border-b bg-white">
        <Link
          to="/dashboard"
          className="flex justify-center hover:opacity-90 transition-opacity block"
        >
          <img src={abapaLogo} alt="ABAPA - LNT" className="h-14 w-auto object-contain" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2 px-2">
              {navigation
                .filter((item) => item.show)
                .map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                        className={
                          isActive
                            ? 'bg-[#00a884]/10 text-[#00a884] font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        }
                      >
                        <Link to={item.href} className="px-3 py-2.5 flex items-center">
                          <item.icon className="h-5 w-5 mr-3 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t bg-slate-50 space-y-2">
        <SidebarMenu className="flex flex-col gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Voltar ao Formulário"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Link to="/" className="flex items-center">
                <Home className="h-5 w-5 mr-3 shrink-0" />
                <span>Início (Chat)</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAuthenticated ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Sair do Sistema"
                className="text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-3 shrink-0" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Acesso Administrativo"
                className="text-slate-500 hover:bg-[#00a884]/10 hover:text-[#00a884] flex items-center"
              >
                <Link to="/login" className="flex items-center">
                  <LogIn className="h-5 w-5 mr-3 shrink-0" />
                  <span>Acesso Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
