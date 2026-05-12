import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCursosCategory, hasMachineCourse, getMarcasForCourse } from '@/lib/survey-flow'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { supabase } from '@/lib/supabase/client'

export function SurveyInputs({ step, form, onNext, onSubmit, isSubmitting }: any) {
  const { watch, setValue } = form as UseFormReturn<any>
  const value = watch(step.id)

  if (step.type === 'single') {
    const options = step.dynamicOptions ? step.dynamicOptions(watch()) : step.options
    return (
      <div className="flex flex-col gap-3 sm:gap-4 pb-6">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => {
              setValue(step.id, opt)
              setTimeout(onNext, 250)
            }}
            className={cn(
              'w-full text-left px-6 py-4 sm:py-5 rounded-xl border-2 transition-all duration-200 text-lg sm:text-xl font-medium shadow-sm active:scale-[0.98]',
              value === opt
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50 text-slate-700',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (step.type === 'multiple' || step.type === 'multiple-categories') {
    const current = value || []
    const toggle = (opt: string) => {
      const next = current.includes(opt)
        ? current.filter((c: string) => c !== opt)
        : [...current, opt]
      setValue(step.id, next)

      // Limpar vagas e marcas se o curso for desmarcado
      if (current.includes(opt)) {
        const cursoVagas = { ...(watch('curso_vagas') || {}) }
        delete cursoVagas[opt]
        setValue('curso_vagas', cursoVagas)

        const cursoVagasHomens = { ...(watch('curso_vagas_homens') || {}) }
        delete cursoVagasHomens[opt]
        setValue('curso_vagas_homens', cursoVagasHomens)

        const cursoVagasMulheres = { ...(watch('curso_vagas_mulheres') || {}) }
        delete cursoVagasMulheres[opt]
        setValue('curso_vagas_mulheres', cursoVagasMulheres)

        const cursoMarcas = { ...(watch('curso_marcas') || {}) }
        delete cursoMarcas[opt]
        setValue('curso_marcas', cursoMarcas)
      }
    }

    const toggleMarca = (curso: string, marca: string) => {
      const cursoMarcas = watch('curso_marcas') || {}
      const marcasForCurso = cursoMarcas[curso] || []
      const nextMarcas = marcasForCurso.includes(marca)
        ? marcasForCurso.filter((m: string) => m !== marca)
        : [...marcasForCurso, marca]

      setValue('curso_marcas', {
        ...cursoMarcas,
        [curso]: nextMarcas,
      })
    }

    const renderOptions = (opts: string[]) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {opts.map((opt) => {
          const isSelected = current.includes(opt)
          const isMachine = hasMachineCourse([opt])
          const marcasForCurso = (watch('curso_marcas') || {})[opt] || []
          const vagasForCurso = (watch('curso_vagas') || {})[opt] || ''

          return (
            <div
              key={opt}
              className={cn(
                'flex flex-col gap-2 rounded-xl border-2 transition-all duration-200',
                isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(opt)}
                className="flex items-start sm:items-center justify-between px-5 py-4 text-left text-base sm:text-lg font-medium active:scale-[0.98] w-full"
              >
                <span
                  className={cn(
                    'pr-4 leading-tight',
                    isSelected ? 'text-primary' : 'text-slate-700',
                  )}
                >
                  {opt}
                </span>
                <div
                  className={cn(
                    'w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0',
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-slate-300',
                  )}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </button>

              {isSelected && (
                <div className="px-5 pb-4 pt-1 animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-semibold text-slate-600">
                      Nº de vagas e distribuição:
                    </Label>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 font-medium">Total:</span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Auto"
                          className="h-9 w-20 bg-slate-100/70 border-slate-200 font-semibold text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-not-allowed"
                          readOnly
                          value={vagasForCurso}
                          tabIndex={-1}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 font-medium">Homens:</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qtd"
                          className="h-9 w-20 bg-white"
                          value={(watch('curso_vagas_homens') || {})[opt] || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            const cursoVagasHomens = watch('curso_vagas_homens') || {}
                            setValue('curso_vagas_homens', {
                              ...cursoVagasHomens,
                              [opt]: val,
                            })
                            const mulheres = (watch('curso_vagas_mulheres') || {})[opt] || '0'
                            const total =
                              val || mulheres
                                ? (parseInt(val || '0') + parseInt(mulheres || '0')).toString()
                                : ''
                            const cursoVagas = watch('curso_vagas') || {}
                            setValue('curso_vagas', { ...cursoVagas, [opt]: total })
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 font-medium">Mulheres:</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qtd"
                          className="h-9 w-20 bg-white"
                          value={(watch('curso_vagas_mulheres') || {})[opt] || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            const cursoVagasMulheres = watch('curso_vagas_mulheres') || {}
                            setValue('curso_vagas_mulheres', {
                              ...cursoVagasMulheres,
                              [opt]: val,
                            })
                            const homens = (watch('curso_vagas_homens') || {})[opt] || '0'
                            const total =
                              homens || val
                                ? (parseInt(homens || '0') + parseInt(val || '0')).toString()
                                : ''
                            const cursoVagas = watch('curso_vagas') || {}
                            setValue('curso_vagas', { ...cursoVagas, [opt]: total })
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {isMachine && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">
                        Selecione as marcas predominantes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getMarcasForCourse(opt).map((marca) => {
                          const isMarcaSelected = marcasForCurso.includes(marca)
                          return (
                            <button
                              key={marca}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleMarca(opt, marca)
                              }}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                                isMarcaSelected
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50',
                              )}
                            >
                              {marca}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )

    return (
      <div className="space-y-8 flex flex-col pb-6">
        {step.type === 'multiple-categories' ? (
          <Accordion type="multiple" defaultValue={['item-0']} className="space-y-4">
            {getCursosCategory(watch('cultura'), watch('setor')).map((cat, i) => {
              const selectedCount = cat.options.filter((opt) => current.includes(opt)).length
              return (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-2 border-slate-200 rounded-xl px-2 bg-white data-[state=open]:border-primary/50 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline px-4 py-4 text-left font-bold text-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.name}</span>
                      {selectedCount > 0 && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">
                          {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-2">
                    {renderOptions(cat.options)}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : (
          renderOptions(step.options)
        )}
        <Button
          size="lg"
          onClick={onNext}
          disabled={current.length === 0}
          className="w-full sm:w-auto self-start mt-6 h-14 px-10 text-lg shadow-md"
        >
          Continuar
        </Button>
      </div>
    )
  }

  if (step.type === 'text') {
    return (
      <div className="space-y-6 pb-6">
        <Textarea
          placeholder="Digite aqui (opcional)..."
          className="min-h-[150px] text-lg p-5 rounded-xl resize-none border-slate-300 focus-visible:ring-primary/50"
          value={value || ''}
          onChange={(e) => setValue(step.id, e.target.value)}
        />
        <Button
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto h-14 px-10 text-lg shadow-md"
        >
          Continuar
        </Button>
      </div>
    )
  }

  if (step.type === 'identification') {
    return (
      <div className="space-y-5 max-w-lg pb-10">
        <div className="space-y-2">
          <Label className="text-base text-slate-600 font-semibold">Nome Completo</Label>
          <Input
            required
            className="h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white"
            value={watch('nome')}
            onChange={(e) => setValue('nome', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base text-slate-600 font-semibold">
            Nome da Fazenda / Empresa
          </Label>
          <Input
            required
            className="h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white"
            value={watch('fazenda')}
            onChange={(e) => setValue('fazenda', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base text-slate-600 font-semibold">WhatsApp</Label>
          <Input
            required
            className="h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white"
            placeholder="(00) 00000-0000"
            value={watch('whatsapp')}
            onChange={(e) => setValue('whatsapp', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base text-slate-600 font-semibold">E-mail</Label>
          <Input
            required
            type="email"
            className="h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white"
            placeholder="seu@email.com"
            value={watch('email')}
            onChange={(e) => setValue('email', e.target.value)}
          />
        </div>
        <div className="pt-4 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <p className="font-medium">
              As informações prestadas são protegidas pela LGPD (Lei Geral de Proteção de Dados).
            </p>
          </div>
          <Button
            size="lg"
            onClick={async () => {
              if (!watch('protocol')) {
                const protocol = `TRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                setValue('protocol', protocol)
              }

              const formData = watch()

              await onSubmit()

              try {
                const protocol = formData.protocol || watch('protocol')

                await supabase.functions.invoke('send-survey-email', {
                  body: {
                    to: 'ct9@abapa.com.br',
                    protocol,
                    nome: formData.nome,
                    fazenda: formData.fazenda,
                    whatsapp: formData.whatsapp,
                    email: formData.email,
                    cursos: formData.cursos,
                    vagas: formData.curso_vagas,
                    vagas_homens: formData.curso_vagas_homens,
                    vagas_mulheres: formData.curso_vagas_mulheres,
                  },
                })
              } catch (error) {
                console.error('Failed to notify:', error)
              }
            }}
            disabled={isSubmitting || !watch('nome') || !watch('fazenda') || !watch('whatsapp')}
            className="w-full h-14 text-lg font-bold shadow-md"
          >
            {isSubmitting ? 'Processando...' : 'Enviar Mapeamento'}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
