import { useEffect } from 'react'
import { Package, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'
import { useProductStore } from '../store/productStore'
import { useAuthStore } from '../store/authStore'
import ProductCard from '../components/ui/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeletons'

export default function HomePage() {
  const { products, fetchProducts, loading, error, getFiltered, selectedCategory, categories, setCategory } = useProductStore()
  const { profile } = useAuthStore()

  useEffect(() => {
    if (products.length === 0) fetchProducts()
  }, [])

  const filtered = getFiltered()

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Retail Hero Banner */}
      <div className="bg-white shadow-sm rounded-sm p-6 md:p-10 border border-surface-100 relative overflow-hidden group">
         <div className="absolute right-0 top-0 w-1/3 h-full bg-brand-50/50 clip-path-hero hidden md:block" />
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
               <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tighter">New Arrivals</span>
               <div className="flex items-center gap-1 text-brand-600">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wide">Summer Collection 2026</span>
               </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-surface-950 leading-tight">
               Exclusive Deals on <span className="text-brand-500">Premium Tech</span> & Lifestyle.
            </h1>
            
            <p className="text-surface-600 mt-4 text-sm md:text-base max-w-lg leading-relaxed">
               Up to <span className="text-green-600 font-bold">40% Off</span> on top brands. Shop our curated collection of electronics, fashion, and home essentials.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
               <button className="px-8 py-3 bg-brand-500 text-white font-bold rounded-sm shadow-md hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2">
                  SHOP NOW <ChevronRight size={18} />
               </button>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest leading-none">Users Choice</span>
                  <span className="text-surface-900 font-bold">4.8/5 Star Rated Store</span>
               </div>
            </div>
         </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white shadow-sm border-b border-surface-100 flex items-center gap-2 p-2 px-1 overflow-x-auto no-scrollbar rounded-sm">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-sm text-sm font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-brand-500 text-white border-brand-600'
                : 'bg-white text-surface-700 border-surface-200 hover:border-brand-500 hover:text-brand-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between px-1">
         <div>
            <h2 className="text-xl font-bold text-surface-950 flex items-center gap-2 uppercase tracking-tight">
               {selectedCategory === 'All' ? 'Our Best Sellers' : `${selectedCategory} Products`}
            </h2>
            <p className="text-xs text-surface-500 font-medium italic">Handpicked collections just for you</p>
         </div>
         <div className="hidden md:flex items-center gap-1 text-brand-500 text-sm font-bold cursor-pointer group">
            SEE ALL <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
         </div>
      </div>

      {/* Product Grid */}
      {error ? (
        <div className="bg-white p-12 text-center rounded-sm shadow-sm border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Package size={32} />
          </div>
          <p className="text-surface-900 font-bold">{error}</p>
          <button onClick={fetchProducts} className="btn-primary mt-6 px-10">Retry Connection</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-24 text-center flex flex-col items-center gap-4 rounded-sm shadow-sm">
          <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center text-surface-300">
            <Package size={42} />
          </div>
          <div>
            <p className="text-surface-950 text-xl font-bold italic">Oops! No items found.</p>
            <p className="text-surface-500 text-sm mt-1">Try exploring another category.</p>
          </div>
          <button onClick={() => setCategory('All')} className="px-8 py-2 bg-brand-500 text-white font-bold rounded-sm shadow-md mt-4">Browse All Stores</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-stagger">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

