import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { browserStorage, createMemoryStorage, STORAGE_KEY } from '../src/utils/storage'
import { dateGroupLabel, formatNumber, formatSigned } from '../src/utils/format'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') || p.endsWith('.tsx') ? [p] : []
  })
}

const SRC = join(__dirname, '..', 'src')
const allSource = walk(SRC).map((f) => readFileSync(f, 'utf8'))

describe('§29 rules audit — forbidden capabilities', () => {
  it('contains zero network code (§29.9/§10: top-up contacts nobody)', () => {
    const forbidden = ['fetch(', 'XMLHttpRequest', 'WebSocket', "require('http')", 'axios', 'EventSource']
    for (const src of allSource) {
      for (const token of forbidden) {
        expect(src.includes(token), `forbidden network token: ${token}`).toBe(false)
      }
    }
  })

  it('contains no real payment provider or brand tokens (§27)', () => {
    const brands = ['QRIS', 'GoPay', 'OVO', 'DANA', 'PayPal', 'Stripe', 'Midtrans', 'Visa', 'Mastercard']
    for (const src of allSource) {
      for (const brand of brands) {
        expect(src.includes(brand), `forbidden brand token: ${brand}`).toBe(false)
      }
    }
  })

  it('contains no purchasable-credit / withdrawal / cash-out affordances (§29.10/14)', () => {
    const forbiddenWords = ['withdraw', 'cash-out', 'cashout', 'purchase', 'buy now', 'deposit ']
    for (const src of allSource) {
      const lower = src.toLowerCase()
      for (const word of forbiddenWords) {
        expect(lower.includes(word), `forbidden money wording: "${word}"`).toBe(false)
      }
    }
  })

  it('never renders an exchange between SIM COINS and FUN POINTS (§29.1)', () => {
    // No "exchange", "convert", or "1 FUN POINT = n SIM" concept exists in code.
    for (const src of allSource) {
      const lower = src.toLowerCase()
      expect(lower.includes('exchange'), 'no exchange concept').toBe(false)
      expect(lower.includes('convert'), 'no conversion concept').toBe(false)
    }
  })
})

describe('persistence (PRD §25, §29.13)', () => {
  it('uses a local storage key and never external endpoints', () => {
    expect(STORAGE_KEY).toBe('vrng-arcade-v1')
  })

  it('browserStorage falls back to memory when localStorage is unavailable', () => {
    // In node there is no window — browserStorage must still work.
    browserStorage.setItem(STORAGE_KEY, '{"simCoins":123}')
    expect(browserStorage.getItem(STORAGE_KEY)).toBe('{"simCoins":123}')
    browserStorage.removeItem(STORAGE_KEY)
    expect(browserStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('memory storage isolates entries', () => {
    const a = createMemoryStorage()
    const b = createMemoryStorage()
    a.setItem('k', '1')
    expect(b.getItem('k')).toBeNull()
  })
})

describe('formatting (design.md §2 numeric rule)', () => {
  it('groups thousands like the PRD examples', () => {
    expect(formatNumber(50_000)).toBe('50,000')
    expect(formatNumber(12_450)).toBe('12,450')
    expect(formatNumber(2000)).toBe('2,000')
    expect(formatSigned(-12_800)).toBe('-12,800')
    expect(formatSigned(7800)).toBe('+7,800')
  })

  it('groups transactions as TODAY / earlier (PRD §11)', () => {
    const now = new Date('2026-08-30T12:00:00Z').getTime()
    expect(dateGroupLabel(new Date('2026-08-30T09:00:00Z').toISOString(), now)).toBe('TODAY')
    expect(dateGroupLabel(new Date('2026-08-29T09:00:00Z').toISOString(), now)).toBe('YESTERDAY')
    expect(dateGroupLabel(new Date('2026-08-01T09:00:00Z').toISOString(), now)).toContain('Aug')
  })
})
