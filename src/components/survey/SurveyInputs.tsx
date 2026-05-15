import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCursosCategory, hasMachineCourse, getMarcasForCourse } from '@/lib/survey-flow'
import { Check, ChevronsUpDown, Plus, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

let cachedFazendasData: any[] | null = null
let fetchFazendasPromise: Promise<any[]> | null = null

const getFazendasData = async () => {
  if (cachedFazendasData) return cachedFazendasData
  if (fetchFazendasPromise) return fetchFazendasPromise

  fetchFazendasPromise = (async () => {
    let allData: any[] = []
    let from = 0
    const step = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('fazendas')
        .select('grupo, fazenda')
        .range(from, from + step - 1)

      if (error || !data || data.length === 0) {
        hasMore = false
      } else {
        allData = [...allData, ...data]
        from += step
        if (data.length < step) hasMore = false
      }
    }
    cachedFazendasData = allData
    return allData
  })()

  return fetchFazendasPromise
}

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

  const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)

  const grupoWatch = watch('grupo')
  const fazendaWatch = watch('fazenda') || []

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    setIsCreatingGroup(true)
    try {
      const name = newGroupName.trim()

      const exists = grupos.some((g) => g.toUpperCase() === name.toUpperCase())
      if (exists) {
        toast({
          title: 'Grupo já existe',
          description: 'Este grupo já está na lista.',
          variant: 'destructive',
        })
        setIsCreatingGroup(false)
        return
      }

      const { error } = await supabase.from('fazendas').insert([
        {
          grupo: name,
          fazenda: null,
        },
      ])

      if (error) throw error

      setGrupos((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)))

      setValue('grupo', name, { shouldValidate: true })
      setValue('fazenda', [])
      clearErrors('grupo')

      if (cachedFazendasData) {
        cachedFazendasData.push({ grupo: name, fazenda: null })
      }

      setOpenNewGroupDialog(false)
      setNewGroupName('')
      toast({
        title: 'Grupo criado',
        description: 'O novo grupo foi adicionado com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao criar grupo',
        description: error.message || 'Não foi possível adicionar o grupo.',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingGroup(false)
    }
  }

  useEffect(() => {
    const fetchGrupos = async () => {
      setLoadingGrupos(true)
      try {
        const data = await getFazendasData()
        const grupoMap = new Map<string, string>()
        data.forEach((d) => {
          const g = d.grupo?.trim()
          if (g) {
            const key = g.toUpperCase()
            if (!grupoMap.has(key)) {
              grupoMap.set(key, g)
            }
          }
        })
        const uniqueGrupos = Array.from(grupoMap.values()).sort((a, b) => a.localeCompare(b))
        setGrupos(uniqueGrupos)
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
      const loadFazendas = async () => {
        try {
          const allData = await getFazendasData()

          const matchingFazendas = allData
            .filter((d) => d.grupo?.trim().toUpperCase() === grupoWatch.trim().toUpperCase())
            .map((d) => d.fazenda?.trim())
            .filter(Boolean)

          const fazendaMap = new Map<string, string>()
          matchingFazendas.forEach((f) => {
            const key = f.toUpperCase()
            if (!fazendaMap.has(key)) {
              fazendaMap.set(key, f)
            }
          })

          const uniqueFazendas = Array.from(fazendaMap.values()).sort((a, b) => a.localeCompare(b))
          setFazendas(uniqueFazendas)
        } catch (err) {
          console.error('Erro ao carregar fazendas:', err)
          setFazendas([])
        }
      }
      loadFazendas()
    } else {
      setFazendas([])
    }
  }, [grupoWatch])

  return (
    <div className="space-y-5 max-w-lg pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!loadingGrupos && grupos.length === 0 && (
        <Alert className="bg-red-50 text-red-900 border-red-200 shadow-sm">
          <Database className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 font-bold text-base">
            Ação Necessária: Importar Dados no Banco
          </AlertTitle>
          <AlertDescription className="text-red-800 text-sm mt-2 flex flex-col gap-3">
            <p>
              Os dados da planilha não podem ser inseridos automaticamente no código. Para que os
              grupos e fazendas apareçam corretamente aqui, você deve{' '}
              <strong>importar a planilha no seu banco de dados conectado (Supabase)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acesse o seu painel do Supabase.</li>
              <li>
                Abra a tabela <strong>fazendas</strong>.
              </li>
              <li>
                Importe as linhas da planilha CSV/Excel para popular as colunas <code>grupo</code> e{' '}
                <code>fazenda</code>.
              </li>
            </ul>
            <p className="font-medium text-red-900 mt-1">
              Caso ainda não tenha um backend conectado, conecte um via painel antes de importar os
              dados.
            </p>
            <p className="text-red-700 mt-2">
              Enquanto os dados não são importados, você pode utilizar a opção{' '}
              <strong>"Outro (Não listado)"</strong> abaixo para continuar os testes.
            </p>
          </AlertDescription>
        </Alert>
      )}

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
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpenGrupo(false)
                      setOpenNewGroupDialog(true)
                    }}
                    className="text-primary font-medium cursor-pointer flex items-center py-3"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Novo Grupo
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={openNewGroupDialog} onOpenChange={setOpenNewGroupDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                <Label htmlFor="new-group-name" className="text-sm font-semibold text-slate-700">
                  Nome do Grupo
                </Label>
                <Input
                  id="new-group-name"
                  placeholder="Ex: Grupo Agrícola São João"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateGroup()
                    }
                  }}
                  className="h-12"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenNewGroupDialog(false)}
                disabled={isCreatingGroup}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={isCreatingGroup || !newGroupName.trim()}
              >
                {isCreatingGroup ? 'Salvando...' : 'Salvar Grupo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                disabled={!grupoWatch}
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
                    {fazendas.length > 1 && (
                      <CommandItem
                        value="selecionar-todas"
                        onSelect={() => {
                          const allSelected = fazendas.every((f) => fazendaWatch.includes(f))
                          if (allSelected) {
                            setValue(
                              'fazenda',
                              fazendaWatch.filter((x: string) => x === 'Outra'),
                              { shouldValidate: true },
                            )
                          } else {
                            const hasOutra = fazendaWatch.includes('Outra')
                            setValue('fazenda', hasOutra ? [...fazendas, 'Outra'] : [...fazendas], {
                              shouldValidate: true,
                            })
                          }
                          clearErrors('fazenda')
                        }}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            fazendas.length > 0 && fazendas.every((f) => fazendaWatch.includes(f))
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible',
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-primary">
                          Selecionar todas as fazendas
                        </span>
                      </CommandItem>
                    )}
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
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
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
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            fazendaWatch.includes('Outra')
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible',
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
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

      <div className="space-y-2 pt-4">
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
        <Label className="text-base text-slate-600 font-semibold">
          E-mail (Para receber o extrato) <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          className={cn(
            'h-14 text-lg rounded-xl border-slate-300 focus-visible:ring-primary/50 bg-white',
            errors.email && 'border-red-500',
          )}
          placeholder="seu@email.com"
          {...register('email', {
            required: 'E-mail é obrigatório para envio do extrato',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'E-mail inválido',
            },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-sm block">{errors.email.message as string}</span>
        )}
      </div>

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
