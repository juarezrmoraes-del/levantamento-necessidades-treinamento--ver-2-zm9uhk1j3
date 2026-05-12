import React, { useState } from 'react'
import { useAuditStore } from '@/stores/audit'
import { useAuth } from '@/stores/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function Audit() {
  const { user } = useAuth()
  const { logs } = useAuditStore()
  const [search, setSearch] = useState('')

  if (user?.role !== 'Administrator') {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-zinc-500">
          Acesso negado. Apenas Administradores podem visualizar auditoria.
        </p>
      </div>
    )
  }

  const filtered = logs.filter(
    (l) =>
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1200px] w-full mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Logs de Auditoria</h1>
        <p className="text-sm text-zinc-500">
          Acompanhe o histórico de todas as alterações realizadas no painel.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar por usuário, ação ou detalhe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-zinc-200 shadow-sm"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/80">
            <TableRow>
              <TableHead className="w-[180px]">Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900">{l.user_name}</TableCell>
                  <TableCell className="text-zinc-700">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-medium">
                      {l.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-600 text-sm">{l.details}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-zinc-500">
                  Nenhum registro de auditoria encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
