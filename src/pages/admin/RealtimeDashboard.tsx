import React, { useMemo, useState } from 'react'
import useMainStore from '@/stores/main'
import { FileText, AlertTriangle, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { generatePDF, generateHRBatchPDF } from '@/lib/pdf'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns'
import { DateRange } from 'react-day-picker'
import { RealtimeKPIs } from '@/components/admin/RealtimeKPIs'
import { RealtimeCharts } from '@/components/admin/RealtimeCharts'

export default function RealtimeDashboard() {
  const { surveys } = useMainStore()
  const [quickPeriod, setQuickPeriod] = useState('all')
  const [date, setDate] = useState<DateRange | undefined>()

  const handleQuickPeriod = (val: string) => {
    setQuickPeriod(val)
    const now = new Date()
    if (val === 'week')
      setDate({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      })
    else if (val === 'month') setDate({ from: startOfMonth(now), to: endOfMonth(now) })
    else if (val === 'quarter') setDate({ from: startOfQuarter(now), to: endOfQuarter(now) })
    else setDate(undefined)
  }

  const filteredSurveys = useMemo(() => {
    if (!date?.from) return surveys
    return surveys.filter((s) => {
      const sDate = new Date(s.date).getTime()
      const from = date.from!.getTime()
      const to = date.to ? date.to.getTime() + 86399999 : from + 86399999
      return sDate >= from && sDate <= to
    })
  }, [surveys, date])

  const kpis = useMemo(() => {
    const total = filteredSurveys.length
    const coursesCount: Record<string, number> = {}
    const units = new Set<string>()
    const categoriesCount: Record<string, number> = {}
    let totalVagas = 0
    let vagasHomens = 0
    let vagasMulheres = 0
    const marcasCount: Record<string, number> = {}

    filteredSurveys.forEach((s) => {
      coursesCount[s.curso_solicitado] = (coursesCount[s.curso_solicitado] || 0) + 1
      categoriesCount[s.area_foco] = (categoriesCount[s.area_foco] || 0) + 1
      if (s.fazenda_grupo) units.add(s.fazenda_grupo)

      totalVagas += parseInt(s.quantidade_colaboradores || '0') || 0
      vagasHomens += parseInt(s.vagas_homens || '0') || 0
      vagasMulheres += parseInt(s.vagas_mulheres || '0') || 0

      let marcaStr = ''
      if (s.detalhes_cursos && typeof s.detalhes_cursos === 'object') {
        const dc = s.detalhes_cursos as any
        if (dc.marca) marcaStr = dc.marca
        else if (dc.fabricante) marcaStr = dc.fabricante
      }
      if (!marcaStr && s.sistema) marcaStr = s.sistema

      if (marcaStr) {
        marcasCount[marcaStr] = (marcasCount[marcaStr] || 0) + 1
      }
    })

    let topCourse = 'N/A'
    let maxCount = 0
    const highDemandAlerts: { course: string; count: number }[] = []

    Object.entries(coursesCount).forEach(([course, count]) => {
      if (count > maxCount) {
        maxCount = count
        topCourse = course
      }
      if (count >= 3) highDemandAlerts.push({ course, count })
    })

    return {
      total,
      topCourse,
      totalUnits: units.size,
      totalVagas,
      vagasHomens,
      vagasMulheres,
      top5Courses: Object.entries(coursesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value })),
      categoryData: Object.entries(categoriesCount).map(([name, value]) => ({ name, value })),
      topMarcas: Object.entries(marcasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value })),
      genderData: [
        { name: 'Homens', value: vagasHomens, fill: '#0284c7' },
        { name: 'Mulheres', value: vagasMulheres, fill: '#f43f5e' },
      ],
      highDemandAlerts: highDemandAlerts.sort((a, b) => b.count - a.count),
    }
  }, [filteredSurveys])

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50/30 p-6 md:p-8 overflow-y-auto no-scrollbar pb-32">
      <div className="max-w-[1200px] mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-abapa-primary rounded-xl flex items-center justify-center shadow-md border border-abapa-primary/20 overflow-hidden shrink-0">
              <img
                src="https://img.usecurling.com/i?q=agriculture&color=white&shape=fill"
                alt="Logo ABAPA"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-zinc-900 leading-tight">
                Centro de Treinamento & Tecnologia / ABAPA
              </h1>
              <p className="text-sm text-zinc-500 font-medium mt-1">
                Dashboard de Monitoramento Executivo
              </p>
            </div>
          </div>
          <Button
            onClick={() => generatePDF(filteredSurveys, date)}
            className="bg-zinc-800 hover:bg-zinc-900 text-white shadow-sm whitespace-nowrap"
          >
            <FileText className="mr-2 h-4 w-4" /> Baixar Relatório Geral
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm items-center z-10 relative">
          <div className="flex-1 text-sm font-medium text-zinc-700 w-full sm:w-auto text-left">
            Filtros de Período:
          </div>
          <Select value={quickPeriod} onValueChange={handleQuickPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] bg-zinc-50 border-zinc-200 shadow-none h-10">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker
            date={date}
            setDate={(d) => {
              setDate(d)
              setQuickPeriod('custom')
            }}
            className="w-full sm:w-auto"
          />
        </div>

        {kpis.highDemandAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            {kpis.highDemandAlerts.map((alert) => (
              <Alert
                key={alert.course}
                className="bg-orange-50/80 border-orange-200 text-orange-900 shadow-sm animate-fade-in-up"
              >
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <AlertTitle className="font-bold text-orange-800">
                  Alerta de Alta Demanda: {alert.course}
                </AlertTitle>
                <AlertDescription className="text-orange-700/90 text-sm mt-1">
                  Este curso atingiu um volume crítico com{' '}
                  <strong>{alert.count} solicitações ativas</strong> no período selecionado.
                  Recomenda-se priorizar a estruturação de uma nova turma.
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <RealtimeKPIs
          total={kpis.total}
          topCourse={kpis.topCourse}
          totalUnits={kpis.totalUnits}
          totalVagas={kpis.totalVagas}
          vagasHomens={kpis.vagasHomens}
          vagasMulheres={kpis.vagasMulheres}
        />
        <RealtimeCharts
          top5Courses={kpis.top5Courses}
          categoryData={kpis.categoryData}
          topMarcas={kpis.topMarcas}
          genderData={kpis.genderData}
          isEmpty={filteredSurveys.length === 0}
        />

        <div className="mt-8 border-t border-zinc-200 pt-8">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-abapa-primary" />
            Exportação para RH (Lote)
          </h2>
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-zinc-800">Comprovantes Consolidados</p>
              <p className="text-sm text-zinc-500">
                Gere um PDF único com os detalhes de todas as solicitações do período selecionado.
              </p>
            </div>
            <Button
              onClick={() => generateHRBatchPDF(filteredSurveys, date)}
              className="bg-zinc-800 hover:bg-zinc-900 text-white shrink-0"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Comprovantes (RH)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
