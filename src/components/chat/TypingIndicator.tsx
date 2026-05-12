export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start mb-2">
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-1.5 w-[72px] h-10">
        <div className="w-2 h-2 bg-slate-400/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400/60 rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}
