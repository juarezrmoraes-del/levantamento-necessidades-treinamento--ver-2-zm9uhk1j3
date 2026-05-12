import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type UserRole = 'Administrator' | 'Manager' | 'Viewer'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  department?: string
}

type UsersContextType = {
  users: AdminUser[]
  loading: boolean
  fetchUsers: () => Promise<void>
  addUser: (user: Omit<AdminUser, 'id'>, password?: string) => Promise<boolean>
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('name')
    if (!error && data) {
      setUsers(data as AdminUser[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const addUser = async (user: Omit<AdminUser, 'id'>, password?: string) => {
    const tempSupabase = createClient(
      import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
      import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder',
      { auth: { persistSession: false } },
    )

    const { data, error } = await tempSupabase.auth.signUp({
      email: user.email,
      password: password || '123456',
      options: {
        data: {
          name: user.name,
        },
      },
    })

    if (error || !data.user) {
      console.error('Error signing up user', error)
      return false
    }

    const { error: insertError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      active: user.active,
    })

    if (insertError) {
      console.error('Error inserting profile', insertError)
      return false
    }

    await fetchUsers()
    return true
  }

  const updateUser = async (id: string, updates: Partial<AdminUser>) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
      return true
    }
    return false
  }

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      return true
    }
    return false
  }

  return React.createElement(
    UsersContext.Provider,
    { value: { users, loading, fetchUsers, addUser, updateUser, deleteUser } },
    children,
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) throw new Error('useUsers must be used within UsersProvider')
  return context
}
