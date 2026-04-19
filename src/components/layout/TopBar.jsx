import { Search, ShoppingCart, User, Bell, LogOut, Package as Box, Zap } from 'lucide-react'
import { useProductStore } from '../../store/productStore'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function TopBar() {
  const navigate = useNavigate()
  const { searchQuery, setSearch } = useProductStore()
  const { items } = useCartStore()
  const { profile, signOut } = useAuthStore()
  const location = useLocation()
  
  const isShop = location.pathname === '/' || location.pathname.startsWith('/product/')
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-surface-200 flex items-center px-4 lg:px-12 gap-12">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
        <div className="w-9 h-9 rounded-sm bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
           <Zap size={20} className="text-white" fill="currentColor" />
        </div>
        <div className="flex flex-col">
           <h1 className="font-black text-xl italic tracking-tighter leading-none text-surface-950">SmartCart</h1>
           <span className="text-[9px] italic text-brand-500 font-black uppercase tracking-tighter ml-0.5">Premium Experience</span>
        </div>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search for premium products..."
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 bg-surface-50 text-surface-900 px-5 pr-12 rounded-sm text-sm border border-surface-200 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all placeholder:text-surface-400 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-brand-500 rounded-sm text-white shadow-sm cursor-pointer hover:bg-brand-600 transition-colors">
            <Search size={14} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <nav className="flex items-center gap-8 font-bold text-sm">
        {profile ? (
          <div className="relative group">
            <div className="flex items-center gap-2 cursor-pointer h-16 text-surface-700 hover:text-brand-500 transition-colors">
              <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center border border-surface-200">
                <User size={18} className="text-surface-500" />
              </div>
              <span className="hidden lg:inline">{profile.email.split('@')[0]}</span>
            </div>
            
            {/* Dropdown */}
            <div className="absolute top-full right-0 w-64 bg-white shadow-2xl border border-surface-100 hidden group-hover:block animate-slide-up py-2 rounded-sm mt-[-4px]">
              <div className="px-5 py-4 border-b border-surface-50">
                <p className="text-surface-400 text-[10px] uppercase font-black tracking-widest mb-1">Authenticated Account</p>
                <p className="text-surface-950 font-bold truncate">{profile.email}</p>
              </div>
              
              <Link to="/orders" className="flex items-center gap-3 px-5 py-3 hover:bg-surface-50 text-surface-800 transition-colors">
                <Box size={18} className="text-brand-500" />
                <span className="font-bold">My Orders</span>
              </Link>
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 border-t border-surface-50 transition-colors"
              >
                <LogOut size={18} />
                <span className="font-bold text-left flex-1">Logout Account</span>
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/auth')} className="btn-primary">
            Login
          </button>
        )}

        <Link to="/cart" className="flex items-center gap-2 text-surface-700 hover:text-brand-500 transition-colors group relative">
          <div className="relative">
            <ShoppingCart size={22} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-accent-500 text-white text-[9px] w-5 h-5 rounded-sm flex items-center justify-center font-black border-2 border-white shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-bold uppercase tracking-wider text-xs">Cart</span>
        </Link>
      </nav>
    </header>
  )
}
