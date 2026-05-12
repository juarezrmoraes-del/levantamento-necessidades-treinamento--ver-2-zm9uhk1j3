import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SurveyRecord } from '@/stores/main'

interface Props {
  survey: SurveyRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (date: string) => void
}

export function ScheduleDialog({ survey, open, onOpenChange, onSave }: Props) {
  const [date, setDate] = useState('')

  useEffect(() => {
    if (open) {
      if (survey?.data_agendada) {
        // Format ISO string to fit datetime-local input (YYYY-MM-DDThh:mm)
        setDate(survey.data_agendada.slice(0, 16))
      } else {
        setDate('')
      }
    }
  }, [open, survey])

  const handleSave = () => {
    if (!date) return
    onSave(new Date(date).toISOString())
    onOpenChange(false)
  }

  if (!survey) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Programar Treinamento</DialogTitle>
          <DialogDescription>
            Defina a data e horário para a realização do curso "{survey.curso_solicitado}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date" className="text-zinc-700">
              Data e Horário de Início
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-50 border-zinc-200"
            />
          </div>
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
            <p className="text-xs text-blue-700 leading-relaxed">
              O solicitante receberá um e-mail automático notificando que o status foi alterado para{' '}
              <strong>Programado</strong> e informando a data selecionada acima.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!date}
            className="bg-abapa-primary hover:bg-abapa-primary/90 text-white"
          >
            Confirmar Programação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
