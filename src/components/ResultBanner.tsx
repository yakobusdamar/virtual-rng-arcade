import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/format'
import { CATEGORY_LABEL } from '../engine/challengeModeEngine'
import { tierOf } from './WinOverlay'
import { burstFromElement } from './ParticleLayer'

/** PRD §14 step 12: result animation. Deltas use the correct currency language. */
export function ResultBanner() {
  const outcome = useGameStore((s) => s.lastOutcome)
  const spinning = useGameStore((s) => s.spinning)
  const nonce = outcome?.nonce ?? 0
  const tier = outcome && !spinning ? tierOf(outcome) : 0

  // Minor wins (tier 1) get a small burst; bigger tiers are handled by WinOverlay.
  useEffect(() => {
    if (tier === 1 && outcome) {
      const kind = outcome.mode === 'challenge' ? 'coin' : 'star'
      burstFromElement('reel-machine', kind, 20)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])

  const win = tier >= 1

  return (
    <div className="min-h-[96px]" aria-live="polite">
      <AnimatePresence mode="wait">
        {outcome && !spinning && (
          <motion.div
            key={nonce}
            data-testid="result-banner"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={`rounded-lg border px-4 py-3 text-center ${
              outcome.mode === 'challenge' && outcome.category === 'JACKPOT'
                ? 'border-sim-coin bg-sim-coin/10 shadow-glow-gold'
                : win
                  ? 'border-state-win/50 bg-state-win/10'
                  : 'border-line bg-cabinet-800'
            }`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="tnum text-sm text-text-secondary"
            >
              {outcome.mode === 'challenge' ? (
                <>
                  {CATEGORY_LABEL[outcome.category as keyof typeof CATEGORY_LABEL]} ·{' '}
                  <span className={outcome.simCoinReturn > 0 ? 'font-bold text-sim-coin' : 'text-text-muted'}>
                    {outcome.simCoinReturn > 0
                      ? `+${formatNumber(outcome.simCoinReturn)} 🪙`
                      : `−${formatNumber(outcome.simCoinSpent)} 🪙`}
                  </span>
                </>
              ) : (
                <span className="font-bold text-fun-point">+{formatNumber(outcome.funPoints)} ⭐</span>
              )}
            </motion.div>
            <p className="mt-1 text-sm font-semibold text-text-primary">{outcome.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
