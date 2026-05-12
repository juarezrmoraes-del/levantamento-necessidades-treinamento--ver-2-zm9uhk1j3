import { cn } from '@/lib/utils'
import { Message } from '@/stores/useChatStore'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface MessageBubbleProps {
  message: Message
  onOptionClick?: (option: string) => void
  isLast?: boolean
  disabled?: boolean
}

export function MessageBubble({ message, onOptionClick, isLast, disabled }: MessageBubbleProps) {
  const isBot = message.sender === 'bot'

  return (
    <div className={cn('flex w-full mb-2 flex-col', isBot ? 'items-start' : 'items-end')}>
      <div className={cn('flex w-full', isBot ? 'justify-start' : 'justify-end')}>
        <div
          className={cn(
            'max-w-[85%] sm:max-w-[75%] px-3 py-2 text-[15px] shadow-sm relative break-words leading-relaxed',
            isBot
              ? 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100'
              : 'bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-sm',
          )}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
          <div className="flex justify-end items-center mt-1 space-x-1">
            <span className="text-[11px] text-slate-500/80 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {!isBot && (
              <svg viewBox="0 0 16 15" width="16" height="15" className="text-blue-500 opacity-80">
                <path
                  fill="currentColor"
                  d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {isBot && message.options && message.options.length > 0 && isLast && (
        <div className="mt-2 ml-1 w-full max-w-[85%] sm:max-w-[75%] bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-slate-100 animate-fade-in-up">
          <RadioGroup
            className="flex flex-col gap-1"
            disabled={disabled}
            onValueChange={(val) => {
              if (!disabled && onOptionClick) {
                // Delay slightly so the user sees the radio toggle visually
                setTimeout(() => onOptionClick(val), 150)
              }
            }}
          >
            {message.options.map((option, idx) => (
              <Label
                key={idx}
                htmlFor={`option-${message.id}-${idx}`}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:bg-slate-50',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${message.id}-${idx}`}
                  className="shrink-0 text-[#00a884] border-slate-300 focus:text-[#00a884] data-[state=checked]:border-[#00a884] data-[state=checked]:text-[#00a884]"
                />
                <span className="font-normal text-[15px] leading-snug flex-1 text-slate-700 select-none">
                  {option}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  )
}
