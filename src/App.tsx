import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { Header } from './components/Header'
import { ReelMachine } from './components/ReelMachine'
import { ResultBanner } from './components/ResultBanner'
import { SpinButton } from './components/SpinButton'
import { WarningBanner } from './components/WarningBanner'
import { TopupModal } from './components/TopupModal'
import { StatsModal } from './components/StatsModal'
import { AchievementPanel } from './components/AchievementPanel'
import { InfoModal, ResetConfirm } from './components/InfoModal'
import { RealityCheckModal } from './components/RealityCheckModal'
import { ProbabilityExplorer } from './components/ProbabilityExplorer'
import { ToastLayer } from './components/ToastLayer'
import { CelebrationLayer } from './components/CelebrationLayer'
import { WinOverlay } from './components/WinOverlay'
import { ParticleLayer } from './components/ParticleLayer'
import { BalanceChart } from './components/BalanceChart'
import { netResult } from './utils/calculations'
import { formatNumber, formatSigned } from './utils/format'

const SPARKS = [
  { left: '6%', dur: '11s', delay: '0s', alpha: 0.3 },
  { left: '18%', dur: '14s', delay: '3s', alpha: 0.22 },
  { left: '31%', dur: '9s', delay: '6s', alpha: 0.34 },
  { left: '47%', dur: '13s', delay: '1.5s', alpha: 0.2 },
  { left: '63%', dur: '10s', delay: '7.5s', alpha: 0.3 },
  { left: '78%', dur: '15s', delay: '4.5s', alpha: 0.22 },
  { left: '91%', dur: '12s', delay: '9s', alpha: 0.32 },
]

function MiniStatsCard({ onOpenStats }: { onOpenStats: () => void }) {
  const normal = useGameStore((s) => s.normal)
  const challenge = useGameStore((s) => s.challenge)
  const net = netResult(challenge.totalSpent, challenge.totalReturned)

  return (
    <div className="rounded-lg border border-line bg-cabinet-800 p-4 shadow-chunky">
      <h3 className="font-display mb-3 text-[9px] text-text-muted">SESSION LEDGER</h3>
      <div className="tnum flex justify-between border-b border-line/50 py-1.5 text-xs">
        <span className="text-neon-cyan">NORMAL spins</span>
        <span>{formatNumber(normal.totalSpins)}</span>
      </div>
      <div className="tnum flex justify-between border-b border-line/50 py-1.5 text-xs">
        <span className="text-neon-pink">CHALLENGE spins</span>
        <span>{formatNumber(challenge.totalSpins)}</span>
      </div>
      <div className="tnum flex justify-between py-1.5 text-xs">
        <span className="text-text-secondary">Challenge net</span>
        <span className={net < 0 ? 'text-danger-red' : 'text-state-win'}>{formatSigned(net)} 🪙</span>
      </div>
      <button
        onClick={onOpenStats}
        className="tnum mt-2 w-full rounded-md border border-line px-3 py-1.5 text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary"
      >
        Full statistics
      </button>
    </div>
  )
}

export default function App() {
  const mode = useGameStore((s) => s.mode)
  const streak = useGameStore((s) => (s.mode === 'challenge' ? s.streaks.challenge : s.streaks.normal))
  const screenFlashNonce = useGameStore((s) => s.screenFlashNonce)
  const challenge = useGameStore((s) => s.challenge)

  const [topupOpen, setTopupOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [achOpen, setAchOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [labOpen, setLabOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)

  // PRD §17: x5 streak screen effect.
  useEffect(() => {
    if (screenFlashNonce === 0) return
    setFlashing(true)
    const t = window.setTimeout(() => setFlashing(false), 1300)
    return () => window.clearTimeout(t)
  }, [screenFlashNonce])

  // Win presentation: tier-3+ shakes the cabinet (WAAPI — restartable, no remounts).
  useEffect(() => {
    const onShake = (e: Event) => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
      const big = (e as CustomEvent<{ big?: boolean }>).detail?.big ?? false
      shellRef.current?.animate(
        [
          { transform: 'translateX(0)' },
          { transform: `translateX(${big ? -9 : -6}px)` },
          { transform: `translateX(${big ? 8 : 5}px)` },
          { transform: `translateX(${big ? -5 : -3}px)` },
          { transform: 'translateX(0)' },
        ],
        { duration: big ? 480 : 360, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
      )
    }
    window.addEventListener('vrng-shake', onShake)
    return () => window.removeEventListener('vrng-shake', onShake)
  }, [])

  return (
    <div ref={shellRef} className={`min-h-screen overflow-x-clip bg-cabinet-900 ${flashing ? 'screen-flash' : ''}`}>
      {/* Ambient cabinet life: slow drifting sparks (design.md §7) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="sparkle"
            style={{
              left: s.left,
              animationDuration: s.dur,
              animationDelay: s.delay,
              ['--spark-alpha' as string]: s.alpha,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-[520px] flex-col gap-4 px-3 pb-28 pt-5 md:max-w-[1000px]">
        <Header onAddCoins={() => setTopupOpen(true)} />

        <main className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_320px] md:items-start">
          <section className="flex flex-col gap-4">
            {/* Gold bezel frame (design.md §7c) + ambient glow behind the machine */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[32px]"
                style={{
                  background:
                    'radial-gradient(60% 55% at 50% 42%, rgba(255,201,77,0.09) 0%, transparent 72%)',
                }}
              />
              <div
                className="relative rounded-xl p-[3px] shadow-chunky-lg"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-frame-gold-1) 0%, var(--color-frame-gold-2) 28%, var(--color-frame-gold-3) 50%, var(--color-frame-gold-2) 72%, var(--color-frame-gold-1) 100%)',
                }}
              >
                {streak >= 3 && <span aria-hidden className="ember pointer-events-none absolute inset-0 rounded-xl" />}
                {['left-1 top-1', 'right-1 top-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos) => (
                  <span
                    key={pos}
                    aria-hidden
                    className={`absolute ${pos} z-10 h-1.5 w-1.5 rounded-full bg-frame-gold-3 opacity-80`}
                    style={{ boxShadow: '0 0 6px rgba(255,201,77,0.8)' }}
                  />
                ))}
                <div className="rounded-[calc(var(--radius-xl)-3px)] border border-line bg-cabinet-900 p-4">
                  <ReelMachine />
                  <ResultBanner />
                  <div
                    data-testid="streak-display"
                    className="tnum mt-1 text-center text-sm font-bold text-warn-amber"
                    aria-live="polite"
                  >
                    {streak > 0 ? (
                      <>
                        <span className={streak >= 3 ? 'flame' : ''}>🔥</span> STREAK: {streak}
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="mt-3">
                    <SpinButton />
                  </div>
                </div>
              </div>
            </div>

            {mode === 'challenge' && <WarningBanner onOpenLab={() => setLabOpen(true)} />}
          </section>

          <aside className="hidden flex-col gap-4 md:flex">
            <MiniStatsCard onOpenStats={() => setStatsOpen(true)} />
            {challenge.balanceHistory.length > 0 && (
              <div className="rounded-lg border border-line bg-cabinet-800 p-4 shadow-chunky">
                <h3 className="font-display mb-3 text-[9px] text-text-muted">CHALLENGE BALANCE 📉</h3>
                <BalanceChart />
              </div>
            )}
          </aside>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-cabinet-800/95 backdrop-blur">
          <div className="mx-auto grid max-w-[520px] grid-cols-4">
            {[
              { id: 'nav-stats', emoji: '📊', label: 'STATS', action: () => setStatsOpen(true) },
              { id: 'nav-achievements', emoji: '🏆', label: 'AWARDS', action: () => setAchOpen(true) },
              { id: 'nav-lab', emoji: '🔬', label: 'LAB', action: () => setLabOpen(true) },
              { id: 'nav-info', emoji: 'ℹ️', label: 'INFO', action: () => setInfoOpen(true) },
            ].map((item) => (
              <button
                key={item.id}
                data-testid={item.id}
                onClick={item.action}
                className="flex flex-col items-center gap-1 py-2.5 text-text-secondary transition-colors hover:text-text-primary"
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="font-display text-[8px]">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <TopupModal open={topupOpen} onClose={() => setTopupOpen(false)} />
        <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
        <AchievementPanel open={achOpen} onClose={() => setAchOpen(false)} />
        <ProbabilityExplorer open={labOpen} onClose={() => setLabOpen(false)} />
        <InfoModal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          onAskReset={() => {
            setInfoOpen(false)
            setResetOpen(true)
          }}
        />
        <ResetConfirm open={resetOpen} onClose={() => setResetOpen(false)} />
        <RealityCheckModal />
        <ToastLayer />
        <CelebrationLayer />
        <WinOverlay />
        <ParticleLayer />
      </div>
    </div>
  )
}
