import { useState, useCallback } from 'react'

export type ChatState = 'idle' | 'processing' | 'error'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function useChatMachine() {
  const [state, setState] = useState<ChatState>('idle')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Olá! Sou o assistente de suporte da ABAPA. Como posso ajudar com o seu mapeamento de treinamentos hoje?',
      timestamp: Date.now(),
    },
  ])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setState('processing')

    // Lógica simplificada de resposta simulada para a máquina de estados
    setTimeout(() => {
      const lowerContent = content.toLowerCase()
      let responseText =
        'Entendi. Se houver mais dúvidas, por favor não hesite em perguntar ou consultar o manual de treinamentos da ABAPA.'

      if (lowerContent.includes('protocolo')) {
        responseText =
          "Para consultar o seu protocolo, você pode voltar à página inicial e clicar em 'Consulta'. Insira o código que você recebeu ao finalizar o envio."
      } else if (lowerContent.includes('curso') || lowerContent.includes('treinamento')) {
        responseText =
          "A ABAPA oferece diversos cursos nas áreas de Operação de Máquinas, NR's, Gestão Agrícola e mais. Ao preencher o formulário, você pode mapear vagas para todos os cursos desejados."
      } else if (lowerContent.includes('erro') || lowerContent.includes('problema')) {
        responseText =
          'Se você está enfrentando problemas técnicos, tente recarregar a página ou refazer o envio garantindo que todos os campos obrigatórios estejam preenchidos.'
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      setState('idle')
    }, 1500)
  }, [])

  return { state, messages, sendMessage }
}
