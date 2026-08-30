import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore, type Toast } from '../store/gameStore'

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useGameStore((s) => s.dismissToast)

  useEffect(() => {
    const t = window.setTimeout(() => dismiss(toast.id), 4000)
    return () => window.clearTimeout(t)
  }, [toast.id, dismiss])

  return (
    <motion.div
      data-testid="toast"
      initial={{ y: -30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -16, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="pointer-events-auto rounded-lg border border-sim-coin/70 bg-cabinet-800 px-4 py-2.5 shadow-chunky shadow-glow-gold"
      onClick={() => dismiss(toast.id)}
    >
      <p className="font-display text-[9px] text-sim-coin">
        {toast.emoji} {toast.title}
      </p>
      {toast.body && <p className="mt-1 text-xs text-text-secondary">{toast.body}</p>}
    </motion.div>
  )
}

export function ToastLayer() {
  const toasts = useGameStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}
