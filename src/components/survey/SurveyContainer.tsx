import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { STEPS_CONFIG, getNextStep, getPrevStep } from '@/lib/survey-flow'
import { SurveyInputs } from './SurveyInputs'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SurveyContainer() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm({
    defaultValues: {
      fazenda: [] as string[],
    },
  })

  const { watch, getValues } = form
  const data = watch()
  const step = STEPS_CONFIG[currentIdx]

  const handleNext = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    if (step.id === 'revisao') {
      submitForm()
    } else {
      setCurrentIdx(getNextStep(currentIdx, data))
    }
  }

  const handlePrev = () => {
    setCurrentIdx(getPrevStep(currentIdx, data))
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      const values = getValues()

      let fazendas = values.fazenda || []
      if (fazendas.includes('Outra')) {
        fazendas = fazendas.filter((f) => f !== 'Outra')
        if (values.fazenda_custom) {
          fazendas.push(...values.fazenda_custom.split(',').map((s: string) => s.trim()))
        }
      } else if (values.grupo === 'Outro' && values.fazenda_custom) {
        fazendas = [values.fazenda_custom.trim()]
      }

      const fazendasStr = fazendas.join(', ')

      const insertData = {
        nome: values.nome,
        whatsapp: values.whatsapp,
        email: values.email,
        grupo: values.grupo,
        fazenda: fazendasStr,
        funcao: values.funcao,
        localizacao: values.localizacao,
        tamanho: values.tamanho,
        cultura: values.cultura,
        sistema: values.sistema,
        gargalo: values.gargalo,
        desafio: values.desafio,
        setor: values.setor,
        cursos: values.cursos,
        vagas: values.curso_vagas,
        vagas_homens: values.curso_vagas_homens,
        vagas_mulheres: values.curso_vagas_mulheres,
        modalidade: values.modalidade,
        infraestrutura: values.infraestrutura,
        epoca: values.epoca,
        inovacao: values.inovacao,
        detalhes_cursos: values.curso_marcas,
      }

      const { data: leadData, error } = await supabase
        .from('survey_leads')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error

      if (values.grupo && values.grupo !== 'Outro') {
        const { data: fazendasData } = await supabase
          .from('fazendas')
          .select('grupo, email, fazenda')

        if (fazendasData && fazendasData.length > 0) {
          const matchingData = fazendasData.filter(
            (f) =>
              f.grupo?.trim() === values.grupo.trim() &&
              f.fazenda &&
              fazendas.includes(f.fazenda.trim()),
          )
          const emails = matchingData.map((f: any) => f.email).filter(Boolean)
          const uniqueEmails = Array.from(new Set(emails))

          for (const email of uniqueEmails) {
            await supabase.functions.invoke('send-survey-email', {
              body: {
                to: email,
                protocol: leadData.id,
                nome: values.nome,
                fazenda: fazendasStr,
                cursos: values.cursos,
                vagas: values.curso_vagas,
                vagas_homens: values.curso_vagas_homens,
                vagas_mulheres: values.curso_vagas_mulheres,
                is_admin: true,
              },
            })
          }
        }
      }

      if (values.email) {
        await supabase.functions.invoke('send-survey-email', {
          body: {
            to: values.email,
            protocol: leadData.id,
            nome: values.nome,
            fazenda: fazendasStr,
            cursos: values.cursos,
            vagas: values.curso_vagas,
            vagas_homens: values.curso_vagas_homens,
            vagas_mulheres: values.curso_vagas_mulheres,
            is_submitter: true,
          },
        })
      }

      // Envia cópia para o email de notificação do sistema
      const { data: settings } = await supabase
        .from('system_settings')
        .select('notification_email')
        .single()
      if (settings?.notification_email) {
        await supabase.functions.invoke('send-survey-email', {
          body: {
            to: settings.notification_email,
            protocol: leadData.id,
            nome: values.nome,
            fazenda: fazendasStr,
            cursos: values.cursos,
            vagas: values.curso_vagas,
            vagas_homens: values.curso_vagas_homens,
            vagas_mulheres: values.curso_vagas_mulheres,
            is_admin: true,
          },
        })
      }

      setIsSuccess(true)
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar',
        description: err.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-2xl shadow-sm animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto my-8 border">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Mapeamento Enviado!</h2>
        <p className="text-slate-600 text-lg mb-8 max-w-md">
          Suas necessidades de treinamento foram registradas com sucesso. A equipe do Centro de
          Treinamento entrará em contato em breve.
        </p>
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          className="px-8 shadow-md h-14 text-lg"
        >
          Novo Mapeamento
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center mb-8 shrink-0">
        {currentIdx > 0 && (
          <button
            onClick={handlePrev}
            className="flex items-center text-slate-500 hover:text-primary transition-colors font-medium mr-4 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </button>
        )}
        <div className="flex-1">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, (currentIdx / (STEPS_CONFIG.length - 1)) * 100)}%` }}
            />
          </div>
        </div>
        <span className="ml-4 text-sm font-bold text-slate-400 w-12 text-right">
          {currentIdx + 1} / {STEPS_CONFIG.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 leading-tight">
          {step.title}
        </h2>

        <SurveyInputs step={step} form={form} onNext={handleNext} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
