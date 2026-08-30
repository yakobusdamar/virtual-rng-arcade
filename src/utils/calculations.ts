import type { ChallengeConfig } from '../engine/types'

/**
 * Expected SIM COIN return per 100 spent, computed from the live config.
 * PRD §7: never hardcode — always derive from the table.
 */
export function computeExpectedReturnPer100(config: ChallengeConfig): number {
  const perSpin = config.table.reduce(
    (sum, row) => sum + row.probability * row.simCoinReturn,
    0,
  )
  return (perSpin / config.spinCost) * 100
}

/** PRD §20: Net = Total Returned − Total Spent. */
export function netResult(totalSpent: number, totalReturned: number): number {
  return totalReturned - totalSpent
}

/** PRD §20: Return Rate = (Total Returned / Total Spent) × 100. */
export function returnRate(totalSpent: number, totalReturned: number): number {
  if (totalSpent <= 0) return 0
  return (totalReturned / totalSpent) * 100
}
