import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Paperclip, Mic } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <div className="p-3 bg-[#f0f2f5] flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-slate-500 shrink-0 hover:bg-slate-200 rounded-full"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem"
          className="rounded-full bg-white border-0 shadow-sm px-4 py-6 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
          autoComplete="off"
        />
      </form>
      {text.trim() ? (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          size="icon"
          className="rounded-full bg-[#00a884] hover:bg-[#008f6f] shrink-0 h-12 w-12 shadow-sm transition-transform active:scale-95"
        >
          <Send className="h-5 w-5 text-white ml-1" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-slate-500 shrink-0 hover:bg-slate-200 rounded-full h-12 w-12"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
