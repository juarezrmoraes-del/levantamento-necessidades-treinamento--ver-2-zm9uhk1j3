import { SurveyRecord } from '@/stores/main'

export function getGoogleCalendarLink(s: SurveyRecord) {
  if (!s.data_agendada) return '#'
  const d = new Date(s.data_agendada)
  const start = d.toISOString().replace(/-|:|\.\d\d\d/g, '')
  const end = new Date(d.getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')

  const title = encodeURIComponent(`Treinamento ABAPA: ${s.curso_solicitado}`)
  const details = encodeURIComponent(
    `Área: ${s.area_foco}\nParticipantes: ${s.quantidade_colaboradores}\nSolicitante: ${s.nome} (${s.fazenda_grupo})\nProtocolo: ${s.protocol || s.id}`,
  )
  const location = encodeURIComponent(s.local_realizacao || '')

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
}

export function getOutlookCalendarLink(s: SurveyRecord) {
  if (!s.data_agendada) return '#'
  const d = new Date(s.data_agendada)
  const start = d.toISOString()
  const end = new Date(d.getTime() + 4 * 3600000).toISOString()

  const title = encodeURIComponent(`Treinamento ABAPA: ${s.curso_solicitado}`)
  const details = encodeURIComponent(
    `Área: ${s.area_foco}\nParticipantes: ${s.quantidade_colaboradores}\nSolicitante: ${s.nome} (${s.fazenda_grupo})\nProtocolo: ${s.protocol || s.id}`,
  )
  const location = encodeURIComponent(s.local_realizacao || '')

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${location}`
}
