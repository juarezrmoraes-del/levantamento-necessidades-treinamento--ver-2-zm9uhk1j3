import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChatMachine } from '@/lib/chat-machine'

export default function ChatAssistant() {
  const [input, setInput] = useState('')
  const { state, messages, sendMessage } = useChatMachine()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, state])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || state === 'processing') return
    sendMessage(input)
    setInput('')
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-3xl mx-auto border-x bg-background">
      <header className="flex items-center p-4 border-b shrink-0">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg leading-none">Assistente ABAPA</h1>
            <p className="text-sm text-muted-foreground mt-1">Dúvidas sobre o mapeamento</p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8 shrink-0">
                {msg.role === 'user' ? (
                  <AvatarFallback className="bg-muted">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted rounded-tl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[10px] opacity-70 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          {state === 'processing' && (
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="px-4 py-3 rounded-lg bg-muted rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-.3s]" />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-.5s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Digite sua dúvida..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={state === 'processing'}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || state === 'processing'}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
