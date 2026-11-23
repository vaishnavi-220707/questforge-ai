import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(err => {
      console.warn('[AuthContext] Session retrieval error:', err.message)
      setLoading(false)
    })

    // Listen for auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase authentication is unconfigured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live login.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async ({ email, password, fullName }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase authentication is unconfigured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live registration.')
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase authentication is unconfigured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable password recovery.')
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
    return data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
