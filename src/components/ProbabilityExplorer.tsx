import { useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Modal } from './Modal'
import { useGameStore } from '../store/gameStore'
import { generateConfig, simulateBatch, type BatchResult } from '../engine/probabilityEngine'
import { computeExpectedReturnPer100 } from '../utils/calculations'
import { cryptoRng } from '../engine/rng'
import { formatNumber } from '../utils/format'
import type { ChallengeConfig } from '../engine/types'

/**
 * PRD §22 educational sandbox. Runs batch simulations on synthetic configs;
 * never touches live balances/stats (§29.12) unless the player explicitly
 * adopts the configuration into Challenge Mode.
 */
export function ProbabilityExplorer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const recordExplorerRun = useGameStore((s) => s.recordExplorerRun)
  const adoptChallengeConfig = useGameStore((s) => s.adoptChallengeConfig)

  const [houseEdge, setHouseEdge] = useState(10)
  const [volatility, setVolatility] = useState(50)
  const [config, setConfig] = useState<ChallengeConfig | null>(null)
  const [result, setResult] = useState<BatchResult | null>(null)

  const run = () => {
    const cfg = generateConfig(houseEdge, volatility / 100)
    const batch = simulateBatch(cfg, 10_000, cryptoRng())
    setConfig(cfg)
    setResult(batch)
    recordExplorerRun()
  }

  const history = (result?.history ?? []).map((b, i) => ({ i, b }))

  return (
    <Modal open={open} onClose={onClose} title="PROBABILITY LAB" emoji="🔬" wide>
      <p className="tnum mb-4 rounded-md border border-dashed border-info-blue/50 bg-info-blue/5 px-3 py-2 text-[10px] uppercase tracking-widest text-info-blue">
        Sandbox — simulations never touch your real balances or gameplay
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <div className="tnum mb-1 flex justify-between text-xs text-text-secondary">
            <span>HOUSE ADVANTAGE</span>
            <span data-testid="house-edge-value" className="font-bold text-info-blue">
              {houseEdge}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={houseEdge}
            onChange={(e) => setHouseEdge(Number(e.target.value))}
            className="w-full accent-info-blue"
            aria-label="House advantage percentage"
          />
          <div className="tnum flex justify-between text-[10px] text-text-muted">
            <span>0%</span>
            <span>20%</span>
          </div>
        </div>

        <div>
          <div className="tnum mb-1 flex justify-between text-xs text-text-secondary">
            <span>VOLATILITY</span>
            <span data-testid="volatility-value" className="font-bold text-info-blue">
              {volatility < 34 ? 'LOW' : volatility < 67 ? 'MEDIUM' : 'HIGH'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={volatility}
            onChange={(e) => setVolatility(Number(e.target.value))}
            className="w-full accent-info-blue"
            aria-label="Volatility"
          />
          <div className="tnum flex justify-between text-[10px] text-text-muted">
            <span>LOW</span>
            <span>HIGH</span>
          </div>
        </div>

        <button
          data-testid="explorer-run"
          onClick={run}
          className="font-display rounded-md bg-info-blue px-4 py-3 text-[10px] text-text-on-accent shadow-chunky active:translate-x-[2px] active:translate-y-[2px]"
        >
          RUN 10,000 SIMULATED SPINS
        </button>

        {result && config && (
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-cabinet-900 p-3" data-testid="explorer-results">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-line p-3 text-center">
                <p className="font-display text-[8px] text-text-muted">PLAYER RETURN</p>
                <p
                  data-testid="explorer-return"
                  className="tnum mt-1 text-2xl font-bold text-state-win"
                >
                  {result.playerReturnPct.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-md border border-line p-3 text-center">
                <p className="font-display text-[8px] text-text-muted">SYSTEM ADVANTAGE</p>
                <p
                  data-testid="explorer-advantage"
                  className="tnum mt-1 text-2xl font-bold text-danger-red"
                >
                  {result.systemAdvantagePct.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="tnum text-xs text-text-secondary">
              Theoretical expected return:{' '}
              <b className="text-warn-amber">
                {Number(computeExpectedReturnPer100(config).toFixed(2))} per 100
              </b>{' '}
              · Jackpots hit: <b className="text-sim-coin">{formatNumber(result.jackpots)}</b>
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: '#12122A',
                    border: '1px solid #2E2E5E',
                    borderRadius: 10,
                    fontFamily: 'Space Mono',
                    fontSize: 11,
                    color: '#F4F2FF',
                  }}
                  formatter={(value: number | string) => [formatNumber(Number(value)) + ' 🪙', 'SIM BALANCE']}
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="b" stroke="#22D3EE" fill="rgba(34,211,238,.1)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
            <button
              data-testid="explorer-adopt"
              onClick={() => adoptChallengeConfig(config)}
              className="tnum rounded-md border border-neon-pink px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neon-pink active:translate-x-[2px] active:translate-y-[2px]"
            >
              Adopt config → Challenge Mode
            </button>
            <p className="tnum text-center text-[10px] text-text-muted">
              Adopting replaces the live Challenge odds table (expected return recalculated).
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
