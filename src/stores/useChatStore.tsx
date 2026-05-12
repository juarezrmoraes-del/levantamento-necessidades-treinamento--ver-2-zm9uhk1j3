import { create } from 'zustand'
import { ChatData, CursoSolicitado } from '@/types/chat'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: string
  options?: string[]
}

interface ChatStore {
  messages: Message[]
  isTyping: boolean
  step: number
  tempCourse: Partial<CursoSolicitado>
  chatData: Partial<ChatData>
  addMessage: (message: Message) => void
  setTyping: (isTyping: boolean) => void
  clearMessages: () => void
  setStep: (step: number) => void
  updateTempCourse: (course: Partial<CursoSolicitado>) => void
  updateChatData: (data: Partial<ChatData>) => void
  finalizeCurrentCourse: (courseUpdate?: Partial<CursoSolicitado>) => void
  resetSession: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isTyping: false,
  step: 1,
  tempCourse: {},
  chatData: {},
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [] }),
  setStep: (step) => set({ step }),
  updateTempCourse: (course) =>
    set((state) => ({ tempCourse: { ...state.tempCourse, ...course } })),
  updateChatData: (data) =>
    set((state) => {
      const newData = { ...state.chatData }
      if (data.dados_solicitante) {
        newData.dados_solicitante = { ...newData.dados_solicitante, ...data.dados_solicitante }
      }
      if (data.status_coleta) newData.status_coleta = data.status_coleta
      if (data.sugestao_futura) newData.sugestao_futura = data.sugestao_futura
      if (data.cursos_solicitados) newData.cursos_solicitados = data.cursos_solicitados
      return { chatData: newData }
    }),
  finalizeCurrentCourse: (courseUpdate) =>
    set((state) => {
      const finalCourse = { ...state.tempCourse, ...courseUpdate } as CursoSolicitado
      return {
        chatData: {
          ...state.chatData,
          cursos_solicitados: [...(state.chatData.cursos_solicitados || []), finalCourse],
        },
        tempCourse: {}, // Limpa o tempCourse para um novo ciclo de curso
      }
    }),
  resetSession: () =>
    set({
      messages: [],
      isTyping: false,
      step: 1,
      tempCourse: {},
      chatData: {},
    }),
}))
