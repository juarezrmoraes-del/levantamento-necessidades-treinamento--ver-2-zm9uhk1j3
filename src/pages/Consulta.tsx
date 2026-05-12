import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search } from 'lucide-react'
import abapaLogo from '@/assets/abapa-7ed0c.jpeg'
import useMainStore from '@/stores/main'
import { cn } from '@/lib/utils'

export default function Consulta() {
  const [protocol, setProtocol] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const { surveys } = useMainStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!protocol.trim()) return

    const searchVal = protocol.trim().toLowerCase()
    const found = surveys.find(
      (s) => s.protocol?.toLowerCase() === searchVal || s.id.toLowerCase() === searchVal,
    )

    if (found) {
      setResult(found.status)
    } else {
      setResult('not_found')
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden">
      <div className="flex items-center p-4 border-b bg-white sticky top-0 shadow-sm z-10">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <img src={abapaLogo} alt="ABAPA Logo" className="h-8 w-auto object-contain" />
        <h1 className="ml-4 font-semibold text-slate-800">Consulta de Protocolo</h1>
      </div>

      <div className="flex-1 p-6 max-w-md w-full mx-auto mt-10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Número do Protocolo
            </label>
            <Input
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              placeholder="Ex: TRN-2026-1234"
              className="w-full bg-white"
            />
          </div>
          <Button type="submit" className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white">
            <Search className="h-4 w-4 mr-2" />
            Consultar
          </Button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-white border rounded-xl shadow-sm text-center animate-fade-in-up">
            <h3 className="font-medium text-slate-500 text-sm mb-3">Status da Solicitação</h3>
            <span
              className={cn(
                'inline-block px-4 py-2 font-bold rounded-full border shadow-sm',
                result === 'Aprovado' && 'bg-green-100 text-green-800 border-green-200',
                result === 'Pendente' && 'bg-amber-100 text-amber-800 border-amber-200',
                result === 'Em Análise' && 'bg-blue-100 text-blue-800 border-blue-200',
                result === 'Rejeitado' && 'bg-rose-100 text-rose-800 border-rose-200',
                result === 'Programado' && 'bg-indigo-100 text-indigo-800 border-indigo-200',
                result === 'Concluído' && 'bg-slate-100 text-slate-800 border-slate-200',
                result === 'not_found' && 'bg-slate-100 text-slate-600 border-slate-200',
              )}
            >
              {result === 'not_found' ? 'Protocolo Não Encontrado' : result}
            </span>
            <p className="text-sm text-slate-500 mt-4">
              {result === 'not_found'
                ? 'Verifique se o número do protocolo foi digitado corretamente.'
                : 'Sua solicitação está sendo acompanhada pela nossa equipe.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
