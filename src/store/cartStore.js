import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  loading: false,
  error: null,
  subscription: null,

  fetchCart: async (userId) => {
    if (!userId) return
    set({ loading: true, error: null })
    try {
      // 1. Ensure user exists in public.users table (Sync check)
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User not in public table, insert them (important for social logins/persistence)
        const { data: session } = await supabase.auth.getSession()
        if (session?.session?.user) {
          await supabase.from('users').insert({ 
            id: userId, 
            email: session.session.user.email,
            role: 'USER' 
          })
        }
      }

      // 2. Get or create cart
      let { data: cart, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: userId })
          .select()
          .single()

        if (createError) throw createError
        cart = newCart
      } else if (error) {
        throw error
      }

      set({ cart })
      await get().fetchCartItems(cart.id)
      get().subscribeToCart(cart.id)
    } catch (err) {
      console.error('Fetch cart error:', err)
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchCartItems: async (cartId) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id, name, price, image_url, stock,
            discounts (percentage)
          )
        `)
        .eq('cart_id', cartId)

      if (error) throw error
      set({ items: data || [] })
    } catch (err) {
      set({ error: err.message })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    let { cart, loading } = get()
    
    // If cart is missing and not loading, try one last time to get it
    if (!cart && !loading) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await get().fetchCart(session.user.id)
        cart = get().cart
      }
    }

    if (!cart) {
      set({ error: "Couldn't initialize cart. Please try again." })
      return false
    }

    try {
      const { items } = get()
      const existing = items.find(i => i.product_id === productId)

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ cart_id: cart.id, product_id: productId, quantity })

        if (error) throw error
      }

      await get().fetchCartItems(cart.id)
      return true
    } catch (err) {
      set({ error: err.message })
      return false
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const { cart } = get()
    if (quantity < 1) {
      return get().removeFromCart(itemId)
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)

      if (error) throw error
      await get().fetchCartItems(cart.id)
    } catch (err) {
      set({ error: err.message })
    }
  },

  removeFromCart: async (itemId) => {
    const { cart } = get()
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      await get().fetchCartItems(cart.id)
    } catch (err) {
      set({ error: err.message })
    }
  },

  clearCart: async () => {
    const { cart } = get()
    if (!cart) return
    try {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id)
      set({ items: [] })
    } catch (err) {
      set({ error: err.message })
    }
  },

  subscribeToCart: (cartId) => {
    const { subscription } = get()
    if (subscription) subscription.unsubscribe()

    const sub = supabase
      .channel(`cart:${cartId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `cart_id=eq.${cartId}`
      }, () => {
        get().fetchCartItems(cartId)
      })
      .subscribe()

    set({ subscription: sub })
  },

  unsubscribe: () => {
    const { subscription } = get()
    if (subscription) {
      subscription.unsubscribe()
      set({ subscription: null })
    }
  },

  getTotal: () => {
    const { items } = get()
    return items.reduce((total, item) => {
      const price = item.products?.price || 0
      const discount = item.products?.discounts?.[0]?.percentage || 0
      const discountedPrice = price * (1 - discount / 100)
      return total + discountedPrice * item.quantity
    }, 0)
  },

  getItemCount: () => {
    const { items } = get()
    return items.reduce((count, item) => count + item.quantity, 0)
  },
}))
