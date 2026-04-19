import { useEffect, useState } from 'react'
import {
  Package, Clock, CheckCircle, Truck, XCircle, ChevronDown,
  ChevronUp, ShoppingBag, ReceiptText, MapPin
} from 'lucide-react'
import { useOrderStore } from '../store/orderStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { OrderCardSkeleton } from '../components/ui/Skeletons'

const statusConfig = {
  PENDING:   { icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50   border-amber-200',   label: 'Processing' },
  CONFIRMED: { icon: CheckCircle,  color: 'text-brand-600',  bg: 'bg-brand-50   border-brand-200',   label: 'Confirmed' },
  SHIPPED:   { icon: Truck,        color: 'text-blue-600',   bg: 'bg-blue-50    border-blue-200',    label: 'Shipped' },
  DELIVERED: { icon: Package,      color: 'text-green-600',  bg: 'bg-green-50   border-green-200',   label: 'Delivered' },
  CANCELLED: { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50     border-red-200',     label: 'Cancelled' },
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="bg-white border border-surface-200 shadow-sm rounded-sm overflow-hidden animate-slide-up hover:border-brand-300 transition-all">
      {/* Header */}
      <div
        className="p-5 flex items-center gap-4 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 rounded-full bg-surface-50 flex items-center justify-center shrink-0 border border-surface-100">
          <ReceiptText size={20} className="text-surface-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-surface-900 font-bold text-sm tracking-tight">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase flex items-center gap-1 shrink-0 ${status.bg} ${status.color}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>
          <p className="text-surface-500 text-xs mt-1 font-medium">{date}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-surface-950 font-black text-base">
            ₹{Math.floor(order.total_amount).toLocaleString()}
          </p>
          <p className="text-surface-400 text-xs font-bold uppercase tracking-widest mt-0.5">
            {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button className="text-surface-300 hover:text-brand-500 transition-colors ml-4 bg-surface-50 p-1 rounded-sm">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Items */}
      {expanded && order.order_items?.length > 0 && (
        <div className="border-t border-surface-100 bg-surface-50/30">
          <div className="px-6 py-4">
             <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-brand-500" />
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Delivery Details</span>
             </div>
             
             <div className="flex flex-col gap-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-3 border border-surface-100 rounded-sm">
                  <div className="w-14 h-14 rounded-sm bg-surface-50 overflow-hidden shrink-0 border border-surface-100 p-1 flex items-center justify-center">
                    {item.products?.image_url ? (
                      <img src={item.products.image_url} alt={item.products?.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={20} className="text-surface-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-900 font-bold text-sm truncate">{item.products?.name || 'Product'}</p>
                    <p className="text-surface-500 text-xs font-medium">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-surface-950 text-sm font-bold shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
             </div>
          </div>

          <div className="px-6 py-4 border-t border-surface-100 flex justify-between items-center bg-white">
            <div className="flex flex-col">
               <span className="text-surface-500 text-xs font-medium">Payment status</span>
               <span className="text-green-600 font-bold text-xs uppercase tracking-tighter">Paid via Credit/Debit Card</span>
            </div>
            <div className="text-right">
               <span className="text-surface-500 text-xs font-medium italic mr-2">Incl. all taxes</span>
               <span className="text-brand-600 font-black text-lg">₹{Math.floor(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { orders, fetchOrders, loading } = useOrderStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) fetchOrders(user.id)
  }, [user?.id])

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-950 tracking-tight uppercase">My Orders</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-surface-500 text-sm font-medium">Track and more information on your past purchases.</p>
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-green-700 font-bold uppercase">Live tracking enabled</span>
             </div>
          </div>
        </div>
        {orders.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-surface-200 rounded-sm">
             <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Total Orders</span>
             <span className="text-surface-900 font-black text-base">{orders.length}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-24 text-center flex flex-col items-center gap-6 rounded-sm shadow-sm border border-surface-100">
          <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center text-brand-200">
            <ShoppingBag size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-surface-900">No orders yet</h2>
            <p className="text-surface-500 text-sm mt-1 max-w-xs mx-auto font-medium">Looks like you haven't made any purchases. Explore our collection and start shopping!</p>
          </div>
          <button onClick={() => navigate('/')} className="px-10 py-3 bg-brand-500 text-white font-bold rounded-sm shadow-md uppercase tracking-wider">
             Discover Products
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-stagger">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
