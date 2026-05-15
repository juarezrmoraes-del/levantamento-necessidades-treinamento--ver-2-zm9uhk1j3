import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import React, { useEffect, ReactNode } from 'react'

export interface SurveyRecord {
  id: string
  nome: string
  email: string
  whatsapp: string
  fazenda_grupo: string
  fazenda_nome: string
  curso_solicitado: string
  quantidade_colaboradores: string
  vagas_homens: string
  vagas_mulheres: string
  prioridade: string
  status: string
  data_solicitacao: string
  area_foco: string
  detalhes_cursos: any
  sistema: string
  date: string
}

interface MainStore {
  surveys: SurveyRecord[]
  loading: boolean
  fetchSurveys: () => Promise<void>
}

export const useMainStore = create<MainStore>((set) => ({
  surveys: [],
  loading: false,
  fetchSurveys: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('survey_leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedSurveys: SurveyRecord[] = []

      data.forEach((row: any) => {
        const cursos = row.cursos || []
        const vagas = row.vagas || {}
        const vagasHomens = row.vagas_homens || {}
        const vagasMulheres = row.vagas_mulheres || {}
        const marcas = row.detalhes_cursos || {}

        if (cursos.length > 0) {
          cursos.forEach((curso: string) => {
            formattedSurveys.push({
              id: `${row.id}-${curso}`,
              nome: row.nome || '',
              email: row.email || '',
              whatsapp: row.whatsapp || '',
              fazenda_grupo: row.grupo || 'Outros',
              fazenda_nome: row.fazenda || '',
              curso_solicitado: curso,
              quantidade_colaboradores: vagas[curso] || '0',
              vagas_homens: vagasHomens[curso] || '0',
              vagas_mulheres: vagasMulheres[curso] || '0',
              prioridade: 'Média',
              status: row.status || 'Pendente',
              data_solicitacao: row.created_at || new Date().toISOString(),
              date: row.created_at || new Date().toISOString(),
              area_foco: row.setor || 'Geral',
              detalhes_cursos: { marca: marcas[curso]?.[0] || '' },
              sistema: row.sistema || '',
            })
          })
        } else {
          formattedSurveys.push({
            id: row.id,
            nome: row.nome || '',
            email: row.email || '',
            whatsapp: row.whatsapp || '',
            fazenda_grupo: row.grupo || 'Outros',
            fazenda_nome: row.fazenda || '',
            curso_solicitado: 'Não especificado',
            quantidade_colaboradores: '0',
            vagas_homens: '0',
            vagas_mulheres: '0',
            prioridade: 'Média',
            status: row.status || 'Pendente',
            data_solicitacao: row.created_at || new Date().toISOString(),
            date: row.created_at || new Date().toISOString(),
            area_foco: row.setor || 'Geral',
            detalhes_cursos: {},
            sistema: row.sistema || '',
          })
        }
      })

      set({ surveys: formattedSurveys, loading: false })
    } catch (err) {
      console.error('Error fetching surveys', err)
      set({ loading: false })
    }
  },
}))

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const fetchSurveys = useMainStore((state) => state.fetchSurveys)

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  return React.createElement(React.Fragment, null, children)
}

export default useMainStore
