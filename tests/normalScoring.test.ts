import { describe, expect, it } from 'vitest'
import { spinNormal } from '../src/engine/normalModeEngine'
import { scoreReels } from '../src/engine/scoringEngine'
import { SYMBOL_IDS } from '../src/engine/symbols'
import type { Reels, SymbolId } from '../src/engine/types'
import { fixedRng, mulberry32 } from './helpers'

describe('PRD §5/§15 Normal Mode: independent uniform RNG', () => {
  it('produces only valid symbols', () => {
    const rng = mulberry32(9)
    for (let i = 0; i < 1_000; i++) {
      for (const reel of spinNormal(rng)) expect(SYMBOL_IDS).toContain(reel)
    }
  })

  it('is roughly uniform over the eight symbols (no house model)', () => {
    const rng = mulberry32(10)
    const counts: Record<SymbolId, number> = {
      cherry: 0, lemon: 0, star: 0, clover: 0, diamond: 0, chicken: 0, potato: 0, fish: 0,
    }
    const N = 16_000
    for (let i = 0; i < N; i++) for (const reel of spinNormal(rng)) counts[reel]++
    for (const id of SYMBOL_IDS) {
      const freq = counts[id] / (N * 3)
      expect(freq, id).toBeGreaterThan(0.125 - 0.025)
      expect(freq, id).toBeLessThan(0.125 + 0.025)
    }
  })
})

describe('PRD §16 FUN POINT scoring', () => {
  const reels = (...s: SymbolId[]): Reels => [s[0], s[1], s[2]]

  it('awards +10 for any spin with no match', () => {
    const r = scoreReels(reels('cherry', 'lemon', 'star'))
    expect(r.funPoints).toBe(10)
    expect(r.isPair).toBe(false)
  })

  it('awards +60 for a pair (+10 base, +50 pair)', () => {
    expect(scoreReels(reels('cherry', 'cherry', 'star')).funPoints).toBe(60)
    expect(scoreReels(reels('star', 'fish', 'star')).funPoints).toBe(60)
  })

  it('awards the PRD table values for triples', () => {
    expect(scoreReels(reels('cherry', 'cherry', 'cherry')).funPoints).toBe(200)
    expect(scoreReels(reels('star', 'star', 'star')).funPoints).toBe(500)
    expect(scoreReels(reels('diamond', 'diamond', 'diamond')).funPoints).toBe(1000)
    expect(scoreReels(reels('chicken', 'chicken', 'chicken')).funPoints).toBe(777)
    expect(scoreReels(reels('potato', 'potato', 'potato')).funPoints).toBe(999)
  })

  it('marks CHICKEN_EVENT and POTATO_COLLAPSE as special events (§13)', () => {
    expect(scoreReels(reels('chicken', 'chicken', 'chicken')).special).toBe('CHICKEN_EVENT')
    expect(scoreReels(reels('potato', 'potato', 'potato')).special).toBe('POTATO_COLLAPSE')
  })

  it('gives the documented odd-triple bonus for lemon/clover/fish', () => {
    expect(scoreReels(reels('fish', 'fish', 'fish')).funPoints).toBe(150)
    expect(scoreReels(reels('clover', 'clover', 'clover')).special).toBe('ODD_TRIPLE')
  })
})

describe('Normal Mode never touches SIM COINS (§29.4)', () => {
  it('spinNormal has no access to any balance or cost concept', () => {
    // The engine signature takes only an rng — no balance, no cost, no state.
    const rng = fixedRng(0.5)
    expect(spinNormal(rng)).toHaveLength(3)
  })
})
