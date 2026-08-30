const nf = new Intl.NumberFormat('en-US')

/** 50000 → "50,000" (design.md §2 numeric rule). */
export function formatNumber(n: number): string {
  return nf.format(Math.round(n))
}

export function formatSigned(n: number): string {
  return n > 0 ? `+${nf.format(Math.round(n))}` : nf.format(Math.round(n))
}

const DAY_MS = 86_400_000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Transaction grouping label (PRD §11): TODAY / YESTERDAY / locale date. */
export function dateGroupLabel(timestamp: string, now = Date.now()): string {
  const ts = new Date(timestamp).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(ts)) / DAY_MS)
  if (days <= 0) return 'TODAY'
  if (days === 1) return 'YESTERDAY'
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatClock(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
