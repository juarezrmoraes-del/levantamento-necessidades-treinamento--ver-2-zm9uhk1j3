import { ChatData, CursoSolicitado, InputType } from '@/types/chat'

export const AREAS = [
  'Linha Agrícola',
  'Normas de Segurança',
  'Movimentação de Carga',
  'Algodoeira',
  'Infraestrutura',
  'Apoio e Gestão',
  'Outra Área',
]
export const COURSES: Record<number, string[]> = {
  1: ['Operação de Tratores', 'Manutenção de Colheitadeiras', 'Pulverizadores', 'Outro'],
  2: ['NR 31', 'NR 33', 'NR 35', 'Outro'],
  3: ['Empilhadeira', 'Pá Carregadeira', 'Outro'],
  4: ['Operação de Prensa', 'Classificação', 'Outro'],
  5: ['Elétrica Básica', 'Solda', 'Outro'],
  6: ['Liderança', 'Gestão de Tempo', 'Outro'],
}
export const HEADCOUNTS = ['1 a 5', '6 a 10', '11 a 20', 'Mais de 20']
export const LOCATIONS = ['LEM (Centro de Treinamento)', 'Rosário', 'Outro (digite o local)']
export const ROIS = [
  'Redução de Custos',
  'Aumento de Produtividade',
  'Adequação à Norma (Segurança)',
  'Inovação/Outro',
]

type MachineResult = {
  nextStep: number
  botMessage: string
  expectedType: InputType
  options?: string[]
  dataUpdate?: Partial<ChatData>
  courseUpdate?: Partial<CursoSolicitado>
  finalizeCourse?: boolean
  error?: string
}

const validateChoice = (input: string, max: number, options?: string[]) => {
  if (options) {
    const idx = options.findIndex((o) => o.toLowerCase() === input.trim().toLowerCase())
    if (idx !== -1) return idx + 1
  }
  const val = parseInt(input.trim())
  return isNaN(val) || val < 1 || val > max ? null : val
}

const err = 'Desculpe, não entendi. Por favor, escolha uma das opções válidas.'

export const handleNextStep = (
  step: number,
  input: string,
  tempCourse: Partial<CursoSolicitado>,
): MachineResult => {
  const text = input.trim()

  switch (step) {
    case 1:
      return {
        nextStep: 2,
        dataUpdate: { dados_solicitante: { nome: text } },
        botMessage: 'Ótimo! Agora, qual é o nome da Fazenda ou Grupo Agrícola?',
        expectedType: 'text',
      }
    case 2:
      return {
        nextStep: 3,
        dataUpdate: { dados_solicitante: { fazenda_grupo: text } },
        botMessage: 'Qual o seu número de WhatsApp? (com DDD)',
        expectedType: 'text',
      }
    case 3:
      return {
        nextStep: 4,
        dataUpdate: { dados_solicitante: { celular: text } },
        botMessage: 'Por favor, informe seu e-mail principal ou corporativo:',
        expectedType: 'text',
      }
    case 4:
      return {
        nextStep: 5,
        dataUpdate: { dados_solicitante: { email: text } },
        botMessage: 'Vamos aos treinamentos. Escolha a Área de Foco:',
        options: AREAS,
        expectedType: 'number',
      }
    case 5: {
      const areaIdx = validateChoice(text, AREAS.length, AREAS)
      if (!areaIdx)
        return { nextStep: 5, botMessage: err, expectedType: 'number', error: err, options: AREAS }
      const area = AREAS[areaIdx - 1]
      if (areaIdx === 7)
        return {
          nextStep: 6.1,
          courseUpdate: { area_foco: area },
          botMessage: 'Digite o nome da área e curso desejado:',
          expectedType: 'text',
        }
      const courses = COURSES[areaIdx]
      return {
        nextStep: 6,
        courseUpdate: { area_foco: area, _tempAreaIdx: areaIdx } as any,
        botMessage: 'Escolha o curso:',
        options: courses,
        expectedType: 'number',
      }
    }
    case 6: {
      const areaIdx = (tempCourse as any)._tempAreaIdx
      const courses = COURSES[areaIdx]
      const courseIdx = validateChoice(text, courses.length, courses)
      if (!courseIdx)
        return {
          nextStep: 6,
          botMessage: err,
          expectedType: 'number',
          error: err,
          options: courses,
        }
      if (courseIdx === courses.length)
        return {
          nextStep: 6.1,
          botMessage: 'Digite o nome do curso desejado:',
          expectedType: 'text',
        }
      return {
        nextStep: 7,
        courseUpdate: { curso_solicitado: courses[courseIdx - 1] },
        botMessage: 'Qual a quantidade estimada de colaboradores?',
        options: HEADCOUNTS,
        expectedType: 'number',
      }
    }
    case 6.1:
      return {
        nextStep: 7,
        courseUpdate: { curso_solicitado: text },
        botMessage: 'Qual a quantidade estimada de colaboradores?',
        options: HEADCOUNTS,
        expectedType: 'number',
      }
    case 7: {
      const qIdx = validateChoice(text, HEADCOUNTS.length, HEADCOUNTS)
      if (!qIdx)
        return {
          nextStep: 7,
          botMessage: err,
          expectedType: 'number',
          error: err,
          options: HEADCOUNTS,
        }
      return {
        nextStep: 8,
        courseUpdate: { quantidade_colaboradores: HEADCOUNTS[qIdx - 1] },
        botMessage: 'Onde será realizado o treinamento?',
        options: LOCATIONS,
        expectedType: 'number',
      }
    }
    case 8: {
      const lIdx = validateChoice(text, LOCATIONS.length, LOCATIONS)
      if (!lIdx)
        return {
          nextStep: 8,
          botMessage: err,
          expectedType: 'number',
          error: err,
          options: LOCATIONS,
        }
      if (lIdx === 3)
        return {
          nextStep: 8.1,
          botMessage: 'Digite o local desejado para o treinamento:',
          expectedType: 'text',
        }
      return {
        nextStep: 9,
        courseUpdate: { local_realizacao: LOCATIONS[lIdx - 1] },
        botMessage: 'Em qual mês ou período (ex: Entressafra) você prefere que ocorra?',
        expectedType: 'text',
      }
    }
    case 8.1:
      return {
        nextStep: 9,
        courseUpdate: { local_realizacao: text },
        botMessage: 'Em qual mês ou período (ex: Entressafra) você prefere que ocorra?',
        expectedType: 'text',
      }
    case 9:
      return {
        nextStep: 10,
        courseUpdate: { mes_previsto: text },
        botMessage: 'Qual o principal desafio ou ROI esperado com este treinamento?',
        options: ROIS,
        expectedType: 'number',
      }
    case 10: {
      const rIdx = validateChoice(text, ROIS.length, ROIS)
      if (!rIdx)
        return { nextStep: 10, botMessage: err, expectedType: 'number', error: err, options: ROIS }
      return {
        nextStep: 11,
        courseUpdate: { desafio_roi: ROIS[rIdx - 1] },
        finalizeCourse: true,
        botMessage: 'Treinamento registrado! Deseja solicitar mais algum curso?',
        options: ['SIM', 'NÃO'],
        expectedType: 'number',
      }
    }
    case 11: {
      const options = ['SIM', 'NÃO']
      const opt = validateChoice(text, 2, options)
      if (!opt)
        return { nextStep: 11, botMessage: err, expectedType: 'number', error: err, options }
      if (opt === 1)
        return {
          nextStep: 5,
          botMessage: 'Vamos lá! Escolha a nova Área de Foco:',
          options: AREAS,
          expectedType: 'number',
        }
      return {
        nextStep: 12,
        botMessage:
          'Quase lá! Para finalizarmos, há alguma sugestão de treinamento focado em futuras adoções de tecnologia na sua fazenda?',
        expectedType: 'text',
      }
    }
    case 12:
      return {
        nextStep: 13,
        dataUpdate: { sugestao_futura: text, status_coleta: 'concluida' },
        botMessage:
          'Levantamento concluído com sucesso! Suas necessidades foram registradas. Obrigado por participar!',
        expectedType: 'text',
      }
    default:
      return { nextStep: 13, botMessage: 'Sessão já foi encerrada.', expectedType: 'text' }
  }
}
