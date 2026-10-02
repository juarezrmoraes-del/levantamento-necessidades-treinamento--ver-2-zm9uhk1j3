import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase'

export type AuditLog = {
  id: string
  timestamp: string
  user_name: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string
  details: string
}

type AuditContextType = {
  logs: AuditLog[]
  loading: boolean
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>
  fetchLogs: () => Promise<void>
}

const AuditContext = createContext<AuditContextType | undefined>(undefined)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    let allLogs: AuditLog[] = []
    let from = 0
    const step = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(from, from + step - 1)

      if (error || !data || data.length === 0) {
        hasMore = false
      } else {
        allLogs = allLogs.concat(data as AuditLog[])
        from += step
        if (data.length < step) hasMore = false
      }
    }

    setLogs(allLogs)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const addLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase.from('audit_logs').insert(log).select()
    if (!error && data) {
      setLogs((prev) => [...(data as AuditLog[]), ...prev])
    }
  }

  return React.createElement(
    AuditContext.Provider,
    { value: { logs, loading, addLog, fetchLogs } },
    children,
  )
}

export function useAuditStore() {
  const context = useContext(AuditContext)
  if (!context) throw new Error('useAuditStore must be used within AuditProvider')
  return context
}
