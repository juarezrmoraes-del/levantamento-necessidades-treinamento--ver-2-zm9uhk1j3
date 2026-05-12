import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6']

interface RealtimeChartsProps {
  top5Courses: { name: string; value: number }[]
  categoryData: { name: string; value: number }[]
  topMarcas: { name: string; value: number }[]
  genderData: { name: string; value: number; fill: string }[]
  isEmpty: boolean
}

export function RealtimeCharts({
  top5Courses,
  categoryData,
  topMarcas,
  genderData,
  isEmpty,
}: RealtimeChartsProps) {
  if (isEmpty) {
    return (
      <Card className="border-dashed border-2 border-zinc-200 bg-transparent">
        <CardContent className="flex flex-col items-center justify-center h-40">
          <p className="text-zinc-500 font-medium">
            Nenhum dado disponível para o período selecionado.
          </p>
        </CardContent>
      </Card>
    )
  }

  const barConfig = { value: { label: 'Demandas', color: '#166534' } }
  const barMarcasConfig = { value: { label: 'Demandas', color: '#8b5cf6' } }
  const pieConfig = { value: { label: 'Demandas' } }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-800">
            Ranking de Cursos Solicitados
          </CardTitle>
          <CardDescription>Volume de demandas por treinamento</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[300px] w-full">
            <BarChart
              data={top5Courses}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={130}
                tickFormatter={(val) => (val.length > 20 ? val.substring(0, 20) + '...' : val)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-800">
            Distribuição por Área
          </CardTitle>
          <CardDescription>Percentual de necessidades por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-800">
            Top Marcas / Fabricantes
          </CardTitle>
          <CardDescription>Volume por marca de máquina ou equipamento</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barMarcasConfig} className="h-[300px] w-full">
            <BarChart
              data={topMarcas}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={130}
                tickFormatter={(val) => (val.length > 20 ? val.substring(0, 20) + '...' : val)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-800">
            Distribuição de Vagas por Sexo
          </CardTitle>
          <CardDescription>Proporção entre homens e mulheres</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
