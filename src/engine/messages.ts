import type { ChallengeCategory, Mode } from './types'
import type { ScoreResult } from './scoringEngine'

// PRD §18 personality — wins in Indonesian flavor, lab-speak for stats.
const NO_MATCH_NORMAL = [
  'No match. The universe remains indifferent.',
  'RNG says: not today.',
  'Three completely unrelated symbols. Art.',
  'Statistically, this is also an outcome.',
]

const SMALL_WIN = [
  'MENANG! Jangan lihat statistik dulu.',
  'MENANG! Kecil tapi mencolok.',
  'A win is a win. Probably.',
]

const BIG_WIN = [
  'Screenshot cepat. Statistik belum sempat protes.',
  'BIG WIN! Ini cuma simulasi, tapi tetap keren.',
]

const JACKPOT_MSG = [
  '💎💎💎 JACKPOT! Imaginary wealth detected.',
  '💎💎💎 JACKPOT! Kabari accounting fiktifmu.',
]

export const LOSS_STREAK_MESSAGES = [
  'Probability is working. Unfortunately for you.',
  'The math is winning. As designed.',
  'Each spin is independent. Independently disappointing.',
]

const CHICKEN_MSG = '🐔🐔🐔 You are now a virtual farmer.'
const POTATO_MSG = '🥔🥔🥔 Potato economics has collapsed.'

const CHALLENGE_SMALL = [
  'MENANG! Jangan lihat statistik dulu.',
  'Short-term wins are possible. Enjoy it.',
]

const CHALLENGE_NO_MATCH = [
  'The house edge sends its regards.',
  'Fully expected. Mathematically speaking.',
  'This is what 55% probability looks like.',
]

export function pickMessage(pool: string[], rng: () => number): string {
  return pool[Math.floor(rng() * pool.length)]
}

export interface ResultMessageInput {
  mode: Mode
  category?: ChallengeCategory
  simCoinReturn: number
  score: ScoreResult
  lossStreak: number
  rng: () => number
}

export function composeResultMessage(input: ResultMessageInput): string {
  const { mode, category, score, lossStreak, rng } = input

  if (score.triple === 'chicken') return CHICKEN_MSG
  if (score.triple === 'potato') return POTATO_MSG

  if (mode === 'challenge') {
    if (category === 'JACKPOT') return pickMessage(JACKPOT_MSG, rng)
    if (category === 'BIG_WIN') return pickMessage(BIG_WIN, rng)
    if (category === 'MEDIUM_WIN') return 'MENANG! Medium. Seperti ukuran kopi favoritmu.'
    if (category === 'SMALL_WIN') return pickMessage(CHALLENGE_SMALL, rng)
    if (lossStreak >= 5) return pickMessage(LOSS_STREAK_MESSAGES, rng)
    return pickMessage(CHALLENGE_NO_MATCH, rng)
  }

  // Normal Mode
  if (score.triple === 'diamond') return '💎💎💎 Triple diamond! The lab is impressed.'
  if (score.triple === 'star') return pickMessage(BIG_WIN, rng)
  if (score.triple) return 'MENANG! Triple combination.'
  if (score.isPair) return pickMessage(SMALL_WIN, rng)
  if (lossStreak >= 5) return pickMessage(LOSS_STREAK_MESSAGES, rng)
  return pickMessage(NO_MATCH_NORMAL, rng)
}

// PRD §10.2 approval messages.
export const APPROVAL_MESSAGES = [
  'Bank simulator has approved absolutely nothing.',
  'Imaginary accountant approves.',
  'Funds are fictional. Congratulations.',
  'Reality remains financially unchanged.',
]

export const PROCESSING_MESSAGES = [
  'Contacting absolutely nobody...',
  'Consulting imaginary accountant...',
  'Wiring fictional funds...',
  'Stamping SIMULATION ONLY paperwork...',
]

// PRD §17 streak titles.
export const STREAK_TITLES: Record<number, string> = {
  20: 'Certified RNG Enjoyer',
  15: 'Randomness Whisperer',
  10: 'Hot Hands',
}

export function streakMilestoneText(streak: number): string | null {
  if (streak === 3) return '🔥 STREAK x3! Small celebration for a small legend.'
  if (streak === 5) return '🔥🔥 STREAK x5! The screen approves.'
  if (streak === 10) return '🔥🔥🔥 STREAK x10! Achievement unlocked territory.'
  if (streak === 20) return '🏆 STREAK x20! Certified RNG Enjoyer.'
  return null
}
