import type { Reels, SymbolId } from './types'

export type SpecialEvent = 'CHICKEN_EVENT' | 'POTATO_COLLAPSE' | 'ODD_TRIPLE'

export interface ScoreResult {
  /** FUN POINTS awarded for this spin (PRD §16 table + documented extension). */
  funPoints: number
  isPair: boolean
  triple: SymbolId | null
  special: SpecialEvent | null
}

export const FUN_POINT_TABLE = {
  baseSpin: 10,
  pair: 50,
  triple: {
    cherry: 200,
    star: 500,
    diamond: 1000,
    chicken: 777, // CHICKEN_EVENT (PRD §13/§16)
    potato: 999, // POTATO_COLLAPSE (PRD §16/§18)
  } as Partial<Record<SymbolId, number>>,
  oddTriple: 150, // lemon / clover / fish — documented extension of the §16 example table
} as const

/**
 * PRD §16 scoring — FUN POINTS are spin-scoring for Normal Mode only:
 * Challenge Mode deals exclusively in SIM COIN returns (§5/§6/§21), so a
 * challenge payout can never be visually mirrored as a FUN POINT reward
 * (§29.1). Achievement bonuses are the only FUN POINT source in challenge.
 */
export function scoreReels(reels: Reels): ScoreResult {
  const [a, b, c] = reels

  if (a === b && b === c) {
    const listed = FUN_POINT_TABLE.triple[a]
    if (a === 'chicken') {
      return { funPoints: 777, isPair: false, triple: a, special: 'CHICKEN_EVENT' }
    }
    if (a === 'potato') {
      return { funPoints: 999, isPair: false, triple: a, special: 'POTATO_COLLAPSE' }
    }
    if (listed !== undefined) {
      return { funPoints: listed, isPair: false, triple: a, special: null }
    }
    return { funPoints: FUN_POINT_TABLE.oddTriple, isPair: false, triple: a, special: 'ODD_TRIPLE' }
  }

  const isPair = a === b || b === c || a === c
  return {
    funPoints: FUN_POINT_TABLE.baseSpin + (isPair ? FUN_POINT_TABLE.pair : 0),
    isPair,
    triple: null,
    special: null,
  }
}
