// Shared engine types — pure data, no React/DOM imports (testable in node).

export type Mode = 'normal' | 'challenge'

export type SymbolId =
  | 'cherry'
  | 'lemon'
  | 'star'
  | 'clover'
  | 'diamond'
  | 'chicken'
  | 'potato'
  | 'fish'

export type Reels = [SymbolId, SymbolId, SymbolId]

export type ChallengeCategory =
  | 'NO_MATCH'
  | 'SMALL_WIN'
  | 'MEDIUM_WIN'
  | 'BIG_WIN'
  | 'JACKPOT'

export interface ChallengeOutcomeRow {
  category: ChallengeCategory
  probability: number
  simCoinReturn: number
}

export interface ChallengeConfig {
  spinCost: number
  table: ChallengeOutcomeRow[]
}

export interface ChallengeOutcome {
  category: ChallengeCategory
  simCoinReturn: number
  reels: Reels
}

export interface NormalStats {
  totalSpins: number
  funPointsEarned: number
  symbolCounts: Record<SymbolId, number>
  tripleCounts: Record<SymbolId, number>
  bestStreak: number
  rareCombinations: Record<string, number>
}

export interface BalancePoint {
  b: number
  win: boolean
  jackpot: boolean
}

export interface ChallengeStats {
  totalSpins: number
  startingBalance: number
  totalSpent: number
  totalReturned: number
  biggestWin: number
  longestLossStreak: number
  bestStreak: number
  outcomeCounts: Record<ChallengeCategory, number>
  balanceHistory: BalancePoint[]
}

export interface Transaction {
  id: string
  type: 'virtual_topup'
  amount: number
  timestamp: string
}

export type AchievementId =
  | 'first_spin'
  | 'lucky_streak_x5'
  | 'streak_x10'
  | 'chicken_farmer'
  | 'potato_legend'
  | 'rng_survivor'
  | 'statistician'
  | 'reality_check'
  | 'jackpot'
  | 'lab_rat'
  | 'fictional_billionaire'

export interface AchievementDef {
  id: AchievementId
  emoji: string
  title: string
  description: string
  funPointBonus: number
}

/** Snapshot handed to achievement predicates — a plain read of persisted state. */
export interface StateSnapshot {
  normal: NormalStats
  challenge: ChallengeStats
  transactions: Transaction[]
  achievements: Partial<Record<AchievementId, { unlockedAt: string }>>
  statsOpenedOnce: boolean
  explorerRuns: number
  totalSpins: number
  bestStreakAnyMode: number
  totalTopup: number
}
