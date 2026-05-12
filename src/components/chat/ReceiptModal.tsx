import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, Printer } from 'lucide-react'
import abapaLogo from '@/assets/abapa-7ed0c.jpeg'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  protocolNumber: string
  date: string
}

export function ReceiptModal({ isOpen, onClose, protocolNumber, date }: ReceiptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="flex flex-col items-center gap-3 pt-6">
          <img src={abapaLogo} alt="ABAPA Logo" className="h-16 w-auto object-contain mb-2" />
          <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-1 shadow-sm">
            <CheckCircle2 className="h-8 w-8 text-[#00a884]" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-800">
            Solicitação Concluída
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Sua solicitação de treinamento foi registrada com sucesso.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 p-5 rounded-xl my-4 space-y-4 border shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Protocolo</span>
            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border shadow-sm">
              {protocolNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Data da Solicitação</span>
            <span className="font-medium text-slate-700">{date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Status</span>
            <span className="text-sm font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-sm">
              Em Análise
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button className="flex-1 bg-[#00a884] hover:bg-[#008f6f] text-white" onClick={onClose}>
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
