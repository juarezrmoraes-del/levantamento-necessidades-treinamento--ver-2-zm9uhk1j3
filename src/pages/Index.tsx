import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, LayoutDashboard, Download, Loader2 } from 'lucide-react'
import { useAuth } from '@/stores/auth'
import useMainStore from '@/stores/main'
import { exportToCSV, formatSurveysForCSV } from '@/lib/export'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { SurveyContainer } from '@/components/survey/SurveyContainer'
import abapaLogo from '@/assets/abapa-7ed0c.jpeg'

export default function Index() {
  const { isAuthenticated } = useAuth()
  const { surveys, fetchSurveys } = useMainStore()
  const [isExporting, setIsExporting] = useState(false)

  const handleDownloadCSV = async () => {
    setIsExporting(true)
    toast({
      title: 'Gerando arquivo CSV...',
      description: 'Carregando base completa de levantamentos.',
    })

    try {
      let currentSurveys = surveys
      if (!currentSurveys || currentSurveys.length === 0) {
        await fetchSurveys()
        currentSurveys = useMainStore.getState().surveys
      }

      if (!currentSurveys || currentSurveys.length === 0) {
        toast({
          title: 'Nenhum registro encontrado',
          description: 'Ainda não há dados cadastrados para exportação.',
          variant: 'destructive',
        })
        return
      }

      const formattedData = formatSurveysForCSV(currentSurveys)
      const today = new Date().toISOString().split('T')[0]
      const filename = `levantamento-necessidades-${today}.csv`

      exportToCSV(formattedData, filename)

      toast({
        title: 'Download concluído!',
        description: `Exportados ${formattedData.length} registro(s) em ${filename}.`,
      })
    } catch (err: any) {
      console.error('Erro ao exportar CSV:', err)
      toast({
        title: 'Erro ao gerar CSV',
        description: err?.message || 'Ocorreu um erro ao gerar o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] relative overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header / Topbar */}
        <header className="px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b bg-white shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-3">
            <img
              src={abapaLogo}
              alt="ABAPA Logo"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = 'https://img.usecurling.com/i?q=leaf&color=green'
              }}
            />
            <div className="border-l border-slate-200 pl-3 ml-1 hidden sm:block">
              <h2 className="font-bold text-slate-800 text-sm leading-tight">
                Centro de Treinamento
              </h2>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                Levantamento de Demandas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={handleDownloadCSV}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900 transition-colors shadow-2xs"
              title="Baixar histórico completo de levantamentos em formato CSV"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin text-emerald-700" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5 text-emerald-700" />
              )}
              <span>{isExporting ? 'Exportando...' : 'Baixar CSV'}</span>
            </Button>

            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-slate-50"
            >
              {isAuthenticated ? (
                <LayoutDashboard className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isAuthenticated ? 'Dashboard' : 'Acesso Restrito'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Area - Form */}
        <main className="flex-1 overflow-hidden relative">
          <SurveyContainer />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-3 px-6 shrink-0 z-20">
          <p className="text-xs text-slate-500 font-medium text-center">
            🔒 As informações prestadas são protegidas pela LGPD (Lei Geral de Proteção de Dados).
          </p>
        </footer>
      </div>
    </div>
  )
}
