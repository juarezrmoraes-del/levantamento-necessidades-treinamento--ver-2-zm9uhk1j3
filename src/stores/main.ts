import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import { supabase } from '@/lib/supabase/client'

export type SurveyStatus =
  | 'Pendente'
  | 'Em Análise'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Programado'
  | 'Concluído'
export type Priority = 'Alta' | 'Média' | 'Baixa'

export type AdminSettings = {
  notification_email: string
  scheduled_report_emails: string
  scheduled_report_active: boolean
}

export type SurveyRecord = {
  id: string
  protocol?: string
  created_at: string
  nome: string
  fazenda_grupo: string
  celular: string
  email: string
  area_foco: string
  curso_solicitado: string
  quantidade_colaboradores: string
  vagas_homens?: string
  vagas_mulheres?: string
  local_realizacao: string
  mes_previsto: string
  desafio_roi: string
  sugestao_futura: string
  notification_sent: boolean
  status: SurveyStatus
  prioridade?: Priority
  data_agendada?: string
}

type MainContextType = {
  surveys: SurveyRecord[]
  settings: AdminSettings
  loading: boolean
  fetchSurveys: () => Promise<void>
  addSurveys: (
    newSurveys: Omit<SurveyRecord, 'id' | 'created_at' | 'notification_sent' | 'status'>[],
  ) => Promise<void>
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<void>
  updateSurvey: (id: string, updates: Partial<SurveyRecord>) => Promise<void>
  deleteSurvey: (id: string) => Promise<void>
}

const MainContext = createContext<MainContextType | undefined>(undefined)

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const [surveys, setSurveys] = useState<SurveyRecord[]>([])
  const [settings, setSettings] = useState<AdminSettings>({
    notification_email: 'treinamentos@abapa.com.br',
    scheduled_report_emails: 'ct9@abapa.com.br, gerente.ct@abapa.com.br',
    scheduled_report_active: true,
  })
  const [loading, setLoading] = useState(true)

  const fetchSurveys = useCallback(async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setSurveys(data as SurveyRecord[])
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single()
    if (!error && data) {
      setSettings(data as AdminSettings)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchSurveys(), fetchSettings()]).finally(() => setLoading(false))

    // Realtime subscription para atualizar o Dashboard instantaneamente
    const subscription = supabase
      .channel('public:surveys')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surveys' }, () => {
        fetchSurveys()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchSurveys, fetchSettings])

  const addSurveys = async (
    newRecords: Omit<SurveyRecord, 'id' | 'created_at' | 'notification_sent' | 'status'>[],
  ) => {
    const recordsToInsert = newRecords.map((rec) => ({
      ...rec,
      status: 'Pendente' as SurveyStatus,
      prioridade: 'Média' as Priority,
      notification_sent: true,
    }))

    const { data, error } = await supabase.from('surveys').insert(recordsToInsert).select()

    if (error) {
      console.error('Erro ao inserir pesquisas:', error)
      throw error
    }

    if (data) {
      setSurveys((prev) => [...(data as SurveyRecord[]), ...prev])
    }
  }

  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 1, ...settings, ...newSettings })
    if (!error) {
      setSettings((prev) => ({ ...prev, ...newSettings }))
    }
  }

  const updateSurvey = async (id: string, updates: Partial<SurveyRecord>) => {
    const { error } = await supabase.from('surveys').update(updates).eq('id', id)
    if (!error) {
      setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    }
  }

  const deleteSurvey = async (id: string) => {
    const { error } = await supabase.from('surveys').delete().eq('id', id)
    if (!error) {
      setSurveys((prev) => prev.filter((s) => s.id !== id))
    }
  }

  return React.createElement(
    MainContext.Provider,
    {
      value: {
        surveys,
        settings,
        loading,
        fetchSurveys,
        addSurveys,
        updateSettings,
        updateSurvey,
        deleteSurvey,
      },
    },
    children,
  )
}

export default function useMainStore() {
  const context = useContext(MainContext)
  if (!context) throw new Error('useMainStore must be used within MainStoreProvider')
  return context
}
