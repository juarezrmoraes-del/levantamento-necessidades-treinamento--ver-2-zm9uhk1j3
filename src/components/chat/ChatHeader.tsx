import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreVertical, RotateCcw, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import abapaLogo from '@/assets/abapa-7ed0c.jpeg'
import { useChatStore } from '@/stores/useChatStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ChatHeader() {
  const { resetSession } = useChatStore()

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10 border shadow-sm bg-white">
            <AvatarImage src={abapaLogo} alt="ABAPA" className="object-contain p-1" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h2 className="font-semibold text-sm leading-none text-slate-800">Assistente ABAPA</h2>
          <p className="text-xs text-[#00a884] mt-1 font-medium">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full focus-visible:ring-0 hover:bg-slate-100"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={resetSession} className="cursor-pointer py-3 text-slate-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Reiniciar Conversa</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer py-3 text-slate-700">
              <Link to="/consulta" className="w-full flex items-center">
                <Search className="mr-2 h-4 w-4" />
                <span>Consulta de Protocolo</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
