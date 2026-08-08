import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { favoritosApi } from '@/api/favoritos'
import { useAuth } from '@/context/AuthContext'

interface FavoritosContextValue {
  favoritoIds: Set<string>
  isFavorito: (produtoId: string) => boolean
  toggle: (produtoId: string) => Promise<void>
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null)

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [favoritoIds, setFavoritoIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoritoIds(new Set())
      return
    }
    favoritosApi.ids().then(ids => setFavoritoIds(new Set(ids))).catch(() => setFavoritoIds(new Set()))
  }, [isAuthenticated])

  const isFavorito = useCallback((produtoId: string) => favoritoIds.has(produtoId), [favoritoIds])

  const toggle = useCallback(async (produtoId: string) => {
    const jaFavoritado = favoritoIds.has(produtoId)

    // Otimista: atualiza a UI antes da resposta do servidor.
    setFavoritoIds(prev => {
      const next = new Set(prev)
      if (jaFavoritado) next.delete(produtoId)
      else next.add(produtoId)
      return next
    })

    try {
      if (jaFavoritado) await favoritosApi.remover(produtoId)
      else await favoritosApi.adicionar(produtoId)
    } catch {
      // Reverte em caso de falha.
      setFavoritoIds(prev => {
        const next = new Set(prev)
        if (jaFavoritado) next.add(produtoId)
        else next.delete(produtoId)
        return next
      })
    }
  }, [favoritoIds])

  return (
    <FavoritosContext.Provider value={{ favoritoIds, isFavorito, toggle }}>
      {children}
    </FavoritosContext.Provider>
  )
}

export function useFavoritos() {
  const ctx = useContext(FavoritosContext)
  if (!ctx) throw new Error('useFavoritos must be used within FavoritosProvider')
  return ctx
}
