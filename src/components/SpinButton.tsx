import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/format'

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
      // Reels stop at 800/1200/1600ms; resolve right after the third lands.
      window.setTimeout(() => useGameStore.getState().resolveSpin(), 1600)
    }
  }

  return (
    <button
      data-testid="spin-button"
      onClick={onPress}
      disabled={disabled}
      className={`mx-auto flex w-full max-w-xs flex-col items-center rounded-lg border-b-4 border-black/40 px-8 py-4 font-display text-display-md transition-all ${
        disabled
          ? 'cursor-not-allowed bg-cabinet-600 text-text-muted opacity-60'
          : 'bg-neon-pink text-text-on-accent shadow-chunky-lg shadow-glow-pink hover:bg-neon-pink-soft active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
      }`}
    >
      <span>{spinning ? '···' : insufficient ? `NEED ${formatNumber(cost)} COINS` : 'SPIN'}</span>
      <span className="tnum mt-1.5 text-[10px] normal-case">
        {mode === 'challenge' ? `−${formatNumber(cost)} SIM COINS` : 'FREE · UNLIMITED'}
      </span>
    </button>
  )
}
