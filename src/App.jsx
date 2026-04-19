import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import AppLayout from './components/layout/AppLayout'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import AdminDashboard from './pages/AdminDashboard'
import StaffPanel from './pages/StaffPanel'
import LoadingScreen from './components/ui/LoadingScreen'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { initialize, user } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { subscribeToInventory } = useProductStore()

  useEffect(() => {
    initialize()
    subscribeToInventory()
  }, [])

  useEffect(() => {
    if (user) fetchCart(user.id)
  }, [user?.id])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          <PublicRoute><AuthPage /></PublicRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <StaffPanel />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
