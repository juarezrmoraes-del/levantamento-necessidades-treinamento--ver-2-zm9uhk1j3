import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileStack,
  BookOpen,
  Building2,
  Loader2,
  FileText,
  Table as TableIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase,
  MapPin,
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useMainStore from '@/stores/main'
import { exportToExcel } from '@/lib/export'
import { generatePDF } from '@/lib/pdf'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function Reports() {
  const { surveys } = useMainStore()
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingXLS, setIsExportingXLS] = useState(false)

  const handleExportPDF = () => {
    setIsExportingPDF(true)
    setTimeout(() => {
      generatePDF(surveys)
      setIsExportingPDF(false)
    }, 1500)
  }

  const handleExportXLS = () => {
    setIsExportingXLS(true)
    setTimeout(() => {
      const exportData = surveys.map((s: any) => ({
        Protocolo: s.protocol || s.id,
        'Data de Inscrição': new Date(s.created_at || s.date || new Date()).toLocaleDateString(
          'pt-BR',
        ),
        Solicitante: s.nome || '-',
        Função: s.funcao || 'Não informada',
        Email: s.email || '-',
        'WhatsApp / Celular': s.whatsapp || s.celular || '-',
        'Grupo / Associado': s.grupo || s.fazenda_grupo || '-',
        'Fazenda(s)': s.fazenda || s.fazenda_nome || '-',
        Proprietário: s.proprietario || '-',
        Responsável: s.responsavel || '-',
        Município: s.municipio || s.localizacao || '-',
        'Estado (UF)': s.estado || '-',
        'Tamanho Operação': s.tamanho || '-',
        Cultura: s.cultura || '-',
        Sistema: s.sistema || '-',
        Gargalo: s.gargalo || '-',
        'Desafio Estratégico': s.desafio_roi || s.desafio || '-',
        'Setor / Área de Foco': s.area_foco || s.setor || '-',
        'Curso Solicitado': s.curso_solicitado || '-',
        'Marcas Predominantes': s.marcas || '-',
        'Vagas Totais': s.quantidade_colaboradores || '0',
        'Vagas Homens': s.vagas_homens || '0',
        'Vagas Mulheres': s.vagas_mulheres || '0',
        Modalidade: s.modalidade || s.local_realizacao || '-',
        'Época Ideal': s.epoca || s.mes_previsto || '-',
        Infraestrutura: s.infraestrutura || '-',
        'Inovação Demandada': s.inovacao || '-',
        Prioridade: s.prioridade || 'Média',
        Status: s.status || 'Pendente',
      }))
      exportToExcel(
        exportData,
        `relatorio_completo_lnt_${new Date().toISOString().split('T')[0]}.xls`,
      )
      setIsExportingXLS(false)
    }, 1500)
  }

  const { total, totalSubmissoes, mostRequested, deptsCount } = useMemo(() => {
    const coursesCount: Record<string, number> = {}
    const depts: Record<string, number> = {}
    const distinctSubmissions = new Set<string>()

    surveys.forEach((s) => {
      if (s.lead_id) distinctSubmissions.add(s.lead_id)
      if (s.curso_solicitado)
        coursesCount[s.curso_solicitado] = (coursesCount[s.curso_solicitado] || 0) + 1
      const dept = s.fazenda_grupo || 'Outros'
      depts[dept] = (depts[dept] || 0) + 1
    })
    const mostReq = Object.entries(coursesCount).sort((a, b) => b[1] - a[1])[0]

    return {
      total: surveys.length,
      totalSubmissoes: distinctSubmissions.size,
      mostRequested: mostReq ? mostReq[0] : 'Nenhum',
      deptsCount: Object.keys(depts).length,
    }
  }, [surveys])

  const chartDataDepts = useMemo(() => {
    const depts: Record<string, number> = {}
    surveys.forEach((s) => {
      depts[s.fazenda_grupo || 'Outros'] = (depts[s.fazenda_grupo || 'Outros'] || 0) + 1
    })
    return Object.entries(depts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [surveys])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterFuncao, setFilterFuncao] = useState('Todas')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    if (expandedRows.size === filteredTableSurveys.length) {
      setExpandedRows(new Set())
    } else {
      setExpandedRows(new Set(filteredTableSurveys.map((s) => s.id)))
    }
  }

  const availableFuncoes = useMemo(() => {
    const setF = new Set<string>()
    surveys.forEach((s) => {
      if (s.funcao) setF.add(s.funcao)
    })
    return Array.from(setF).sort()
  }, [surveys])

  const filteredTableSurveys = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return surveys.filter((s: any) => {
      const matchSearch =
        !term ||
        s.nome?.toLowerCase().includes(term) ||
        s.funcao?.toLowerCase().includes(term) ||
        s.grupo?.toLowerCase().includes(term) ||
        s.fazenda?.toLowerCase().includes(term) ||
        s.fazenda_grupo?.toLowerCase().includes(term) ||
        s.curso_solicitado?.toLowerCase().includes(term) ||
        s.municipio?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)

      const matchFuncao = filterFuncao === 'Todas' || s.funcao === filterFuncao
      return matchSearch && matchFuncao
    })
  }, [surveys, searchTerm, filterFuncao])

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Relatórios Consolidados
        </h1>
        <p className="text-slate-500">Visualize as métricas ou exporte a totalidade dos dados.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-800">Exportação de Dados</CardTitle>
          <CardDescription>
            Baixe os relatórios em formato formatado para apresentação ou bruto para análise.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="bg-slate-800 hover:bg-slate-700 text-white w-full sm:w-auto"
          >
            {isExportingPDF ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}{' '}
            Documento PDF
          </Button>
          <Button
            onClick={handleExportXLS}
            disabled={isExportingXLS}
            className="bg-[#107c41] hover:bg-[#0c6633] text-white w-full sm:w-auto"
          >
            {isExportingXLS ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TableIcon className="mr-2 h-4 w-4" />
            )}{' '}
            Planilha Excel (XLS)
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Solicitações
            </CardTitle>
            <FileStack className="h-4 w-4 text-[#00a884]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{total}</div>
            <p className="text-xs text-slate-500 mt-1">
              {totalSubmissoes} formulários recebidos ({total} cursos demandados)
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Treinamento Mais Solicitado
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-900 truncate mt-1">{mostRequested}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Departamentos Envolvidos
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{deptsCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Distribuição por Departamento</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] w-full pl-0">
          <ChartContainer
            config={{ value: { label: 'Solicitações', color: 'hsl(160, 100%, 33%)' } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataDepts}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#00a884" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Relatório Completo Detalhado com Função e layout expansível */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00a884]" />
                Relatório Geral com Informações Completas por Linha
              </CardTitle>
              <CardDescription className="mt-1">
                Todas as informações cadastradas de cada registro, incluindo Função, Grupo, Fazenda,
                Contato e Demandas.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="bg-white text-slate-700 hover:bg-slate-100"
            >
              {expandedRows.size === filteredTableSurveys.length && filteredTableSurveys.length > 0
                ? 'Recolher Todas as Linhas'
                : 'Expandir Todas as Linhas'}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por colaborador, função, fazenda, curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Filtrar Função:
              </span>
              <select
                value={filterFuncao}
                onChange={(e) => setFilterFuncao(e.target.value)}
                className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              >
                <option value="Todas">Todas as Funções ({surveys.length})</option>
                {availableFuncoes.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[180px]">
                    Solicitante
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[170px]">Função</TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[200px]">
                    Grupo / Fazenda
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Curso Solicitado</TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[110px]">Vagas</TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[110px]">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[100px]">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTableSurveys.length > 0 ? (
                  filteredTableSurveys.map((req: any) => {
                    const isExpanded = expandedRows.has(req.id)
                    return (
                      <React.Fragment key={req.id}>
                        <TableRow
                          onClick={() => toggleRow(req.id)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <TableCell className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-slate-800"
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
                          <TableCell>
                            <div className="font-semibold text-slate-900">{req.nome}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[150px]">{req.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              <Briefcase className="w-3 h-3 mr-1 shrink-0 text-emerald-600" />
                              {req.funcao || 'Não informada'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-800">{req.fazenda_grupo}</div>
                            {req.fazenda && (
                              <div className="text-xs text-slate-500 truncate max-w-[190px]">
                                {req.fazenda}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-900">{req.curso_solicitado}</div>
                            {req.area_foco && (
                              <div className="text-xs text-slate-500 mt-0.5">{req.area_foco}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-slate-800">
                              {req.quantidade_colaboradores || '0'} total
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {req.vagas_homens || '0'} H / {req.vagas_mulheres || '0'} M
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
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
                              }`}
                            >
                              {req.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs">
                            {new Date(req.created_at || req.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>

                        {/* Linha expandida com todas as informações completas do registro */}
                        {isExpanded && (
                          <TableRow className="bg-slate-50/90 border-b border-slate-200">
                            <TableCell colSpan={8} className="p-4 sm:p-6">
                              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
                                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                      Registro Completo
                                    </span>
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                      Protocolo: {req.protocol || req.id}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Submetido em:{' '}
                                    {new Date(req.created_at || req.date).toLocaleString('pt-BR')}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                  {/* Coluna 1: Dados do Solicitante e Função */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                                      <User className="w-3.5 h-3.5" /> Responsável & Função
                                    </h4>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          Nome do Solicitante
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                          {req.nome}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          Função / Cargo
                                        </span>
                                        <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                                          <Briefcase className="w-3.5 h-3.5" />
                                          {req.funcao || 'Não informada'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 block">E-mail</span>
                                        <span className="text-slate-700 break-all">
                                          {req.email || '-'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          WhatsApp / Telefone
                                        </span>
                                        <span className="text-slate-700 flex items-center gap-1">
                                          <Phone className="w-3 h-3 text-slate-400" />
                                          {req.whatsapp || req.celular || '-'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Coluna 2: Dados da Propriedade / Fazenda */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                                      <Building2 className="w-3.5 h-3.5" /> Propriedade & Operação
                                    </h4>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          Grupo ou Associado
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                          {req.grupo || req.fazenda_grupo || '-'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          Fazenda(s)
                                        </span>
                                        <span className="text-slate-700">
                                          {req.fazenda || req.fazenda_nome || '-'}
                                        </span>
                                      </div>
                                      {req.proprietario && (
                                        <div>
                                          <span className="text-xs text-slate-500 block">
                                            Proprietário Cadastrado
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
                                          <span className="text-slate-700">
                                            {req.estado || '-'}
                                          </span>
                                        </div>
                                      </div>
                                      {req.tamanho && (
                                        <div>
                                          <span className="text-xs text-slate-500 block">
                                            Tamanho da Operação
                                          </span>
                                          <span className="text-slate-700">{req.tamanho}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Coluna 3: Detalhes Agronômicos e Treinamento */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                                      <GraduationCap className="w-3.5 h-3.5" /> Demanda & Contexto
                                    </h4>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          Cultura / Sistema
                                        </span>
                                        <span className="text-slate-700 font-medium">
                                          {req.cultura || '-'}{' '}
                                          {req.sistema ? `(${req.sistema})` : ''}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 block">
                                          Gargalo Identificado
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
                                            Inovação / Novas Tecnologias
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
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                      Nenhum registro encontrado para a busca.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
