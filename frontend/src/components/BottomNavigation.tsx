import { useState, type FormEvent } from 'react'
import { Building2, Home, LayoutDashboard, Package, Heart, Wallet, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function BottomNavigation() {
  const { isLojista, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const navItems = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/meus-pedidos', label: 'Pedidos', icon: Package },
    { to: '/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/carteira', label: 'Carteira', icon: Wallet },
    ...(isLojista || isAdmin ? [{ to: '/minha-empresa', label: 'Loja', icon: Building2 }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: LayoutDashboard }] : []),
  ]

  const displayItems = navItems.slice(0, 4)

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/')
    setSearchOpen(false)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/70 bg-background/90 backdrop-blur-xl lg:hidden">
        {displayItems.map(item => {
          const Icon = item.icon
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-3 text-xs font-semibold transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px]">Buscar</span>
        </button>
      </nav>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="gap-0 p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="text-lg font-semibold">Buscar produtos</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="flex items-center gap-2 p-4">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/15">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar produtos..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Buscar
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
