// Local-only persistence (PRD §25). Injectable StorageLike so engines/tests
// never need a DOM. No data ever leaves the browser (PRD §29.13).

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  }
}

/** Safe window.localStorage wrapper — falls back to memory in restricted contexts. */
export const browserStorage: StorageLike = (() => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const probeKey = '__vrng_probe__'
      window.localStorage.setItem(probeKey, '1')
      window.localStorage.removeItem(probeKey)
      return window.localStorage
    }
  } catch {
    // private mode / disabled storage
  }
  return createMemoryStorage()
})()

export const STORAGE_KEY = 'vrng-arcade-v1'
