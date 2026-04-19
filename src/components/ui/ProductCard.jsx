import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, StarHalf, Package, Zap } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const discount = product.discounts?.[0]?.percentage || 0
  const originalPrice = product.price
  const finalPrice = originalPrice * (1 - discount / 100)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (isOutOfStock || adding) return
    setAdding(true)
    const success = await addToCart(product.id)
    setAdding(false)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border border-surface-200 rounded-sm hover:shadow-card-hover cursor-pointer group flex flex-col transition-all duration-300 animate-slide-up"
    >
      {/* Image Area */}
      <div className="relative p-2 aspect-[4/5] bg-white flex items-center justify-center overflow-hidden border-b border-surface-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Package size={40} className="text-surface-200" />
        )}

        {/* Wishlist toggle would go here */}
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-medium text-surface-900 text-sm leading-snug mb-1 line-clamp-2 hover:text-brand-500 transition-colors">
          {product.name}
        </h3>

        {/* Ratings placeholder */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold">
            4.2 <Star size={8} fill="white" />
          </div>
          <span className="text-surface-400 text-[11px] font-medium">(2,143)</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <Zap size={14} className="text-brand-500" fill="currentColor" />
          </div>
        </div>

        {/* Price Area */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-surface-950 text-base">₹{Math.floor(finalPrice).toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-surface-400 text-xs line-through">₹{originalPrice.toFixed(0)}</span>
                <span className="text-green-600 text-xs font-bold">{discount}% off</span>
              </>
            )}
          </div>
          
          <div className="mt-2 flex items-center justify-between gap-2">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
            ) : (
              <span className="text-[10px] font-bold text-green-600 uppercase">In Stock</span>
            )}
            
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`h-8 px-4 border rounded-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                added 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : isOutOfStock
                  ? 'bg-surface-50 border-surface-200 text-surface-300 cursor-not-allowed'
                  : 'border-surface-200 hover:border-brand-500 hover:text-brand-500 text-surface-700 font-medium'
              }`}
            >
              <ShoppingCart size={14} />
              <span className="text-[11px] font-bold uppercase tracking-tight">
                {added ? 'Added' : 'Add'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
