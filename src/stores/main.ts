import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import React, { useEffect, ReactNode } from 'react'

export type SurveyStatus =
  | 'Pendente'
  | 'Em Análise'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Programado'
  | 'Concluído'

export interface SurveyRecord {
  id: string
  lead_id: string
  protocol?: string
  nome: string
  email: string
  whatsapp: string
  celular?: string
  funcao?: string
  grupo?: string
  fazenda?: string
  fazenda_grupo: string
  fazenda_nome: string
  curso_solicitado: string
  cursos_list?: string[]
  quantidade_colaboradores: string
  vagas_homens: string
  vagas_mulheres: string
  prioridade: string
  status: string
  data_solicitacao: string
  date: string
  created_at?: string
  area_foco: string
  detalhes_cursos: any
  marcas?: string
  fabricantes?: string
  sistema: string
  cultura?: string
  gargalo?: string
  desafio?: string
  desafio_roi?: string
  setor?: string
  modalidade?: string
  local_realizacao?: string
  infraestrutura?: string
  epoca?: string
  mes_previsto?: string
  inovacao?: string
  sugestao_futura?: string
  localizacao?: string
  tamanho?: string
  data_agendada?: string
  // Dados enriquecidos da fazenda/grupo quando disponíveis
  proprietario?: string
  responsavel?: string
  municipio?: string
  estado?: string
  cpf_cnpj?: string
  inscricao_estadual?: string
  endereco?: string
  telefone?: string
}

interface MainStore {
  surveys: SurveyRecord[]
  loading: boolean
  settings?: any
  fetchSurveys: () => Promise<void>
  updateSurvey: (id: string, updates: Partial<SurveyRecord>) => Promise<void>
  deleteSurvey: (id: string) => Promise<void>
  updateSettings?: (updates: any) => Promise<void>
}

// Mapa em memória de metadados de fazendas por nome/grupo para enriquecer
let fazendasMetaMap: Map<string, any> | null = null

async function getFazendasMetaMap() {
  if (fazendasMetaMap) return fazendasMetaMap
  fazendasMetaMap = new Map()
  try {
    // Carrega TODOS os registros de fazendas paginando em blocos de 1000
    const step = 1000
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('fazendas')
        .select(
          'grupo, fazenda, proprietario, responsavel, municipio, estado, cpf_cnpj, inscricao_estadual, endereco, email, telefone',
        )
        .range(from, from + step - 1)

      if (error || !data || data.length === 0) {
        hasMore = false
      } else {
        data.forEach((f: any) => {
          if (f.fazenda) {
            fazendasMetaMap!.set(f.fazenda.trim().toUpperCase(), f)
          }
          if (f.grupo && !fazendasMetaMap!.has(f.grupo.trim().toUpperCase())) {
            fazendasMetaMap!.set(f.grupo.trim().toUpperCase(), f)
          }
        })
        from += step
        if (data.length < step) hasMore = false
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar metadados de fazendas', e)
  }
  return fazendasMetaMap
}

export const useMainStore = create<MainStore>((set, get) => ({
  surveys: [],
  loading: false,
  settings: {},
  fetchSurveys: async () => {
    set({ loading: true })
    try {
      // Carrega a totalidade de survey_leads paginando em blocos de 1000 até esgotar todos os registros da base
      const fetchAllSurveyLeads = async () => {
        let allLeads: any[] = []
        const step = 1000
        let from = 0
        let hasMore = true

        while (hasMore) {
          const { data, error } = await supabase
            .from('survey_leads')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, from + step - 1)

          if (error) {
            console.error('Erro ao consultar survey_leads:', error)
            throw error
          }

          if (!data || data.length === 0) {
            hasMore = false
          } else {
            allLeads = allLeads.concat(data)
            from += step
            if (data.length < step) {
              hasMore = false
            }
          }
        }

        return allLeads
      }

      const [leadsData, metaMap] = await Promise.all([fetchAllSurveyLeads(), getFazendasMetaMap()])

      const data = leadsData || []

      const formattedSurveys: SurveyRecord[] = []

      data.forEach((row: any) => {
        const cursos = Array.isArray(row.cursos) ? row.cursos : []
        const vagas = row.vagas || {}
        const vagasHomens = row.vagas_homens || {}
        const vagasMulheres = row.vagas_mulheres || {}
        const detalhesCursos = row.detalhes_cursos || {}

        // Enriquecer com dados cadastrais da fazenda/grupo quando existirem
        let meta: any = null
        if (row.fazenda) {
          const firstFaz = row.fazenda.split(',')[0].trim().toUpperCase()
          meta = metaMap.get(firstFaz)
        }
        if (!meta && row.grupo) {
          meta = metaMap.get(row.grupo.trim().toUpperCase())
        }

        const baseRecord: Partial<SurveyRecord> = {
          lead_id: row.id,
          protocol: row.id,
          nome: row.nome || '',
          email: row.email || '',
          whatsapp: row.whatsapp || '',
          celular: row.whatsapp || '',
          funcao: row.funcao || 'Não informada',
          grupo: row.grupo || 'Outros',
          fazenda: row.fazenda || '',
          fazenda_grupo: row.grupo || 'Outros',
          fazenda_nome: row.fazenda || '',
          cursos_list: cursos,
          prioridade: (row.prioridade as string) || 'Média',
          status: row.status || 'Pendente',
          data_solicitacao: row.created_at || new Date().toISOString(),
          date: row.created_at || new Date().toISOString(),
          created_at: row.created_at || new Date().toISOString(),
          area_foco: row.setor || 'Geral',
          setor: row.setor || 'Geral',
          sistema: row.sistema || '',
          cultura: row.cultura || '',
          gargalo: row.gargalo || '',
          desafio: row.desafio || '',
          desafio_roi: row.desafio || '',
          modalidade: row.modalidade || '',
          local_realizacao: row.modalidade || '',
          infraestrutura: row.infraestrutura || '',
          epoca: row.epoca || '',
          mes_previsto: row.epoca || '',
          inovacao: row.inovacao || '',
          localizacao: row.localizacao || meta?.municipio || '',
          tamanho: row.tamanho || '',
          // Metadados enriquecidos
          proprietario: meta?.proprietario || '',
          responsavel: meta?.responsavel || '',
          municipio: row.localizacao || meta?.municipio || '',
          estado: meta?.estado || '',
          cpf_cnpj: meta?.cpf_cnpj || '',
          inscricao_estadual: meta?.inscricao_estadual || '',
          endereco: meta?.endereco || '',
          telefone: meta?.telefone || row.whatsapp || '',
        }

        if (cursos.length > 0) {
          cursos.forEach((curso: string) => {
            const marcasArr = detalhesCursos[curso] || []
            const marcasStr = Array.isArray(marcasArr) ? marcasArr.join(', ') : marcasArr || ''

            formattedSurveys.push({
              ...(baseRecord as SurveyRecord),
              id: `${row.id}-${curso}`,
              curso_solicitado: curso,
              quantidade_colaboradores: String(vagas[curso] ?? '0'),
              vagas_homens: String(vagasHomens[curso] ?? '0'),
              vagas_mulheres: String(vagasMulheres[curso] ?? '0'),
              detalhes_cursos: detalhesCursos,
              marcas: marcasStr,
              fabricantes: marcasStr,
            })
          })
        } else {
          formattedSurveys.push({
            ...(baseRecord as SurveyRecord),
            id: row.id,
            curso_solicitado: 'Não especificado',
            quantidade_colaboradores: '0',
            vagas_homens: '0',
            vagas_mulheres: '0',
            detalhes_cursos: detalhesCursos,
            marcas: '-',
            fabricantes: '-',
          })
        }
      })

      set({ surveys: formattedSurveys, loading: false })
    } catch (err) {
      console.error('Error fetching surveys', err)
      set({ loading: false })
    }
  },
  updateSurvey: async (id: string, updates: Partial<SurveyRecord>) => {
    // Atualiza o estado local imediatamente
    const current = get().surveys
    const updated = current.map((s) => (s.id === id || s.lead_id === id ? { ...s, ...updates } : s))
    set({ surveys: updated })

    // Se temos o lead_id correspondente, atualiza no Supabase
    const target = current.find((s) => s.id === id || s.lead_id === id)
    const leadId = target?.lead_id || id.split('-')[0]

    try {
      const payload: any = {}
      if (updates.status) payload.status = updates.status
      if ((updates as any).funcao) payload.funcao = (updates as any).funcao

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from('survey_leads').update(payload).eq('id', leadId)

        if (error) throw error
      }
    } catch (err) {
      console.error('Erro ao atualizar survey no Supabase:', err)
    }
  },
  deleteSurvey: async (id: string) => {
    const leadId = id.includes('-') && id.length > 36 ? id.split('-')[0] : id
    set((state) => ({
      surveys: state.surveys.filter((s) => s.id !== id && s.lead_id !== leadId),
    }))
  },
  updateSettings: async (updates: any) => {
    set((state) => ({ settings: { ...state.settings, ...updates } }))
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
