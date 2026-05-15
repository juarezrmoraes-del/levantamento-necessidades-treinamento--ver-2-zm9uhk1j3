import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCursosCategory, hasMachineCourse, getMarcasForCourse } from '@/lib/survey-flow'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Database } from 'lucide-react'

function IdentificationStep({ step, form, onNext }: any) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
    clearErrors,
  } = form as UseFormReturn<any>
  const [grupos, setGrupos] = useState<string[]>([])
  const [fazendas, setFazendas] = useState<string[]>([])
  const [loadingGrupos, setLoadingGrupos] = useState(true)
  const [openGrupo, setOpenGrupo] = useState(false)
  const [openFazenda, setOpenFazenda] = useState(false)

  const grupoWatch = watch('grupo')
  const fazendaWatch = watch('fazenda') || []

  useEffect(() => {
    const fetchGrupos = async () => {
      setLoadingGrupos(true)
      try {
        const { data, error } = await supabase.from('fazendas').select('grupo').order('grupo')
        if (data && !error) {
          const uniqueGrupos = Array.from(
            new Set(data.map((d) => d.grupo).filter(Boolean)),
          ) as string[]
          setGrupos(uniqueGrupos)
        } else {
          setGrupos([])
        }
      } catch (err) {
        setGrupos([])
      } finally {
        setLoadingGrupos(false)
      }
    }
    fetchGrupos()
  }, [])

  useEffect(() => {
    if (grupoWatch && grupoWatch !== 'Outro') {
      const fetchFazendas = async () => {
        try {
          const { data, error } = await supabase
            .from('fazendas')
            .select('fazenda')
            .eq('grupo', grupoWatch)
            .order('fazenda')
          if (data && !error) {
            const uniqueFazendas = Array.from(
              new Set(data.map((d) => d.fazenda).filter(Boolean)),
            ) as string[]
            setFazendas(uniqueFazendas)
          } else {
            setFazendas([])
          }
        } catch (err) {
          setFazendas([])
        }
      }
      fetchFazendas()
    } else {
      setFazendas([])
    }
  }, [grupoWatch])

  return (
    <div className="space-y-5 max-w-lg pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!loadingGrupos && grupos.length === 0 && (
        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <Database className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 font-semibold">Aguardando dados</AlertTitle>
          <AlertDescription className="text-yellow-700 text-sm mt-1">
            A lista de fazendas ainda não foi importada. Você pode continuar escolhendo a opção{' '}
            <strong>"Outro (Não listado)"</strong> ou solicitar a importação do arquivo CSV no
            painel do Supabase.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label className="text-base text-slate-600 font-semibold">
          Nome Completo <span className="text-red-500">*</span>
        </Label>
        <Input
          className={cn(
            'h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white',
            errors.nome && 'border-red-500',
          )}
          placeholder="Seu nome"
          {...register('nome', { required: 'Nome é obrigatório' })}
        />
        {errors.nome && (
          <span className="text-red-500 text-sm block">{errors.nome.message as string}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-base text-slate-600 font-semibold">
          WhatsApp (com DDD) <span className="text-red-500">*</span>
        </Label>
        <Input
          className={cn(
            'h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white',
            errors.whatsapp && 'border-red-500',
          )}
          placeholder="(00) 00000-0000"
          {...register('whatsapp', { required: 'WhatsApp é obrigatório' })}
        />
        {errors.whatsapp && (
          <span className="text-red-500 text-sm block">{errors.whatsapp.message as string}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-base text-slate-600 font-semibold">E-mail</Label>
        <Input
          type="email"
          className="h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white"
          placeholder="seu@email.com"
          {...register('email')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base text-slate-600 font-semibold">
          Grupo <span className="text-red-500">*</span>
        </Label>

        <Popover open={openGrupo} onOpenChange={setOpenGrupo}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openGrupo}
              className={cn(
                'w-full justify-between h-14 text-lg bg-white border-slate-300 font-normal hover:bg-slate-50',
                !grupoWatch && 'text-slate-400',
                errors.grupo && 'border-red-500',
              )}
            >
              {loadingGrupos
                ? 'Carregando grupos...'
                : grupoWatch
                  ? grupoWatch === 'Outro'
                    ? 'Outro (Não listado)'
                    : grupos.find((g) => g === grupoWatch) || grupoWatch
                  : 'Selecione um Grupo...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar grupo..." />
              <CommandList>
                <CommandEmpty>Nenhum grupo encontrado.</CommandEmpty>
                <CommandGroup>
                  {grupos.map((g) => (
                    <CommandItem
                      key={g}
                      value={g}
                      onSelect={() => {
                        setValue('grupo', g, { shouldValidate: true })
                        setValue('fazenda', [])
                        clearErrors('grupo')
                        setOpenGrupo(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          grupoWatch === g ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {g}
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="Outro"
                    onSelect={() => {
                      setValue('grupo', 'Outro', { shouldValidate: true })
                      setValue('fazenda', ['Outra'])
                      clearErrors('grupo')
                      setOpenGrupo(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        grupoWatch === 'Outro' ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    Outro (Não listado)
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {/* Input escondido para manter o react-hook-form preenchido e poder fazer o hook das validações */}
        <input type="hidden" {...register('grupo', { required: 'Grupo é obrigatório' })} />

        {errors.grupo && (
          <span className="text-red-500 text-sm block">{errors.grupo.message as string}</span>
        )}
      </div>

      {grupoWatch === 'Outro' ? (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-2">
          <Label className="text-base text-slate-600 font-semibold">
            Nome da Fazenda / Empresa <span className="text-red-500">*</span>
          </Label>
          <Input
            className={cn(
              'h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white',
              errors.fazenda_custom && 'border-red-500',
            )}
            placeholder="Digite o nome da fazenda ou empresa"
            {...register('fazenda_custom', {
              required: 'Nome da fazenda ou empresa é obrigatório',
            })}
          />
          {errors.fazenda_custom && (
            <span className="text-red-500 text-sm block">
              {errors.fazenda_custom.message as string}
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          <Label className="text-base text-slate-600 font-semibold">
            Fazendas <span className="text-red-500">*</span>
          </Label>

          <Popover open={openFazenda} onOpenChange={setOpenFazenda}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFazenda}
                disabled={!grupoWatch || fazendas.length === 0}
                className={cn(
                  'w-full justify-between min-h-[3.5rem] h-auto py-2 text-lg bg-white border-slate-300 disabled:opacity-50 font-normal hover:bg-slate-50',
                  (!fazendaWatch || fazendaWatch.length === 0) && 'text-slate-400',
                  errors.fazenda && 'border-red-500',
                )}
              >
                <div className="flex flex-wrap gap-1.5 items-center text-left max-w-[90%]">
                  {fazendaWatch && fazendaWatch.length > 0
                    ? fazendaWatch.map((f: string) => (
                        <span
                          key={f}
                          className="bg-primary/10 text-primary text-sm px-2.5 py-1 rounded-md font-semibold"
                        >
                          {f === 'Outra' ? 'Outra (Não listada)' : f}
                        </span>
                      ))
                    : grupoWatch
                      ? 'Selecione as Fazendas...'
                      : 'Selecione um grupo primeiro'}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar fazenda..." />
                <CommandList>
                  <CommandEmpty>Nenhuma fazenda encontrada.</CommandEmpty>
                  <CommandGroup>
                    {fazendas.map((f) => {
                      const isSelected = fazendaWatch.includes(f)
                      return (
                        <CommandItem
                          key={f}
                          value={f}
                          onSelect={() => {
                            const next = isSelected
                              ? fazendaWatch.filter((x: string) => x !== f)
                              : [...fazendaWatch, f]
                            setValue('fazenda', next, { shouldValidate: true })
                            clearErrors('fazenda')
                          }}
                        >
                          <Check
                            className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                          />
                          {f}
                        </CommandItem>
                      )
                    })}
                    {grupoWatch && (
                      <CommandItem
                        value="Outra"
                        onSelect={() => {
                          const isSelected = fazendaWatch.includes('Outra')
                          const next = isSelected
                            ? fazendaWatch.filter((x: string) => x !== 'Outra')
                            : [...fazendaWatch, 'Outra']
                          setValue('fazenda', next, { shouldValidate: true })
                          clearErrors('fazenda')
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            fazendaWatch.includes('Outra') ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        Outra (Não listada)
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Input escondido para manter o react-hook-form preenchido e poder fazer o hook das validações */}
          <input
            type="hidden"
            {...register('fazenda', {
              validate: (v) => (v && v.length > 0) || 'Selecione ao menos uma fazenda',
            })}
          />

          {errors.fazenda && (
            <span className="text-red-500 text-sm block">{errors.fazenda.message as string}</span>
          )}
        </div>
      )}

      {fazendaWatch.includes('Outra') && grupoWatch !== 'Outro' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-2">
          <Label className="text-base text-slate-600 font-semibold">
            Nome da(s) Fazenda(s) Não Listada(s) <span className="text-red-500">*</span>
          </Label>
          <Input
            className={cn(
              'h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white',
              errors.fazenda_custom && 'border-red-500',
            )}
            placeholder="Digite o nome (separe por vírgula se mais de uma)"
            {...register('fazenda_custom', {
              validate: (v: string) =>
                !watch('fazenda')?.includes('Outra') || !!v || 'Nome da fazenda é obrigatório',
            })}
          />
          {errors.fazenda_custom && (
            <span className="text-red-500 text-sm block">
              {errors.fazenda_custom.message as string}
            </span>
          )}
        </div>
      )}

      <div className="pt-4">
        <Button
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto h-14 px-10 text-lg shadow-md"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

export function SurveyInputs({ step, form, onNext, onSubmit, isSubmitting }: any) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
    clearErrors,
  } = form as UseFormReturn<any>
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
                            setValue('curso_vagas_homens', { ...cursoVagasHomens, [opt]: val })
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
                            setValue('curso_vagas_mulheres', { ...cursoVagasMulheres, [opt]: val })
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

  if (step.type === 'review') {
    const cursos = watch('cursos') || []
    const vagas = watch('curso_vagas') || {}
    const modalidades = watch('modalidade') || ''
    const infraestrutura = watch('infraestrutura') || ''

    return (
      <div className="space-y-8 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Cursos Selecionados</h3>
          {cursos.length > 0 ? (
            <div className="grid gap-3">
              {cursos.map((c: string) => (
                <Card key={c} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4 flex justify-between items-center gap-4">
                    <span className="font-semibold text-slate-700 leading-tight">{c}</span>
                    <div className="shrink-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                      {vagas[c] || 0} vagas
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-200">
              Nenhum curso selecionado.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Modalidade e Local</h3>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-500">Modalidade:</span>
                <span className="font-semibold text-slate-700 text-right">
                  {modalidades || 'Não definida'}
                </span>
              </div>
              {infraestrutura && (
                <div className="flex justify-between items-start gap-4 pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Infraestrutura:</span>
                  <span className="font-semibold text-slate-700 text-right">{infraestrutura}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <p className="font-medium">As informações prestadas são protegidas pela LGPD.</p>
          </div>
          <Button
            size="lg"
            onClick={onNext}
            disabled={isSubmitting || cursos.length === 0}
            className="w-full h-14 text-lg font-bold shadow-md"
          >
            {isSubmitting ? 'Processando...' : 'Confirmar e Enviar Mapeamento'}
          </Button>
        </div>
      </div>
    )
  }

  if (step.type === 'identification') {
    return <IdentificationStep step={step} form={form} onNext={onNext} />
  }

  return null
}
