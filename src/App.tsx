import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from '@/pages/Index'
import Consulta from '@/pages/Consulta'
import Login from '@/pages/Login'
import AdminLayout from '@/components/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import Responses from '@/pages/admin/Responses'
import Users from '@/pages/admin/Users'
import Reports from '@/pages/admin/Reports'
import Settings from '@/pages/admin/Settings'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { MainStoreProvider } from '@/stores/main'
import { AuthProvider } from '@/stores/auth'
import { UsersProvider } from '@/stores/users'
import { AuditProvider } from '@/stores/audit'

function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <UsersProvider>
          <MainStoreProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/consulta" element={<Consulta />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="respostas" element={<Responses />} />
                  <Route path="usuarios" element={<Users />} />
                  <Route path="relatorios" element={<Reports />} />
                  <Route path="configuracoes" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </MainStoreProvider>
        </UsersProvider>
      </AuditProvider>
    </AuthProvider>
  )
}

export default App
