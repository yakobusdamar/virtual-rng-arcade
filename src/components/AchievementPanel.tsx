import { Modal } from './Modal'
import { ACHIEVEMENTS } from '../engine/achievements'
import { useGameStore } from '../store/gameStore'

/** PRD §23 panel — unlocked items glow gold, locked stay dim. */
export function AchievementPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const achievements = useGameStore((s) => s.achievements)
  const unlockedCount = Object.keys(achievements).length

  return (
    <Modal open={open} onClose={onClose} title="ACHIEVEMENTS" emoji="🏆">
      <p className="tnum mb-3 text-xs text-text-muted" data-testid="achievement-count">
        {unlockedCount} / {ACHIEVEMENTS.length} unlocked
      </p>
      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = achievements[a.id] !== undefined
          return (
            <div
              key={a.id}
              data-testid="achievement-item"
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                unlocked ? 'border-sim-coin/60 bg-sim-coin/5' : 'border-line bg-cabinet-700/50 opacity-60'
              }`}
            >
              <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>{unlocked ? a.emoji : '🔒'}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${unlocked ? 'text-sim-coin' : 'text-text-secondary'}`}>
                  {a.title}
                </p>
                <p className="text-xs text-text-muted">{a.description}</p>
              </div>
              <span className="tnum text-xs text-fun-point">+{a.funPointBonus} ⭐</span>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
