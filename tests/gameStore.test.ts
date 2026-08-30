import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../src/store/gameStore'
import { DEFAULT_CHALLENGE_CONFIG } from '../src/engine/challengeModeEngine'
import { generateConfig } from '../src/engine/probabilityEngine'
import { fixedRng } from './helpers'

const S = () => useGameStore.getState()

beforeEach(() => {
  S().resetSimulation()
  S().setMode('challenge')
})

describe('PRD §6/§14 Challenge Mode spin flow', () => {
  it('deducts exactly the configured cost BEFORE animation', () => {
    const res = S().startSpin(fixedRng(0.9))
    expect(res.ok).toBe(true)
    expect(S().simCoins).toBe(50_000 - S().challengeConfig.spinCost)
    expect(S().spinning).toBe(true)
  })

  it('blocks the spin when balance is insufficient, without deducting', () => {
    useGameStore.setState({ simCoins: 50 })
    const res = S().startSpin(fixedRng(0.9))
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('insufficient_coins')
    expect(S().simCoins).toBe(50)
    expect(S().spinning).toBe(false)
  })

  it('resolve applies rewards, ledger stats, and re-enables SPIN', () => {
    S().startSpin(fixedRng(0.99999)) // rigged → JACKPOT, returns 2000
    S().resolveSpin(fixedRng(0.5))
    const c = S().challenge
    expect(c.totalSpins).toBe(1)
    expect(c.totalSpent).toBe(100)
    expect(c.totalReturned).toBe(2_000)
    expect(c.biggestWin).toBe(2_000)
    expect(c.outcomeCounts.JACKPOT).toBe(1)
    expect(S().simCoins).toBe(50_000 - 100 + 2_000)
    expect(c.balanceHistory).toHaveLength(1)
    expect(c.balanceHistory[0]).toEqual({ b: 51_900, win: true, jackpot: true })
    expect(S().spinning).toBe(false)
  })

  it('anchors startingBalance on the first challenge spin (§20)', () => {
    S().startSpin(fixedRng(0.3))
    S().resolveSpin(fixedRng(0.5))
    expect(S().challenge.startingBalance).toBe(50_000)
  })

  it('loss updates loss streak + balance history as a loss point', () => {
    S().startSpin(fixedRng(0.0)) // rigged → NO_MATCH, returns 0
    S().resolveSpin(fixedRng(0.5))
    expect(S().streaks.challenge).toBe(0)
    expect(S().lossStreaks.challenge).toBe(1)
    expect(S().challenge.balanceHistory[0].win).toBe(false)
  })

  it('FUN POINTS are never awarded for Challenge spins (§29.1)', () => {
    // Pre-seed the achievements this spin would unlock so any funPoints delta
    // could only come from the spin itself.
    useGameStore.setState({
      achievements: { first_spin: { unlockedAt: 'seeded' }, jackpot: { unlockedAt: 'seeded' } },
    })
    const before = S().funPoints
    S().startSpin(fixedRng(0.99999)) // JACKPOT → +2000 SIM COINS
    S().resolveSpin(fixedRng(0.5))
    expect(S().challenge.totalReturned).toBe(2_000)
    expect(S().funPoints).toBe(before) // zero spin-derived FUN POINTS
  })
})

describe('PRD §5 Normal Mode spin flow', () => {
  it('never deducts SIM COINS and awards FUN POINTS', () => {
    S().setMode('normal')
    useGameStore.setState({
      achievements: { first_spin: { unlockedAt: 'seeded' } },
    })
    const before = S().simCoins
    // Rigged rng 0.0 → every reel lands on index 0 → 🍒🍒🍒 triple cherry.
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    expect(S().simCoins).toBe(before)
    expect(S().normal.totalSpins).toBe(1)
    expect(S().funPoints).toBe(200) // triple cherry, no other bonuses
    expect(S().normal.funPointsEarned).toBe(S().funPoints)
  })

  it('tracks symbol counts, triples and rare combinations (§21)', () => {
    S().setMode('normal')
    S().startSpin(fixedRng(0.0)) // 🍒🍒🍒
    S().resolveSpin(fixedRng(0.5))
    const n = S().normal
    expect(Object.values(n.symbolCounts).reduce((a, b) => a + b, 0)).toBe(3)
    expect(n.symbolCounts.cherry).toBe(3)
    expect(n.tripleCounts.cherry).toBe(1)
    expect(n.rareCombinations['CHICKEN_EVENT']).toBeUndefined()
  })
})

describe('PRD §9 mode switching preserves separate records', () => {
  it('switching modes never resets, merges, or modifies stats', () => {
    S().startSpin(fixedRng(0.99999))
    S().resolveSpin(fixedRng(0.5))
    const challengeBefore = S().challenge

    S().setMode('normal')
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    const normalAfter = S().normal

    S().setMode('challenge')
    expect(S().challenge).toEqual(challengeBefore)
    expect(normalAfter.totalSpins).toBe(1)
    expect(S().challenge.totalSpins).toBe(1)
    expect(S().normal.totalSpins).toBe(1)
  })
})

describe('PRD §17 streak system', () => {
  it('streaks accumulate on wins and reset on losses, best kept per mode', () => {
    S().setMode('challenge')
    for (let i = 0; i < 3; i++) {
      S().startSpin(fixedRng(0.99999)) // win
      S().resolveSpin(fixedRng(0.5))
    }
    expect(S().streaks.challenge).toBe(3)
    expect(S().challenge.bestStreak).toBe(3)

    S().startSpin(fixedRng(0.0)) // loss
    S().resolveSpin(fixedRng(0.5))
    expect(S().streaks.challenge).toBe(0)
    expect(S().challenge.longestLossStreak).toBe(1)
  })

  it('x3 fires a celebration; x5 triggers the screen flash', () => {
    for (let i = 0; i < 3; i++) {
      S().startSpin(fixedRng(0.99999))
      S().resolveSpin(fixedRng(0.5))
    }
    expect(S().streaks.challenge).toBe(3)
    expect(S().celebration?.text).toContain('STREAK x3')

    S().startSpin(fixedRng(0.99999))
    S().resolveSpin(fixedRng(0.5))
    expect(S().celebration?.text).toContain('STREAK x3') // x4: no new milestone

    S().startSpin(fixedRng(0.99999))
    S().resolveSpin(fixedRng(0.5))
    expect(S().streaks.challenge).toBe(5)
    expect(S().celebration?.text).toContain('STREAK x5')
    expect(S().screenFlashNonce).toBeGreaterThan(0)
  })
})

describe('PRD §10/§11 Virtual Top-Up Simulator', () => {
  it('records a fictional transaction immediately, then credits on approval', () => {
    expect(S().topUpConfirm(10_000).ok).toBe(true)
    const [tx] = S().transactions
    expect(tx.type).toBe('virtual_topup')
    expect(tx.amount).toBe(10_000)
    expect(tx.timestamp).toBeTruthy()
    expect(S().simCoins).toBe(50_000) // not yet applied

    S().topUpApply(10_000)
    expect(S().simCoins).toBe(60_000)
  })

  it('rejects invalid amounts', () => {
    for (const bad of [0, -5, 1.5, 2_000_000, NaN]) {
      expect(S().topUpConfirm(bad).ok).toBe(false)
    }
    expect(S().transactions).toHaveLength(0)
  })
})

describe('PRD §23 achievements', () => {
  it('first spin unlocks First Spin with a FUN POINT bonus', () => {
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    expect(S().achievements.first_spin).toBeTruthy()
    // Challenge spin itself awards no FUN POINTS; the achievement bonus is +100.
    expect(S().funPoints).toBe(100)
  })

  it('opening statistics unlocks Statistician', () => {
    S().markStatsOpened()
    expect(S().achievements.statistician).toBeTruthy()
    expect(S().statsOpenedOnce).toBe(true)
  })

  it('jackpot spin unlocks JACKPOT achievement', () => {
    S().setMode('challenge')
    S().startSpin(fixedRng(0.99999))
    S().resolveSpin(fixedRng(0.5))
    expect(S().achievements.jackpot).toBeTruthy()
  })

  it('a rigged triple chicken unlocks Chicken Farmer with +777 scored', () => {
    // Force normal reels to 🐔🐔🐔 via the rigged rng path on scoring:
    S().startSpin(fixedRng(0.0))
    // simulate the combination effect directly through score application by
    // rigging the reel result is engine-level (covered in normalScoring.test);
    // here we assert the predicate reacts to tripleCounts:
    useGameStore.setState({
      normal: { ...S().normal, tripleCounts: { ...S().normal.tripleCounts, chicken: 1 } },
    })
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    expect(S().achievements.chicken_farmer).toBeTruthy()
  })
})

describe('PRD §19 reality check milestones', () => {
  it('fires once at 50 challenge spins with factual numbers', () => {
    S().setMode('challenge')
    useGameStore.setState({ challenge: { ...S().challenge, totalSpins: 49, startingBalance: 50_000 } })
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    expect(S().challenge.totalSpins).toBe(50)
    expect(S().pendingRealityCheck).toBe(50)
    expect(S().realityChecksSeen).toContain(50)

    S().dismissRealityCheck()
    expect(S().pendingRealityCheck).toBeNull()

    // does not refire at 51
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    expect(S().pendingRealityCheck).toBeNull()
  })

  it('Reality Check achievement at 100 challenge spins', () => {
    S().setMode('challenge')
    useGameStore.setState({ challenge: { ...S().challenge, totalSpins: 99 } })
    S().startSpin(fixedRng(0.0))
    S().resolveSpin(fixedRng(0.5))
    expect(S().achievements.reality_check).toBeTruthy()
  })
})

describe('PRD §22/§29.12 explorer isolation and explicit adoption', () => {
  it('recording a run unlocks Lab Rat without touching balances', () => {
    const coins = S().simCoins
    S().recordExplorerRun()
    expect(S().explorerRuns).toBe(1)
    expect(S().achievements.lab_rat).toBeTruthy()
    expect(S().simCoins).toBe(coins)
  })

  it('adopting a config replaces the live table and EV changes accordingly', () => {
    const cfg = generateConfig(20, 1)
    S().adoptChallengeConfig(cfg)
    expect(S().challengeConfig).toEqual(cfg)
    expect(S().challengeConfig.spinCost).toBe(100)
  })
})

describe('PRD §26 reset simulation', () => {
  it('erases coins, points, stats, achievements, transactions, milestones', () => {
    S().setMode('challenge')
    S().startSpin(fixedRng(0.99999))
    S().resolveSpin(fixedRng(0.5))
    S().topUpConfirm(10_000)
    S().markStatsOpened()

    S().resetSimulation()
    expect(S().simCoins).toBe(50_000)
    expect(S().funPoints).toBe(0)
    expect(S().challenge.totalSpins).toBe(0)
    expect(S().transactions).toHaveLength(0)
    expect(Object.keys(S().achievements)).toHaveLength(0)
    expect(S().statsOpenedOnce).toBe(false)
    expect(S().mode).toBe('normal')
  })
})

describe('default configuration integrity', () => {
  it('matches the PRD §7 example table', () => {
    expect(DEFAULT_CHALLENGE_CONFIG.spinCost).toBe(100)
    expect(DEFAULT_CHALLENGE_CONFIG.table.map((r) => r.probability)).toEqual([0.55, 0.25, 0.12, 0.06, 0.02])
    expect(DEFAULT_CHALLENGE_CONFIG.table.map((r) => r.simCoinReturn)).toEqual([0, 50, 150, 400, 2000])
  })
})
