import { useState } from 'react'
import { ShoppingCart, Package, Wallet, LogOut, LayoutDashboard, Search, Home, Sun, Moon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CartSheet } from './CartSheet'

export function Navbar() {
  const { user, logout, hasPermission } = useAuth()
  const { totalItems } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleSearch(e: React.FormEvent) {
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

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Row 1 — logo + search + cart + avatar */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight hover:text-primary transition-colors"
          >
            <Package className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">CentralPedidos</span>
          </Link>

          <form onSubmit={handleSearch} className="flex flex-1 items-center overflow-hidden rounded-lg border border-border bg-background">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none"
            />
            <button
              type="submit"
              className="flex h-full items-center gap-1 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'shrink-0 text-muted-foreground hover:text-foreground'
            )}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'relative shrink-0 text-muted-foreground hover:text-foreground'
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[11px] font-bold text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Carrinho</SheetTitle>
              </SheetHeader>
              <CartSheet />
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'shrink-0 gap-2 pl-1 pr-2'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate text-sm md:inline">
                {user?.unique_name?.split(' ')[0]}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
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
              {hasPermission('Empresa.Read') && (
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

      {/* Row 2 — nav links */}
      <div className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="mx-auto flex h-9 max-w-7xl items-center gap-0.5 overflow-x-auto px-4 scrollbar-none">
          <NavLinkItem to="/">
            <Home className="mr-1 h-3 w-3" />
            Início
          </NavLinkItem>
          <NavLinkItem to="/meus-pedidos">Meus Pedidos</NavLinkItem>
          <NavLinkItem to="/carteira">Carteira</NavLinkItem>
          {hasPermission('Empresa.Read') && (
            <NavLinkItem to="/admin">
              <LayoutDashboard className="mr-1 h-3 w-3" />
              Admin
            </NavLinkItem>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLinkItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex shrink-0 items-center rounded px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  )
}
