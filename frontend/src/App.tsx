import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { FavoritosProvider } from '@/context/FavoritosContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { LojaPage } from '@/pages/LojaPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { MyOrdersPage } from '@/pages/MyOrdersPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { WalletPage } from '@/pages/WalletPage'
import { FavoritosPage } from '@/pages/FavoritosPage'
import { ContaPage } from '@/pages/ContaPage'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { EmpresasPage } from '@/pages/admin/EmpresasPage'
import { EmpresaDetailPage } from '@/pages/admin/EmpresaDetailPage'
import { UsuariosPage } from '@/pages/admin/UsuariosPage'
import { UsuarioDetailPage } from '@/pages/admin/UsuarioDetailPage'
import { ProdutosAdminPage } from '@/pages/admin/ProdutosAdminPage'
import { CarteirasPage } from '@/pages/admin/CarteirasPage'
import { PedidosAdminPage } from '@/pages/admin/PedidosAdminPage'
import { PermissoesCargoPage } from '@/pages/admin/PermissoesCargoPage'
import { CategoriasPage } from '@/pages/admin/CategoriasPage'
import { MinhaEmpresaPage } from '@/pages/MinhaEmpresaPage'
import { QueroVenderPage } from '@/pages/QueroVenderPage'

function App() {
  return (
    <AuthProvider>
      <FavoritosProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produto/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loja/:id"
            element={
              <ProtectedRoute>
                <LojaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-pedidos"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedido/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carteira"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoritos"
            element={
              <ProtectedRoute>
                <FavoritosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quero-vender"
            element={
              <ProtectedRoute>
                <QueroVenderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minha-conta"
            element={
              <ProtectedRoute>
                <ContaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minha-empresa"
            element={
              <ProtectedRoute roles={['lojista', 'admin']}>
                <MinhaEmpresaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minha-empresa/:id"
            element={
              <ProtectedRoute roles={['lojista', 'admin']}>
                <MinhaEmpresaPage />
              </ProtectedRoute>
            }
          />
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/empresas"
            element={
              <ProtectedRoute adminOnly>
                <EmpresasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/empresa/:id"
            element={
              <ProtectedRoute adminOnly>
                <EmpresaDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute adminOnly>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios/:id"
            element={
              <ProtectedRoute adminOnly>
                <UsuarioDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <ProtectedRoute adminOnly>
                <ProdutosAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carteiras"
            element={
              <ProtectedRoute adminOnly>
                <CarteirasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pedidos"
            element={
              <ProtectedRoute adminOnly>
                <PedidosAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/permissoes"
            element={
              <ProtectedRoute adminOnly>
                <PermissoesCargoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute adminOnly>
                <CategoriasPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </CartProvider>
      </FavoritosProvider>
    </AuthProvider>
  )
}

export default App
