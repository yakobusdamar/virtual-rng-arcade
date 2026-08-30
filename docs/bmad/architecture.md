# architecture.md — BMAD Architect Output
**Project:** Virtual RNG Arcade Simulator · **Source of truth:** `prd.md` · **Design system:** `design.md`

## 1. Stack Decision (PRD §28 recommended path)

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite 6 + React 18 + TypeScript (strict) | Fast dev, type safety for engine math |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`, tokens from `design.md` in `@theme` | Tokens are first-class |
| Motion | Framer Motion | Reel stagger, celebrations, modal/stamp springs |
| Charts | Recharts | Balance history + explorer sparkline |
| State | Zustand + `persist` middleware (localStorage) | Small, testable, PRD `store/gameStore` |
| Fonts | `@fontsource/press-start-2p`, `@fontsource/space-grotesk`, `@fontsource/space-mono` | Bundled = offline, no CDN branding risk |
| Tests | Vitest (node env) on pure engines | Automated QA gate |

No backend, no network calls anywhere (PRD §25, §29.13). Fonts bundled locally.

## 2. Directory contract (PRD §28)

```
src/
  components/   ReelMachine, SpinButton, ModeToggle, BalanceDisplay, TopupModal,
                Statistics, AchievementPanel, ProbabilityExplorer, InfoModal,
                RealityCheckModal, ResetConfirm, ResultBanner, Header, WarningBanner
  engine/       rng, symbols, normalModeEngine, challengeModeEngine,
                scoringEngine, probabilityEngine, achievements, messages
  store/        gameStore.ts
  utils/        storage.ts, calculations.ts (EV, return rate), format.ts
tests/          vitest suites per engine + persistence + rules audit
```

## 3. Core data models (persisted, PRD §25)

```ts
type Mode = 'normal' | 'challenge'
type SymbolId = 'cherry'|'lemon'|'star'|'clover'|'diamond'|'chicken'|'potato'|'fish'

interface NormalStats {
  totalSpins: number
  funPointsEarned: number
  symbolCounts: Record<SymbolId, number>
  tripleCounts: Record<SymbolId, number>
  mostCommonSymbol: SymbolId | null
  bestStreak: number
  rareCombinations: string[]   // e.g. 'CHICKEN_EVENT', 'POTATO_COLLAPSE'
}
interface ChallengeStats {
  totalSpins: number
  startingBalance: number      // SIM COINS at first challenge spin after reset
  totalSpent: number
  totalReturned: number
  biggestWin: number
  longestLossStreak: number
  outcomeCounts: Record<ChallengeCategory, number>
  balanceHistory: number[]     // balance after each challenge spin (§24)
}
interface Transaction { id: string; type: 'virtual_topup'; amount: number; timestamp: string }
interface GameState {
  simCoins: number; funPoints: number; mode: Mode
  normal: NormalStats; challenge: ChallengeStats
  streak: { current: number }            // per active mode; best kept in mode stats
  transactions: Transaction[]
  achievements: Record<AchievementId, { unlockedAt: string }>
  realityChecksSeen: number[]            // 50 | 100 | 500 (§19)
  explorerRuns: number
}
```

**Mode switch (§9):** toggles `mode` only — stats objects untouched, never merged.

## 4. Engine contracts (pure functions, all in `engine/`)

### symbols.ts
`SYMBOLS: { id, emoji, label }[]` — 🍒 🍋 ⭐ 🍀 💎 🐔 🥔 🐟 (PRD §13).

### rng.ts
`randomFloat()` = `crypto.getRandomValues` → uniform [0,1). `pickIndex(weights: number[]): number` — one allocation-free cumulative scan; the ONLY random source in the app. Injected/mocked in tests.

### normalModeEngine.ts (PRD §5, §15)
`spinNormal(rng): { reels: SymbolId[3] }` — three **independent** uniform picks, no house model, no cost.

### challengeModeEngine.ts (PRD §6–8, §15)
```ts
interface ChallengeConfig { spinCost: 100; table: { category, probability, return }[] }  // probabilities sum ≈ 1
spinChallenge(config, rng): { category, reels }
```
1. Sample category from `config.table` via `pickIndex`.
2. **Deterministic category→reels mapping** (guarantees §15 "displayed outcome matches actual payout"):
   - `NO_MATCH` → three distinct symbols (never a pair/triple)
   - `SMALL_WIN` → exactly one pair (low symbol pair + different third)
   - `MEDIUM_WIN` → triple of 🍒/🍋/🍀
   - `BIG_WIN` → triple ⭐
   - `JACKPOT` → triple 💎
3. `computeExpectedReturn(config): number` — Σ p·return, always computed (§7), displayed as "per 100 SIM COINS spent" + NEGATIVE/POSITIVE verdict.

Default table = PRD §7 (0.55/0.25/0.12/0.06/0.02 → 0/50/150/400/2000, EV 94.5). Odds are static per config; **no** input to `spinChallenge` depends on balance/history/behavior (§29.7).

### scoringEngine.ts (PRD §16)
`scoreNormal(reels): { funPoints, events }` — +10 any spin, +50 one pair, triples: cherry 200, star 500, diamond 1000, chicken 777 (CHICKEN_EVENT), potato 999 (POTATO_COLLAPSE), other triples (lemon/clover/fish) +150 "ODD_TRIPLE" (documented extension of the example table). Applied to **Normal Mode spins only** — Challenge Mode awards only SIM COIN returns, so a payout can never be mirrored as FUN POINTS (§16 rule + §29.1).

### probabilityEngine.ts (PRD §22)
`generateConfig(houseEdgePct: 0–20, volatility: 0–1): ChallengeConfig` — fixed payouts `[0,50,150,400,2000]`, volatility reweights win-category weights, scale factor `s = (100−h)/Σ(wᵢ·payᵢ)` pins theoretical EV to `100−h`; `p_noMatch = 1 − Σp_win`. `simulateBatch(config, n, rng)` — batch simulator for the explorer sandbox only.

### streaks (in store)
Win definition: normal = pair or triple (funPoints > 10); challenge = returned > 0. Separate per mode (§17). Milestones x3 toast, x5 screen flash, x10 achievement, x20 title "Certified RNG Enjoyer".

### achievements.ts (PRD §23)
`ACHIEVEMENTS: { id, emoji, title, desc, check(state): boolean }[]` — pure predicate over state, evaluated post-spin/post-action; new unlocks return list for toast queue.

## 5. Store & persistence (PRD §25)

Zustand `persist`, key `vrng-arcade-v1`, `version: 1`, `migrate` passthrough. `utils/storage.ts` exposes `loadState()/saveState()` with a `StorageLike` interface (in-memory fallback for tests). All data stays in the browser.

Spin flow (store action `spin()`, PRD §14 order): validate mode → challenge: check `simCoins >= cost`, deduct **before** animation → set `spinning` (button disabled) → components drive reel timings 800/1200/1600ms → `resolve()` applies outcome, rewards, stats, streak, achievements, balanceHistory, reality-check trigger → `spinning=false`.

## 6. Non-negotiable rule enforcement (PRD §29) — design-level guarantees

1/2/3. Separate currencies; separate types, colors (gold vs violet per design.md), engines; FUN POINTS never spent anywhere (no spend path exists).
4. `spinNormal` deducts nothing (no code path touches simCoins).
5. `spinCost` read from config on every spin.
6. Challenge table rendered from config in UI (WarningBanner + InfoModal + explorer).
7. `spinChallenge(config, rng)` signature has no behavioral inputs.
8. Category→reels mapping is deterministic (§4 above); reels rendered only from engine result.
9. Top-up is a local state transition + animation; zero network code (verified: `fetch`/`XHR` absent from src).
10. No purchase/withdraw/cash-out code or wording exists; top-up reads "ADD SIM COINS" + SIMULATION ONLY.
11. `normal` and `challenge` stats objects never merge; UI tabs per mode.
12. Explorer calls `simulateBatch` only; adopting a config requires explicit button press → replaces live config with recalc EV.
13. localStorage only.
14. No conversion/exchange code exists between the currencies.

## 7. QA gate (BMAD cycle)

Vitest suites in `tests/`: challenge distribution (10k-spin tolerance), EV math, category↔payout consistency, scoring, streaks, achievements, config generator EV pinning, persistence round-trip + reset. Build (`tsc + vite build`) must pass. GUI smoke test via automated browser. Results recorded in `docs/bmad/qa-report.md`.
