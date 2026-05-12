export type DadosSolicitante = {
  nome: string
  fazenda_grupo: string
  celular: string
  email: string
}

export type CursoSolicitado = {
  area_foco: string
  curso_solicitado: string
  quantidade_colaboradores: string
  local_realizacao: string
  mes_previsto: string
  desafio_roi: string
}

export type ChatData = {
  status_coleta: 'em_andamento' | 'concluida'
  dados_solicitante: Partial<DadosSolicitante>
  cursos_solicitados: CursoSolicitado[]
  sugestao_futura: string
}

export type Message = {
  id: string
  text: string
  sender: 'bot' | 'user'
  timestamp?: string
  options?: string[]
}

export type InputType = 'text' | 'number'
