import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Search, Download, Trash2, Lock, LogIn } from 'lucide-react'
import useMainStore, { SurveyStatus } from '@/stores/main'
import { useAuth } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { exportToCSV } from '@/lib/export'
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
  const { surveys, updateSurvey, deleteSurvey } = useMainStore()
  const { addLog } = useAuditStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('Todas')

  // Role-Based Access Control logic
  const isViewer = !user || user.role === 'Viewer'
  const isAdmin = user?.role === 'Administrator'
  const canEdit = !!user && !isViewer
  const canDelete = isAdmin

  const filteredSurveys = useMemo(() => {
    return surveys
      .filter((s) => {
        const matchSearch =
          s.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.fazenda_grupo?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchPriority = priorityFilter === 'Todas' || s.prioridade === priorityFilter
        return matchSearch && matchPriority
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  }, [surveys, searchTerm, priorityFilter])

  const handleExport = () => {
    const exportData = filteredSurveys.map((s: any) => ({
      Protocolo: s.protocol || s.id,
      Colaborador: s.nome,
      Celular: s.celular,
      Email: s.email,
      'Departamento/Fazenda': s.fazenda_grupo,
      Função: s.funcao,
      Localização: s.localizacao,
      Tamanho: s.tamanho,
      Cultura: s.cultura,
      Sistema: s.sistema,
      Gargalo: s.gargalo,
      'Área de Foco': s.area_foco,
      'Treinamento Requerido': s.curso_solicitado,
      Marcas: s.marcas || s.detalhes_cursos?.marcas || '-',
      Fabricantes: s.fabricantes || s.detalhes_cursos?.fabricantes || '-',
      'Vagas Totais': s.quantidade_colaboradores,
      'Vagas Homens': s.vagas_homens || '0',
      'Vagas Mulheres': s.vagas_mulheres || '0',
      'Modalidade/Local': s.local_realizacao,
      'Época Ideal': s.mes_previsto,
      Infraestrutura: s.infraestrutura,
      'Justificativa/Desafio': s.desafio_roi,
      Inovação: s.inovacao,
      'Sugestão Futura': s.sugestao_futura,
      Prioridade: s.prioridade || 'Não Definida',
      Status: s.status,
      'Data de Inscrição': new Date(s.created_at).toLocaleDateString('pt-BR'),
    }))
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

      await deleteSurvey(deleteId)
      await addLog({
        user_name: user?.name || '',
        user_email: user?.email || '',
        action: 'DELETE',
        entity_type: 'SURVEY',
        entity_id: deleteId,
        details: `Removeu solicitação de treinamento`,
      })
      toast({ title: 'Solicitação Removida com sucesso' })
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast({ title: 'Erro ao remover solicitação', variant: 'destructive' })
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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por colaborador ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filtrar por Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as Prioridades</SelectItem>
                  <SelectItem value="Alta">Alta Prioridade</SelectItem>
                  <SelectItem value="Média">Média Prioridade</SelectItem>
                  <SelectItem value="Baixa">Baixa Prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 w-[15%]">Colaborador</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[15%]">Departamento</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[20%]">
                  Treinamento Necessário
                </TableHead>
                <TableHead className="font-semibold text-slate-700 w-[12%]">Vagas</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Prioridade</TableHead>
                <TableHead className="font-semibold text-slate-700">Data</TableHead>
                {canDelete && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.length > 0 ? (
                filteredSurveys.map((req: any) => (
                  <TableRow key={req.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{req.nome}</TableCell>
                    <TableCell className="text-slate-600">{req.fazenda_grupo}</TableCell>
                    <TableCell className="text-slate-700">
                      {req.curso_solicitado}
                      <div className="text-xs text-slate-500 mt-1">{req.area_foco}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="font-medium">
                        {req.quantidade_colaboradores || '0'} totais
                      </div>
                      <div className="text-xs text-slate-500">
                        {req.vagas_homens || '0'} H / {req.vagas_mulheres || '0'} M
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={!canEdit}
                        value={req.status}
                        onValueChange={(v) => handleStatusChange(req.id, v)}
                      >
                        <SelectTrigger
                          className={`h-8 text-xs w-[130px] font-semibold border-0 ${
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
                    <TableCell>
                      <Select
                        disabled={!canEdit}
                        value={req.prioridade || 'Média'}
                        onValueChange={(v) => handlePriorityChange(req.id, v)}
                      >
                        <SelectTrigger
                          className={`h-8 text-xs w-[100px] border-0 font-medium ${
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
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(req.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    {canDelete && (
                      <TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={canDelete ? 8 : 7}
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
              Tem certeza que deseja excluir este levantamento? Esta ação não pode ser desfeita.
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
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
