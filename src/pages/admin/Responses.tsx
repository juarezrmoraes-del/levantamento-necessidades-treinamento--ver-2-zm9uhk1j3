import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Search,
  Download,
  Trash2,
  Lock,
  LogIn,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react'
import useMainStore, { SurveyStatus } from '@/stores/main'
import { useAuth } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { exportToCSV, formatSurveysForCSV } from '@/lib/export'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function Responses() {
  const mainStore = useMainStore() as any
  const { surveys, updateSurvey } = mainStore
  const { addLog } = useAuditStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('Todas')
  const [funcaoFilter, setFuncaoFilter] = useState('Todas')

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Role-Based Access Control logic
  const isViewer = !user || user.role === 'Viewer'
  const isAdmin = user?.role === 'Administrator'
  const canEdit = !!user && !isViewer
  const canDelete = isAdmin

  const availableFuncoes = useMemo(() => {
    const funcoes = new Set<string>()
    ;(surveys || []).forEach((s: any) => {
      if (s.funcao) funcoes.add(s.funcao)
    })
    return Array.from(funcoes).sort()
  }, [surveys])

  const filteredSurveys = useMemo(() => {
    return (surveys || [])
      .filter((s: any) => !deletedIds.has(s.id))
      .filter((s: any) => {
        const term = searchTerm.toLowerCase()
        const matchSearch =
          !term ||
          s.nome?.toLowerCase().includes(term) ||
          s.funcao?.toLowerCase().includes(term) ||
          s.fazenda_grupo?.toLowerCase().includes(term) ||
          s.grupo?.toLowerCase().includes(term) ||
          s.fazenda?.toLowerCase().includes(term) ||
          s.curso_solicitado?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term)
        const matchPriority = priorityFilter === 'Todas' || s.prioridade === priorityFilter
        const matchFuncao = funcaoFilter === 'Todas' || s.funcao === funcaoFilter
        return matchSearch && matchPriority && matchFuncao
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      )
  }, [surveys, searchTerm, priorityFilter, funcaoFilter, deletedIds])

  const handleExport = () => {
    const exportData = formatSurveysForCSV(filteredSurveys)
    exportToCSV(
      exportData,
      `necessidades_treinamento_${new Date().toISOString().split('T')[0]}.csv`,
    )
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!canEdit) return
    await updateSurvey(id, { status: newStatus as SurveyStatus })
    await addLog({
      user_name: user?.name || '',
      user_email: user?.email || '',
      action: 'UPDATE',
      entity_type: 'SURVEY',
      entity_id: id,
      details: `Alterou status da solicitação para ${newStatus}`,
    })
    toast({ title: 'Status Atualizado' })
  }

  const handlePriorityChange = async (id: string, newPriority: string) => {
    if (!canEdit) return
    await updateSurvey(id, { prioridade: newPriority as any })
    await addLog({
      user_name: user?.name || '',
      user_email: user?.email || '',
      action: 'UPDATE',
      entity_type: 'SURVEY',
      entity_id: id,
      details: `Alterou prioridade da solicitação para ${newPriority}`,
    })
    toast({ title: 'Prioridade Atualizada' })
  }

  const handleDeleteClick = (id: string) => {
    if (!canDelete) return
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId || !canDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('survey_leads').delete().eq('id', deleteId)
      if (error) throw error

      setDeletedIds((prev) => {
        const next = new Set(prev)
        next.add(deleteId)
        return next
      })

      if (typeof mainStore.deleteSurvey === 'function') {
        try {
          await mainStore.deleteSurvey(deleteId)
        } catch (e) {
          console.warn('Erro ao chamar deleteSurvey:', e)
        }
      } else if (typeof mainStore.fetchSurveys === 'function') {
        try {
          mainStore.fetchSurveys()
        } catch (e) {
          console.warn('Erro ao chamar fetchSurveys:', e)
        }
      }

      try {
        await addLog({
          user_name: user?.name || '',
          user_email: user?.email || '',
          action: 'DELETE',
          entity_type: 'SURVEY',
          entity_id: deleteId,
          details: `Removeu solicitação de treinamento`,
        })
      } catch (logErr) {
        console.warn('Erro ao salvar log de auditoria', logErr)
      }

      toast({ title: 'Registro excluído com sucesso!' })
    } catch (error: any) {
      console.error('Erro ao deletar:', error)
      toast({
        title: 'Erro ao remover solicitação',
        description: error?.message || 'Falha na comunicação com o banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Respostas Recebidas</h1>
          <p className="text-slate-500">
            {!user
              ? 'Visualize as solicitações de treinamento. Faça login para editar.'
              : 'Gerencie e analise todas as solicitações de treinamento da equipe.'}
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="bg-white hover:bg-slate-50">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {!user && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm">
          <div className="flex items-center gap-3 flex-1">
            <Lock className="w-4 h-4 shrink-0" />
            <p>
              Você está visualizando no modo público. Apenas usuários logados podem modificar ou
              excluir registros.
            </p>
          </div>
          <Link to="/login" className="w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </Link>
        </div>
      )}

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por colaborador, função ou grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as Prioridades</SelectItem>
                  <SelectItem value="Alta">Alta Prioridade</SelectItem>
                  <SelectItem value="Média">Média Prioridade</SelectItem>
                  <SelectItem value="Baixa">Baixa Prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={funcaoFilter} onValueChange={setFuncaoFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filtrar Função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as Funções</SelectItem>
                  {availableFuncoes.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[36px]"></TableHead>
                <TableHead className="font-semibold text-slate-700 w-[16%]">Colaborador</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[15%]">Função</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[15%]">
                  Departamento / Grupo
                </TableHead>
                <TableHead className="font-semibold text-slate-700 w-[18%]">
                  Treinamento Necessário
                </TableHead>
                <TableHead className="font-semibold text-slate-700 w-[11%]">Vagas</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Prioridade</TableHead>
                <TableHead className="font-semibold text-slate-700">Data</TableHead>
                {canDelete && <TableHead className="w-[44px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.length > 0 ? (
                filteredSurveys.map((req: any) => {
                  const isExpanded = expandedRows.has(req.id)
                  return (
                    <React.Fragment key={req.id}>
                      <TableRow
                        onClick={() => toggleRow(req.id)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <TableCell className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-slate-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRow(req.id)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          <div>{req.nome}</div>
                          {req.email && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {req.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="font-medium text-xs bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <Briefcase className="w-3 h-3 mr-1 shrink-0 text-emerald-600" />
                            {req.funcao || 'Não informada'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="font-medium">{req.fazenda_grupo}</div>
                          {req.fazenda && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {req.fazenda}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          <div className="font-medium">{req.curso_solicitado}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{req.area_foco}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="font-medium">
                            {req.quantidade_colaboradores || '0'} totais
                          </div>
                          <div className="text-xs text-slate-500">
                            {req.vagas_homens || '0'} H / {req.vagas_mulheres || '0'} M
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            disabled={!canEdit}
                            value={req.status}
                            onValueChange={(v) => handleStatusChange(req.id, v)}
                          >
                            <SelectTrigger
                              className={`h-8 text-xs w-[125px] font-semibold border-0 ${
                                req.status === 'Aprovado'
                                  ? 'bg-green-100 text-green-800'
                                  : req.status === 'Pendente'
                                    ? 'bg-amber-100 text-amber-800'
                                    : req.status === 'Em Análise'
                                      ? 'bg-blue-100 text-blue-800'
                                      : req.status === 'Rejeitado'
                                        ? 'bg-rose-100 text-rose-800'
                                        : req.status === 'Programado'
                                          ? 'bg-indigo-100 text-indigo-800'
                                          : 'bg-slate-100 text-slate-800'
                              } ${!canEdit && 'opacity-100 cursor-default'}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            {canEdit && (
                              <SelectContent>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Em Análise">Em Análise</SelectItem>
                                <SelectItem value="Aprovado">Aprovado</SelectItem>
                                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                                <SelectItem value="Programado">Programado</SelectItem>
                                <SelectItem value="Concluído">Concluído</SelectItem>
                              </SelectContent>
                            )}
                          </Select>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            disabled={!canEdit}
                            value={req.prioridade || 'Média'}
                            onValueChange={(v) => handlePriorityChange(req.id, v)}
                          >
                            <SelectTrigger
                              className={`h-8 text-xs w-[95px] border-0 font-medium ${
                                req.prioridade === 'Alta'
                                  ? 'bg-rose-50 text-rose-700'
                                  : req.prioridade === 'Média'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-blue-50 text-blue-700'
                              } ${!canEdit && 'opacity-100 cursor-default'}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            {canEdit && (
                              <SelectContent>
                                <SelectItem value="Alta">Alta</SelectItem>
                                <SelectItem value="Média">Média</SelectItem>
                                <SelectItem value="Baixa">Baixa</SelectItem>
                              </SelectContent>
                            )}
                          </Select>
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">
                          {new Date(req.created_at || req.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        {canDelete && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(req.id)}
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Linha expansível com todas as informações completas */}
                      {isExpanded && (
                        <TableRow className="bg-slate-50/80 border-b border-slate-200">
                          <TableCell colSpan={canDelete ? 10 : 9} className="p-4 sm:p-5">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Informações Detalhadas
                                  </span>
                                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                    Protocolo: {req.protocol || req.id}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  Registrado em:{' '}
                                  {new Date(req.created_at || req.date).toLocaleString('pt-BR')}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                                {/* Solicitante & Função */}
                                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2">
                                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Solicitante & Contato
                                  </h4>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      Nome Completo
                                    </span>
                                    <span className="font-semibold text-slate-800">{req.nome}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      Função / Cargo
                                    </span>
                                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                                      <Briefcase className="w-3.5 h-3.5" />
                                      {req.funcao || 'Não informada'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 block">E-mail</span>
                                    <span className="text-slate-700 flex items-center gap-1">
                                      <Mail className="w-3 h-3 text-slate-400" />
                                      {req.email || '-'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      WhatsApp / Celular
                                    </span>
                                    <span className="text-slate-700 flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      {req.whatsapp || req.celular || '-'}
                                    </span>
                                  </div>
                                </div>

                                {/* Fazenda & Operação */}
                                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2">
                                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> Propriedade & Operação
                                  </h4>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      Grupo ou Associado
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {req.grupo || req.fazenda_grupo || '-'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 block">Fazenda(s)</span>
                                    <span className="text-slate-700">
                                      {req.fazenda || req.fazenda_nome || '-'}
                                    </span>
                                  </div>
                                  {req.proprietario && (
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Proprietário
                                      </span>
                                      <span className="text-slate-700">{req.proprietario}</span>
                                    </div>
                                  )}
                                  {req.responsavel && (
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Responsável Geral
                                      </span>
                                      <span className="text-slate-700">{req.responsavel}</span>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Município / Base
                                      </span>
                                      <span className="text-slate-700 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        {req.municipio || req.localizacao || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Estado (UF)
                                      </span>
                                      <span className="text-slate-700">{req.estado || '-'}</span>
                                    </div>
                                  </div>
                                  {req.tamanho && (
                                    <div>
                                      <span className="text-xs text-slate-500 block">Tamanho</span>
                                      <span className="text-slate-700">{req.tamanho}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Demanda & Treinamento */}
                                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2">
                                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5" /> Treinamento &
                                    Diagnóstico
                                  </h4>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      Cultura & Sistema
                                    </span>
                                    <span className="text-slate-700 font-medium">
                                      {req.cultura || '-'} {req.sistema ? `(${req.sistema})` : ''}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      Gargalo Principal
                                    </span>
                                    <span className="text-slate-700">{req.gargalo || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 block">
                                      Desafio Estratégico
                                    </span>
                                    <span className="text-slate-700">
                                      {req.desafio_roi || req.desafio || '-'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Modalidade
                                      </span>
                                      <span className="text-slate-700">
                                        {req.modalidade || req.local_realizacao || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Época Ideal
                                      </span>
                                      <span className="text-slate-700 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {req.epoca || req.mes_previsto || '-'}
                                      </span>
                                    </div>
                                  </div>
                                  {req.marcas && req.marcas !== '-' && (
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Marcas Predominantes
                                      </span>
                                      <span className="text-slate-700 font-medium">
                                        {req.marcas}
                                      </span>
                                    </div>
                                  )}
                                  {req.inovacao && (
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Inovação Demandada
                                      </span>
                                      <span className="text-slate-700 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        {req.inovacao}
                                      </span>
                                    </div>
                                  )}
                                  {req.infraestrutura && (
                                    <div>
                                      <span className="text-xs text-slate-500 block">
                                        Infraestrutura Local
                                      </span>
                                      <span className="text-slate-700 flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-slate-400" />
                                        {req.infraestrutura}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={canDelete ? 10 : 9}
                    className="text-center py-10 text-slate-500"
                  >
                    Nenhum registro encontrado para os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={isDeleting}
              className="bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500"
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
