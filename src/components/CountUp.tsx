import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '../utils/format'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Ticker: rolls to the new value over ~450ms (out-expo) instead of jumping. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    prevRef.current = value
    if (from === value) return
    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const dur = 450
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setDisplay(Math.round(from + (value - from) * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <span className={className}>{formatNumber(display)}</span>
}
