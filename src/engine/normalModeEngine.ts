import type { Reels, SymbolId } from './types'
import { SYMBOL_IDS } from './symbols'
import type { Rng } from './rng'

/**
 * Normal Mode (PRD §5, §15): pure independent RNG per reel.
 * No cost, no house model — three uniform picks over the eight symbols.
 */
export function spinNormal(rng: Rng): Reels {
  return [
    SYMBOL_IDS[Math.floor(rng() * SYMBOL_IDS.length)],
    SYMBOL_IDS[Math.floor(rng() * SYMBOL_IDS.length)],
    SYMBOL_IDS[Math.floor(rng() * SYMBOL_IDS.length)],
  ]
}

export function countSymbol(reels: Reels, id: SymbolId): number {
  return reels.filter((r) => r === id).length
}
