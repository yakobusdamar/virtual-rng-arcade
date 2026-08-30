import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import type { Mode } from '../engine/types'

/** PRD §4/§9: active mode always visible; switching never touches stats. */
export function ModeToggle() {
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)

  const Option = ({ value, label }: { value: Mode; label: string }) => {
    const active = mode === value
    return (
      <button
        data-testid={`mode-${value}`}
        onClick={() => setMode(value)}
        className={`relative flex-1 px-3 py-2 font-display text-[9px] transition-colors ${
          active ? 'text-text-on-accent' : 'text-text-muted hover:text-text-secondary'
        }`}
        aria-pressed={active}
      >
        {active && (
          <motion.span
            layoutId="mode-knob"
            className={`absolute inset-0 rounded-pill ${
              value === 'challenge' ? 'bg-neon-pink shadow-glow-pink' : 'bg-neon-cyan shadow-glow-cyan'
            }`}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <span className="relative z-10">{label}</span>
      </button>
    )
  }

  return (
    <div
      data-testid="mode-toggle"
      role="group"
      aria-label="Game mode"
      className="flex rounded-pill border border-line bg-cabinet-700 p-1"
    >
      <Option value="normal" label="NORMAL" />
      <Option value="challenge" label="CHALLENGE 😈" />
    </div>
  )
}
