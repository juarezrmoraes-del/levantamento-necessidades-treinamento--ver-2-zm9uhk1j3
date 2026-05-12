import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, BookOpen, Building2, Users, User } from 'lucide-react'

interface RealtimeKPIsProps {
  total: number
  topCourse: string
  totalUnits: number
  totalVagas: number
  vagasHomens: number
  vagasMulheres: number
}

export function RealtimeKPIs({
  total,
  topCourse,
  totalUnits,
  totalVagas,
  vagasHomens,
  vagasMulheres,
}: RealtimeKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600">Total de Solicitações</CardTitle>
          <ClipboardList className="h-5 w-5 text-abapa-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-900">{total}</div>
          <p className="text-xs text-zinc-500 mt-1">no período selecionado</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600">Curso mais Solicitado</CardTitle>
          <BookOpen className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-zinc-900 leading-tight truncate" title={topCourse}>
            {topCourse}
          </div>
          <p className="text-xs text-zinc-500 mt-1">maior demanda atual</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600">Fazendas / Grupos</CardTitle>
          <Building2 className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-900">{totalUnits}</div>
          <p className="text-xs text-zinc-500 mt-1">participação distinta</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600">Total de Vagas</CardTitle>
          <Users className="h-5 w-5 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-900">{totalVagas}</div>
          <div className="flex gap-3 mt-1 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-sky-600" /> {vagasHomens} Homens
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-rose-500" /> {vagasMulheres} Mulheres
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
