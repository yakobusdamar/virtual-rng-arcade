import { useGameStore } from '../store/gameStore'
import { CountUp } from './CountUp'

interface BalanceDisplayProps {
  onAddCoins: () => void
}

/**
 * PRD §3: two visibly separate values. SIM COINS always gold + 🪙,
 * FUN POINTS always violet + ⭐ — never interchangeable (design.md §1.3).
 * Values tick with a count-up instead of jumping.
 */
export function BalanceDisplay({ onAddCoins }: BalanceDisplayProps) {
  const simCoins = useGameStore((s) => s.simCoins)
  const funPoints = useGameStore((s) => s.funPoints)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div
          data-testid="sim-coins"
          className="rounded-lg border border-sim-coin-deep/60 bg-cabinet-800 px-3 py-2 shadow-chunky"
        >
          <div className="font-display text-[8px] text-text-muted">🪙 SIM COINS</div>
          <CountUp value={simCoins} className="tnum mt-1 block text-xl font-bold text-sim-coin" />
        </div>
        <div
          data-testid="fun-points"
          className="rounded-lg border border-fun-point-deep/60 bg-cabinet-800 px-3 py-2 shadow-chunky"
        >
          <div className="font-display text-[8px] text-text-muted">⭐ FUN POINTS</div>
          <CountUp value={funPoints} className="tnum mt-1 block text-xl font-bold text-fun-point" />
        </div>
      </div>
      <button
        data-testid="add-sim-coins"
        onClick={onAddCoins}
        className="w-full rounded-md border border-sim-coin-deep bg-cabinet-700 px-3 py-2 text-sm font-bold text-sim-coin transition-transform hover:scale-[1.01] active:translate-x-[2px] active:translate-y-[2px] active:scale-[0.99]"
      >
        + ADD SIM COINS
      </button>
    </div>
  )
}
