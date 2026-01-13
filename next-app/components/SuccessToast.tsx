'use client'

import { useEffect, useState } from 'react'

interface SuccessToastProps {
  show: boolean
  message: string
  icon?: string
  streak?: number
  xp?: number
  onClose?: () => void
}

export function SuccessToast({ show, message, icon = '✅', streak, xp, onClose }: SuccessToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!visible) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-pulse">{icon}</span>
          <div>
            <p className="font-bold text-lg">{message}</p>
            {streak !== undefined && (
              <p className="text-sm text-white/90 flex items-center gap-2 mt-1">
                <span className="text-xl">🔥</span>
                <span className="font-semibold">{streak} dagar i rad!</span>
              </p>
            )}
            {xp !== undefined && (
              <p className="text-sm text-white/90 flex items-center gap-2 mt-1">
                <span className="text-xl">⚡</span>
                <span className="font-semibold">+{xp} XP</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: translateX(-50%) scale(0.3);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) scale(1.05);
          }
          70% {
            transform: translateX(-50%) scale(0.9);
          }
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  )
}
