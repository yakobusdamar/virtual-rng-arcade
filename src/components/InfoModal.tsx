import { Modal } from './Modal'
import { useGameStore } from '../store/gameStore'
import { computeExpectedReturnPer100 } from '../utils/calculations'
import { formatNumber } from '../utils/format'

/** PRD §26 reset confirmation — exact copy, destructive action guard. */
export function ResetConfirm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const resetSimulation = useGameStore((s) => s.resetSimulation)

  return (
    <Modal open={open} onClose={onClose} title="RESET SIMULATION" emoji="⚠️">
      <div className="rounded-lg border border-danger-red/60 bg-danger-red/5 p-4" data-testid="reset-confirm">
        <p className="text-center text-lg font-bold text-text-primary">Are you sure?</p>
        <p className="mt-2 text-center text-sm text-text-secondary">This will erase:</p>
        <ul className="tnum mx-auto mt-2 w-fit list-disc space-y-1 text-sm text-text-secondary">
          <li>SIM COINS</li>
          <li>FUN POINTS</li>
          <li>Statistics</li>
          <li>Achievements</li>
          <li>Transaction history</li>
        </ul>
        <div className="mt-5 flex flex-col gap-2">
          <button
            data-testid="reset-cancel"
            onClick={onClose}
            className="rounded-md bg-cabinet-700 px-4 py-2.5 text-sm font-bold text-text-primary"
          >
            CANCEL
          </button>
          <button
            data-testid="reset-everything"
            onClick={() => {
              resetSimulation()
              onClose()
            }}
            className="rounded-md bg-danger-red px-4 py-2.5 text-sm font-bold text-text-primary shadow-chunky active:translate-x-[2px] active:translate-y-[2px]"
          >
            RESET EVERYTHING
          </button>
        </div>
      </div>
    </Modal>
  )
}

/** PRD §12 [INFO] — how it works, full transparency, danger zone. */
export function InfoModal({
  open,
  onClose,
  onAskReset,
}: {
  open: boolean
  onClose: () => void
  onAskReset: () => void
}) {
  const config = useGameStore((s) => s.challengeConfig)
  const ev = computeExpectedReturnPer100(config)

  return (
    <Modal open={open} onClose={onClose} title="INFO" emoji="ℹ️" wide>
      <div className="flex flex-col gap-5 text-sm leading-relaxed text-text-secondary">
        <section>
          <h3 className="font-display mb-2 text-[9px] text-neon-cyan">WHAT IS THIS?</h3>
          <p>
            An entertaining RNG arcade machine that gradually reveals the mathematics behind
            long-term losing probability. Everything here is a simulation: arcade fun on the
            outside, a probability experiment on the inside.
          </p>
        </section>

        <section>
          <h3 className="font-display mb-2 text-[9px] text-sim-coin">THE TWO VALUES</h3>
          <p>
            <span className="font-bold text-sim-coin">🪙 SIM COINS</span> are gameplay credits:
            they exist only in your browser and cannot be bought, traded, or moved to anyone else.{' '}
            <span className="font-bold text-fun-point">⭐ FUN POINTS</span> are your score: they can
            never be spent. The two systems are separate forever.
          </p>
        </section>

        <section>
          <h3 className="font-display mb-2 text-[9px] text-neon-pink">THE MODES</h3>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <b className="text-neon-cyan">NORMAL</b> — free unlimited spins, independent RNG, FUN
              POINTS for funny combinations.
            </li>
            <li>
              <b className="text-neon-pink">CHALLENGE 😈</b> — a probability experiment: each spin
              costs {formatNumber(config.spinCost)} SIM COINS and follows a fixed, fully visible
              odds table with negative long-term expectation. The odds never adapt to you.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-display mb-2 text-[9px] text-warn-amber">CHALLENGE MATH</h3>
          <p className="tnum">
            Expected return is computed live from the current table:{' '}
            <b className="text-warn-amber">{Number(ev.toFixed(2))} SIM COINS per 100 spent</b> — a
            long-term expectation of{' '}
            <b className={ev < 100 ? 'text-danger-red' : 'text-state-win'}>
              {ev < 100 ? 'NEGATIVE' : 'POSITIVE'}
            </b>
            . Outcome visuals always match the payout: a pair = SMALL WIN, triple 🍒/🍋/🍀 = MEDIUM,
            ⭐⭐⭐ = BIG, 💎💎💎 = JACKPOT. Want to bend the odds yourself? Open the{' '}
            <b className="text-info-blue">🔬 Probability Lab</b>.
          </p>
        </section>

        <section>
          <h3 className="font-display mb-2 text-[9px] text-stamp-red">NO REAL MONEY. EVER.</h3>
          <p>
            No payments, no bank transfers, no credit, no prize redemptions, no crypto — and the
            bank behind "BANK SIMULATOR" contacts absolutely nobody. All data stays in your
            browser's local storage.
          </p>
        </section>

        <section className="rounded-lg border border-danger-red/50 bg-danger-red/5 p-3">
          <h3 className="font-display mb-2 text-[9px] text-danger-red">DANGER ZONE</h3>
          <button
            data-testid="info-reset"
            onClick={onAskReset}
            className="tnum w-full rounded-md border border-danger-red/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-danger-red"
          >
            RESET SIMULATION
          </button>
        </section>
      </div>
    </Modal>
  )
}
