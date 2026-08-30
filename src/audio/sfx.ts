// Synthesized SFX (WebAudio, zero assets, zero network). Design.md §7 "SFX".
// Volume is intentionally low; everything is synthesized so the app keeps its
// no-external-files guarantee. Mute state lives in its own localStorage key.

const MUTE_KEY = 'vrng-muted'

type Osc = OscillatorType

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null

  get muted(): boolean {
    try {
      return localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      return false
    }
  }

  setMuted(m: boolean): void {
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0')
    } catch {
      // storage unavailable; session-only mute
    }
  }

  private ensure(): AudioContext | null {
    try {
      if (typeof window === 'undefined') return null
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!Ctor) return null
        this.ctx = new Ctor()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.12
        this.master.connect(this.ctx.destination)
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return this.ctx
    } catch {
      return null
    }
  }

  /** One enveloped oscillator blip. */
  private blip(freq: number, opts: { type?: Osc; dur?: number; gain?: number; delay?: number; slideTo?: number } = {}): void {
    if (this.muted) return
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const { type = 'triangle', dur = 0.09, gain = 0.6, delay = 0, slideTo } = opts
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(env)
    env.connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  click(): void {
    this.blip(1250, { type: 'square', dur: 0.045, gain: 0.28 })
  }

  tick(): void {
    this.blip(1900 + Math.random() * 260, { type: 'triangle', dur: 0.03, gain: 0.16 })
  }

  reelStop(index: number): void {
    this.blip(120 + index * 18, { type: 'sine', dur: 0.1, gain: 0.85 })
    this.blip(900 + index * 120, { type: 'triangle', dur: 0.05, gain: 0.3, delay: 0.01 })
  }

  /** Tier-scaled win chime; tier 4 = jackpot fanfare. */
  win(tier: 1 | 2 | 3 | 4): void {
    const arp: number[] = tier >= 3 ? [523, 659, 784, 1046] : tier === 2 ? [523, 659, 784] : [523, 659]
    arp.forEach((f, i) => this.blip(f, { type: 'triangle', dur: 0.14, gain: 0.5, delay: i * 0.09 }))
    if (tier === 2) this.blip(1046, { type: 'triangle', dur: 0.22, gain: 0.45, delay: 0.28 })
    if (tier >= 3) {
      this.blip(1318, { type: 'triangle', dur: 0.3, gain: 0.5, delay: 0.38 })
      this.blip(2093, { type: 'sine', dur: 0.4, gain: 0.3, delay: 0.46 })
    }
    if (tier === 4) {
      ;[523, 659, 784, 1046, 1318].forEach((f, i) =>
        this.blip(f * 2, { type: 'sine', dur: 0.5, gain: 0.22, delay: 0.55 + i * 0.08 }),
      )
    }
  }

  coinDrop(): void {
    this.blip(1568, { type: 'sine', dur: 0.09, gain: 0.4 })
    this.blip(2093, { type: 'sine', dur: 0.12, gain: 0.4, delay: 0.07 })
    this.blip(2637, { type: 'sine', dur: 0.16, gain: 0.3, delay: 0.14 })
  }

  lose(): void {
    this.blip(220, { type: 'sine', dur: 0.12, gain: 0.25 })
  }
}

export const sfx = new Sfx()
