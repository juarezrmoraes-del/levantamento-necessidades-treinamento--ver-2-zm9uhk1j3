import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUsers, AdminUser, UserRole } from '@/stores/users'
import { useAuth } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, LogIn } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Users() {
  const { user: currentUser } = useAuth()
  const { users, addUser, updateUser, deleteUser } = useUsers()
  const { addLog } = useAuditStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '' as UserRole | '',
    active: true,
    password: '',
  })

  if (!currentUser || currentUser.role !== 'Administrator') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-zinc-800">Acesso Restrito</h2>
          <p className="text-zinc-500 max-w-md">
            Apenas Administradores podem gerenciar usuários. Faça login com uma conta com
            privilégios de administrador para acessar esta seção.
          </p>
        </div>
        {!currentUser && (
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

  const handleOpenNew = () => {
    setEditingUser(undefined)
    setFormData({ name: '', email: '', department: '', role: '', active: true, password: '' })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (u: AdminUser) => {
    setEditingUser(u)
    setFormData({
      name: u.name,
      email: u.email,
      department: u.department || '',
      role: u.role,
      active: u.active,
      password: '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      const success = await deleteUser(id)
      if (success) {
        await addLog({
          user_name: currentUser?.name || '',
          user_email: currentUser?.email || '',
          action: 'DELETE',
          entity_type: 'USER',
          entity_id: id,
          details: `Removeu usuário ${id}`,
        })
        toast({ title: 'Usuário Removido' })
      }
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      return toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios (Nome, E-mail e Nível de Acesso).',
        variant: 'destructive',
      })
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      role: formData.role as UserRole,
      active: formData.active,
    }

    if (editingUser) {
      const success = await updateUser(editingUser.id, userData)
      if (success) {
        await addLog({
          user_name: currentUser?.name || '',
          user_email: currentUser?.email || '',
          action: 'UPDATE',
          entity_type: 'USER',
          entity_id: editingUser.id,
          details: `Atualizou usuário ${userData.email}`,
        })
        toast({ title: 'Sucesso', description: 'Usuário atualizado.' })
      }
    } else {
      if (!formData.password) {
        return toast({
          title: 'Atenção',
          description: 'Senha é obrigatória para novos usuários.',
          variant: 'destructive',
        })
      }
      const success = await addUser(userData, formData.password)
      if (success) {
        await addLog({
          user_name: currentUser?.name || '',
          user_email: currentUser?.email || '',
          action: 'CREATE',
          entity_type: 'USER',
          entity_id: userData.email,
          details: `Criou usuário ${userData.email}`,
        })
        toast({ title: 'Sucesso', description: 'Usuário adicionado.' })
      }
    }
    setIsDialogOpen(false)
  }

  const roleColors: Record<string, string> = {
    Administrator: 'bg-purple-100 text-purple-800 border-purple-200',
    Manager: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Viewer: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  }

  const roleLabels: Record<string, string> = {
    Administrator: 'Administrador',
    Manager: 'Gestor',
    Viewer: 'Visualizador',
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1000px] w-full mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gestão de Usuários</h1>
          <p className="text-sm text-zinc-500">
            Gerencie perfis, departamentos e níveis de acesso.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="bg-[#00a884] hover:bg-[#008f6f] text-white">
          <Plus className="h-4 w-4 mr-2" /> Adicionar Usuário
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-zinc-900">{u.name}</TableCell>
                <TableCell className="text-zinc-600">{u.email}</TableCell>
                <TableCell className="text-zinc-600">{u.department || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColors[u.role] || roleColors.Viewer}>
                    {roleLabels[u.role] || u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      u.active
                        ? 'border-green-200 text-green-700 bg-green-50'
                        : 'border-red-200 text-red-700 bg-red-50'
                    }
                  >
                    {u.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)}>
                    <Edit className="h-4 w-4 text-zinc-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Perfil' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                E-mail <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>
                  Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Senha inicial"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Ex: RH, TI..."
              />
            </div>
            <div className="space-y-2">
              <Label>
                Nível de Acesso <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrador</SelectItem>
                  <SelectItem value="Manager">Gestor</SelectItem>
                  <SelectItem value="Viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 mt-2">
              <div>
                <Label className="text-base">Acesso Ativo</Label>
                <p className="text-xs text-zinc-500">Permitir login no sistema.</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(c) => setFormData({ ...formData, active: c })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#00a884] text-white hover:bg-[#008f6f]">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
