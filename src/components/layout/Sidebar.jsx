import { NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, ShoppingCart, Package, LayoutDashboard,
  LogOut, Users, Zap, Tag, ChevronRight, Wrench
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useProductStore } from '../../store/productStore'

export default function Sidebar() {
  const navigate = useNavigate()
  const { profile, signOut, isAdmin, isStaff } = useAuthStore()
  const { getItemCount } = useCartStore()
  const { categories, selectedCategory, setCategory } = useProductStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const cartCount = getItemCount()

  return (
    <aside className="w-64 h-full bg-white border-r border-surface-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-brand-500 flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-black text-surface-950 text-base leading-none tracking-tight">SmartCart</h1>
            <p className="text-surface-400 text-[10px] mt-0.5 font-bold uppercase tracking-widest">v2.0 PRO</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-3 py-4 border-b border-surface-100 bg-surface-50/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-sm bg-white border border-surface-200 flex items-center justify-center text-brand-600 font-black text-sm shadow-sm ring-2 ring-brand-50">
            {profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface-950 text-xs font-black truncate leading-none">{profile?.email?.split('@')[0]}</p>
            <div className="mt-1.5">
              <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-tighter ${
                profile?.role === 'ADMIN'
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-surface-200 text-surface-700 border-surface-300'
              }`}>
                {profile?.role || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-8 custom-scrollbar">
        {/* Navigation */}
        <div>
          <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Navigation</p>
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `sidebar-link rounded-sm ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <ShoppingBag size={18} />
              <span className="font-bold">Shop</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) => `sidebar-link rounded-sm ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <Package size={18} />
              <span className="font-bold">My Orders</span>
            </NavLink>

            {isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-link rounded-sm ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span className="font-bold">Admin Dashboard</span>
              </NavLink>
            )}

            {isStaff() && (
              <NavLink
                to="/staff"
                className={({ isActive }) => `sidebar-link rounded-sm ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <Wrench size={18} />
                <span className="font-bold">Staff Panel</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Categories */}
        <div>
          <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Categories</p>
          <div className="flex flex-col gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); navigate('/') }}
                className={`sidebar-link rounded-sm justify-between ${selectedCategory === cat ? 'sidebar-link-active' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span className="font-bold">{cat}</span>
                </div>
                {selectedCategory === cat && <ChevronRight size={14} className="animate-pulse" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-surface-100 p-4 bg-surface-50/30 flex flex-col gap-2">
        <NavLink
          to="/cart"
          className={({ isActive }) => `sidebar-link rounded-sm justify-between ${isActive ? 'sidebar-link-active' : ''}`}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} />
            <span className="font-bold">Cart</span>
          </div>
          {cartCount > 0 && (
            <span className="bg-brand-500 text-white text-[10px] font-black rounded-sm px-1.5 py-0.5 min-w-[20px] text-center shadow-sm">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </NavLink>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 hover:text-red-700 transition-all rounded-sm uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
