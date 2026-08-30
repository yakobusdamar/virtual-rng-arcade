import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { SYMBOL_EMOJI, SYMBOL_IDS, SYMBOL_TINT } from '../engine/symbols'
import type { SymbolId } from '../engine/types'
import { anticipationMs, reelStopDelay } from './reelTiming'
import { sfx } from '../audio/sfx'

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
  stopDelay,
  anticipate,
}: {
  index: number
  finalSymbol: SymbolId
  spinning: boolean
  spinKey: number
  stopDelay: number
  anticipate: boolean
}) {
  const [display, setDisplay] = useState<SymbolId>(finalSymbol)
  const [stopped, setStopped] = useState(true)
  const tickRef = useRef(0)

  // While idle, mirror the outcome reels (e.g. staged/external updates).
  useEffect(() => {
    if (!spinning) setDisplay(finalSymbol)
  }, [finalSymbol, spinning])

  useEffect(() => {
    if (!spinning) return
    setStopped(false)
    let cycle: number | undefined
    if (!prefersReducedMotion()) {
      cycle = window.setInterval(() => {
        tickRef.current += 1
        if (tickRef.current % 3 === 0) sfx.tick()
        setDisplay(randomSymbolId())
      }, 60)
    }
    const stop = window.setTimeout(() => {
      if (cycle !== undefined) window.clearInterval(cycle)
      setDisplay(finalSymbol)
      setStopped(true)
      sfx.reelStop(index)
    }, stopDelay)
    return () => {
      if (cycle !== undefined) window.clearInterval(cycle)
      window.clearTimeout(stop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, spinKey, index, stopDelay])

  const landed = stopped && spinKey > 0

  return (
    <div
      data-testid={`reel-${index}`}
      data-symbol={display}
      className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border bg-gradient-to-b from-cabinet-700 to-cabinet-800 shadow-inset-reel transition-colors sm:h-24 sm:w-24 ${
        anticipate && !stopped ? 'anticipate' : 'border-line'
      }`}
    >
      {/* Symbol tint halo (design.md §7) */}
      <div
        key={`tint-${spinKey}-${stopped ? 'l' : 's'}`}
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${landed ? 'cell-land' : ''}`}
        style={{
          background: `radial-gradient(72% 72% at 50% 62%, ${SYMBOL_TINT[display]}38 0%, transparent 100%)`,
        }}
      />
      {/* CRT shade: darker top/bottom edges for cabinet depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,15,0.55) 0%, transparent 20%, transparent 80%, rgba(7,7,15,0.55) 100%)',
        }}
      />
      <motion.span
        key={`${spinKey}-${stopped ? 'land' : 'spin'}`}
        initial={stopped ? { y: -14, opacity: 0.4, scale: 1.12 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.15, 0.9, 0.25, 1.05] }}
        className={`relative text-4xl sm:text-5xl ${spinning && !stopped ? 'blur-[1.5px]' : ''}`}
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
      className={`relative flex items-center justify-center gap-2 rounded-lg border bg-cabinet-800 px-4 py-5 shadow-chunky sm:gap-3 ${
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
          stopDelay={reelStopDelay(i, pending)}
          anticipate={i === 2 && spinning && anticipationMs(pending) > 0}
        />
      ))}
    </div>
  )
}
