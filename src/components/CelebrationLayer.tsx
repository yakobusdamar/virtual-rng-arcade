import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'

/** PRD §17: x5 screen effect etc. — full-screen milestone splash. */
export function CelebrationLayer() {
  const celebration = useGameStore((s) => s.celebration)
  const clear = useGameStore((s) => s.clearCelebration)

  useEffect(() => {
    if (!celebration) return
    const t = window.setTimeout(clear, 2200)
    return () => window.clearTimeout(t)
  }, [celebration, clear])

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key={celebration.nonce}
          data-testid="celebration"
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -4 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
            className="rounded-xl border-2 border-sim-coin bg-cabinet-900/90 px-6 py-5 text-center shadow-glow-gold"
          >
            <p className="font-display text-display-sm text-sim-coin">{celebration.text}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
