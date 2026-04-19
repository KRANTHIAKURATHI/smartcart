import { useEffect, useState } from 'react'
import {
  Wrench, Search, ShoppingCart, User, Package, Plus, Minus,
  Trash2, RefreshCw, CheckCircle, AlertCircle, ChevronRight, UserPlus
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProductStore } from '../store/productStore'

export default function StaffPanel() {
  const { products, fetchProducts } = useProductStore()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [addProductId, setAddProductId] = useState('')

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    supabase.from('users').select('*').eq('role', 'USER').then(({ data }) => setUsers(data || []))
  }, [])

  const showMsg = (msg, isError = false) => {
    setActionMsg(isError ? `FAILED: ${msg}` : `SUCCESS: ${msg}`)
    setTimeout(() => setActionMsg(''), 4000)
  }

  const loadUserCart = async (user) => {
    setSelectedUser(user)
    setLoading(true)
    try {
      let { data: cartData } = await supabase
        .from('carts').select('*').eq('user_id', user.id).single()

      if (!cartData) {
        const { data: newCart } = await supabase
          .from('carts').insert({ user_id: user.id }).select().single()
        cartData = newCart
      }

      setCart(cartData)

      const { data: items } = await supabase
        .from('cart_items')
        .select('*, products(id, name, price, image_url, stock, discounts(percentage))')
        .eq('cart_id', cartData.id)

      setCartItems(items || [])
    } catch (err) {
      showMsg('Failed to load cart', true)
    } finally {
      setLoading(false)
    }
  }

  const refreshCart = async () => {
    if (!cart) return
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url, stock, discounts(percentage))')
      .eq('cart_id', cart.id)
    setCartItems(data || [])
  }

  const updateQty = async (itemId, qty) => {
    if (qty < 1) {
      await supabase.from('cart_items').delete().eq('id', itemId)
    } else {
      await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId)
    }
    await refreshCart()
  }

  const removeItem = async (itemId) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    await refreshCart()
    showMsg('Item removed')
  }

  const addToCart = async () => {
    if (!addProductId || !cart) return
    const existing = cartItems.find(i => i.product_id === addProductId)
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: addProductId, quantity: 1 })
    }
    await refreshCart()
    setAddProductId('')
    showMsg('Product added to customer cart')
  }

  const filteredUsers = users.filter(u =>
    !searchEmail || u.email.toLowerCase().includes(searchEmail.toLowerCase())
  )

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.products?.price || 0
    const discount = item.products?.discounts?.[0]?.percentage || 0
    return sum + price * (1 - discount / 100) * item.quantity
  }, 0)

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between border-b border-surface-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-surface-950 uppercase tracking-tighter flex items-center gap-2">
            <Wrench size={24} className="text-brand-500" /> Staff Workstation
          </h1>
          <p className="text-surface-500 text-sm font-medium">Assisted customer terminal for retail floor operations</p>
        </div>
        <button className="px-4 py-2 bg-white border border-surface-200 text-surface-600 rounded-sm font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-surface-50">
           <UserPlus size={14} /> New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Customer Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-surface-200 rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 bg-surface-50 border-b border-surface-100 italic">
               <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Customer Directory</h3>
            </div>
            <div className="p-4">
               <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                 <input
                   type="text"
                   placeholder="Filter by Email..."
                   value={searchEmail}
                   onChange={e => setSearchEmail(e.target.value)}
                   className="w-full bg-surface-50 border border-surface-200 rounded-sm pl-9 pr-3 py-2 text-xs font-bold text-surface-900 outline-none focus:ring-1 focus:ring-brand-500"
                 />
               </div>
            </div>
            <div className="flex flex-col divide-y divide-surface-100 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => loadUserCart(user)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                    selectedUser?.id === user.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'hover:bg-surface-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-sm font-black text-[10px] flex items-center justify-center shrink-0 border ${
                    selectedUser?.id === user.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface-100 text-surface-500 border-surface-200'
                  }`}>
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${selectedUser?.id === user.id ? 'text-brand-700' : 'text-surface-900'}`}>{user.email}</p>
                    <p className="text-[9px] text-surface-400 uppercase font-black">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedUser?.id === user.id && <ChevronRight size={14} className="text-brand-500" />}
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-surface-400 text-xs font-bold uppercase italic">Missing Entries</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {!selectedUser ? (
            <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-sm p-24 flex flex-col items-center justify-center text-center gap-4">
               <div className="w-16 h-16 rounded-full bg-white border border-surface-200 flex items-center justify-center text-surface-300 shadow-sm">
                 <User size={32} />
               </div>
               <div>
                 <p className="text-surface-950 font-black text-lg uppercase tracking-tight">Access Terminal Idle</p>
                 <p className="text-surface-500 text-sm max-w-sm mt-1">Please authenticate a customer account from the directory to begin session management.</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-slide-up">
              {/* Header Info */}
              <div className="bg-white border border-surface-200 rounded-sm p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-black text-xl">
                    {selectedUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-surface-950 leading-none">{selectedUser.email}</h2>
                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-1">Active Customer Session</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={refreshCart} className="p-2.5 bg-white border border-surface-200 text-surface-400 rounded-sm hover:text-brand-500 hover:bg-brand-50 transition-all">
                     <RefreshCw size={16} />
                   </button>
                </div>
              </div>

              {/* Status Message */}
              {actionMsg && (
                <div className={`px-4 py-3 rounded-sm border font-black text-[10px] uppercase tracking-widest animate-fade-in ${
                  actionMsg.startsWith('FAILED') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                }`}>
                  {actionMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Inventory Injection */}
                 <div className="bg-white border border-surface-200 rounded-sm shadow-sm flex flex-col">
                    <div className="p-4 border-b border-surface-100 bg-surface-50">
                       <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                         <Package size={14} /> Global Stock Injection
                       </h3>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                       <div className="flex flex-col gap-2">
                         <label className="text-[9px] font-black text-surface-400 uppercase">Select Catalog Item</label>
                         <select
                           value={addProductId}
                           onChange={e => setAddProductId(e.target.value)}
                           className="w-full bg-surface-50 border border-surface-200 rounded-sm px-3 py-2.5 text-xs font-bold text-surface-900 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                         >
                           <option value="">Catalog lookup...</option>
                           {products.filter(p => p.stock > 0).map(p => (
                             <option key={p.id} value={p.id}>{p.name} [₹{p.price}]</option>
                           ))}
                         </select>
                       </div>
                       <button
                         onClick={addToCart}
                         disabled={!addProductId}
                         className="w-full py-3 bg-brand-500 text-white font-black uppercase text-xs tracking-widest shadow-md hover:bg-brand-600 transition-colors disabled:bg-surface-200"
                       >
                         Inject Asset into Cart
                       </button>
                    </div>
                 </div>

                 {/* Cart Summary */}
                 <div className="bg-surface-950 rounded-sm shadow-xl p-6 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                       <ShoppingCart size={120} />
                    </div>
                    <div className="relative z-10">
                       <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Session Subtotal</p>
                       <h3 className="text-4xl font-black tracking-tighter">₹{cartTotal.toLocaleString()}</h3>
                       <p className="text-surface-400 text-xs mt-2 font-medium">{cartItems.length} verified units in buffer</p>
                    </div>
                    <button className="relative z-10 mt-6 w-full py-3 bg-brand-500 text-white font-black uppercase text-xs tracking-widest shadow-lg hover:bg-brand-400 transition-colors">
                       PROCEED TO SETTLEMENT
                    </button>
                 </div>
              </div>

              {/* Cart Line Items */}
              <div className="bg-white border border-surface-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
                 <div className="p-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                       <ShoppingCart size={14} /> Itemized Buffer Content
                    </h3>
                 </div>
                 {loading ? (
                   <div className="p-24 flex items-center justify-center">
                     <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                   </div>
                 ) : cartItems.length === 0 ? (
                   <div className="p-24 text-center">
                     <p className="text-surface-400 font-bold text-xs uppercase italic">No items identified in current session cart.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-surface-100">
                     {cartItems.map(item => {
                       const price = item.products?.price || 0
                       const discount = item.products?.discounts?.[0]?.percentage || 0
                       const finalPrice = price * (1 - discount / 100)
                       return (
                         <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-surface-50/50 transition-colors group">
                           <div className="w-12 h-12 rounded-sm bg-surface-50 border border-surface-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                             {item.products?.image_url
                               ? <img src={item.products.image_url} alt="" className="w-full h-full object-contain" />
                               : <Package size={20} className="text-surface-200" />
                             }
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-surface-950 text-sm font-black tracking-tight">{item.products?.name}</p>
                             <p className="text-brand-600 text-[10px] font-black uppercase">₹{finalPrice.toLocaleString()} / UNIT</p>
                           </div>
                           <div className="flex items-center gap-1 bg-surface-100 rounded-sm p-1 border border-surface-200">
                             <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 rounded-sm bg-white hover:bg-brand-50 text-surface-600 hover:text-brand-600 flex items-center justify-center transition-all border border-surface-200 shadow-sm">
                               <Minus size={12} />
                             </button>
                             <span className="w-10 text-center text-surface-900 text-sm font-black">{item.quantity}</span>
                             <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded-sm bg-white hover:bg-brand-50 text-surface-600 hover:text-brand-600 flex items-center justify-center transition-all border border-surface-200 shadow-sm">
                               <Plus size={12} />
                             </button>
                           </div>
                           <div className="w-32 text-right">
                             <p className="text-[10px] font-black text-surface-400 uppercase leading-none mb-1">Sum</p>
                             <p className="text-surface-950 text-sm font-black">₹{(finalPrice * item.quantity).toLocaleString()}</p>
                           </div>
                           <button onClick={() => removeItem(item.id)} className="p-2.5 rounded-sm text-surface-300 hover:text-red-600 hover:bg-red-50 transition-all">
                             <Trash2 size={16} />
                           </button>
                         </div>
                       )
                     })}
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
