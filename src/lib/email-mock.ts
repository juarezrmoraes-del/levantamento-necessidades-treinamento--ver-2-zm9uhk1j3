import { toast } from '@/hooks/use-toast'

export function simulateEmail(to: string, subject: string, template: string) {
  toast({
    title: '📧 E-mail Automático Disparado',
    description: `Enviado para: ${to}`,
  })

  console.log(`
======================================
📧 E-MAIL SIMULADO (ABAPA LNT)
======================================
Para:    ${to}
Assunto: ${subject}
--------------------------------------
${template}
======================================
  `)
}
