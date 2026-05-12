import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileStack, BookOpen, Building2, Loader2, FileText, Table as TableIcon } from 'lucide-react'
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
        'Data de Inscrição': new Date(s.created_at || new Date()).toLocaleDateString('pt-BR'),
        Solicitante: s.nome,
        Celular: s.celular,
        Email: s.email,
        Função: s.funcao,
        'Fazenda/Grupo': s.fazenda_grupo,
        Localização: s.localizacao,
        Tamanho: s.tamanho,
        Cultura: s.cultura,
        Sistema: s.sistema,
        Gargalo: s.gargalo,
        'Área de Foco': s.area_foco,
        'Curso Solicitado': s.curso_solicitado,
        Marcas: s.marcas || s.detalhes_cursos?.marcas || '-',
        Fabricantes: s.fabricantes || s.detalhes_cursos?.fabricantes || '-',
        'Vagas Totais': s.quantidade_colaboradores,
        'Vagas Homens': s.vagas_homens || '0',
        'Vagas Mulheres': s.vagas_mulheres || '0',
        'Modalidade/Local': s.local_realizacao,
        'Época Ideal': s.mes_previsto,
        Infraestrutura: s.infraestrutura,
        'Desafio Estratégico': s.desafio_roi,
        Inovação: s.inovacao,
        'Sugestão Futura': s.sugestao_futura,
        Prioridade: s.prioridade || 'Não Definida',
        Status: s.status,
      }))
      exportToExcel(
        exportData,
        `relatorio_completo_lnt_${new Date().toISOString().split('T')[0]}.xls`,
      )
      setIsExportingXLS(false)
    }, 1500)
  }

  const { total, mostRequested, deptsCount } = useMemo(() => {
    const coursesCount: Record<string, number> = {}
    const depts: Record<string, number> = {}

    surveys.forEach((s) => {
      if (s.curso_solicitado)
        coursesCount[s.curso_solicitado] = (coursesCount[s.curso_solicitado] || 0) + 1
      const dept = s.fazenda_grupo || 'Outros'
      depts[dept] = (depts[dept] || 0) + 1
    })
    const mostReq = Object.entries(coursesCount).sort((a, b) => b[1] - a[1])[0]

    return {
      total: surveys.length,
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
    </div>
  )
}
