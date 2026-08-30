import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  AchievementId,
  ChallengeCategory,
  ChallengeConfig,
  ChallengeStats,
  Mode,
  NormalStats,
  Reels,
  StateSnapshot,
  SymbolId,
  Transaction,
} from '../engine/types'
import { cryptoRng, type Rng } from '../engine/rng'
import { DEFAULT_CHALLENGE_CONFIG, spinChallenge } from '../engine/challengeModeEngine'
import { spinNormal } from '../engine/normalModeEngine'
import { scoreReels, type ScoreResult } from '../engine/scoringEngine'
import { composeResultMessage } from '../engine/messages'
import { ACHIEVEMENT_MAP, evaluateAchievements } from '../engine/achievements'
import { browserStorage, STORAGE_KEY } from '../utils/storage'

export interface Toast {
  id: number
  emoji: string
  title: string
  body?: string
}

export interface LastOutcome {
  mode: Mode
  reels: Reels
  category: ChallengeCategory | null
  simCoinSpent: number
  simCoinReturn: number
  funPoints: number
  message: string
  streak: number
  nonce: number
}

interface PendingOutcome {
  mode: Mode
  reels: Reels
  category: ChallengeCategory | null
  spent: number
  simCoinReturn: number
  score: ScoreResult
}

export interface GameState {
  // ---- persisted (PRD §25) ----
  simCoins: number
  funPoints: number
  mode: Mode
  challengeConfig: ChallengeConfig
  normal: NormalStats
  challenge: ChallengeStats
  streaks: { normal: number; challenge: number }
  lossStreaks: { normal: number; challenge: number }
  transactions: Transaction[]
  achievements: Partial<Record<AchievementId, { unlockedAt: string }>>
  realityChecksSeen: number[]
  statsOpenedOnce: boolean
  explorerRuns: number
  // ---- transient ----
  spinning: boolean
  pendingOutcome: PendingOutcome | null
  lastOutcome: LastOutcome | null
  toasts: Toast[]
  screenFlashNonce: number
  celebration: { text: string; nonce: number } | null
  pendingRealityCheck: number | null

  // ---- actions ----
  startSpin: (rng?: Rng) => { ok: boolean; reason?: 'insufficient_coins' | 'already_spinning' }
  resolveSpin: (rng?: Rng) => void
  setMode: (mode: Mode) => void
  topUpConfirm: (amount: number) => { ok: boolean }
  topUpApply: (amount: number) => void
  markStatsOpened: () => void
  recordExplorerRun: () => void
  adoptChallengeConfig: (config: ChallengeConfig) => void
  resetSimulation: () => void
  pushToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
  clearCelebration: () => void
  dismissRealityCheck: () => void
}

export const INITIAL_NORMAL: NormalStats = {
  totalSpins: 0,
  funPointsEarned: 0,
  symbolCounts: { cherry: 0, lemon: 0, star: 0, clover: 0, diamond: 0, chicken: 0, potato: 0, fish: 0 },
  tripleCounts: { cherry: 0, lemon: 0, star: 0, clover: 0, diamond: 0, chicken: 0, potato: 0, fish: 0 },
  bestStreak: 0,
  rareCombinations: {},
}

export const INITIAL_CHALLENGE: ChallengeStats = {
  totalSpins: 0,
  startingBalance: 0,
  totalSpent: 0,
  totalReturned: 0,
  biggestWin: 0,
  longestLossStreak: 0,
  bestStreak: 0,
  outcomeCounts: { NO_MATCH: 0, SMALL_WIN: 0, MEDIUM_WIN: 0, BIG_WIN: 0, JACKPOT: 0 },
  balanceHistory: [],
}

const INITIAL = {
  simCoins: 50_000,
  funPoints: 0,
  mode: 'normal' as Mode,
  challengeConfig: DEFAULT_CHALLENGE_CONFIG,
  normal: INITIAL_NORMAL,
  challenge: INITIAL_CHALLENGE,
  streaks: { normal: 0, challenge: 0 },
  lossStreaks: { normal: 0, challenge: 0 },
  transactions: [] as Transaction[],
  achievements: {} as Partial<Record<AchievementId, { unlockedAt: string }>>,
  realityChecksSeen: [] as number[],
  statsOpenedOnce: false,
  explorerRuns: 0,
}

let toastId = 0
let outcomeNonce = 0
const appRng: Rng = cryptoRng()

function snapshotOf(s: GameState): StateSnapshot {
  return {
    normal: s.normal,
    challenge: s.challenge,
    transactions: s.transactions,
    achievements: s.achievements,
    statsOpenedOnce: s.statsOpenedOnce,
    explorerRuns: s.explorerRuns,
    totalSpins: s.normal.totalSpins + s.challenge.totalSpins,
    bestStreakAnyMode: Math.max(s.normal.bestStreak, s.challenge.bestStreak),
    totalTopup: s.transactions.reduce((sum, t) => sum + t.amount, 0),
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      spinning: false,
      pendingOutcome: null,
      lastOutcome: null,
      toasts: [],
      screenFlashNonce: 0,
      celebration: null,
      pendingRealityCheck: null,

      // PRD §14 steps 1–3 + engine roll. Deduction happens BEFORE animation.
      startSpin: (rng = appRng) => {
        const s = get()
        if (s.spinning) return { ok: false, reason: 'already_spinning' as const }

        if (s.mode === 'challenge') {
          const cost = s.challengeConfig.spinCost
          if (s.simCoins < cost) return { ok: false, reason: 'insufficient_coins' as const }
          if (s.challenge.totalSpins === 0) {
            set({ challenge: { ...s.challenge, startingBalance: s.simCoins } })
          }
          set({ simCoins: s.simCoins - cost })
          const outcome = spinChallenge(s.challengeConfig, rng)
          set({
            spinning: true,
            pendingOutcome: {
              mode: 'challenge',
              reels: outcome.reels,
              category: outcome.category,
              spent: cost,
              simCoinReturn: outcome.simCoinReturn,
              score: scoreReels(outcome.reels),
            },
          })
        } else {
          const reels = spinNormal(rng)
          set({
            spinning: true,
            pendingOutcome: {
              mode: 'normal',
              reels,
              category: null,
              spent: 0,
              simCoinReturn: 0,
              score: scoreReels(reels),
            },
          })
        }
        return { ok: true }
      },

      // PRD §14 steps 9–13: resolve, rewards, stats, streak, achievements, re-enable.
      resolveSpin: (rng = appRng) => {
        const s = get()
        const pending = s.pendingOutcome
        if (!pending) {
          set({ spinning: false })
          return
        }

        const next: Partial<GameState> = { spinning: false, pendingOutcome: null }
        outcomeNonce += 1

        if (pending.mode === 'challenge') {
          const challenge: ChallengeStats = { ...s.challenge }
          const simCoins = s.simCoins + pending.simCoinReturn
          const win = pending.simCoinReturn > 0

          challenge.totalSpins += 1
          challenge.totalSpent += pending.spent
          challenge.totalReturned += pending.simCoinReturn
          if (pending.simCoinReturn > challenge.biggestWin) challenge.biggestWin = pending.simCoinReturn
          challenge.outcomeCounts = {
            ...challenge.outcomeCounts,
            [pending.category as ChallengeCategory]: challenge.outcomeCounts[pending.category as ChallengeCategory] + 1,
          }

          const streak = win ? s.streaks.challenge + 1 : 0
          const lossStreak = win ? 0 : s.lossStreaks.challenge + 1
          challenge.balanceHistory = [
            ...challenge.balanceHistory.slice(-5000),
            { b: simCoins, win, jackpot: pending.category === 'JACKPOT' },
          ]
          if (streak > challenge.bestStreak) challenge.bestStreak = streak
          if (lossStreak > challenge.longestLossStreak) challenge.longestLossStreak = lossStreak

          next.simCoins = simCoins
          next.challenge = challenge
          next.streaks = { ...s.streaks, challenge: streak }
          next.lossStreaks = { ...s.lossStreaks, challenge: lossStreak }

          next.lastOutcome = {
            mode: 'challenge',
            reels: pending.reels,
            category: pending.category,
            simCoinSpent: pending.spent,
            simCoinReturn: pending.simCoinReturn,
            funPoints: 0,
            message: composeResultMessage({
              mode: 'challenge',
              category: pending.category ?? undefined,
              simCoinReturn: pending.simCoinReturn,
              score: pending.score,
              lossStreak,
              rng,
            }),
            streak,
            nonce: outcomeNonce,
          }
        } else {
          const normal: NormalStats = { ...s.normal }
          const score = pending.score
          const win = score.funPoints > 10 // pair or triple

          normal.totalSpins += 1
          normal.funPointsEarned += score.funPoints
          const symbolCounts = { ...normal.symbolCounts }
          for (const reel of pending.reels) symbolCounts[reel] += 1
          normal.symbolCounts = symbolCounts
          if (score.triple) {
            normal.tripleCounts = {
              ...normal.tripleCounts,
              [score.triple]: normal.tripleCounts[score.triple] + 1,
            }
          }
          if (score.special) {
            normal.rareCombinations = {
              ...normal.rareCombinations,
              [score.special]: (normal.rareCombinations[score.special] ?? 0) + 1,
            }
          }

          const streak = win ? s.streaks.normal + 1 : 0
          const lossStreak = win ? 0 : s.lossStreaks.normal + 1
          if (streak > normal.bestStreak) normal.bestStreak = streak

          next.funPoints = s.funPoints + score.funPoints
          next.normal = normal
          next.streaks = { ...s.streaks, normal: streak }
          next.lossStreaks = { ...s.lossStreaks, normal: lossStreak }

          next.lastOutcome = {
            mode: 'normal',
            reels: pending.reels,
            category: null,
            simCoinSpent: 0,
            simCoinReturn: 0,
            funPoints: score.funPoints,
            message: composeResultMessage({
              mode: 'normal',
              simCoinReturn: 0,
              score,
              lossStreak,
              rng,
            }),
            streak,
            nonce: outcomeNonce,
          }
        }

        // PRD §17 streak milestones (separate per mode).
        const streak = pending.mode === 'challenge' ? next.streaks!.challenge : next.streaks!.normal
        if (streak === 3 || streak === 5 || streak === 10 || streak === 20) {
          const text = {
            3: '🔥 STREAK x3! Small celebration for a small legend.',
            5: '🔥🔥 STREAK x5! The screen approves.',
            10: '🔥🔥🔥 STREAK x10! Unstoppable randomness.',
            20: '🏆 STREAK x20! Certified RNG Enjoyer.',
          }[streak]
          next.celebration = { text, nonce: outcomeNonce }
          if (streak === 5) next.screenFlashNonce = s.screenFlashNonce + 1
        }

        set(next)

        // Achievements (§23) evaluated after all effects settle.
        unlockPendingAchievements(set, get)
        // PRD §19 reality checks at 50 / 100 / 500 challenge spins.
        const after = get()
        for (const threshold of [50, 100, 500]) {
          if (after.challenge.totalSpins >= threshold && !after.realityChecksSeen.includes(threshold)) {
            set({
              realityChecksSeen: [...after.realityChecksSeen, threshold],
              pendingRealityCheck: threshold,
            })
            break
          }
        }
      },

      // PRD §9: switch mode only — never reset, merge, or modify stats.
      setMode: (mode) => set({ mode }),

      // PRD §10: fictional, local-only. Transaction created immediately on confirm.
      topUpConfirm: (amount) => {
        if (!Number.isInteger(amount) || amount <= 0 || amount > 1_000_000) return { ok: false }
        const tx: Transaction = {
          id: `vt_${Date.now()}_${Math.floor(get().simCoins)}_${Math.floor(Math.random() * 1e9)}`,
          type: 'virtual_topup',
          amount,
          timestamp: new Date().toISOString(),
        }
        set({ transactions: [tx, ...get().transactions] })
        return { ok: true }
      },

      topUpApply: (amount) => {
        set({ simCoins: get().simCoins + amount })
        unlockPendingAchievements(set, get)
      },

      markStatsOpened: () => {
        if (!get().statsOpenedOnce) {
          set({ statsOpenedOnce: true })
          unlockPendingAchievements(set, get)
        }
      },

      recordExplorerRun: () => {
        set({ explorerRuns: get().explorerRuns + 1 })
        unlockPendingAchievements(set, get)
      },

      // PRD §22/§29.12: only an explicit user action replaces the live config.
      adoptChallengeConfig: (config) => {
        set({ challengeConfig: config })
        get().pushToast({
          emoji: '⚙️',
          title: 'CONFIGURATION ADOPTED',
          body: 'Challenge Mode now uses the lab configuration. EV recalculated.',
        })
      },

      // PRD §26: everything back to zero.
      resetSimulation: () => {
        set({ ...INITIAL, spinning: false, pendingOutcome: null, lastOutcome: null, toasts: [], celebration: null, pendingRealityCheck: null })
      },

      pushToast: (toast) => {
        toastId += 1
        set({ toasts: [...get().toasts.slice(-3), { ...toast, id: toastId }] })
      },

      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      clearCelebration: () => set({ celebration: null }),

      dismissRealityCheck: () => set({ pendingRealityCheck: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => browserStorage),
      version: 1,
      partialize: (s) => ({
        simCoins: s.simCoins,
        funPoints: s.funPoints,
        mode: s.mode,
        challengeConfig: s.challengeConfig,
        normal: s.normal,
        challenge: s.challenge,
        streaks: s.streaks,
        lossStreaks: s.lossStreaks,
        transactions: s.transactions,
        achievements: s.achievements,
        realityChecksSeen: s.realityChecksSeen,
        statsOpenedOnce: s.statsOpenedOnce,
        explorerRuns: s.explorerRuns,
      }),
      migrate: (persisted) => ({ ...INITIAL, ...(persisted as object) }) as GameState,
    },
  ),
)

function unlockPendingAchievements(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
): void {
  const s = get()
  const newly = evaluateAchievements(snapshotOf(s))
  if (newly.length === 0) return

  const achievements = { ...s.achievements }
  let funPoints = s.funPoints
  const toasts = [...s.toasts]
  for (const id of newly) {
    achievements[id] = { unlockedAt: new Date().toISOString() }
    const def = ACHIEVEMENT_MAP[id]
    funPoints += def.funPointBonus
    toastId += 1
    toasts.push({
      id: toastId,
      emoji: def.emoji,
      title: `ACHIEVEMENT: ${def.title}`,
      body: `${def.description} (+${def.funPointBonus} FUN POINTS)`,
    })
  }
  set({ achievements, funPoints, toasts: toasts.slice(-4) })
}

/** Most common symbol for §21 Normal Mode stats display. */
export function mostCommonSymbol(counts: Record<SymbolId, number>): SymbolId | null {
  let best: SymbolId | null = null
  let bestCount = 0
  for (const [id, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = id as SymbolId
      bestCount = count
    }
  }
  return best
}
