'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    void getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient()
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    
    // Esperar a que la sesión se establezca en las cookies
    if (!error && data.session) {
      // Pequeña espera para asegurar que las cookies se escriban
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return {
      error,
      /** Código estable de Supabase (p. ej. email_not_confirmed) para mensajes UX */
      errorCode: error?.code ?? null,
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, fullName }),
    })

    const data = (await res.json()) as {
      error?: string
      message?: string
      session?: boolean
      success?: boolean
    }

    if (!res.ok) {
      return {
        error: { message: data.message ?? 'Error al crear la cuenta.' },
        session: null,
        errorCode: data.error ?? null,
      }
    }

    const supabase = createClient()
    if (data.session !== false) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    const { data: sessionData } = await supabase.auth.getSession()

    return {
      error: null,
      session: data.session === false ? null : sessionData.session,
      errorCode: null,
    }
  }, [])

  const signInWithGoogle = useCallback(async (redirectTo = '/cuenta') => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [])

  return { user, loading, signIn, signUp, signInWithGoogle, signOut }
}
