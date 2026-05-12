import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { SurveyRecord } from '@/stores/main'

export function SurveyAuditDialog({ survey }: { survey: SurveyRecord }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Solicitação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm mt-2">
          <div className="grid grid-cols-2 gap-y-3">
            <div>
              <span className="text-zinc-500 font-medium">Protocolo:</span>
              <p className="font-semibold text-zinc-900">{survey.protocol || survey.id}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Data Recebimento:</span>
              <p className="font-semibold text-zinc-900">
                {new Date(survey.date).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Email:</span>
              <p className="font-semibold text-zinc-900">{survey.email}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Celular:</span>
              <p className="font-semibold text-zinc-900">{survey.celular}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Local Previsto:</span>
              <p className="font-semibold text-zinc-900">{survey.local_realizacao}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Período Desejado:</span>
              <p className="font-semibold text-zinc-900">{survey.mes_previsto}</p>
            </div>
            <div className="col-span-2">
              <span className="text-zinc-500 font-medium">Desafio/ROI Esperado:</span>
              <p className="font-semibold text-zinc-900">{survey.desafio_roi}</p>
            </div>
            {survey.sugestao_futura && (
              <div className="col-span-2">
                <span className="text-zinc-500 font-medium">Sugestões Futuras:</span>
                <p className="font-semibold text-zinc-900">{survey.sugestao_futura}</p>
              </div>
            )}
            {survey.data_agendada && (
              <div className="col-span-2 bg-purple-50 p-2 rounded border border-purple-100">
                <span className="text-purple-700 font-medium">Data Programada:</span>
                <p className="font-bold text-purple-900">
                  {new Date(survey.data_agendada).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
