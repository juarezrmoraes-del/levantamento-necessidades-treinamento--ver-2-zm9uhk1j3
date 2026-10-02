export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((value) => {
          const strVal = String(value ?? '').replace(/"/g, '""')
          return `"${strVal}"`
        })
        .join(','),
    )
    .join('\n')

  const csv = `${headers}\n${rows}`
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function formatSurveysForCSV(surveys: any[]): Record<string, any>[] {
  return surveys.map((s: any) => ({
    Protocolo: s.protocol || s.id,
    'Data de Inscrição':
      s.created_at || s.date ? new Date(s.created_at || s.date).toLocaleDateString('pt-BR') : '-',
    Colaborador: s.nome || '-',
    Função: s.funcao || 'Não informada',
    Email: s.email || '-',
    'WhatsApp / Celular': s.whatsapp || s.celular || '-',
    'Grupo / Associado': s.grupo || s.fazenda_grupo || '-',
    'Fazenda(s)': s.fazenda || s.fazenda_nome || '-',
    Proprietário: s.proprietario || '-',
    Responsável: s.responsavel || '-',
    Município: s.municipio || s.localizacao || '-',
    Estado: s.estado || '-',
    'Tamanho Operação': s.tamanho || '-',
    Cultura: s.cultura || '-',
    Sistema: s.sistema || '-',
    Gargalo: s.gargalo || '-',
    'Desafio Estratégico': s.desafio_roi || s.desafio || '-',
    'Setor / Área de Foco': s.area_foco || s.setor || '-',
    'Treinamento Requerido': s.curso_solicitado || '-',
    Marcas: s.marcas || '-',
    'Vagas Totais': s.quantidade_colaboradores || '0',
    'Vagas Homens': s.vagas_homens || '0',
    'Vagas Mulheres': s.vagas_mulheres || '0',
    Modalidade: s.modalidade || s.local_realizacao || '-',
    'Época Ideal': s.epoca || s.mes_previsto || '-',
    Infraestrutura: s.infraestrutura || '-',
    Inovação: s.inovacao || '-',
    Prioridade: s.prioridade || 'Média',
    Status: s.status || 'Pendente',
  }))
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  let table =
    '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1"><tr>'
  headers.forEach((h) => (table += `<th style="background-color: #f3f4f6;">${h}</th>`))
  table += '</tr>'

  data.forEach((row) => {
    table += '<tr>'
    Object.values(row).forEach(
      (v) => (table += `<td>${v !== null && v !== undefined ? v : ''}</td>`),
    )
    table += '</tr>'
  })
  table += '</table></body></html>'

  const blob = new Blob([table], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
