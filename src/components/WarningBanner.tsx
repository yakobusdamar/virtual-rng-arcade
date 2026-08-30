import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { computeExpectedReturnPer100 } from '../utils/calculations'
import { formatNumber } from '../utils/format'

const pct = (p: number) => `${Number((p * 100).toFixed(1))}%`

/**
 * PRD §8 transparency: cost, probabilities, rewards, expected return —
 * all rendered from the live config (§7: computed, never hardcoded).
 */
export function WarningBanner({ onOpenLab }: { onOpenLab: () => void }) {
  const config = useGameStore((s) => s.challengeConfig)
  const [open, setOpen] = useState(false)

  const evPer100 = computeExpectedReturnPer100(config)
  const negative = evPer100 < 100

  return (
    <section
      data-testid="challenge-warning"
      className="rounded-lg border border-warn-amber/70 bg-warn-amber/10 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-[9px] text-warn-amber">⚠️ SIMULATION ONLY</h3>
        <button
          data-testid="odds-toggle"
          onClick={() => setOpen(!open)}
          className="tnum text-[10px] uppercase tracking-widest text-warn-amber underline decoration-dotted"
          aria-expanded={open}
        >
          {open ? 'HIDE ODDS' : 'INSPECT ODDS'}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
        This mode uses a negative long-term expected value. Short-term wins are possible. Long-term
        results may trend negative.
      </p>

      {open && (
        <div className="mt-3 rounded-md border border-line bg-cabinet-900 p-3" data-testid="odds-table">
          <div className="tnum mb-2 flex justify-between text-xs text-text-secondary">
            <span>SPIN COST</span>
            <span className="text-sim-coin">{formatNumber(config.spinCost)} 🪙</span>
          </div>
          <table className="tnum w-full text-xs">
            <thead>
              <tr className="text-left text-text-muted">
                <th className="pb-1 font-normal">RESULT</th>
                <th className="pb-1 text-right font-normal">PROBABILITY</th>
                <th className="pb-1 text-right font-normal">RETURN 🪙</th>
              </tr>
            </thead>
            <tbody>
              {config.table.map((row) => (
                <tr key={row.category} className="border-t border-line/60">
                  <td className="py-1.5 text-text-secondary">{row.category.replace('_', ' ')}</td>
                  <td className="py-1.5 text-right text-text-primary">{pct(row.probability)}</td>
                  <td
                    className={`py-1.5 text-right ${
                      row.simCoinReturn > 0 ? 'text-sim-coin' : 'text-text-muted'
                    }`}
                  >
                    {formatNumber(row.simCoinReturn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 border-t border-line pt-3">
            <p className="font-display text-[8px] text-text-muted">EXPECTED RETURN</p>
            <p className="tnum mt-1 text-lg font-bold text-warn-amber" data-testid="expected-return">
              {Number(evPer100.toFixed(2))} SIM COINS
              <span className="text-xs font-normal text-text-muted"> per 100 spent</span>
            </p>
            <p className="font-display text-[8px] text-text-muted">LONG-TERM EXPECTATION</p>
            <p
              className={`tnum text-sm font-bold ${negative ? 'text-danger-red' : 'text-state-win'}`}
              data-testid="long-term-expectation"
            >
              {negative ? 'NEGATIVE' : 'POSITIVE'}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onOpenLab}
        className="tnum mt-3 text-[10px] uppercase tracking-widest text-info-blue underline decoration-dotted"
      >
        🔬 Open Probability Lab
      </button>
    </section>
  )
}
