import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Share2, Copy, Download, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const PUBLIC_URL = 'https://levantamento-necessidades-treinamento-997e2.goskip.app'
const QR_API_URL = `https://quickchart.io/qr?text=${encodeURIComponent(PUBLIC_URL)}&size=400&margin=2`

export function ShareDialog() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_URL)
      setCopied(true)
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para sua área de transferência.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link automaticamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(QR_API_URL)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'abapa-lnt-qrcode.png'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download concluído',
        description: 'O QR Code foi salvo no seu dispositivo.',
      })
    } catch (error) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o QR Code no momento.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm">
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Compartilhar Levantamento</DialogTitle>
          <DialogDescription>
            Use o QR Code ou o link abaixo para compartilhar o formulário com os associados.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-2">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 shadow-inner flex items-center justify-center">
            <img
              src={QR_API_URL}
              alt="QR Code do Formulário LNT"
              className="w-48 h-48 object-contain mix-blend-multiply"
              crossOrigin="anonymous"
            />
          </div>
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-zinc-700 ml-1">Link Público</label>
            <div className="flex space-x-2">
              <Input
                readOnly
                value={PUBLIC_URL}
                className="bg-zinc-50 border-zinc-200 text-zinc-600 focus-visible:ring-0 font-medium truncate"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                type="button"
                variant={copied ? 'default' : 'secondary'}
                className="shrink-0 w-10 px-0 transition-all"
                onClick={handleCopy}
                title="Copiar link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-abapa-primary hover:bg-abapa-primary/90 text-white font-semibold h-11"
          >
            <Download className="mr-2 h-5 w-5" />
            {isDownloading ? 'Gerando arquivo...' : 'Baixar QR Code'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
