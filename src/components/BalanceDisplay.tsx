import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/format'

interface BalanceDisplayProps {
  onAddCoins: () => void
}

/**
 * PRD §3: two visibly separate values. SIM COINS always gold + 🪙,
 * FUN POINTS always violet + ⭐ — never interchangeable (design.md §1.3).
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
          <div className="tnum mt-1 text-xl font-bold text-sim-coin">{formatNumber(simCoins)}</div>
        </div>
        <div
          data-testid="fun-points"
          className="rounded-lg border border-fun-point-deep/60 bg-cabinet-800 px-3 py-2 shadow-chunky"
        >
          <div className="font-display text-[8px] text-text-muted">⭐ FUN POINTS</div>
          <div className="tnum mt-1 text-xl font-bold text-fun-point">{formatNumber(funPoints)}</div>
        </div>
      </div>
      <button
        data-testid="add-sim-coins"
        onClick={onAddCoins}
        className="w-full rounded-md border border-sim-coin-deep bg-cabinet-700 px-3 py-2 text-sm font-bold text-sim-coin transition-transform active:translate-x-[2px] active:translate-y-[2px]"
      >
        + ADD SIM COINS
      </button>
    </div>
  )
}
