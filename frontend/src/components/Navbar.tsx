import { useState, type FormEvent, type ReactNode } from 'react'
import { Building2, Heart, Home, LayoutDashboard, LogOut, Moon, Package, Search, ShoppingCart, Sun, Wallet } from 'lucide-react'
import { Building2, Home, LayoutDashboard, LogOut, Moon, Package, Search, Settings, ShoppingCart, Sun, Wallet } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { resolveImageUrl } from '@/api/upload'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CartSheet } from './CartSheet'

export function Navbar() {
  const { user, usuario, logout, isLojista, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/')
  }

  const initials =
    user?.unique_name
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? 'U'

  const navItems = [
    { to: '/', label: 'Início', icon: <Home className="h-3.5 w-3.5" /> },
    { to: '/meus-pedidos', label: 'Meus Pedidos', icon: <Package className="h-3.5 w-3.5" /> },
    { to: '/favoritos', label: 'Favoritos', icon: <Heart className="h-3.5 w-3.5" /> },
    { to: '/carteira', label: 'Carteira', icon: <Wallet className="h-3.5 w-3.5" /> },
    ...(isLojista || isAdmin
      ? [{ to: '/minha-empresa', label: 'Minha Loja', icon: <Building2 className="h-3.5 w-3.5" /> }]
      : []),
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin', icon: <LayoutDashboard className="h-3.5 w-3.5" /> }]
      : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 shadow-sm shadow-foreground/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 rounded-xl px-1 py-1 transition-colors hover:text-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Package className="h-5 w-5" />
            </span>
            <span className="hidden text-lg font-black tracking-tight sm:inline">Fluxus</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-xl border border-border bg-card/70 p-1 lg:flex">
            {navItems.map(item => (
              <NavLinkItem
                key={item.to}
                to={item.to}
                active={isActiveRoute(location.pathname, item.to)}
              >
                {item.icon}
                {item.label}
              </NavLinkItem>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/15 lg:max-w-md xl:max-w-xl"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              title="Buscar"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={toggleTheme}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'h-10 w-10 rounded-xl bg-card text-muted-foreground hover:text-foreground'
              )}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Sheet>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'icon' }),
                  'relative h-10 w-10 rounded-xl bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle className="text-lg font-semibold">Carrinho</SheetTitle>
                </SheetHeader>
                <CartSheet />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-10 shrink-0 rounded-xl bg-card pl-1.5 pr-2.5'
                )}
              >
                <Avatar className="h-7 w-7">
                  {resolveImageUrl(usuario?.foto_url) && (
                    <AvatarImage src={resolveImageUrl(usuario?.foto_url)!} />
                  )}
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm font-medium md:inline">
                  {user?.unique_name?.split(' ')[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold">{user?.unique_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/meus-pedidos')} className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4" />
                  Meus Pedidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/carteira')} className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  Minha Carteira
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/minha-conta')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Minha Conta
                </DropdownMenuItem>
                {(isLojista || isAdmin) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/minha-empresa')} className="cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      Minha Loja
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Painel Admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="mt-3 flex gap-1 overflow-x-auto lg:hidden">
          {navItems.map(item => (
            <NavLinkItem
              key={item.to}
              to={item.to}
              active={isActiveRoute(location.pathname, item.to)}
            >
              {item.icon}
              {item.label}
            </NavLinkItem>
          ))}
        </nav>
      </div>
    </header>
  )
}

function isActiveRoute(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

function NavLinkItem({
  to,
  active,
  children,
}: {
  to: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {children}
    </Link>
  )
}
