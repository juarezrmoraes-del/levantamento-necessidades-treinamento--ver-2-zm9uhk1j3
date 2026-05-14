import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useMainStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'
import { getNextStep, getPrevStep, STEPS_CONFIG } from '@/lib/survey-flow'
import { SurveyInputs } from './SurveyInputs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'

export function SurveyContainer() {
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('abapa_survey_submitted_protocol')) {
      setIsSuccess(true)
    } else {
      const draft = localStorage.getItem('abapa_survey_draft')
      if (draft) {
        setHasDraft(true)
      }
    }
    setDraftLoaded(true)
  }, [])

  const { addSurveys } = useMainStore()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      funcao: '',
      nome: '',
      whatsapp: '',
      email: '',
      grupo: '',
      fazenda: [] as string[],
      fazenda_custom: '',
      localizacao: '',
      tamanho: '',
      cultura: '',
      sistema: '',
      gargalo: '',
      desafio: '',
      setor: '',
      cursos: [] as string[],
      curso_marcas: {} as Record<string, string[]>,
      curso_vagas: {} as Record<string, string>,
      curso_vagas_homens: {} as Record<string, string>,
      curso_vagas_mulheres: {} as Record<string, string>,
      volume_vagas: '',
      modalidade: '',
      infraestrutura: '',
      epoca: '',
      inovacao: '',
    },
  })

  useEffect(() => {
    if (!draftLoaded || isSuccess || hasDraft) return
    const subscription = form.watch((value) => {
      localStorage.setItem('abapa_survey_draft', JSON.stringify({ values: value, stepIndex }))
    })
    return () => subscription.unsubscribe()
  }, [form, form.watch, stepIndex, draftLoaded, isSuccess, hasDraft])

  const restoreDraft = () => {
    const draftStr = localStorage.getItem('abapa_survey_draft')
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr)
        if (draft.values && typeof draft.values.fazenda === 'string') {
          draft.values.fazenda = draft.values.fazenda ? [draft.values.fazenda] : []
        }
        form.reset(draft.values)
        setStepIndex(draft.stepIndex || 0)
      } catch (e) {
        console.error('Error parsing draft:', e)
      }
    }
    setHasDraft(false)
  }

  const discardDraft = () => {
    localStorage.removeItem('abapa_survey_draft')
    setHasDraft(false)
  }

  const handleNext = async () => {
    if (hasDraft) setHasDraft(false)

    const step = STEPS_CONFIG[stepIndex]
    const values = form.getValues()

    let isValid = true
    if (step.id === 'identificacao') {
      const fieldsToValidate = ['nome', 'whatsapp', 'grupo', 'fazenda']
      if ((values.fazenda || []).includes('Outra')) fieldsToValidate.push('fazenda_custom')
      isValid = await form.trigger(fieldsToValidate as any)
    } else if (step.id !== 'revisao') {
      isValid = await form.trigger(step.id as any)
    }

    if (!isValid) return

    const nextIdx = getNextStep(stepIndex, values)
    if (nextIdx >= STEPS_CONFIG.length) {
      form.handleSubmit(onSubmit)()
      return
    }

    setStepIndex(nextIdx)
  }

  const handlePrev = () => setStepIndex((prev) => getPrevStep(prev, form.getValues()))

  const onSubmit = async (values: any) => {
    setIsSubmitting(true)
    const protocolNumber = `TRN-${new Date().getFullYear()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`

    const finalFazendasList = (values.fazenda || []).filter((f: string) => f !== 'Outra')
    if ((values.fazenda || []).includes('Outra') && values.fazenda_custom) {
      finalFazendasList.push(values.fazenda_custom)
    }
    const finalFazenda = finalFazendasList.join(', ')

    const records = (values.cursos || []).map((curso: string) => {
      const marcas = values.curso_marcas?.[curso] || []
      const vagas = values.curso_vagas?.[curso] || ''
      const vagasHomens = values.curso_vagas_homens?.[curso] || ''
      const vagasMulheres = values.curso_vagas_mulheres?.[curso] || ''
      const cursoFinal = marcas.length > 0 ? `${curso} (Marcas: ${marcas.join(', ')})` : curso

      return {
        protocol: protocolNumber,
        nome: values.nome,
        fazenda_grupo: finalFazenda,
        celular: values.whatsapp,
        email: values.email,
        area_foco: values.setor,
        curso_solicitado: cursoFinal,
        quantidade_colaboradores: vagas,
        vagas_homens: vagasHomens || '0',
        vagas_mulheres: vagasMulheres || '0',
        local_realizacao: values.modalidade,
        mes_previsto: values.epoca,
        desafio_roi: values.desafio,
        funcao: values.funcao,
        localizacao: values.localizacao,
        tamanho: values.tamanho,
        cultura: values.cultura,
        sistema: values.sistema,
        gargalo: values.gargalo,
        infraestrutura: values.infraestrutura,
        inovacao: values.inovacao,
      }
    })

    try {
      try {
        await supabase.from('survey_leads').insert([
          {
            nome: values.nome,
            whatsapp: values.whatsapp,
            email: values.email || null,
            fazenda: finalFazenda || null,
            grupo: values.grupo || null,
            status: 'completed',
          },
        ])
      } catch (err) {
        console.error('Failed to save lead info:', err)
      }

      if (records.length > 0) {
        await addSurveys(records)

        try {
          await supabase.functions.invoke('send-survey-email', {
            body: {
              to: values.email,
              protocol: protocolNumber,
              nome: values.nome,
              fazenda: finalFazenda,
              grupo: values.grupo,
              cursos: records.map((r) => r.curso_solicitado),
              vagas: records.reduce(
                (acc, r) => acc + parseInt(r.quantidade_colaboradores || '0'),
                0,
              ),
              vagas_homens: records.reduce((acc, r) => acc + parseInt(r.vagas_homens || '0'), 0),
              vagas_mulheres: records.reduce(
                (acc, r) => acc + parseInt(r.vagas_mulheres || '0'),
                0,
              ),
            },
          })
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail de confirmação:', emailErr)
        }
      }
      sessionStorage.setItem('abapa_survey_submitted_protocol', protocolNumber)
      localStorage.removeItem('abapa_survey_draft')
      setIsSuccess(true)
    } catch (err) {
      toast({ title: 'Erro ao enviar', description: 'Tente novamente.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 p-6">
        <CheckCircle2 className="w-24 h-24 text-primary" />
        <h2 className="text-3xl font-bold text-slate-800">Mapeamento Concluído!</h2>
        <p className="text-slate-600 max-w-md text-lg">
          Agradecemos sua participação. Suas necessidades de treinamento foram registradas com
          sucesso e ajudarão a ABAPA a preparar as melhores capacitações para sua equipe.
        </p>
        <Button
          onClick={() => {
            sessionStorage.removeItem('abapa_survey_submitted_protocol')
            window.location.reload()
          }}
          variant="outline"
          className="mt-4"
          size="lg"
        >
          Realizar novo mapeamento
        </Button>
      </div>
    )
  }

  const step = STEPS_CONFIG[stepIndex]
  const progress = ((stepIndex + 1) / STEPS_CONFIG.length) * 100

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full p-5 sm:p-8">
      {hasDraft && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
          <p className="text-sm text-slate-700 font-medium">
            Identificamos um mapeamento em andamento. Deseja continuar de onde parou?
          </p>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none border-slate-200"
              onClick={discardDraft}
            >
              Reiniciar
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={restoreDraft}>
              Restaurar
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8 sm:mb-12 pt-2">
        {stepIndex > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="rounded-full shrink-0 text-slate-500 hover:text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        ) : (
          <div className="w-10 h-10 shrink-0" />
        )}
        <Progress value={progress} className="h-2.5 flex-1 bg-slate-200" />
        <span className="text-sm text-slate-400 font-bold shrink-0">
          {stepIndex + 1} / {STEPS_CONFIG.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div
          key={step.id}
          className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-8 sm:mb-10 leading-tight">
            {step.title}
          </h1>

          <SurveyInputs
            step={step}
            form={form}
            onNext={handleNext}
            onSubmit={form.handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
