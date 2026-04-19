import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        if (error.message.includes('refresh_token')) {
          await supabase.auth.signOut()
        }
        throw error
      }

      if (session) {
        set({ session, user: session.user })
        await get().fetchProfile(session.user.id)
      }
    } catch (err) {
      console.warn('Auth initialization warning:', err.message)
      set({ session: null, user: null, profile: null })
    } finally {
      set({ loading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth Event:', event)
      if (session) {
        set({ session, user: session.user })
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null, profile: null, session: null })
      }
    })
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      set({ profile: data })
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  },

  signUp: async (email, password, role = 'USER') => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      })
      if (error) throw error

      // Insert into users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({ id: data.user.id, email, role })

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (err) {
      set({ error: err.message })
      return { data: null, error: err.message }
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      set({ error: err.message })
      return { data: null, error: err.message }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  isAdmin: () => get().profile?.role === 'ADMIN',
  isStaff: () => get().profile?.role === 'STAFF' || get().profile?.role === 'ADMIN',
}))
