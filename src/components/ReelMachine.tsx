import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { SYMBOL_EMOJI, SYMBOL_IDS } from '../engine/symbols'
import type { SymbolId } from '../engine/types'

// PRD §14 suggested timings (design.md §5 motion tokens).
const REEL_STOPS = [800, 1200, 1600]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function randomSymbolId(): SymbolId {
  return SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]
}

function Reel({
  index,
  finalSymbol,
  spinning,
  spinKey,
}: {
  index: number
  finalSymbol: SymbolId
  spinning: boolean
  spinKey: number
}) {
  const [display, setDisplay] = useState<SymbolId>(finalSymbol)
  const [stopped, setStopped] = useState(true)

  useEffect(() => {
    if (!spinning) return
    setStopped(false)
    let cycle: number | undefined
    if (!prefersReducedMotion()) {
      cycle = window.setInterval(() => setDisplay(randomSymbolId()), 60)
    }
    const stop = window.setTimeout(
      () => {
        if (cycle !== undefined) window.clearInterval(cycle)
        setDisplay(finalSymbol)
        setStopped(true)
      },
      REEL_STOPS[index],
    )
    return () => {
      if (cycle !== undefined) window.clearInterval(cycle)
      window.clearTimeout(stop)
    }
  }, [spinning, spinKey, index, finalSymbol])

  return (
    <div
      data-testid={`reel-${index}`}
      data-symbol={display}
      className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-line bg-gradient-to-b from-cabinet-700 to-cabinet-800 shadow-inset-reel sm:h-24 sm:w-24"
    >
      <motion.span
        key={`${spinKey}-${stopped ? 'land' : 'spin'}`}
        initial={stopped ? { y: -16, opacity: 0.4 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.15, 0.9, 0.25, 1.05] }}
        className={`text-4xl sm:text-5xl ${spinning && !stopped ? 'blur-[1.5px]' : ''}`}
        aria-label={display}
      >
        {SYMBOL_EMOJI[display]}
      </motion.span>
    </div>
  )
}

export function ReelMachine() {
  const spinning = useGameStore((s) => s.spinning)
  const pending = useGameStore((s) => s.pendingOutcome)
  const lastOutcome = useGameStore((s) => s.lastOutcome)
  const outcomeNonce = lastOutcome?.nonce ?? 0

  const reels: [SymbolId, SymbolId, SymbolId] = spinning
    ? (pending?.reels ?? ['cherry', 'star', 'lemon'])
    : (lastOutcome?.reels ?? ['cherry', 'star', 'lemon'])

  const isWin =
    !spinning &&
    lastOutcome != null &&
    (lastOutcome.simCoinReturn > 0 || lastOutcome.funPoints > 10)

  return (
    <div
      data-testid="reel-machine"
      className={`flex items-center justify-center gap-2 rounded-lg border bg-cabinet-800 px-4 py-5 shadow-chunky sm:gap-3 ${
        isWin ? 'border-state-win/60' : 'border-line'
      }`}
    >
      {reels.map((symbol, i) => (
        <Reel
          key={i}
          index={i}
          finalSymbol={symbol}
          spinning={spinning}
          spinKey={spinning ? outcomeNonce + 1 : outcomeNonce}
        />
      ))}
    </div>
  )
}
