import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, Plus, Pencil, Trash2, Tag,
  TrendingUp, ShoppingBag, Users, DollarSign, AlertTriangle,
  BarChart3, Save, X, Image, RefreshCw, ChevronDown, CheckCircle, ExternalLink
} from 'lucide-react'
import { useProductStore } from '../store/productStore'
import { useOrderStore } from '../store/orderStore'
import { supabase } from '../lib/supabase'
import Modal from '../components/ui/Modal'
import { TableSkeleton } from '../components/ui/Skeletons'

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Beauty', 'Toys']

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'text-brand-600 bg-brand-50 border-brand-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  }
  return (
    <div className="bg-white border border-surface-200 p-5 rounded-sm shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
           <TrendingUp size={12} /> +12.5%
        </div>
      </div>
      <div>
        <p className="text-surface-500 text-xs font-bold uppercase tracking-widest">{label}</p>
        <p className="font-black text-surface-950 text-2xl mt-1 tracking-tight">{value}</p>
        {sub && <p className="text-surface-400 text-[10px] mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  )
}

const defaultForm = { name: '', price: '', category: '', stock: '', image_url: '', description: '' }

export default function AdminDashboard() {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, applyDiscount, removeDiscount, loading } = useProductStore()
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [modalState, setModalState] = useState({ open: false, mode: 'add', product: null })
  const [discountModal, setDiscountModal] = useState({ open: false, product: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null })
  const [form, setForm] = useState(defaultForm)
  const [discountPct, setDiscountPct] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
    supabase.from('users').select('id', { count: 'exact' }).then(({ count }) => setUserCount(count || 0))
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
  const lowStockProducts = products.filter(p => p.stock <= 5)

  const openAdd = () => { setForm(defaultForm); setError(''); setModalState({ open: true, mode: 'add', product: null }) }
  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      image_url: product.image_url || '',
      description: product.description || '',
    })
    setError('')
    setModalState({ open: true, mode: 'edit', product })
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      return setError('Name, price, and category are required')
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      image_url: form.image_url || null,
      description: form.description || null,
    }
    const { error } = modalState.mode === 'add'
      ? await addProduct(payload)
      : await updateProduct(modalState.product.id, payload)

    setSaving(false)
    if (error) return setError(error)
    setModalState({ open: false, mode: 'add', product: null })
  }

  const handleDelete = async () => {
    if (!deleteModal.product) return
    const { error } = await deleteProduct(deleteModal.product.id)
    if (!error) setDeleteModal({ open: false, product: null })
  }

  const handleDiscount = async () => {
    if (!discountModal.product || !discountPct) return
    setSaving(true)
    const pct = parseFloat(discountPct)
    if (pct > 0) {
      await applyDiscount(discountModal.product.id, pct)
    } else {
      await removeDiscount(discountModal.product.id)
    }
    setSaving(false)
    setDiscountModal({ open: false, product: null })
    setDiscountPct('')
  }

  const tabs = [
    { id: 'overview', label: 'Analytics', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Sales Orders', icon: ShoppingBag },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-950 uppercase tracking-tight">Management Console</h1>
          <p className="text-surface-500 text-sm font-medium">Control center for SmartCart retail business</p>
        </div>
        <div className="flex items-center gap-3">
           {activeTab === 'products' && (
             <button onClick={openAdd} className="px-6 py-2.5 bg-brand-500 text-white font-bold rounded-sm shadow-md flex items-center gap-2 uppercase text-xs tracking-wider">
               <Plus size={16} /> New Product
             </button>
           )}
           <button className="p-2.5 bg-white border border-surface-200 text-surface-600 rounded-sm hover:bg-surface-50 transition-colors">
              <RefreshCw size={18} />
           </button>
        </div>
      </div>

      {/* Side-specific Tabs - Styled like an Enterprise App */}
      <div className="flex border-b border-surface-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === id
                ? 'text-brand-500 border-b-2 border-brand-500'
                : 'text-surface-400 hover:text-surface-600'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
            <StatCard icon={DollarSign} label="Gross Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub={`${orders.length} order entries processed`} color="brand" />
            <StatCard icon={Package} label="Total Assets" value={products.length} sub={`${lowStockProducts.length} items requiring replenishment`} color="blue" />
            <StatCard icon={Users} label="Client Base" value={userCount} sub="Verified digital identities" color="purple" />
            <StatCard icon={ShoppingBag} label="Transaction Volume" value={orders.length} sub="Cycle count complete" color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low stock alert box */}
            <div className="lg:col-span-1 bg-white border border-surface-200 rounded-sm overflow-hidden flex flex-col">
               <div className="p-4 border-b border-surface-100 bg-amber-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700">
                     <AlertTriangle size={18} />
                     <h3 className="font-bold text-sm uppercase tracking-tight">Stock Warnings</h3>
                  </div>
                  <span className="text-[10px] font-black bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-sm">{lowStockProducts.length} items</span>
               </div>
               <div className="p-4 flex flex-col gap-4">
                 {lowStockProducts.map(p => (
                   <div key={p.id} className="flex items-center justify-between group">
                     <span className="text-surface-800 text-xs font-bold line-clamp-1">{p.name}</span>
                     <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {p.stock === 0 ? 'X STOCK' : `${p.stock} QTY`}
                        </span>
                        <ChevronDown size={14} className="text-surface-300 group-hover:text-brand-500 cursor-pointer" />
                     </div>
                   </div>
                 ))}
                 {lowStockProducts.length === 0 && <p className="text-xs text-surface-400 italic text-center py-4">Inventory health is at 100%.</p>}
               </div>
            </div>

            {/* Recent Orders Table */}
            <div className="lg:col-span-2 bg-white border border-surface-200 rounded-sm overflow-hidden flex flex-col">
               <div className="p-4 border-b border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-900">
                     <BarChart3 size={18} className="text-brand-500" />
                     <h3 className="font-bold text-sm uppercase tracking-tight">Real-time Order Stream</h3>
                  </div>
                  <button className="text-brand-500 font-bold text-xs hover:underline flex items-center gap-1">
                     VIEW ALL <ExternalLink size={12} />
                  </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-surface-50">
                        <th className="px-4 py-3 text-left text-[10px] font-black text-surface-400 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-surface-400 uppercase">Timeline</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-surface-400 uppercase">Valuation</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-surface-400 uppercase">Fulfillment</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-surface-100">
                     {orders.slice(0, 5).map(order => (
                       <tr key={order.id} className="hover:bg-brand-50/30 transition-colors">
                         <td className="px-4 py-3 font-mono text-[11px] text-surface-900 font-bold">#{order.id.slice(0, 8).toUpperCase()}</td>
                         <td className="px-4 py-3 text-xs text-surface-500">{new Date(order.created_at).toLocaleDateString()}</td>
                         <td className="px-4 py-3 text-xs font-black text-surface-950">₹{Math.floor(order.total_amount).toLocaleString()}</td>
                         <td className="px-4 py-3">
                           <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black border uppercase ${
                             order.status === 'CONFIRMED' ? 'bg-brand-50 text-brand-600 border-brand-100' :
                             order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                             'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>{order.status}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab Content */}
      {activeTab === 'products' && (
        <div className="bg-white border border-surface-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{products.length} master inventory items</span>
            <div className="flex items-center gap-2">
               <input type="text" placeholder="Search SKU..." className="bg-white border border-surface-200 rounded-sm px-3 py-1 text-xs focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
          </div>

          {loading ? <TableSkeleton rows={8} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/50">
                    {['SKU/Product', 'Vertical', 'Standard Price', 'Current Stock', 'Promotion', 'Operations'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-surface-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {products.map(product => {
                    const discount = product.discounts?.[0]?.percentage || 0
                    return (
                      <tr key={product.id} className="hover:bg-brand-50/20 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-surface-50 border border-surface-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                              {product.image_url
                                ? <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                : <Package size={18} className="text-surface-200" />
                              }
                            </div>
                            <div className="flex flex-col">
                               <span className="text-surface-950 font-bold text-sm leading-none mb-1">{product.name}</span>
                               <span className="text-[10px] font-mono text-surface-400 uppercase">ID: {product.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 bg-surface-100 text-surface-600 font-bold text-[10px] rounded-sm uppercase tracking-tighter">{product.category}</span>
                        </td>
                        <td className="px-5 py-4 text-surface-950 font-black">₹{product.price.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`font-black text-sm ${product.stock === 0 ? 'text-red-600 underline' : product.stock <= 5 ? 'text-amber-500' : 'text-brand-600'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {discount > 0
                            ? <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-sm font-black text-[10px] uppercase">{discount}% REDUCED</span>
                            : <span className="text-surface-300 text-[10px] font-black italic">NOMINAL</span>
                          }
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 rounded-sm text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            ><Pencil size={15} /></button>
                            <button
                              onClick={() => { setDiscountPct(discount.toString()); setDiscountModal({ open: true, product }) }}
                              className="p-2 rounded-sm text-surface-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            ><Tag size={15} /></button>
                            <button
                              onClick={() => setDeleteModal({ open: true, product })}
                              className="p-2 rounded-sm text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            ><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-surface-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-surface-50 border-b border-surface-100">
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{orders.length} transaction logs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  {['Transaction ID', 'Posted', 'Units', 'Valuation', 'Lifecycle State', 'Update Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-surface-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="px-5 py-4 text-surface-950 font-mono font-bold text-xs uppercase">#{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-surface-500 text-xs font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-surface-800 font-bold">{order.order_items?.length || 0} ITEMS</td>
                    <td className="px-5 py-4 text-brand-600 font-black">₹{Math.floor(order.total_amount).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-black uppercase tracking-tight ${
                        order.status === 'CONFIRMED' ? 'bg-brand-50 text-brand-600 border-brand-100' :
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        className="bg-white border border-surface-200 rounded-sm px-2 py-1.5 text-surface-900 text-xs font-bold uppercase focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
                      >
                        {['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-24 text-surface-400 font-bold text-sm uppercase italic">No transaction data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals - Standard Layout */}
      <Modal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, mode: 'add', product: null })}
        title={modalState.mode === 'add' ? 'INITIALIZE NEW STOCK ENTRY' : 'UPDATE PRODUCT DEFINITION'}
        size="md"
      >
        <div className="flex flex-col gap-5 p-2">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">PRODUCT LABEL</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="High Performance Laptop..." className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">UNIT VALUATION (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">STOCK QUANTITY</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">VERTICAL SECTOR</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer">
                <option value="">Choose vertical...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">ASSET IMAGE URL</label>
              <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">DETAILED DESCRIPTION</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Functional requirements and features..." className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-medium focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase text-center">{error}</div>}

          <div className="flex gap-4 pt-2">
            <button onClick={() => setModalState({ open: false, mode: 'add', product: null })} className="flex-1 py-3 bg-white border border-surface-300 text-surface-600 font-black uppercase text-xs tracking-widest hover:bg-surface-50">ABORT</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-brand-500 text-white font-black uppercase text-xs tracking-widest shadow-md">
              {saving ? 'PROCESSING...' : 'COMMIT CHANGES'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal
        isOpen={discountModal.open}
        onClose={() => { setDiscountModal({ open: false, product: null }); setDiscountPct('') }}
        title="PROMOTIONAL OVERRIDE"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <p className="text-surface-600 text-xs font-medium">
            Applying markdown to <span className="text-surface-950 font-black">"{discountModal.product?.name}"</span>
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">RECOUP PERCENTAGE (MAX 90%)</label>
            <div className="relative">
              <input type="number" value={discountPct} onChange={e => setDiscountPct(e.target.value)} placeholder="0" className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-sm text-surface-900 font-black focus:ring-2 focus:ring-brand-500 outline-none" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-surface-400">%</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setDiscountModal({ open: false, product: null }); setDiscountPct('') }} className="flex-1 py-3 text-surface-400 font-black text-[10px] uppercase hover:text-surface-900">CANCEL</button>
            <button onClick={handleDiscount} disabled={saving} className="flex-2 py-3 bg-brand-500 text-white font-black uppercase text-xs tracking-widest">
              {saving ? 'EXECUTING...' : 'APPLY STICKER'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        title="ASSET DE-REGISTRATION"
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <p className="text-surface-600 text-sm leading-relaxed">
            Are you sure you want to permanently remove <span className="text-surface-950 font-black italic">"{deleteModal.product?.name}"</span> from the global inventory?
          </p>
          <div className="flex gap-4">
            <button onClick={() => setDeleteModal({ open: false, product: null })} className="flex-1 py-3 bg-white border border-surface-200 text-surface-400 font-black text-[10px] uppercase">CANCEL</button>
            <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-xs tracking-widest shadow-lg">DESTROY</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
