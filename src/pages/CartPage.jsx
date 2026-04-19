import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Minus, Plus, Zap, Package,
  CheckCircle, ShoppingBag, ShieldCheck, Truck
} from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import { useAuthStore } from '../store/authStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, loading, removeFromCart, updateQuantity, clearCart, getTotal } = useCartStore()
  const { createOrder, loading: orderLoading } = useOrderStore()
  const { user } = useAuthStore()
  const [checkoutDone, setCheckoutDone] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const total = getTotal()
  const tax = total * 0.18
  const grandTotal = total + tax

  const handleCheckout = async () => {
    if (!user || items.length === 0) return
    const { data, error: orderError } = await createOrder(user.id, items, grandTotal)
    if (!orderError && data) {
      setOrderId(data.id)
      await clearCart()
      setCheckoutDone(true)
    } else if (orderError) {
      alert(`Order failed: ${orderError}`)
    }
  }

  if (checkoutDone) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white p-8 md:p-12 text-center flex flex-col items-center gap-6 max-w-sm w-full shadow-sm rounded-sm animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-surface-950">Grand Success!</h2>
            <p className="text-surface-600 mt-2">
              Your order has been placed successfully. It will reach you shortly.
            </p>
          </div>
          {orderId && (
            <div className="w-full p-4 bg-surface-50 border border-surface-200 rounded-sm">
              <p className="text-xs text-surface-500 font-bold uppercase tracking-widest text-left mb-1">Order Tracking ID</p>
              <p className="text-surface-900 font-mono text-sm text-left truncate">{orderId}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 w-full mt-4">
            <button onClick={() => navigate('/orders')} className="w-full py-3 bg-brand-500 text-white font-bold rounded-sm shadow-sm hover:translate-y-[-1px] transition-all">
              VIEW MY ORDERS
            </button>
            <button onClick={() => navigate('/')} className="w-full py-3 bg-white text-surface-900 font-bold border border-surface-300 rounded-sm hover:bg-surface-50 transition-all">
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 flex flex-col gap-4">
           <div className="h-60 bg-white rounded-sm" />
           <div className="h-60 bg-white rounded-sm" />
        </div>
        <div className="h-80 bg-white rounded-sm" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 md:p-24 shadow-sm text-center flex flex-col items-center gap-6 rounded-sm">
        <div className="relative">
           <div className="w-32 h-32 bg-brand-50 rounded-full flex items-center justify-center text-brand-200">
              <ShoppingCart size={64} />
           </div>
           <div className="absolute -bottom-2 -right-2 bg-accent-500 text-white p-2 rounded-full shadow-lg">
              <Plus size={20} />
           </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-surface-950">Your cart is empty!</h2>
          <p className="text-surface-500 mt-1">Add items to it now.</p>
        </div>
        <button onClick={() => navigate('/')} className="px-10 py-3 bg-brand-500 text-white font-bold shadow-md hover:shadow-xl transition-all rounded-sm uppercase tracking-wide">
          Shop Now
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-fade-in items-start pb-12">
      {/* Items Section */}
      <div className="flex-1 bg-white shadow-sm rounded-sm">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
           <h2 className="text-lg font-bold text-surface-950">My Cart ({items.length})</h2>
           <button onClick={clearCart} className="text-sm font-bold text-red-500 hover:text-red-600">
              EMPTY CART
           </button>
        </div>

        <div className="divide-y divide-surface-50">
          {items.map((item) => {
            const price = item.products?.price || 0
            const discount = item.products?.discounts?.[0]?.percentage || 0
            const finalPrice = price * (1 - discount / 100)
            const lineTotal = finalPrice * item.quantity

            return (
              <div key={item.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-surface-50/50 transition-colors">
                <div className="w-32 h-32 flex-shrink-0 border border-surface-100 p-2 rounded-sm overflow-hidden flex items-center justify-center">
                  {item.products?.image_url ? (
                    <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package size={32} className="text-surface-100" />
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-medium text-surface-900 hover:text-brand-500 cursor-pointer transition-colors line-clamp-2">
                       {item.products?.name}
                    </h3>
                    <p className="text-xs text-surface-500 font-medium bg-surface-50 px-2 py-1 flex items-center gap-1 shrink-0 rounded-sm">
                       <Truck size={12} /> Delivered by Tomorrow
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                     <span className="text-2xl font-bold text-surface-950">₹{Math.floor(lineTotal).toLocaleString()}</span>
                     {discount > 0 && (
                       <>
                         <span className="text-surface-400 line-through text-sm italic">₹{(price * item.quantity).toLocaleString()}</span>
                         <span className="text-green-600 font-bold text-sm">{discount}% Off applied</span>
                       </>
                     )}
                  </div>

                  <div className="flex items-center gap-6 mt-auto pt-6">
                     <div className="flex items-center">
                        <button 
                           onClick={() => updateQuantity(item.id, item.quantity - 1)}
                           className="w-8 h-8 flex items-center justify-center border border-surface-200 rounded-full hover:bg-surface-50 transition-colors text-surface-600"
                        >
                           <Minus size={14} />
                        </button>
                        <input 
                           type="text" 
                           value={item.quantity} 
                           readOnly 
                           className="w-12 text-center text-sm font-bold text-surface-950"
                        />
                        <button 
                           onClick={() => updateQuantity(item.id, item.quantity + 1)}
                           className="w-8 h-8 flex items-center justify-center border border-surface-200 rounded-full hover:bg-surface-50 transition-colors text-surface-600"
                        >
                           <Plus size={14} />
                        </button>
                     </div>

                     <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold text-surface-900 hover:text-brand-500 transition-colors">
                        REMOVE FROM CART
                     </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-white shadow-sm rounded-sm">
           <div className="px-6 py-4 border-b border-surface-50 text-surface-500 font-bold text-sm uppercase tracking-wider">
              Price Details
           </div>
           
           <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between text-surface-900">
                 <span>Price ({items.length} items)</span>
                 <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-surface-900">
                 <span>Platform Fee & Tax</span>
                 <span>₹{Math.floor(tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                 <span>Delivery Charges</span>
                 <span className="uppercase text-sm font-bold">Free</span>
              </div>

              <div className="border-t border-dashed border-surface-200 pt-4 flex justify-between text-xl font-bold text-surface-950">
                 <span>Total Amount</span>
                 <span>₹{Math.floor(grandTotal).toLocaleString()}</span>
              </div>

              <div className="mt-2 text-green-600 font-bold text-sm py-2 px-1 bg-green-50/50 rounded-sm">
                 You will save ₹{Math.floor(total * 0.1).toLocaleString()} on this order!
              </div>

              <button 
                onClick={handleCheckout}
                disabled={orderLoading}
                className="w-full py-4 mt-2 bg-accent-500 text-white font-bold rounded-sm shadow-lg hover:shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>PLACE ORDER</>
                )}
              </button>
           </div>
        </div>

        <div className="flex items-center gap-3 px-2">
           <ShieldCheck size={28} className="text-surface-400" />
           <p className="text-[11px] text-surface-500 font-medium leading-tight">
              Safe and Secure Payments. Easy returns. 100% Authentic products curated for you.
           </p>
        </div>
      </div>
    </div>
  )
}
