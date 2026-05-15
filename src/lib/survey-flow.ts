export const MAPA_MAQUINAS = [
  {
    equipamento: 'Tratores de Alta Potência',
    keywords: ['trator'],
    marcas: ['John Deere', 'Case IH', 'Fendt', 'Valtra', 'Massey Ferguson'],
  },
  {
    equipamento: 'Implementos (Grades/Subsoladores)',
    keywords: ['implemento', 'grade', 'subsolador'],
    marcas: ['Horsch', 'Tatú Marchesan', 'Baldan', 'Civemasa'],
  },
  {
    equipamento: 'Plantadeiras de Precisão',
    keywords: ['plantadeira'],
    marcas: ['Horsch', 'John Deere', 'Stara', 'Jacto', 'Planti Center'],
  },
  {
    equipamento: 'Pulverizadores Autopropelidos',
    keywords: ['pulverizador'],
    marcas: ['John Deere', 'Case IH', 'Kuhn', 'Jacto', 'Stara'],
  },
  {
    equipamento: 'Drones de Pulverização',
    keywords: ['drone'],
    marcas: ['DJI', 'XAG', 'XMobots', 'SkyDrones'],
  },
  {
    equipamento: 'Motosserras (Manutenção)',
    keywords: ['motosserra', 'roçadeira'],
    marcas: ['Stihl', 'Husqvarna', 'Echo'],
  },
  {
    equipamento: 'Pivô Central e Gotejamento',
    keywords: ['pivô', 'gotejamento', 'irrigação'],
    marcas: ['Valley', 'Lindsay', 'Netafim', 'Bauer Brasil', 'Focker', 'NaanDanJain'],
  },
  {
    equipamento: 'Colheitadeiras (Pickers)',
    keywords: ['colheitadeira'],
    marcas: ['John Deere', 'Case IH'],
  },
  {
    equipamento: 'Transbordos de Fardos',
    keywords: ['transbordo', 'fardo', 'movimentação'],
    marcas: ['BUSA', 'GTS do Brasil', 'Indutar'],
  },
  {
    equipamento: 'Usinas de Descaroçamento',
    keywords: ['descaroçador', 'usina', 'beneficiamento', 'eletromecânica de descaroçador'],
    marcas: ['Lummus', 'Continental Eagle', 'BUSA', 'Soferagro', 'Agroden'],
  },
  {
    equipamento: 'Caminhões (Rodotrens/Bitrens)',
    keywords: [
      'caminhã',
      'caminhõe',
      'rodotren',
      'bitren',
      'gestão de combustíveis',
      'gestão de pneus',
    ],
    marcas: ['Scania', 'Volvo', 'Mercedes-Benz', 'VW Caminhões', 'Iveco', 'DAF'],
  },
  {
    equipamento: 'Carretas e Implementos Rodoviários',
    keywords: ['carreta', 'rodoviário'],
    marcas: ['Randon', 'Facchini', 'Librelato', 'Guerra'],
  },
  {
    equipamento: 'Softwares e IA',
    keywords: ['software', 'sistema agrícola', 'ia', 'monitoramento'],
    marcas: ['Climate FieldView', 'Trimble', 'Solinftec', 'Agrosmart'],
  },
  {
    equipamento: 'Empilhadeiras e Pás Carregadeiras',
    keywords: ['empilhadeira', 'pá carregadeira'],
    marcas: ['Caterpillar', 'JCB', 'Case', 'Volvo', 'Toyota', 'Hyster', 'Manitou'],
  },
  {
    equipamento: 'Secadores e Silos',
    keywords: ['secador', 'silo', 'armazenagem'],
    marcas: ['Kepler Weber', 'GSI', 'Comil'],
  },
  {
    equipamento: 'Recolhedoras / Trilhadoras (Feijão)',
    keywords: ['recolhedora', 'trilhadora'],
    marcas: ['MIAC', 'Colombo', 'Double Master'],
  },
]

export const getMarcasForCourse = (course: string): string[] => {
  if (course.includes('Objetivo:')) return []
  for (const item of MAPA_MAQUINAS) {
    if (item.keywords.some((k) => course.toLowerCase().includes(k.toLowerCase()))) {
      return item.marcas
    }
  }
  return []
}

export const hasMachineCourse = (cursos: string[] = []) => {
  return cursos.some((c) => getMarcasForCourse(c).length > 0)
}

export const CULTURA_SISTEMA: Record<string, string[]> = {
  Algodão: ['Sequeiro', 'Irrigado/Pivô', 'Adensado'],
  'Soja/Milho': ['Plantio Direto/Sequeiro', 'Irrigado/Pivô', 'Safrinha/Sucessão'],
  Feijão: ['Irrigado/Pivô', 'Sequeiro'],
  'Pecuária/ILP': ['Confinamento', 'Pastagem Extensiva', 'Integração Lavoura-Pecuária'],
}

export const CULTURA_GARGALO: Record<string, string[]> = {
  Algodão: ['Plantio e Tratos', 'Colheita', 'Beneficiamento/Algodoeira', 'Logística'],
  'Soja/Milho': ['Plantio', 'Tratos Culturais', 'Colheita', 'Armazenagem/Silos'],
  Feijão: ['Plantio/Irrigação', 'Arrancamento/Recolhimento', 'Beneficiamento'],
  'Pecuária/ILP': ['Manejo Nutricional/Trato', 'Manejo Sanitário/Bem-estar', 'Maquinário de Apoio'],
}

export const getCursosCategory = (cultura: string, setor: string) => {
  const maquinas = [
    'Tratorista Agrícola Aperfeiçoamento (24h)',
    'Operador de Empilhadeira Aperfeiçoamento (16h)',
    'Operador de Pá Carregadeira (24h)',
    'Implementos (Grades/Subsoladores)',
    'Pulverizadores Autopropelidos',
    'Drones',
    'Motosserras/Roçadeiras',
    'Caminhões/Rodotrens',
    'Gestão de Combustíveis com prática simulada',
    'Gestão de Pneus com prática simulada',
    'Carretas e Implementos Rodoviários',
  ]

  const seguranca = [
    'NR 10 - Segurança em Eletricidade (40h)',
    'NR 12 - Segurança em Máquinas (24h)',
    'NR 23 - Combate a Incêndio (16h)',
    'NR 31.7 - Aplicação de Agrotóxicos (24h)',
    'NR 33 - Espaços Confinados (16h)',
    'NR 35 - Trabalho em Altura (16h)',
  ]

  const gestao = [
    'Liderança Prática (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Reduzir rotatividade e formar equipes de alto desempenho)',
    'Gestão de Custos da Safra (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Controle orçamentário e análise de rentabilidade)',
    'Padronização de Rotinas (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Melhoria contínua e eficiência de processos)',
    'Metas de Safra (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Planejamento estratégico e desdobramento de metas)',
    'Redução de Desperdícios (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Otimização de recursos e sustentabilidade)',
    'Análise de Dados para Gestores (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Tomada de decisão baseada em indicadores)',
    'Certificações e Leis (ESG) (16h) (Pré-requisito mínimo: Ensino Médio) (Objetivo: Adequação ambiental, social e governança)',
  ]

  const informatica = [
    'Pacote Office (Pré-requisito mínimo: Ensino Médio)',
    'Word (Pré-requisito mínimo: Ensino Médio)',
    'Excel (Pré-requisito mínimo: Ensino Médio)',
    'Power BI (Pré-requisito mínimo: Ensino Médio)',
    'Sistemas Agrícolas e Monitoramento (Pré-requisito mínimo: Ensino Médio)',
  ]

  const alimentacao = ['Cozinha Agrícola']

  if (cultura === 'Algodão') {
    maquinas.push(
      'Colheitadeira de Algodão',
      'Eletromecânica de Descaroçador',
      'Movimentação de Fardos',
    )
  } else if (cultura === 'Soja/Milho') {
    maquinas.push(
      'Plantadeiras de Precisão a Vácuo',
      'Colheitadeira de Grãos',
      'Operação de Secadores',
    )
  } else if (cultura === 'Feijão') {
    maquinas.push('Recolhedoras/Trilhadoras', 'Manutenção de Pivô Central')
  } else if (cultura === 'Pecuária/ILP') {
    maquinas.push('Implementos Pecuários (Vagão Forrageiro)')
  }

  return [
    { name: 'Máquinas', options: maquinas },
    { name: 'Gestão', options: gestao },
    { name: 'Informática', options: informatica },
    { name: 'Segurança', options: seguranca },
    { name: 'Área de Alimentação', options: alimentacao },
  ]
}

export const STEPS_CONFIG = [
  {
    id: 'funcao',
    title: 'Qual é a sua função principal?',
    type: 'single',
    options: [
      'Produtor/Proprietário',
      'Gerente/Coordenador',
      'Administrativo/RH',
      'Técnico Seg. Trabalho',
      'Outro',
    ],
  },
  {
    id: 'identificacao',
    title: 'Dados de Contato e Localização',
    type: 'identification',
  },
  {
    id: 'localizacao',
    title: 'Qual é a localização da sua base?',
    type: 'single',
    options: [
      'Luís Eduardo Magalhães',
      'Barreiras',
      'Rosário/Correntina',
      'São Desidério',
      'Formosa do Rio Preto',
      'Outro',
    ],
  },
  {
    id: 'tamanho',
    title: 'Qual é o tamanho da sua operação?',
    type: 'single',
    options: ['Até 1.000 ha', '1.001 a 5.000 ha', '5.001 a 10.000 ha', 'Acima de 10.000 ha'],
  },
  {
    id: 'cultura',
    title: 'Qual a cultura foco do treinamento?',
    type: 'single',
    options: ['Algodão', 'Soja/Milho', 'Feijão', 'Pecuária/ILP'],
  },
  {
    id: 'sistema',
    title: 'Qual é o sistema da cultura?',
    type: 'single',
    dynamicOptions: (d: any) => CULTURA_SISTEMA[d.cultura] || [],
  },
  {
    id: 'gargalo',
    title: 'Qual é o principal gargalo?',
    type: 'single',
    dynamicOptions: (d: any) => CULTURA_GARGALO[d.cultura] || [],
  },
  {
    id: 'desafio',
    title: 'Qual é o desafio estratégico?',
    type: 'single',
    options: [
      'Reduzir quebra de máquinas',
      'Evitar multas/NRs',
      'Aumentar produtividade',
      'Novas tecnologias',
    ],
  },
  {
    id: 'setor',
    title: 'Para qual setor da equipe é o treinamento?',
    type: 'single',
    options: [
      'Linha Agrícola/Irrigação',
      'Agroindústria/Silos',
      'Manutenção/Oficina',
      'Apoio/Rodoviário',
      'Gestão/Liderança/Administrativo',
    ],
  },
  { id: 'cursos', title: 'Quais cursos você precisa?', type: 'multiple-categories' },
  {
    id: 'modalidade',
    title: 'Qual a modalidade preferencial?',
    type: 'single',
    options: ['Presencial (CT)', 'Fazenda/Empresa', 'EAD', 'Híbrido (EAD + Presencial)'],
  },
  {
    id: 'infraestrutura',
    title: 'Como é a infraestrutura local?',
    type: 'single',
    options: ['Sim/Temos sala e internet', 'Parcial/Só espaço ou internet instável', 'Não possui'],
  },
  {
    id: 'epoca',
    title: 'Qual a época ideal para o treinamento?',
    type: 'single',
    options: ['Jan-Mar', 'Abr-Jun', 'Jul-Set', 'Out-Dez'],
  },
  {
    id: 'inovacao',
    title: 'Alguma demanda por nova tecnologia ou inovação não listada?',
    type: 'text',
  },
  {
    id: 'revisao',
    title: 'Resumo do Mapeamento',
    type: 'review',
  },
]

export const getNextStep = (current: number, data: any): number => {
  let next = current + 1
  while (next < STEPS_CONFIG.length) {
    if (
      STEPS_CONFIG[next].id === 'infraestrutura' &&
      !['Fazenda/Empresa', 'EAD', 'Híbrido (EAD + Presencial)'].includes(data.modalidade)
    ) {
      next++
      continue
    }

    if (['localizacao', 'tamanho'].includes(STEPS_CONFIG[next].id)) {
      const hasOutra = (data.fazenda || []).includes('Outra')
      if (!hasOutra) {
        next++
        continue
      }
    }

    break
  }
  return next
}

export const getPrevStep = (current: number, data: any): number => {
  let prev = current - 1
  while (prev >= 0) {
    if (
      STEPS_CONFIG[prev].id === 'infraestrutura' &&
      !['Fazenda/Empresa', 'EAD', 'Híbrido (EAD + Presencial)'].includes(data.modalidade)
    ) {
      prev--
      continue
    }

    if (['localizacao', 'tamanho'].includes(STEPS_CONFIG[prev].id)) {
      const hasOutra = (data.fazenda || []).includes('Outra')
      if (!hasOutra) {
        prev--
        continue
      }
    }

    break
  }
  return prev
}
