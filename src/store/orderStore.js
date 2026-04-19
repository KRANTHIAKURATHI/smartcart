import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  subscription: null,

  fetchOrders: async (userId) => {
    set({ loading: true, error: null })
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (id, name, image_url, price)
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      set({ orders: data || [] })
      get().subscribeToOrders(userId)
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  createOrder: async (userId, cartItems, totalAmount) => {
    set({ loading: true, error: null })
    try {
      // Simulate payment
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: 'CONFIRMED',
          payment_status: 'PAID',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map(item => {
        const price = item.products?.price || 0
        const discount = item.products?.discounts?.[0]?.percentage || 0
        const finalPrice = price * (1 - discount / 100)
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: finalPrice,
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Decrement stock for each product
      for (const item of cartItems) {
        const product = item.products
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity)
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)

          await supabase.from('inventory_logs').insert({
            product_id: item.product_id,
            change: -item.quantity,
            note: `Order ${order.id}`
          })
        }
      }

      await get().fetchOrders(userId)
      return { data: order, error: null }
    } catch (err) {
      set({ error: err.message })
      return { data: null, error: err.message }
    } finally {
      set({ loading: false })
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
      await get().fetchOrders()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  },

  subscribeToOrders: (userId) => {
    const { subscription } = get()
    if (subscription) subscription.unsubscribe()

    let filter = userId ? `user_id=eq.${userId}` : undefined

    const sub = supabase
      .channel('orders_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        ...(filter && { filter })
      }, () => {
        get().fetchOrders(userId)
      })
      .subscribe()

    set({ subscription: sub })
  },
}))
