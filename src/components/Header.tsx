import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { sfx } from '../audio/sfx'
import { BalanceDisplay } from './BalanceDisplay'
import { ModeToggle } from './ModeToggle'

export function Header({ onAddCoins }: { onAddCoins: () => void }) {
  const mode = useGameStore((s) => s.mode)
  const [muted, setMuted] = useState(sfx.muted)

  const toggleMute = () => {
    const next = !muted
    sfx.setMuted(next)
    setMuted(next)
    if (!next) sfx.click()
  }

  return (
    <header className="flex flex-col gap-3">
      <div className="relative text-center">
        <h1 className="font-display text-display-lg text-text-primary">
          <span className="text-neon-pink">VIRTUAL</span> RNG{' '}
          <span className="text-neon-cyan">ARCADE</span>
        </h1>
        <p className="tnum mt-2 text-[10px] uppercase tracking-widest text-text-muted">
          Simulation only · No real money · Odds visible
        </p>
        <button
          data-testid="sfx-toggle"
          onClick={toggleMute}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className="absolute right-0 top-0 rounded-md border border-line bg-cabinet-800 px-2 py-1 text-sm transition-transform hover:scale-110 active:scale-95"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      <BalanceDisplay onAddCoins={onAddCoins} />
      <ModeToggle />
      <p
        data-testid="mode-label"
        className="text-center font-display text-[9px] uppercase tracking-widest"
      >
        {mode === 'normal' ? (
          <span className="text-neon-cyan">● NORMAL MODE — FREE PLAY</span>
        ) : (
          <span className="text-neon-pink">● CHALLENGE MODE 😈 — 100 SIM COINS / SPIN</span>
        )}
      </p>
    </header>
  )
}
