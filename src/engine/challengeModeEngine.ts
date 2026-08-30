import type { ChallengeCategory, ChallengeConfig, ChallengeOutcome, Reels } from './types'
import { pickIndex, type Rng } from './rng'
import { LOW_SYMBOLS, SYMBOL_IDS } from './symbols'

/**
 * PRD §7 example configuration — the default fixed probability table.
 * Probabilities are static per config; nothing about them depends on
 * balance, history, or behavior (PRD §29.7).
 */
export const DEFAULT_CHALLENGE_CONFIG: ChallengeConfig = {
  spinCost: 100,
  table: [
    { category: 'NO_MATCH', probability: 0.55, simCoinReturn: 0 },
    { category: 'SMALL_WIN', probability: 0.25, simCoinReturn: 50 },
    { category: 'MEDIUM_WIN', probability: 0.12, simCoinReturn: 150 },
    { category: 'BIG_WIN', probability: 0.06, simCoinReturn: 400 },
    { category: 'JACKPOT', probability: 0.02, simCoinReturn: 2000 },
  ],
}

export const CATEGORY_LABEL: Record<ChallengeCategory, string> = {
  NO_MATCH: 'NO MATCH',
  SMALL_WIN: 'SMALL WIN',
  MEDIUM_WIN: 'MEDIUM WIN',
  BIG_WIN: 'BIG WIN',
  JACKPOT: 'JACKPOT',
}

/**
 * PRD §15: "The displayed outcome must always match the actual reward."
 * Each category maps deterministically to reel symbols that can only be
 * read back as that category — a shown pair/triple always pays its table value.
 */
export function reelsForCategory(category: ChallengeCategory, rng: Rng): Reels {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]

  switch (category) {
    case 'NO_MATCH': {
      // Three distinct symbols — can never read as a pair or triple.
      const pool = [...SYMBOL_IDS]
      const a = pool.splice(Math.floor(rng() * pool.length), 1)[0]
      const b = pool.splice(Math.floor(rng() * pool.length), 1)[0]
      const c = pool.splice(Math.floor(rng() * pool.length), 1)[0]
      return [a, b, c]
    }
    case 'SMALL_WIN': {
      // Exactly one pair — any pair visually means "small win".
      const pair = pick(SYMBOL_IDS)
      const others = SYMBOL_IDS.filter((s) => s !== pair)
      const third = pick(others)
      const layout = rng()
      if (layout < 1 / 3) return [pair, pair, third]
      if (layout < 2 / 3) return [pair, third, pair]
      return [third, pair, pair]
    }
    case 'MEDIUM_WIN': {
      const s = pick(LOW_SYMBOLS)
      return [s, s, s]
    }
    case 'BIG_WIN':
      return ['star', 'star', 'star']
    case 'JACKPOT':
      return ['diamond', 'diamond', 'diamond']
  }
}

/**
 * PRD §6/§7: sample the outcome category from the fixed table, then render
 * reels that represent it. No other input influences the result.
 */
export function spinChallenge(config: ChallengeConfig, rng: Rng): ChallengeOutcome {
  const idx = pickIndex(
    config.table.map((r) => r.probability),
    rng,
  )
  const row = config.table[idx]
  return {
    category: row.category,
    simCoinReturn: row.simCoinReturn,
    reels: reelsForCategory(row.category, rng),
  }
}

/** Read reels back as a category — used by QA to prove display/payout consistency. */
export function categoryFromReels(reels: Reels): ChallengeCategory {
  const [a, b, c] = reels
  if (a === b && b === c) {
    if (a === 'diamond') return 'JACKPOT'
    if (a === 'star') return 'BIG_WIN'
    if (LOW_SYMBOLS.includes(a)) return 'MEDIUM_WIN'
    // Funny triples never occur in Challenge Mode visuals, but if they did
    // they would read as a big win — the payout table decides, not the symbol.
    return 'BIG_WIN'
  }
  if (a === b || b === c || a === c) return 'SMALL_WIN'
  return 'NO_MATCH'
}
