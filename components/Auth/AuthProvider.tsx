'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from 'lib/supabase'
import type { AuthContextType, LoginCredentials, RegisterCredentials, User } from 'types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If Supabase is not configured, just set loading to false
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          user_type: session.user.user_metadata?.user_type || 'student',
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at
        }
        setUser(userData)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            user_type: session.user.user_metadata?.user_type || 'student',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          }
          setUser(userData)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured || !supabase) {
        // Development mode - simulate successful login
        const mockUser: User = {
          id: 'dev-user-123',
          email: credentials.email,
          user_type: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(mockUser)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true)
      setError(null)

      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (!isSupabaseConfigured || !supabase) {
        // Development mode - simulate successful registration
        const mockUser: User = {
          id: 'dev-user-' + Date.now(),
          email: credentials.email,
          user_type: credentials.userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(mockUser)
        return
      }

      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            user_type: credentials.userType
          }
        }
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured || !supabase) {
        // Development mode - simply clear user
        setUser(null)
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
