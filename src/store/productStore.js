import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  selectedCategory: 'All',
  searchQuery: '',
  loading: false,
  error: null,
  subscription: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          discounts (percentage)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const products = data || []
      const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]

      set({ products, categories })
    } catch (err) {
      console.error('Fetch error:', err)
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchProductById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, discounts(percentage)`)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      return null
    }
  },

  setCategory: (category) => set({ selectedCategory: category }),
  setSearch: (query) => set({ searchQuery: query }),

  getFiltered: () => {
    const { products, selectedCategory, searchQuery } = get()
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  },

  // Admin functions
  addProduct: async (product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      await get().fetchProducts()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Log inventory change if stock changed
      if (updates.stock !== undefined) {
        await supabase.from('inventory_logs').insert({
          product_id: id,
          change: updates.stock,
          note: 'Admin update'
        })
      }

      await get().fetchProducts()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      await get().fetchProducts()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  },

  applyDiscount: async (productId, percentage) => {
    try {
      // Upsert discount
      const { error } = await supabase
        .from('discounts')
        .upsert({ product_id: productId, percentage }, { onConflict: 'product_id' })

      if (error) throw error
      await get().fetchProducts()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  },

  removeDiscount: async (productId) => {
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('product_id', productId)

      if (error) throw error
      await get().fetchProducts()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  },

  subscribeToInventory: () => {
    const { subscription } = get()
    if (subscription) subscription.unsubscribe()

    const sub = supabase
      .channel('products_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        get().fetchProducts()
      })
      .subscribe()

    set({ subscription: sub })
  },
}))
