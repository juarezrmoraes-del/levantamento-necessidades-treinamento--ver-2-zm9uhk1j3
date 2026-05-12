import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { AdminUser, UserRole } from './users'
import { toast } from '@/hooks/use-toast'

type AuthContextType = {
  user: AdminUser | null
  session: Session | null
  isAuthenticated: boolean
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionUser, setSessionUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AdminUser | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSessionUser(session?.user ?? null)
      setLoadingAuth(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSessionUser(session?.user ?? null)
      setLoadingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let mounted = true
    if (sessionUser) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single()
        .then(({ data, error }) => {
          if (!mounted) return
          if (data && !error) {
            if (!data.active) {
              toast({
                title: 'Acesso Negado',
                description: 'Sua conta está desativada.',
                variant: 'destructive',
              })
              supabase.auth.signOut()
              setProfile(null)
            } else {
              setProfile({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as UserRole,
                active: data.active,
                department: data.department,
              })
            }
          } else {
            // Defesa: Caso o perfil não exista no banco, tentamos inferir permissões com base no e-mail
            // para que administradores conhecidos não fiquem bloqueados se a migration falhar
            const isKnownAdmin =
              sessionUser.email === 'admin@abapa.com.br' ||
              sessionUser.email === 'juarez.rmoraes@gmail.com'
            setProfile({
              id: sessionUser.id,
              name: sessionUser.user_metadata?.name || 'Usuário',
              email: sessionUser.email || '',
              role: isKnownAdmin ? 'Administrator' : 'Viewer',
              active: true,
            })
          }
        })
    } else {
      setProfile(null)
    }
    return () => {
      mounted = false
    }
  }, [sessionUser])

  const login = async (email: string, password?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '123456',
      })
      if (error) throw error
      return true
    } catch (error: any) {
      toast({
        title: 'Erro de Autenticação',
        description:
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : 'Falha ao conectar.',
        variant: 'destructive',
      })
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // O sistema está carregando se a auth básica ainda está sendo verificada
  // ou se já temos o usuário da auth mas o perfil completo ainda não chegou
  const loading = loadingAuth || (!!sessionUser && profile?.id !== sessionUser.id)
  const isAuthenticated = !!profile

  return React.createElement(
    AuthContext.Provider,
    { value: { user: profile, session, isAuthenticated, login, logout, loading } },
    children,
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
