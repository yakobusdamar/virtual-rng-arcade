import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore, type LastOutcome } from '../store/gameStore'
import { CATEGORY_LABEL } from '../engine/challengeModeEngine'
import { SYMBOL_LABEL } from '../engine/symbols'
import { formatNumber } from '../utils/format'
import { CountUp } from './CountUp'
import { burstFromElement } from './ParticleLayer'
import { sfx } from '../audio/sfx'

export type WinTier = 0 | 1 | 2 | 3 | 4

/**
 * Tiered win presentation (design.md §7). The tier comes from the FIXED
 * engine outcome — presentation only, never the odds (PRD §29.7).
 */
export function tierOf(o: LastOutcome): WinTier {
  if (o.mode === 'challenge') {
    switch (o.category) {
      case 'JACKPOT':
        return 4
      case 'BIG_WIN':
        return 3
      case 'MEDIUM_WIN':
        return 2
      default:
        return 0
    }
  }
  if (o.funPoints >= 1000) return 4 // triple diamond
  if (o.funPoints >= 500) return 3 // star / chicken / potato
  if (o.funPoints >= 150) return 2 // cherry triple, odd triple
  return 0
}

function outcomeLabel(o: LastOutcome): string {
  if (o.mode === 'challenge') return CATEGORY_LABEL[o.category as keyof typeof CATEGORY_LABEL]
  const [a, b, c] = o.reels
  if (a === b && b === c) {
    if (a === 'chicken') return '🐔 CHICKEN EVENT'
    if (a === 'potato') return '🥔 POTATO ECONOMY'
    if (a === 'diamond') return '💎 TRIPLE DIAMOND'
    if (a === 'star') return '⭐ TRIPLE STAR'
    return `TRIPLE ${SYMBOL_LABEL[a].toUpperCase()}`
  }
  return 'FUN COMBO'
}

const DURATION_MS: Record<WinTier, number> = { 0: 0, 1: 900, 2: 1500, 3: 2100, 4: 3000 }

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * The hero moment. Levels: 2 = win strip over the machine, 3 = rays +
 * shake takeover, 4 = full jackpot takeover with confetti. Losses stay
 * quiet: the banner tells the truth without punishing.
 */
export function WinOverlay() {
  const outcome = useGameStore((s) => s.lastOutcome)
  const spinning = useGameStore((s) => s.spinning)

  const tier: WinTier = useMemo(() => (outcome && !spinning ? tierOf(outcome) : 0), [outcome, spinning])
  const [visible, setVisible] = useState(false)

  const nonce = outcome?.nonce ?? 0

  useEffect(() => {
    if (tier === 0 || !outcome) {
      setVisible(false)
      return
    }
    setVisible(true)
    sfx.win(tier === 1 ? 2 : (tier as 2 | 3 | 4))

    const kind = outcome.mode === 'challenge' ? 'coin' : 'star'
    const count = tier >= 4 ? 170 : tier === 3 ? 90 : 46
    if (tier >= 2) burstFromElement('reel-machine', tier === 4 ? 'confetti' : kind, count)
    if (tier >= 3 && !reducedMotion()) {
      window.dispatchEvent(new CustomEvent('vrng-shake', { detail: { big: tier === 4 } }))
    }
    const t = window.setTimeout(() => setVisible(false), DURATION_MS[tier])
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, nonce])

  const isChallenge = outcome?.mode === 'challenge'
  const amount = isChallenge ? (outcome?.simCoinReturn ?? 0) : (outcome?.funPoints ?? 0)
  const label = outcome ? outcomeLabel(outcome) : ''

  return (
    <AnimatePresence>
      {visible && outcome && tier >= 2 && (
        <motion.div
          key={nonce}
          data-testid="win-overlay"
          className="pointer-events-none fixed inset-0 z-[65] flex items-start justify-center overflow-hidden pt-[24vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {tier >= 3 && <div className="rays" aria-hidden />}
          {tier === 4 && <div className="absolute inset-0 bg-cabinet-950/55" aria-hidden />}

          <div className="relative flex flex-col items-center px-6 text-center">
            <motion.p
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`font-display ${tier === 4 ? 'text-display-lg' : 'text-display-md'} ${
                tier === 4 ? 'text-state-jackpot' : tier === 3 ? 'text-sim-coin' : 'text-neon-pink'
              } ${tier >= 3 ? 'drop-shadow-[0_0_18px_rgba(255,201,77,0.55)]' : ''}`}
            >
              {tier === 4 ? '💎 JACKPOT' : label}
            </motion.p>

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="tnum mt-3 text-4xl font-bold"
            >
              <CountUp
                value={amount}
                className={isChallenge ? 'text-sim-coin' : 'text-fun-point'}
              />
              <span className={`ml-2 text-2xl ${isChallenge ? 'text-sim-coin' : 'text-fun-point'}`}>
                {isChallenge ? '🪙' : '⭐'}
              </span>
            </motion.div>

            {tier === 4 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="tnum mt-3 text-xs uppercase tracking-widest text-text-secondary"
              >
                100% fictional. As always.
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Display helper reused by the result banner. */
export function formatAmount(o: LastOutcome): string {
  return o.mode === 'challenge' ? `+${formatNumber(o.simCoinReturn)} 🪙` : `+${formatNumber(o.funPoints)} ⭐`
}
