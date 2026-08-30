import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/format'
import { resolveDelayMs } from './reelTiming'
import { sfx } from '../audio/sfx'

/** PRD §14: disabled while resolving; challenge shows cost; blocked when broke. */
export function SpinButton() {
  const spinning = useGameStore((s) => s.spinning)
  const mode = useGameStore((s) => s.mode)
  const simCoins = useGameStore((s) => s.simCoins)
  const cost = useGameStore((s) => s.challengeConfig.spinCost)

  const insufficient = mode === 'challenge' && simCoins < cost
  const disabled = spinning || insufficient

  const onPress = () => {
    const res = useGameStore.getState().startSpin()
    if (res.ok) {
      sfx.click()
      // Reels land per reelTiming (PRD §14 baseline + anticipation); then resolve.
      const delay = resolveDelayMs(useGameStore.getState().pendingOutcome)
      window.setTimeout(() => useGameStore.getState().resolveSpin(), delay)
    } else if (res.reason === 'insufficient_coins') {
      sfx.lose()
      window.dispatchEvent(new CustomEvent('vrng-shake', { detail: { big: false } }))
    }
  }

  return (
    <button
      data-testid="spin-button"
      onClick={onPress}
      disabled={disabled}
      className={`relative mx-auto flex w-full max-w-xs flex-col items-center overflow-hidden rounded-lg border-b-4 border-black/40 px-8 py-4 font-display text-display-md transition-all ${
        disabled
          ? 'cursor-not-allowed bg-cabinet-600 text-text-muted opacity-60'
          : 'bg-neon-pink text-text-on-accent shadow-chunky-lg shadow-glow-pink hover:scale-[1.02] active:translate-x-[3px] active:translate-y-[3px] active:scale-[0.98] active:shadow-none'
      }`}
    >
      {!disabled && <span aria-hidden className="sheen" />}
      <span className="relative">{spinning ? '···' : insufficient ? `NEED ${formatNumber(cost)} COINS` : 'SPIN'}</span>
      <span className="tnum relative mt-1.5 text-[10px] normal-case">
        {mode === 'challenge' ? `−${formatNumber(cost)} SIM COINS` : 'FREE · UNLIMITED'}
      </span>
    </button>
  )
}
