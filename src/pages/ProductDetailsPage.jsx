import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ShoppingCart, Zap, Package, Tag, AlertCircle, Check,
  Star, Shield, RefreshCw, Truck, Heart, Share2, Info
} from 'lucide-react'
import { useProductStore } from '../store/productStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchProductById } = useProductStore()
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buying, setBuying] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchProductById(id)
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  const discount = product?.discounts?.[0]?.percentage || 0
  const originalPrice = product?.price || 0
  const finalPrice = originalPrice * (1 - discount / 100)
  const isOutOfStock = product?.stock === 0

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return
    setAddingToCart(true)
    const success = await addToCart(product.id, quantity)
    setAddingToCart(false)
    
    if (success) {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2500)
    }
  }

  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return
    setBuying(true)
    const success = await addToCart(product.id, quantity)
    if (success) {
      navigate('/cart')
    }
    setBuying(false)
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-sm shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-surface-100 rounded-sm" />
        <div className="flex flex-col gap-6">
          <div className="h-10 bg-surface-100 w-3/4 rounded-sm" />
          <div className="h-6 bg-surface-100 w-1/4 rounded-sm" />
          <div className="h-32 bg-surface-100 w-full rounded-sm" />
          <div className="flex gap-4">
            <div className="h-12 flex-1 bg-surface-100 rounded-sm" />
            <div className="h-12 flex-1 bg-surface-100 rounded-sm" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white p-20 rounded-sm shadow-sm text-center flex flex-col items-center gap-6">
        <AlertCircle size={60} className="text-surface-200" />
        <p className="text-surface-900 text-xl font-medium">Product details could not be found.</p>
        <button onClick={() => navigate('/')} className="px-8 py-2 bg-brand-500 text-white font-bold rounded-sm">
          Go to Homepage
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-12">
      <div className="bg-white rounded-sm shadow-sm flex flex-col md:flex-row p-4 lg:p-12 gap-12 relative">
        {/* Sticky Action Column (Left) */}
        <div className="w-full md:w-[45%] flex flex-col gap-4">
          <div className="relative group aspect-square border border-surface-100 rounded-sm overflow-hidden p-6 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            ) : (
              <Package size={100} className="text-surface-100" />
            )}
            
            <button className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-surface-200 text-surface-300 hover:text-red-500 hover:shadow-md transition-all">
              <Heart size={18} />
            </button>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`flex-1 h-14 flex items-center justify-center gap-2 font-bold text-base transition-all ${
                addedToCart ? 'bg-green-600 text-white' : 'bg-accent-400 text-surface-950 hover:shadow-lg'
              }`}
            >
              <ShoppingCart size={20} />
              {addedToCart ? 'ADDED TO CART' : 'ADD TO CART'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || buying}
              className="flex-1 h-14 bg-accent-500 text-white flex items-center justify-center gap-2 font-bold text-base hover:shadow-lg transition-all"
            >
              <Zap size={20} fill="white" />
              BUY NOW
            </button>
          </div>
        </div>

        {/* Details Column (Right) */}
        <div className="flex-1 flex flex-col gap-4">
          <nav className="flex items-center gap-2 text-xs text-surface-400 font-medium overflow-x-auto whitespace-nowrap pb-2">
            <span>Home</span>
            <span>&gt;</span>
            <span>{product.category}</span>
            <span>&gt;</span>
            <span className="text-surface-900 truncate max-w-[200px]">{product.name}</span>
          </nav>

          <h1 className="text-lg md:text-xl font-medium text-surface-900 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded-sm text-xs font-bold">
              4.5 <Star size={10} fill="white" />
            </div>
            <span className="text-surface-400 text-sm font-semibold">1,208 Ratings & 455 Reviews</span>
            <div className="ml-auto flex items-center gap-1">
               <Zap size={14} className="text-brand-500" fill="currentColor" />
               <span className="text-brand-500 font-bold italic text-sm tracking-tight leading-none">SmartCart <span className="text-accent-400 leading-none">Assured</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <span className="text-green-600 font-bold text-sm">Special price</span>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-surface-950">₹{Math.floor(finalPrice).toLocaleString()}</span>
             {discount > 0 && (
               <>
                 <span className="text-surface-400 text-base line-through">₹{originalPrice.toLocaleString()}</span>
                 <span className="text-green-600 font-bold text-base">{discount}% off</span>
               </>
             )}
             <Info size={16} className="text-surface-300 ml-1 cursor-help" />
          </div>

          <div className="flex flex-col gap-2 py-4">
             <h4 className="text-sm font-bold text-surface-900">Available offers</h4>
             <div className="flex items-start gap-2 text-sm">
                <Tag size={16} className="text-green-600 mt-1 shrink-0" />
                <span><span className="font-bold">Bank Offer</span> 10% instant discount on Cards up to ₹1,000. <span className="text-brand-500 font-bold">T&C</span></span>
             </div>
             <div className="flex items-start gap-2 text-sm">
                <Tag size={16} className="text-green-600 mt-1 shrink-0" />
                <span><span className="font-bold">Partner Offer</span> Sign up for SmartApp Pay and get 5% cashback.</span>
             </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-surface-100 pt-6">
             <div className="flex gap-8 items-start">
                <span className="w-16 text-sm font-bold text-surface-400">Delivery</span>
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2 border-b-2 border-brand-500 pb-1 w-fit">
                      <span className="text-sm font-bold">110001</span>
                      <span className="text-xs text-brand-500 font-bold">Change</span>
                   </div>
                   <span className="text-sm font-bold">Delivery by Tomorrow, Monday | <span className="text-green-600">Free</span></span>
                </div>
             </div>

             <div className="flex gap-8 items-start">
                <span className="w-16 text-sm font-bold text-surface-400">Highlights</span>
                <ul className="text-sm list-disc pl-4 flex flex-col gap-1 text-surface-800">
                    <li>1 Year Warranty</li>
                    <li>Cash on Delivery available</li>
                    <li>10 Days Replacement Policy</li>
                    <li>GST invoice available</li>
                </ul>
             </div>

             <div className="flex gap-8 items-start">
                <span className="w-16 text-sm font-bold text-surface-400">Description</span>
                <p className="text-sm text-surface-700 leading-relaxed">
                   {product.description || "No description provided for this product. High quality items curated for your needs."}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
