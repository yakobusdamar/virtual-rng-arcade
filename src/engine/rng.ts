// The ONLY random source in the app. Injectable for deterministic tests.

export type Rng = () => number // uniform [0, 1)

export function cryptoRng(): Rng {
  const buf = new Uint32Array(1)
  return () => {
    crypto.getRandomValues(buf)
    return buf[0] / 2 ** 32
  }
}

/** Weighted pick: returns index i with probability weights[i] / Σweights. */
export function pickIndex(weights: number[], rng: Rng): number {
  let total = 0
  for (const w of weights) total += w
  let roll = rng() * total
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]
    if (roll < 0) return i
  }
  return weights.length - 1
}
