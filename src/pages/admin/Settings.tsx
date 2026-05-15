import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Save, Bell, Mail, Send, LogIn } from 'lucide-react'
import useMainStore from '@/stores/main'
import { useAuth } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { toast } from '@/hooks/use-toast'

export default function Settings() {
  const { user } = useAuth()
  const { settings, updateSettings } = useMainStore()
  const { addLog } = useAuditStore()
  const [formData, setFormData] = useState(
    settings || {
      scheduled_report_active: false,
      scheduled_report_emails: '',
      notification_email: '',
    },
  )

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  if (!user || user.role !== 'Administrator') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-zinc-800">Acesso Restrito</h2>
          <p className="text-zinc-500 max-w-md">
            Acesso restrito a Administradores. Faça login para visualizar e modificar configurações
            do sistema.
          </p>
        </div>
        {!user && (
          <Link to="/login">
            <Button className="bg-[#00a884] hover:bg-[#008f6f] text-white">
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </Link>
        )}
      </div>
    )
  }

  const handleSave = async () => {
    await updateSettings(formData)
    await addLog({
      user_name: user?.name || '',
      user_email: user?.email || '',
      action: 'UPDATE',
      entity_type: 'SETTINGS',
      entity_id: '1',
      details: 'Atualizou configurações de notificação do sistema',
    })
    toast({
      title: 'Configurações Salvas',
      description: 'As opções foram atualizadas com sucesso.',
    })
  }

  const handleSendNow = () => {
    toast({
      title: 'Relatório Enviado',
      description: `Planilha de LNT enviada para: ${formData?.scheduled_report_emails || ''}`,
    })
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-y-auto no-scrollbar">
      <div className="max-w-[800px] w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Integrações e Notificações</h1>
          <p className="text-sm text-zinc-500">
            Configure alertas e envios automáticos dos relatórios.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-indigo-500" /> Relatórios Agendados
              </CardTitle>
              <CardDescription>
                Envio automático de planilhas com os dados coletados a cada 12 horas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${formData?.scheduled_report_active ? 'bg-green-500' : 'bg-zinc-300'}`}
                  />
                  <span className="text-sm font-medium text-zinc-800">
                    {formData?.scheduled_report_active ? 'Automação Ativa' : 'Automação Inativa'}
                  </span>
                </div>
                <Switch
                  checked={!!formData?.scheduled_report_active}
                  onCheckedChange={(c) =>
                    setFormData((prev: any) => ({ ...prev, scheduled_report_active: c }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>E-mails Destinatários (separados por vírgula)</Label>
                <Input
                  value={formData?.scheduled_report_emails || ''}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      scheduled_report_emails: e.target.value,
                    }))
                  }
                  placeholder="Ex: ct9@abapa.com.br, gerente.ct@abapa.com.br"
                />
              </div>
              <Button variant="outline" onClick={handleSendNow} className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2 text-indigo-500" /> Enviar Teste Agora
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-[#00a884]" /> Alertas Administrativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail Padrão para Notificações</Label>
                <Input
                  type="email"
                  value={formData?.notification_email || ''}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, notification_email: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-start pb-10">
          <Button
            onClick={handleSave}
            className="bg-[#00a884] hover:bg-[#008f6f] text-white shadow-sm px-8"
          >
            <Save className="mr-2 h-4 w-4" /> Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
