/* Layout Component - A component that wraps the main content of the app
   - Use this file to add a header, footer, or other elements that should be present on every page
   - This component is used in the App.tsx file to wrap the main content of the app */

import { Outlet, Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen relative">
      <Outlet />

      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/chat">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </main>
  )
}
