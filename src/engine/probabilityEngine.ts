import type { ChallengeCategory, ChallengeConfig } from './types'
import type { Rng } from './rng'
import { spinChallenge } from './challengeModeEngine'

export const EXPLORER_PAYOUTS: Record<ChallengeCategory, number> = {
  NO_MATCH: 0,
  SMALL_WIN: 50,
  MEDIUM_WIN: 150,
  BIG_WIN: 400,
  JACKPOT: 2000,
}

const CATEGORY_ORDER: ChallengeCategory[] = [
  'NO_MATCH',
  'SMALL_WIN',
  'MEDIUM_WIN',
  'BIG_WIN',
  'JACKPOT',
]

const BASE_WEIGHTS: number[] = [0, 0.25, 0.12, 0.06, 0.02] // NO_MATCH resolved last

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * PRD §22 sandbox: build a config with a target house edge and volatility.
 * Fixed payouts; volatility reweights win categories (fewer small wins,
 * more big/jackpot mass); the scale factor pins theoretical EV to
 * (100 − houseEdge) per 100 spent. Pure math — never touches live state.
 */
export function generateConfig(houseEdgePct: number, volatility01: number): ChallengeConfig {
  const h = clamp(houseEdgePct, 0, 20)
  const v = clamp(volatility01, 0, 1)

  const w = [
    0,
    BASE_WEIGHTS[1] * (1 - 0.5 * v), // small wins shrink
    BASE_WEIGHTS[2] * (1 - 0.25 * v),
    BASE_WEIGHTS[3] * (1 + 1.5 * v), // big wins grow
    BASE_WEIGHTS[4] * (1 + 4 * v), // jackpot grows most
  ]

  const evWeighted = w[1] * 50 + w[2] * 150 + w[3] * 400 + w[4] * 2000
  const s = (100 - h) / evWeighted

  const probabilities = w.map((wi) => s * wi)
  probabilities[0] = 1 - (probabilities[1] + probabilities[2] + probabilities[3] + probabilities[4])

  return {
    spinCost: 100,
    table: CATEGORY_ORDER.map((category, i) => ({
      category,
      probability: probabilities[i],
      simCoinReturn: EXPLORER_PAYOUTS[category],
    })),
  }
}

export interface BatchResult {
  spins: number
  totalSpent: number
  totalReturned: number
  playerReturnPct: number
  systemAdvantagePct: number
  history: number[] // simulated balance, downsampled
  jackpots: number
}

/** PRD §22: batch simulation for the explorer sandbox only. */
export function simulateBatch(
  config: ChallengeConfig,
  spins: number,
  rng: Rng,
  startingBalance = 10_000,
): BatchResult {
  let spent = 0
  let returned = 0
  let jackpots = 0
  let balance = startingBalance
  const history: number[] = [balance]
  const stride = Math.max(1, Math.floor(spins / 400))

  for (let i = 1; i <= spins; i++) {
    spent += config.spinCost
    balance -= config.spinCost
    const outcome = spinChallenge(config, rng)
    returned += outcome.simCoinReturn
    balance += outcome.simCoinReturn
    if (outcome.category === 'JACKPOT') jackpots++
    if (i % stride === 0 || i === spins) history.push(balance)
  }

  const playerReturnPct = spent > 0 ? (returned / spent) * 100 : 0
  return {
    spins,
    totalSpent: spent,
    totalReturned: returned,
    playerReturnPct,
    systemAdvantagePct: 100 - playerReturnPct,
    history,
    jackpots,
  }
}
