import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-sm bg-brand-50 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <Zap size={32} className="text-brand-500 animate-pulse" fill="currentColor" />
          </div>
          <div className="absolute -inset-4 rounded-sm border border-brand-500/10 animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-black italic text-2xl tracking-tighter text-surface-950">SmartCart Pro</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
