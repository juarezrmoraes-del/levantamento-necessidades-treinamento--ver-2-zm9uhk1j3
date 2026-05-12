import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function DateRangePicker({
  date,
  setDate,
  className,
}: {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full md:w-[260px] justify-start text-left font-normal bg-white border-zinc-200 shadow-sm h-10',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
            {date?.from ? (
              date.to ? (
                <span className="truncate">
                  {format(date.from, 'dd/MM/yy', { locale: ptBR })} -{' '}
                  {format(date.to, 'dd/MM/yy', { locale: ptBR })}
                </span>
              ) : (
                format(date.from, 'dd/MM/yy', { locale: ptBR })
              )
            ) : (
              <span>Filtrar por período...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={ptBR}
            className="p-3"
          />
          {date && (
            <div className="p-2 border-t border-zinc-100 flex justify-end bg-zinc-50 rounded-b-xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDate(undefined)}
                className="text-zinc-600 hover:text-red-600 hover:bg-red-50 h-8 px-3"
              >
                <X className="w-4 h-4 mr-1.5" /> Limpar Filtro
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
