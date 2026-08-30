import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from './Modal'
import { useGameStore } from '../store/gameStore'
import { APPROVAL_MESSAGES, PROCESSING_MESSAGES } from '../engine/messages'
import { dateGroupLabel, formatClock, formatNumber } from '../utils/format'
import { sfx } from '../audio/sfx'

type Phase = 'input' | 'processing' | 'approved'

const QUICK_AMOUNTS = [10_000, 50_000, 100_000]
const MAX_TOPUP = 1_000_000

/**
 * PRD §10 — Virtual Top-Up Simulator. Satirical "BANK SIMULATOR" on paper
 * stock (design.md §1.4). Zero network: a local state transition with a
 * theatrical delay (§29.9).
 */
export function TopupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topUpConfirm = useGameStore((s) => s.topUpConfirm)
  const topUpApply = useGameStore((s) => s.topUpApply)
  const transactions = useGameStore((s) => s.transactions)
  const pushToast = useGameStore((s) => s.pushToast)

  const [phase, setPhase] = useState<Phase>('input')
  const [rawAmount, setRawAmount] = useState('10000')
  const [processingMsg, setProcessingMsg] = useState(PROCESSING_MESSAGES[0])
  const [approvalMsg, setApprovalMsg] = useState(APPROVAL_MESSAGES[0])
  const [approvedAmount, setApprovedAmount] = useState(0)

  const amount = Number.parseInt(rawAmount.replace(/[^\d]/g, ''), 10)
  const valid = Number.isInteger(amount) && amount > 0 && amount <= MAX_TOPUP

  // Reset the theatre each time the modal opens.
  useEffect(() => {
    if (open) {
      setPhase('input')
      setProcessingMsg(PROCESSING_MESSAGES[0])
    }
  }, [open])

  // PRD §10.2 processing ticker + fixed 1.8s theatrical delay.
  useEffect(() => {
    if (phase !== 'processing') return
    let i = 0
    const tick = window.setInterval(() => {
      i = (i + 1) % PROCESSING_MESSAGES.length
      setProcessingMsg(PROCESSING_MESSAGES[i])
    }, 600)
    const done = window.setTimeout(finishProcessing, 1800)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const groups = useMemo(() => {
    const out: { label: string; items: typeof transactions }[] = []
    for (const tx of transactions) {
      const label = dateGroupLabel(tx.timestamp)
      const last = out[out.length - 1]
      if (last && last.label === label) last.items.push(tx)
      else out.push({ label, items: [tx] })
    }
    return out
  }, [transactions])

  const confirm = () => {
    if (!valid) return
    const res = topUpConfirm(amount)
    if (!res.ok) return
    setProcessingMsg(PROCESSING_MESSAGES[0])
    setPhase('processing')
  }

  const finishProcessing = () => {
    topUpApply(amount)
    setApprovedAmount(amount)
    setApprovalMsg(APPROVAL_MESSAGES[Math.floor(Math.random() * APPROVAL_MESSAGES.length)])
    sfx.coinDrop()
    pushToast({ emoji: '🏦', title: 'SIMULATION APPROVED', body: `+${formatNumber(amount)} SIM COINS (fictional)` })
    setPhase('approved')
  }

  return (
    <Modal open={open} onClose={onClose} title="BANK SIMULATOR" emoji="🏦">
      {phase === 'input' && (
        <div className="rounded-lg border-2 border-dashed border-paper-line bg-paper-bg p-4 text-paper-ink">
          <p className="tnum text-center text-[10px] uppercase tracking-widest">Add Virtual SIM COINS</p>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wide" htmlFor="topup-amount">
            Amount
          </label>
          <input
            id="topup-amount"
            data-testid="topup-amount"
            inputMode="numeric"
            value={rawAmount}
            onChange={(e) => setRawAmount(e.target.value)}
            className="tnum mt-1 w-full rounded-md border-2 border-paper-line bg-white/70 px-3 py-2 text-lg font-bold text-paper-ink outline-none focus:border-stamp-red"
            aria-label="Virtual amount of SIM COINS to add"
          />
          <div className="mt-2 flex gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => setRawAmount(String(q))}
                className="tnum flex-1 rounded-md border border-paper-line px-2 py-1 text-xs font-bold hover:bg-white/60"
              >
                +{formatNumber(q)}
              </button>
            ))}
          </div>
          {rawAmount !== '' && !valid && (
            <p className="tnum mt-2 text-xs font-bold text-stamp-red" data-testid="topup-error">
              Enter 1 – {formatNumber(MAX_TOPUP)}.
            </p>
          )}
          <button
            data-testid="topup-confirm"
            onClick={confirm}
            disabled={!valid}
            className="mt-3 w-full rounded-md border-2 border-paper-ink bg-paper-ink px-3 py-2.5 text-sm font-bold text-paper-bg transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40"
          >
            ADD SIM COINS
          </button>
          <div className="mt-3 flex items-center justify-center">
            <span className="stamp rotate-[-4deg]">SIMULATION ONLY</span>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="py-6 text-center" data-testid="topup-processing">
          <p className="font-display text-display-sm text-lab-green">PROCESSING...</p>
          <div className="mx-auto mt-4 h-4 w-full max-w-xs overflow-hidden rounded-pill border border-line bg-cabinet-900">
            <div
              className="h-full bg-lab-green shadow-glow-green"
              style={{
                width: phase === 'processing' ? '100%' : '0%',
                transition: 'width 1.8s linear',
              }}
            />
          </div>
          <p className="tnum mt-4 animate-pulse text-sm text-text-secondary" data-testid="processing-message">
            {processingMsg}
          </p>
        </div>
      )}

      {phase === 'approved' && (
        <div className="py-6 text-center" data-testid="topup-approved">
          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="font-display text-display-sm text-state-win"
          >
            ✓ SIMULATION APPROVED
          </motion.p>
          <p className="tnum mt-3 text-2xl font-bold text-sim-coin">
            +{formatNumber(approvedAmount)} SIM COINS
          </p>
          <p className="tnum mt-3 text-sm italic text-text-secondary">“{approvalMsg}”</p>
          <button
            onClick={onClose}
            className="mt-5 rounded-md bg-cabinet-700 px-6 py-2 text-sm font-bold text-text-primary"
          >
            DONE
          </button>
        </div>
      )}

      {phase === 'input' && groups.length > 0 && (
        <div className="mt-4" data-testid="transaction-history">
          <h3 className="font-display text-[9px] text-text-muted">VIRTUAL TRANSACTION HISTORY</h3>
          {groups.map((g) => (
            <div key={g.label} className="mt-2">
              <p className="tnum text-[10px] uppercase tracking-widest text-text-muted">{g.label}</p>
              {g.items.map((tx) => (
                <div
                  key={tx.id}
                  className="tnum flex items-center justify-between border-b border-line/50 py-1.5 text-xs"
                >
                  <span className="text-sim-coin">+{formatNumber(tx.amount)} SIM COINS</span>
                  <span className="text-text-muted">
                    SIMULATION APPROVED · {formatClock(tx.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
