import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/format'
import type { BalancePoint } from '../engine/types'

function downsample(points: BalancePoint[], max: number): BalancePoint[] {
  if (points.length <= max) return points
  const stride = Math.ceil(points.length / max)
  const out: BalancePoint[] = []
  for (let i = 0; i < points.length; i += stride) out.push(points[i])
  const last = points[points.length - 1]
  if (out[out.length - 1] !== last) out.push(last)
  return out
}

interface DotProps {
  cx?: number
  cy?: number
  payload?: BalancePoint
}

/** PRD §24: wins vs losses visible, big wins as spikes, trend obvious. */
export function BalanceChart() {
  const challenge = useGameStore((s) => s.challenge)
  const data = downsample(challenge.balanceHistory, 500).map((p, i) => ({ ...p, i }))

  if (data.length === 0) {
    return (
      <p className="tnum py-8 text-center text-xs text-text-muted">
        No Challenge spins yet. The chart will plot your balance after every spin.
      </p>
    )
  }

  const dot = (props: DotProps) => {
    const { cx, cy, payload } = props
    if (cx === undefined || cy === undefined || !payload) return <g />
    const r = payload.jackpot ? 5 : 3
    const fill = payload.jackpot ? '#FFC94D' : payload.win ? '#4ADE80' : '#FF5252'
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="#0B0B18" strokeWidth={1} />
  }

  return (
    <div data-testid="balance-chart">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC94D" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#FFC94D" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2E2E5E" strokeOpacity={0.4} strokeDasharray="3 3" />
          <XAxis dataKey="i" hide />
          <YAxis
            width={64}
            tick={{ fill: '#A9A7C9', fontSize: 10, fontFamily: 'Space Mono' }}
            tickFormatter={(v: number) => formatNumber(v)}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#12122A',
              border: '1px solid #2E2E5E',
              borderRadius: 10,
              fontFamily: 'Space Mono',
              fontSize: 12,
              color: '#F4F2FF',
            }}
            formatter={(value: number | string) => [formatNumber(Number(value)) + ' 🪙', 'BALANCE']}
            labelFormatter={() => ''}
          />
          <ReferenceLine
            y={challenge.startingBalance}
            stroke="#3D3D7A"
            strokeDasharray="5 5"
            ifOverflow="extendDomain"
          />
          <Area
            type="monotone"
            dataKey="b"
            stroke="#E0A62E"
            strokeWidth={2}
            fill="url(#balanceFill)"
            dot={data.length <= 500 ? (dot as unknown as boolean) : false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="tnum mt-2 text-center text-[10px] text-text-muted">
        <span className="text-state-win">● win</span> · <span className="text-danger-red">● loss</span> ·{' '}
        <span className="text-sim-coin">● jackpot</span> · dashed line = starting balance
      </p>
    </div>
  )
}
