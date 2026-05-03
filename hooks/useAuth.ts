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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return {
      error,
      /** Código estable de Supabase (p. ej. email_not_confirmed) para mensajes UX */
      errorCode: error?.code ?? null,
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const supabase = createClient()
    const redirectBase =
      typeof window !== 'undefined' ? window.location.origin : ''
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectBase
          ? `${redirectBase}/api/auth/callback?next=/cuenta`
          : undefined,
      },
    })
    return {
      error,
      session: data.session,
      errorCode: error?.code ?? null,
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
