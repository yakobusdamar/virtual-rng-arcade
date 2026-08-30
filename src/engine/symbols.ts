import type { SymbolId } from './types'

export interface SymbolDef {
  id: SymbolId
  emoji: string
  label: string
}

// PRD §13 — the eight reel symbols.
export const SYMBOL_LIST: SymbolDef[] = [
  { id: 'cherry', emoji: '🍒', label: 'Cherry' },
  { id: 'lemon', emoji: '🍋', label: 'Lemon' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'clover', emoji: '🍀', label: 'Clover' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'chicken', emoji: '🐔', label: 'Chicken' },
  { id: 'potato', emoji: '🥔', label: 'Potato' },
  { id: 'fish', emoji: '🐟', label: 'Fish' },
]

export const SYMBOL_IDS: SymbolId[] = SYMBOL_LIST.map((s) => s.id)

export const SYMBOL_EMOJI: Record<SymbolId, string> = Object.fromEntries(
  SYMBOL_LIST.map((s) => [s.id, s.emoji]),
) as Record<SymbolId, string>

export const SYMBOL_LABEL: Record<SymbolId, string> = Object.fromEntries(
  SYMBOL_LIST.map((s) => [s.id, s.label]),
) as Record<SymbolId, string>

/** Symbols used for MEDIUM_WIN triples in Challenge Mode. */
export const LOW_SYMBOLS: SymbolId[] = ['cherry', 'lemon', 'clover']

/**
 * Per-symbol tint (design.md §7) — one hue per symbol so each reel cell can
 * glow in its own color when it lands. Pure presentation: never used by the
 * engines or the payout logic.
 */
export const SYMBOL_TINT: Record<SymbolId, string> = {
  cherry: '#FF5C7A',
  lemon: '#FFE066',
  star: '#FFC94D',
  clover: '#6EE7A0',
  diamond: '#22D3EE',
  chicken: '#FFD9A8',
  potato: '#D9A05B',
  fish: '#6AA8FF',
}
