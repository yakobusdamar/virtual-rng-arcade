import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CHALLENGE_CONFIG,
  categoryFromReels,
  reelsForCategory,
  spinChallenge,
} from '../src/engine/challengeModeEngine'
import { computeExpectedReturnPer100, netResult, returnRate } from '../src/utils/calculations'
import { mulberry32 } from './helpers'

const config = DEFAULT_CHALLENGE_CONFIG

describe('PRD §7 expected value math', () => {
  it('computes 94.5 per 100 from the default table (never hardcoded)', () => {
    expect(computeExpectedReturnPer100(config)).toBeCloseTo(94.5, 6)
  })

  it('tracks config changes instead of a hardcoded value', () => {
    const doubled = { ...config, table: config.table.map((r) => ({ ...r, simCoinReturn: r.simCoinReturn * 2 })) }
    expect(computeExpectedReturnPer100(doubled)).toBeCloseTo(189, 6)
  })

  it('default table produces a NEGATIVE long-term expectation', () => {
    expect(computeExpectedReturnPer100(config)).toBeLessThan(100)
  })

  it('§20 formulas: net and return rate', () => {
    expect(netResult(52_000, 39_200)).toBe(-12_800)
    expect(returnRate(52_000, 39_200)).toBeCloseTo(75.3846, 3)
    expect(returnRate(0, 0)).toBe(0)
  })
})

describe('PRD §7/§15 challenge outcome sampling', () => {
  const N = 20_000
  const rng = mulberry32(1234)

  it('category frequencies match the fixed table within tolerance (no adaptation)', () => {
    const counts = { NO_MATCH: 0, SMALL_WIN: 0, MEDIUM_WIN: 0, BIG_WIN: 0, JACKPOT: 0 }
    for (let i = 0; i < N; i++) counts[spinChallenge(config, rng).category]++
    const expected: Record<keyof typeof counts, number> = {
      NO_MATCH: 0.55,
      SMALL_WIN: 0.25,
      MEDIUM_WIN: 0.12,
      BIG_WIN: 0.06,
      JACKPOT: 0.02,
    }
    for (const cat of Object.keys(expected) as (keyof typeof counts)[]) {
      const freq = counts[cat] / N
      expect(freq, cat).toBeGreaterThan(expected[cat] - 0.02)
      expect(freq, cat).toBeLessThan(expected[cat] + 0.02)
    }
  })

  it('displayed outcome always matches the actual reward (§29.8)', () => {
    const returnByCategory = Object.fromEntries(config.table.map((r) => [r.category, r.simCoinReturn]))
    for (let i = 0; i < 5_000; i++) {
      const outcome = spinChallenge(config, rng)
      const readBack = categoryFromReels(outcome.reels)
      expect(readBack, `${JSON.stringify(outcome.reels)}`).toBe(outcome.category)
      expect(returnByCategory[readBack]).toBe(outcome.simCoinReturn)
    }
  })
})

describe('category → reel visual invariants (§15)', () => {
  const rng = mulberry32(77)

  it('NO_MATCH renders three distinct symbols', () => {
    for (let i = 0; i < 500; i++) {
      const [a, b, c] = reelsForCategory('NO_MATCH', rng)
      expect(new Set([a, b, c]).size).toBe(3)
    }
  })

  it('SMALL_WIN renders exactly one pair', () => {
    for (let i = 0; i < 500; i++) {
      const [a, b, c] = reelsForCategory('SMALL_WIN', rng)
      const isPair = (a === b && b !== c) || (b === c && a !== b) || (a === c && a !== b)
      expect(isPair).toBe(true)
    }
  })

  it('MEDIUM_WIN renders a triple of 🍒/🍋/🍀; BIG = ⭐⭐⭐; JACKPOT = 💎💎💎', () => {
    for (let i = 0; i < 500; i++) {
      const medium = reelsForCategory('MEDIUM_WIN', rng)
      expect(medium[0]).toBe(medium[1])
      expect(medium[1]).toBe(medium[2])
      expect(['cherry', 'lemon', 'clover']).toContain(medium[0])
      expect(reelsForCategory('BIG_WIN', rng)).toEqual(['star', 'star', 'star'])
      expect(reelsForCategory('JACKPOT', rng)).toEqual(['diamond', 'diamond', 'diamond'])
    }
  })
})
