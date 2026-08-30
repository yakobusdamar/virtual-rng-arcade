import type { AchievementDef, AchievementId, StateSnapshot } from './types'

// PRD §23 examples + bonus set tied to §17/§22/§10.
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_spin', emoji: '🎯', title: 'First Spin', description: 'Perform your first spin.', funPointBonus: 100 },
  { id: 'lucky_streak_x5', emoji: '🔥', title: 'Lucky Streak', description: 'Reach streak x5.', funPointBonus: 250 },
  { id: 'streak_x10', emoji: '🌋', title: 'Hot Hands', description: 'Reach streak x10.', funPointBonus: 500 },
  { id: 'chicken_farmer', emoji: '🐔', title: 'Chicken Farmer', description: 'Get three chickens.', funPointBonus: 100 },
  { id: 'potato_legend', emoji: '🥔', title: 'Potato Legend', description: 'Get three potatoes.', funPointBonus: 100 },
  { id: 'rng_survivor', emoji: '🎲', title: 'RNG Survivor', description: 'Perform 100 spins.', funPointBonus: 300 },
  { id: 'statistician', emoji: '📊', title: 'Statistician', description: 'Open statistics.', funPointBonus: 50 },
  { id: 'reality_check', emoji: '💀', title: 'Reality Check', description: 'Complete 100 Challenge Mode spins.', funPointBonus: 400 },
  { id: 'jackpot', emoji: '💎', title: 'JACKPOT!', description: 'Hit the Challenge Mode jackpot.', funPointBonus: 500 },
  { id: 'lab_rat', emoji: '🔬', title: 'Lab Rat', description: 'Run a Probability Explorer experiment.', funPointBonus: 100 },
  { id: 'fictional_billionaire', emoji: '💰', title: 'Fictional Billionaire', description: 'Top up 100,000+ SIM COINS in total.', funPointBonus: 250 },
]

export const ACHIEVEMENT_MAP: Record<AchievementId, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchievementId, AchievementDef>

/** Pure predicate evaluation — returns ids not yet unlocked that now qualify. */
export function evaluateAchievements(snap: StateSnapshot): AchievementId[] {
  const unlocked: AchievementId[] = []
  const has = (id: AchievementId) => snap.achievements[id] !== undefined

  const check = (id: AchievementId, cond: boolean) => {
    if (cond && !has(id)) unlocked.push(id)
  }

  check('first_spin', snap.totalSpins >= 1)
  check('lucky_streak_x5', snap.bestStreakAnyMode >= 5)
  check('streak_x10', snap.bestStreakAnyMode >= 10)
  check('chicken_farmer', snap.normal.tripleCounts.chicken >= 1)
  check('potato_legend', snap.normal.tripleCounts.potato >= 1)
  check('rng_survivor', snap.totalSpins >= 100)
  check('statistician', snap.statsOpenedOnce)
  check('reality_check', snap.challenge.totalSpins >= 100)
  check('jackpot', snap.challenge.outcomeCounts.JACKPOT >= 1)
  check('lab_rat', snap.explorerRuns >= 1)
  check('fictional_billionaire', snap.totalTopup >= 100_000)

  return unlocked
}
