import { useEffect, useRef } from 'react'

export type BurstKind = 'coin' | 'star' | 'confetti'

export interface BurstDetail {
  x: number
  y: number
  kind: BurstKind
  count: number
}

const PALETTES: Record<BurstKind, string[]> = {
  coin: ['#FFC94D', '#FFE066', '#E0A62E', '#FFF3D6'],
  star: ['#B388FF', '#E4D4FF', '#8B5CF6', '#FFF3D6'],
  confetti: ['#FFC94D', '#B388FF', '#22D3EE', '#FF2E88', '#FFF3D6', '#4ADE80'],
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  g: number
  spin: number
  angle: number
  size: number
  ttl: number
  life: number
  color: string
  rect: boolean
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const MAX_PARTICLES = 260

/** Canvas particle layer. Listens for `vrng-burst` events; costs nothing idle. */
export function ParticleLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles: Particle[] = []
    let raf = 0
    let running = false

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (e: Event) => {
      if (reducedMotion()) return
      const { x, y, kind, count } = (e as CustomEvent<BurstDetail>).detail
      const palette = PALETTES[kind]
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2.2 + Math.random() * (kind === 'confetti' ? 7 : 5)
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.4,
          g: kind === 'confetti' ? 0.16 : 0.2,
          spin: (Math.random() - 0.5) * 0.3,
          angle: Math.random() * Math.PI,
          size: kind === 'confetti' ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
          ttl: 900 + Math.random() * 700,
          life: 0,
          color: palette[Math.floor(Math.random() * palette.length)],
          rect: kind === 'confetti' || Math.random() < 0.3,
        })
      }
      if (particles.length > MAX_PARTICLES) particles = particles.slice(-MAX_PARTICLES)
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }

    const frame = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particles = particles.filter((p) => p.life < p.ttl)
      for (const p of particles) {
        p.life += 16.7
        p.vy += p.g
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.angle += p.spin
        const alpha = Math.max(0, 1 - p.life / p.ttl)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        if (p.rect) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle)
          ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size)
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (particles.length > 0) {
        raf = requestAnimationFrame(frame)
      } else {
        running = false
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('vrng-burst', spawn)
    return () => {
      window.removeEventListener('vrng-burst', spawn)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

/** Fire a particle burst from the center of an element (by test id). */
export function burstFromElement(elementId: string, kind: BurstKind, count: number): void {
  const el = document.querySelector(`[data-testid="${elementId}"]`)
  const rect = el?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  window.dispatchEvent(new CustomEvent<BurstDetail>('vrng-burst', { detail: { x, y, kind, count } }))
}
