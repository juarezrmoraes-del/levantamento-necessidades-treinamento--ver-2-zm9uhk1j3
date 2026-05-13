import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Search,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  CalendarDays,
  CalendarPlus,
  Loader2,
} from 'lucide-react'
import { type SurveyRecord } from '@/stores/main'
import { Badge } from '@/components/ui/badge'
import { getGoogleCalendarLink, getOutlookCalendarLink } from '@/lib/calendar'
import { supabase } from '@/lib/supabase/client'

export default function ConsultaProtocolo() {
  const [search, setSearch] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<SurveyRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const term = search.trim()
    if (!term) return

    setHasSearched(true)
    setLoading(true)
    setError(null)
    setResults([])

    try {
      let foundData: any[] = []
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)

      if (isUUID) {
        // Try RPC first to securely bypass RLS for anonymous users querying their own protocol
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_survey_by_id', {
          search_id: term,
        })

        if (!rpcError && rpcData && rpcData.length > 0) {
          foundData = rpcData
        } else {
          // Fallback to direct select (works for authenticated admins)
          const { data, error: idError } = await supabase
            .from('survey_leads')
            .select('*')
            .eq('id', term)

          if (!idError && data && data.length > 0) {
            foundData = data
          }
        }
      }

      // Try searching by a string column if we still have nothing (e.g. legacy protocols)
      if (foundData.length === 0) {
        const { data: protoData, error: protoError } = await supabase
          .from('survey_leads')
          .select('*')
          .eq('protocol', term)

        if (!protoError && protoData && protoData.length > 0) {
          foundData = protoData
        }
      }

      if (foundData.length > 0) {
        const mappedData = foundData.map((item: any) => ({
          id: item.id,
          protocol: item.protocol || item.id,
          status: item.status || 'Em Análise',
          date: item.created_at || new Date().toISOString(),
          nome: item.nome || 'Não informado',
          curso_solicitado: item.curso_solicitado || item.cursos || 'Treinamento Solicitado',
          area_foco: item.area_foco || item.fazenda || 'Geral',
          quantidade_colaboradores: item.quantidade_colaboradores || item.vagas || 1,
          data_agendada: item.data_agendada || null,
        })) as SurveyRecord[]

        setResults(mappedData)
      } else {
        setError('Protocolo não encontrado. Verifique se o número foi digitado corretamente.')
      }
    } catch (err) {
      console.error('Erro na busca de protocolo:', err)
      setError('Ocorreu um erro ao buscar o protocolo. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Concluído' || status === 'Programado' || status === 'Aprovado')
      return <CheckCircle2 className="w-4 h-4 text-green-600" />
    if (status === 'Em Análise') return <AlertCircle className="w-4 h-4 text-blue-600" />
    return <Clock className="w-4 h-4 text-yellow-600" />
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50/50 p-6 md:p-8 overflow-y-auto no-scrollbar">
      <div className="max-w-[800px] mx-auto w-full space-y-8">
        <div className="text-center space-y-2 mt-4">
          <div className="w-16 h-16 bg-abapa-primary rounded-2xl flex items-center justify-center shadow-md mx-auto mb-4">
            <FileText className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            Consultar Protocolo
          </h1>
          <p className="text-zinc-500 font-medium">
            Acompanhe o status da sua solicitação de treinamento.
          </p>
        </div>

        <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Digite o Número do Protocolo (ex: REQ-2024... ou UUID)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
                className="h-12 text-base bg-zinc-50 border-zinc-200 shadow-none focus-visible:ring-abapa-primary"
              />
              <Button
                type="submit"
                disabled={loading || !search.trim()}
                className="h-12 px-8 bg-abapa-primary hover:bg-abapa-primary/90 text-white shadow-sm font-semibold shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {hasSearched && (
          <div className="space-y-4 animate-fade-in-up">
            {loading ? (
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Loader2 className="w-8 h-8 text-abapa-primary animate-spin mb-4" />
                  <p className="text-lg font-bold text-zinc-900">Buscando protocolo...</p>
                  <p className="text-sm text-zinc-500 mt-1">Isso pode levar alguns segundos.</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-dashed border-2 border-red-200 bg-red-50/50 shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-lg font-bold text-red-900">Erro na Consulta</p>
                  <p className="text-sm text-red-600 mt-2 max-w-sm font-medium">{error}</p>
                </CardContent>
              </Card>
            ) : results.length > 0 ? (
              results.map((r) => (
                <Card key={r.id} className="border-zinc-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-zinc-50/80 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Número de Protocolo
                      </p>
                      <p className="font-mono text-sm sm:text-lg font-bold text-zinc-900 tracking-tight break-all">
                        {r.protocol || r.id}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white px-3 py-1.5 flex items-center gap-2 text-sm shadow-sm border-zinc-200 h-9"
                    >
                      {getStatusIcon(r.status)}
                      <span className="font-semibold text-zinc-700">{r.status}</span>
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                        <CalendarDays className="w-3.5 h-3.5" /> Data da Solicitação
                      </p>
                      <p className="text-[15px] text-zinc-900 font-medium">
                        {new Date(r.date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                        Solicitante
                      </p>
                      <p className="text-[15px] text-zinc-900 font-medium">{r.nome}</p>
                    </div>

                    <div className="sm:col-span-2 mt-2 pt-5 border-t border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                        Treinamento Solicitado
                      </p>
                      <div className="bg-zinc-50/80 p-4 rounded-xl border border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-zinc-900 text-[15px]">
                            {r.curso_solicitado}
                          </p>
                          <p className="text-[13px] text-zinc-500 font-medium mt-1">
                            Área: {r.area_foco}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-zinc-600 shadow-sm whitespace-nowrap">
                            {r.quantidade_colaboradores} colaboradores
                          </div>
                        </div>
                      </div>
                    </div>

                    {r.status === 'Programado' && r.data_agendada && (
                      <div className="sm:col-span-2 mt-2 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" /> Treinamento Agendado
                          </p>
                          <p className="text-[15px] text-zinc-900 font-bold">
                            {new Date(r.data_agendada).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <a
                            href={getGoogleCalendarLink(r)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Google Calendar
                          </a>
                          <a
                            href={getOutlookCalendarLink(r)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Outlook
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
