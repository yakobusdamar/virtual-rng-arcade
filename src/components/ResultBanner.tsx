import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/format'
import { CATEGORY_LABEL } from '../engine/challengeModeEngine'

/** PRD §14 step 12: result animation. Deltas use the correct currency language. */
export function ResultBanner() {
  const outcome = useGameStore((s) => s.lastOutcome)
  const spinning = useGameStore((s) => s.spinning)

  return (
    <div className="min-h-[92px]" aria-live="polite">
      <AnimatePresence mode="wait">
        {outcome && !spinning && (
          <motion.div
            key={outcome.nonce}
            data-testid="result-banner"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className={`rounded-lg border px-4 py-3 text-center ${
              outcome.mode === 'challenge' && outcome.category === 'JACKPOT'
                ? 'border-sim-coin bg-sim-coin/10 shadow-glow-gold'
                : outcome.simCoinReturn > 0 || outcome.funPoints > 10
                  ? 'border-state-win/50 bg-state-win/10'
                  : 'border-line bg-cabinet-800'
            }`}
          >
            <div className="tnum text-sm text-text-secondary">
              {outcome.mode === 'challenge' ? (
                <>
                  {CATEGORY_LABEL[outcome.category as keyof typeof CATEGORY_LABEL]} ·{' '}
                  <span className={outcome.simCoinReturn > 0 ? 'text-sim-coin' : 'text-text-muted'}>
                    {outcome.simCoinReturn > 0
                      ? `+${formatNumber(outcome.simCoinReturn)} 🪙`
                      : `−${formatNumber(outcome.simCoinSpent)} 🪙`}
                  </span>
                </>
              ) : (
                <span className="text-fun-point">+{formatNumber(outcome.funPoints)} ⭐</span>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-text-primary">{outcome.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
