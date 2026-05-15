import { Link } from 'react-router-dom'
import { Lock, LayoutDashboard, Database } from 'lucide-react'
import { useAuth } from '@/stores/auth'
import { SurveyContainer } from '@/components/survey/SurveyContainer'
import abapaLogo from '@/assets/abapa-7ed0c.jpeg'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function Index() {
  const { isAuthenticated } = useAuth()
  const [dbStatus, setDbStatus] = useState<'loading' | 'active' | 'waiting'>('loading')

  useEffect(() => {
    const checkDb = async () => {
      try {
        const { count, error } = await supabase
          .from('fazendas')
          .select('*', { count: 'exact', head: true })
        if (error) throw error
        setDbStatus(count && count > 0 ? 'active' : 'waiting')
      } catch (err) {
        setDbStatus('waiting')
      }
    }
    checkDb()
  }, [])

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] relative overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header / Topbar */}
        <header className="px-5 sm:px-8 py-4 flex items-center justify-between border-b bg-white shadow-sm shrink-0 z-20">
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
            {dbStatus !== 'loading' && (
              <div
                className={cn(
                  'hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ml-2 cursor-help',
                  dbStatus === 'active'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200',
                )}
                title={
                  dbStatus === 'active'
                    ? 'Banco de dados sincronizado com sucesso'
                    : 'ATENÇÃO: Importe a planilha no Supabase conectado (tabela fazendas)!'
                }
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    dbStatus === 'active' ? 'bg-green-500' : 'bg-red-500 animate-pulse',
                  )}
                />
                {dbStatus === 'active' ? 'DB Sincronizado' : 'Falta Importar Planilha'}
              </div>
            )}
          </div>
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
        </header>

        {/* Aviso sobre importação de dados */}
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 shrink-0 z-20">
          <div className="max-w-3xl mx-auto flex items-start gap-3 text-sm text-blue-800">
            <Database className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <strong>Aviso de Atualização da Base de Dados:</strong> Por restrições de segurança do
              sistema, os dados da nova planilha não podem ser injetados automaticamente no código
              ou no banco. Para descartar os dados antigos e usar os novos da planilha, por favor,
              acesse o <strong>Table Editor do seu painel do Supabase</strong>, selecione a tabela{' '}
              <code>fazendas</code>, exclua todos os registros atuais e faça o upload da nova
              planilha usando a opção <strong>Insert {'>'} Import data from CSV</strong>.
            </div>
          </div>
        </div>

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
