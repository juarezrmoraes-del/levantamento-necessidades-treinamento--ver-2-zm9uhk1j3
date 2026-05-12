import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Sprout, Lock, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoading(true)
      const success = await login(email, password)
      if (!success) {
        setIsLoading(false)
      }
    }
  }

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-slate-50 relative">
      <div
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Card className="w-full max-w-md shadow-xl border-slate-200 z-10 bg-white">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="w-14 h-14 rounded-xl bg-[#00a884] mx-auto flex items-center justify-center shadow-md mb-2">
            <Sprout className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Acesso Restrito</CardTitle>
          <CardDescription className="text-slate-500 text-base">
            Portal Administrativo de Treinamentos ABAPA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-slate-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@abapa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11"
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-slate-700">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] mt-4 text-white h-12 text-md font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Lock className="w-5 h-5 mr-2" />
              )}
              Entrar no Painel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
