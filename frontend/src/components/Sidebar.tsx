import { useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import {
  Building2,
  Home,
  LayoutDashboard,
  Package,
  Heart,
  Wallet,
  Users,
  Tag,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

interface SubItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  exact?: boolean
}

interface NavItem extends SubItem {
  children?: SubItem[]
}

const ADMIN_SUBMENU: SubItem[] = [
  { to: '/admin', label: 'Visão Geral', icon: LayoutDashboard, exact: true },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/categorias', label: 'Categorias', icon: Tag },
  { to: '/admin/carteiras', label: 'Carteiras', icon: Wallet },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/permissoes', label: 'Permissões', icon: ShieldCheck },
]

function isRouteActive(pathname: string, to: string, exact?: boolean) {
  return to === '/' || exact ? pathname === to : pathname.startsWith(to)
}

// Largura final da sidebar expandida (w-64) + espaçamento até o submenu.
// Usar um valor fixo evita que o submenu seja posicionado com base na largura
// ainda em transição (80px → 256px) quando o hover chega antes da animação terminar.
const SIDEBAR_EXPANDED_WIDTH = 256
const SUBMENU_GAP = 8

interface SubmenuState {
  key: string
  top: number
  left: number
  items: SubItem[]
}

export function Sidebar() {
  const { isLojista, isAdmin } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [submenu, setSubmenu] = useState<SubmenuState | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const asideRef = useRef<HTMLElement>(null)
  const location = useLocation()

  const navItems: NavItem[] = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/meus-pedidos', label: 'Meus Pedidos', icon: Package },
    { to: '/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/carteira', label: 'Carteira', icon: Wallet },
    ...(isLojista || isAdmin ? [{ to: '/minha-empresa', label: 'Minha Empresa', icon: Building2 }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: LayoutDashboard, children: ADMIN_SUBMENU }] : []),
  ]

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => setSubmenu(null), 150)
  }

  function openSubmenu(item: NavItem, el: HTMLElement) {
    if (!item.children?.length) return
    cancelClose()
    const top = el.getBoundingClientRect().top
    const asideLeft = asideRef.current?.getBoundingClientRect().left ?? 0
    const left = asideLeft + SIDEBAR_EXPANDED_WIDTH + SUBMENU_GAP
    setSubmenu({ key: item.to, top, left, items: item.children })
  }

  return (
    <aside
      ref={asideRef}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false)
        scheduleClose()
      }}
      className={cn(
        'hidden h-full border-r border-border/70 bg-card/50 p-4 lg:flex lg:flex-col lg:gap-6 transition-all duration-300 overflow-y-auto overflow-x-hidden',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = isRouteActive(location.pathname, item.to)
          const hasChildren = !!item.children?.length
          const isSubmenuOpen = submenu?.key === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              onMouseEnter={e => {
                if (hasChildren) {
                  openSubmenu(item, e.currentTarget)
                } else {
                  scheduleClose()
                }
              }}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || isSubmenuOpen
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title={item.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isExpanded && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
              {isExpanded && hasChildren && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {submenu && createPortal(
        <div
          className="fixed z-60 w-56 rounded-xl border border-border bg-card p-2 shadow-lg"
          style={{ top: submenu.top, left: submenu.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {submenu.items.map(child => {
            const ChildIcon = child.icon
            const childActive = isRouteActive(location.pathname, child.to, child.exact)

            return (
              <Link
                key={child.to}
                to={child.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  childActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <ChildIcon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{child.label}</span>
              </Link>
            )
          })}
        </div>,
        document.body
      )}
    </aside>
  )
}
