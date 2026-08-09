import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Package,
  Wallet,
  ShoppingBag,
  LayoutDashboard,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  ArrowLeftFromLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { resolveImageUrl } from '@/api/upload'

const NAV_ITEMS = [
  { to: '/admin', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  // { to: '/minha-empresa', label: 'Minha Empresa', icon: Building2, end: true },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2, end: false },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, end: false },
  { to: '/admin/produtos', label: 'Produtos', icon: Package, end: false },
  { to: '/admin/categorias', label: 'Categorias', icon: Tag, end: false },
  { to: '/admin/carteiras', label: 'Carteiras', icon: Wallet, end: false },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, end: false },
  { to: '/admin/permissoes', label: 'Permissões', icon: ShieldCheck, end: false },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, usuario, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const initials =
    user?.unique_name
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? 'A'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-200',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-14 items-center border-b border-border px-3', collapsed ? 'justify-center' : 'gap-2')}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold truncate">Admin</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 p-2 pt-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center' : 'gap-2.5',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Return to app */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate('/')}
            className={cn(
              'flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-dashed border-border',
              collapsed ? 'justify-center' : 'gap-2.5'
            )}
            title={collapsed ? 'Voltar ao sistema' : undefined}
          >
            <ArrowLeftFromLine className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Voltar ao sistema</span>}
          </button>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={toggleTheme}
            className={cn(
              'flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
              collapsed ? 'justify-center' : 'gap-2.5'
            )}
            title={collapsed ? 'Tema' : undefined}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-2">
              <Avatar className="h-7 w-7 shrink-0">
                {resolveImageUrl(usuario?.foto_url) && (
                  <AvatarImage src={resolveImageUrl(usuario?.foto_url)!} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold">{user?.unique_name?.split(' ')[0]}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors',
              collapsed ? 'justify-center' : 'gap-2.5'
            )}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex h-8 w-full items-center justify-center border-t border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
