import type { PendingOutcome } from '../store/gameStore'

/**
 * PRD §14 baseline (800/1200/1600 ms). "Suggested" in the PRD, so the
 * anticipation extension is allowed: the outcome is already fixed at spin
 * start, so the extra reel-3 drama changes presentation only — the odds
 * stay exactly as configured (PRD §29.7).
 */
export const BASE_STOPS = [800, 1200, 1600] as const

export function anticipationMs(p: PendingOutcome | null): number {
  if (!p) return 0
  if (p.mode === 'challenge') {
    return p.category === 'BIG_WIN' || p.category === 'JACKPOT' ? 900 : 0
  }
  // Normal mode: first two reels match (pair or triple potential) — shorter tease.
  return p.reels[0] === p.reels[1] ? 500 : 0
}

/** When the store may apply the outcome (SpinButton schedules resolveSpin). */
export function resolveDelayMs(p: PendingOutcome | null): number {
  return BASE_STOPS[2] + anticipationMs(p)
}

export function reelStopDelay(index: number, p: PendingOutcome | null): number {
  return BASE_STOPS[index] + (index === 2 ? anticipationMs(p) : 0)
}
