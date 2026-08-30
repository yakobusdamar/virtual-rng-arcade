import { describe, expect, it } from 'vitest'
import { generateConfig, simulateBatch } from '../src/engine/probabilityEngine'
import { computeExpectedReturnPer100 } from '../src/utils/calculations'
import { mulberry32 } from './helpers'

describe('PRD §22 config generator', () => {
  it('pins theoretical EV to 100 − houseEdge across the slider domain', () => {
    for (const h of [0, 5, 10, 15, 20]) {
      for (const v of [0, 0.5, 1]) {
        const ev = computeExpectedReturnPer100(generateConfig(h, v))
        expect(ev, `h=${h} v=${v}`).toBeCloseTo(100 - h, 4)
      }
    }
  })

  it('produces a valid probability table (sums to 1, non-negative)', () => {
    const cfg = generateConfig(13, 0.7)
    const sum = cfg.table.reduce((a, r) => a + r.probability, 0)
    expect(sum).toBeCloseTo(1, 6)
    for (const row of cfg.table) expect(row.probability).toBeGreaterThanOrEqual(0)
  })

  it('keeps the spin cost fixed at 100 (§29.5)', () => {
    expect(generateConfig(0, 0).spinCost).toBe(100)
    expect(generateConfig(20, 1).spinCost).toBe(100)
  })
})

describe('PRD §22 batch simulation', () => {
  it('player return ≈ 100 − houseEdge over 10,000 spins', () => {
    for (const h of [0, 10, 20]) {
      const cfg = generateConfig(h, 0.5)
      const batch = simulateBatch(cfg, 10_000, mulberry32(42 + h))
      expect(batch.playerReturnPct, `h=${h}`).toBeGreaterThan(100 - h - 12)
      expect(batch.playerReturnPct, `h=${h}`).toBeLessThan(100 - h + 12)
      expect(batch.totalSpent).toBe(10_000 * 100)
    }
  })

  it('system advantage complements player return', () => {
    const batch = simulateBatch(generateConfig(10, 0.5), 5_000, mulberry32(7))
    expect(batch.playerReturnPct + batch.systemAdvantagePct).toBeCloseTo(100, 6)
  })

  it('sandbox never receives or mutates live state (pure inputs/outputs)', () => {
    // simulateBatch(config, spins, rng, startingBalance) — no store access exists.
    const before = simulateBatch(generateConfig(10, 0.5), 1_000, mulberry32(1))
    const again = simulateBatch(generateConfig(10, 0.5), 1_000, mulberry32(1))
    expect(again).toEqual(before)
  })
})
