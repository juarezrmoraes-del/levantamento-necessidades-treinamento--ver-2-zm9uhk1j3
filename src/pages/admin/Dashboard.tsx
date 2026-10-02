import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import useMainStore from '@/stores/main'
import { FileStack, AlertCircle, BookOpen, Users, User } from 'lucide-react'
import { extractTopMarcas } from '@/lib/utils'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#00a884', '#0284c7', '#eab308', '#f59e0b', '#f43f5e']

export default function Dashboard() {
  const { surveys } = useMainStore()

  const {
    total,
    totalSubmissoes,
    mostRequested,
    pendingDepts,
    totalVagas,
    vagasHomens,
    vagasMulheres,
    topMarcas,
  } = useMemo(() => {
    const coursesCount: Record<string, number> = {}
    const pendingSet = new Set<string>()
    const distinctSubmissions = new Set<string>()
    let vTotal = 0
    let vHomens = 0
    let vMulheres = 0
    const marcasCount: Record<string, number> = {}

    surveys.forEach((s: any) => {
      if (s.lead_id) distinctSubmissions.add(s.lead_id)
      const cursosList = Array.isArray(s.cursos)
        ? s.cursos
        : s.curso_solicitado
          ? [s.curso_solicitado]
          : []
      cursosList.forEach((c: string) => {
        coursesCount[c] = (coursesCount[c] || 0) + 1
      })

      const fazendaGrupo = s.grupo || s.fazenda_grupo || s.fazenda
      if ((s.status === 'Pendente' || s.status === 'in_progress') && fazendaGrupo) {
        pendingSet.add(fazendaGrupo)
      }

      if (s.vagas && typeof s.vagas === 'object') {
        Object.values(s.vagas).forEach((v: any) => (vTotal += parseInt(v) || 0))
      } else {
        vTotal += parseInt(s.quantidade_colaboradores || '0') || 0
      }

      if (s.vagas_homens && typeof s.vagas_homens === 'object') {
        Object.values(s.vagas_homens).forEach((v: any) => (vHomens += parseInt(v) || 0))
      } else {
        vHomens += parseInt(s.vagas_homens || '0') || 0
      }

      if (s.vagas_mulheres && typeof s.vagas_mulheres === 'object') {
        Object.values(s.vagas_mulheres).forEach((v: any) => (vMulheres += parseInt(v) || 0))
      } else {
        vMulheres += parseInt(s.vagas_mulheres || '0') || 0
      }

      if (s.detalhes_cursos && typeof s.detalhes_cursos === 'object') {
        Object.values(s.detalhes_cursos).forEach((marcasArr: any) => {
          if (Array.isArray(marcasArr)) {
            marcasArr.forEach((m: string) => {
              marcasCount[m] = (marcasCount[m] || 0) + 1
            })
          }
        })
      }
    })

    const mostReq = Object.entries(coursesCount).sort((a, b) => b[1] - a[1])[0]

    let sortedMarcas = Object.entries(marcasCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    if (sortedMarcas.length === 0) {
      sortedMarcas = extractTopMarcas(surveys)
    }

    return {
      total: surveys.length,
      totalSubmissoes: distinctSubmissions.size,
      mostRequested: mostReq ? mostReq[0] : 'Nenhum',
      pendingDepts: pendingSet.size,
      totalVagas: vTotal,
      vagasHomens: vHomens,
      vagasMulheres: vMulheres,
      topMarcas: sortedMarcas,
    }
  }, [surveys])
  const chartDataGender = useMemo(() => {
    return [
      { name: 'Homens', value: vagasHomens, fill: '#0284c7' },
      { name: 'Mulheres', value: vagasMulheres, fill: '#f43f5e' },
    ]
  }, [vagasHomens, vagasMulheres])

  const chartDataDepts = useMemo(() => {
    const depts: Record<string, number> = {}
    surveys.forEach((s: any) => {
      const dept = s.grupo || s.fazenda_grupo || s.fazenda || 'Outros'
      depts[dept] = (depts[dept] || 0) + 1
    })
    return Object.entries(depts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [surveys])

  const chartDataPriority = useMemo(() => {
    const priorities = { Alta: 0, Média: 0, Baixa: 0 }
    surveys.forEach((s: any) => {
      const prio = s.prioridade || 'Média'
      if (priorities[prio as keyof typeof priorities] !== undefined) {
        priorities[prio as keyof typeof priorities]++
      }
    })
    return Object.entries(priorities).map(([name, value]) => ({ name, value }))
  }, [surveys])

  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
        <p className="text-slate-500">
          Métricas e estatísticas consolidadas dos levantamentos de necessidades de treinamento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {totalSubmissoes} formulários ({total} demandas de curso)
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Treinamento Mais Requisitado
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-900 truncate leading-tight mt-1">
              {mostRequested}
            </div>
            <p className="text-xs text-slate-500 mt-2">maior demanda atual</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Departamentos Pendentes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingDepts}</div>
            <p className="text-xs text-slate-500 mt-1">aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Vagas</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalVagas}</div>
            <div className="flex gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-sky-600" /> {vagasHomens} M
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-rose-500" /> {vagasMulheres} F
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Necessidades por Departamento</CardTitle>
            <CardDescription>Top 5 departamentos com mais solicitações</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pl-0">
            <ChartContainer
              config={{ value: { label: 'Solicitações', color: 'hsl(210, 100%, 40%)' } }}
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
                    width={100}
                  />
                  <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#00a884" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Distribuição de Prioridades</CardTitle>
            <CardDescription>Volume de treinamentos por nível de urgência</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex items-center justify-center">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataPriority}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartDataPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Vagas por Sexo</CardTitle>
            <CardDescription>Distribuição de vagas entre homens e mulheres</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex items-center justify-center">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartDataGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Top Marcas / Fabricantes</CardTitle>
            <CardDescription>Principais marcas solicitadas em treinamentos</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pl-0">
            <ChartContainer
              config={{ value: { label: 'Solicitações', color: 'hsl(280, 100%, 60%)' } }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMarcas}
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
                    width={100}
                    tickFormatter={(val) => (val.length > 15 ? val.substring(0, 15) + '...' : val)}
                  />
                  <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
