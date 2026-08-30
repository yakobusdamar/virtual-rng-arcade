import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { useGameStore, mostCommonSymbol } from '../store/gameStore'
import { BalanceChart } from './BalanceChart'
import { netResult, returnRate } from '../utils/calculations'
import { formatNumber, formatSigned } from '../utils/format'
import { SYMBOL_EMOJI, SYMBOL_LABEL } from '../engine/symbols'

function StatRow({
  label,
  value,
  valueClass = 'text-text-primary',
  testId,
}: {
  label: string
  value: string
  valueClass?: string
  testId?: string
}) {
  return (
    <div className="tnum flex items-center justify-between border-b border-line/50 py-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span data-testid={testId} className={`font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  )
}

/** PRD §21: stats separated by mode — never merged. Opening unlocks Statistician (§23). */
export function StatsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mode = useGameStore((s) => s.mode)
  const markStatsOpened = useGameStore((s) => s.markStatsOpened)
  const normal = useGameStore((s) => s.normal)
  const challenge = useGameStore((s) => s.challenge)
  const simCoins = useGameStore((s) => s.simCoins)
  const [tab, setTab] = useState<'normal' | 'challenge'>(mode)

  useEffect(() => {
    if (open) {
      setTab(mode)
      markStatsOpened()
    }
  }, [open, mode, markStatsOpened])

  const net = netResult(challenge.totalSpent, challenge.totalReturned)
  const rate = returnRate(challenge.totalSpent, challenge.totalReturned)
  const triples = Object.values(normal.tripleCounts).reduce((a, b) => a + b, 0)
  const mostCommon = mostCommonSymbol(normal.symbolCounts)
  const rareEntries = Object.entries(normal.rareCombinations)

  return (
    <Modal open={open} onClose={onClose} title="STATISTICS" emoji="📊" wide>
      <div className="mb-4 flex gap-2" role="tablist">
        {(['normal', 'challenge'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            data-testid={`stats-tab-${t}`}
            onClick={() => setTab(t)}
            className={`font-display flex-1 rounded-md px-3 py-2 text-[9px] transition-colors ${
              tab === t
                ? t === 'normal'
                  ? 'bg-neon-cyan text-text-on-accent'
                  : 'bg-neon-pink text-text-on-accent'
                : 'bg-cabinet-700 text-text-muted'
            }`}
          >
            {t === 'normal' ? 'NORMAL MODE' : 'CHALLENGE MODE 😈'}
          </button>
        ))}
      </div>

      {tab === 'normal' ? (
        <div data-testid="normal-stats">
          <StatRow label="Total spins" value={formatNumber(normal.totalSpins)} testId="normal-spins" />
          <StatRow
            label="FUN POINTS earned"
            value={formatNumber(normal.funPointsEarned)}
            valueClass="text-fun-point"
            testId="normal-fun-points"
          />
          <StatRow
            label="Most common symbol"
            value={mostCommon ? `${SYMBOL_EMOJI[mostCommon]} ${SYMBOL_LABEL[mostCommon]}` : '—'}
            testId="normal-most-common"
          />
          <StatRow label="Triple matches" value={formatNumber(triples)} testId="normal-triples" />
          <StatRow label="Best streak" value={`🔥 x${normal.bestStreak}`} testId="normal-best-streak" />
          <div className="mt-4">
            <h4 className="font-display text-[9px] text-text-muted">RARE COMBINATIONS</h4>
            {rareEntries.length === 0 ? (
              <p className="tnum py-2 text-xs text-text-muted">None yet. The chickens await.</p>
            ) : (
              rareEntries.map(([key, count]) => (
                <div key={key} className="tnum flex justify-between border-b border-line/50 py-2 text-sm">
                  <span className="text-text-secondary">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-fun-point">x{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div data-testid="challenge-stats">
          <StatRow label="Total spins" value={formatNumber(challenge.totalSpins)} testId="challenge-spins" />
          <StatRow
            label="Starting balance"
            value={`${formatNumber(challenge.startingBalance)} 🪙`}
            testId="challenge-starting"
          />
          <StatRow
            label="Current balance"
            value={`${formatNumber(simCoins)} 🪙`}
            valueClass="text-sim-coin"
            testId="challenge-current"
          />
          <StatRow label="Total spent" value={formatNumber(challenge.totalSpent)} testId="challenge-spent" />
          <StatRow
            label="Total returned"
            value={formatNumber(challenge.totalReturned)}
            testId="challenge-returned"
          />
          <StatRow
            label="NET RESULT"
            value={formatSigned(net)}
            valueClass={net < 0 ? 'text-danger-red' : net > 0 ? 'text-state-win' : 'text-text-primary'}
            testId="challenge-net"
          />
          <StatRow
            label="RETURN RATE"
            value={`${Number(rate.toFixed(2))}%`}
            valueClass={rate < 100 ? 'text-warn-amber' : 'text-state-win'}
            testId="challenge-return-rate"
          />
          <StatRow
            label="Biggest win"
            value={formatNumber(challenge.biggestWin)}
            valueClass="text-sim-coin"
            testId="challenge-biggest-win"
          />
          <StatRow
            label="Longest loss streak"
            value={`x${challenge.longestLossStreak}`}
            valueClass="text-danger-red"
            testId="challenge-loss-streak"
          />
          <div className="mt-4">
            <h4 className="font-display text-[9px] text-text-muted">BALANCE HISTORY</h4>
            <BalanceChart />
          </div>
        </div>
      )}
    </Modal>
  )
}
