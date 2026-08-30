import { useGameStore } from '../store/gameStore'
import { netResult, returnRate } from '../utils/calculations'
import { formatNumber, formatSigned } from '../utils/format'

/**
 * PRD §19 reality check — factual summary at 50/100/500 Challenge spins.
 */
export function RealityCheckModal() {
  const pending = useGameStore((s) => s.pendingRealityCheck)
  const dismiss = useGameStore((s) => s.dismissRealityCheck)
  const challenge = useGameStore((s) => s.challenge)

  if (pending === null) return null

  const net = netResult(challenge.totalSpent, challenge.totalReturned)
  const rate = returnRate(challenge.totalSpent, challenge.totalReturned)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <div
        data-testid="reality-check"
        className="w-full max-w-md rounded-lg border border-info-blue/50 bg-cabinet-800 p-5 shadow-overlay"
      >
        <h2 className="font-display text-display-sm text-info-blue">
          📊 {pending} CHALLENGE SPINS
        </h2>
        <div className="mt-4">
          {[
            ['Starting Balance', formatNumber(challenge.startingBalance), 'text-text-primary'],
            ['Total Spent', formatNumber(challenge.totalSpent), 'text-sim-coin'],
            ['Total Returned', formatNumber(challenge.totalReturned), 'text-sim-coin'],
          ].map(([label, value, cls]) => (
            <div key={label} className="tnum flex justify-between border-b border-line/50 py-2 text-sm">
              <span className="text-text-secondary">{label}</span>
              <span className={`font-bold ${cls}`}>{value}</span>
            </div>
          ))}
          <div className="tnum flex justify-between py-2 text-base">
            <span className="text-text-secondary">NET RESULT</span>
            <span
              data-testid="reality-net"
              className={`font-bold ${net < 0 ? 'text-danger-red' : 'text-state-win'}`}
            >
              {formatSigned(net)}
            </span>
          </div>
          <div className="tnum flex justify-between border-t border-line/50 py-2 text-sm">
            <span className="text-text-secondary">RETURN RATE</span>
            <span data-testid="reality-rate" className="font-bold text-warn-amber">
              {Number(rate.toFixed(2))}%
            </span>
          </div>
        </div>
        <p className="mt-4 text-center text-sm italic text-text-secondary">
          “You didn't lose every spin. That's the clever part.”
        </p>
        <button
          data-testid="reality-continue"
          onClick={dismiss}
          className="mt-4 w-full rounded-md bg-cabinet-700 px-4 py-2.5 text-sm font-bold text-text-primary"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}
