# BMAD QA Report — Virtual RNG Arcade Simulator
**QA agent output · automated, no human review** · Date: 2026-08-30 · Build: production (`vite build`, served via `vite preview`)

## 1. Gates

| Gate | Command | Result |
| --- | --- | --- |
| Type safety | `tsc --noEmit` (strict) | ✅ 0 errors |
| Unit/integration | `vitest run` | ✅ **55/55 tests, 5 files** |
| Production build | `npm run build` | ✅ success (JS 708 kB / CSS 56 kB; recharts+framer bundle noted) |
| GUI smoke (real browser) | `node tests/gui-smoke.mjs` (Playwright headless Chromium) | ✅ **23/23 checks** (`docs/bmad/qa/gui-results.json`) |
| §29 rules audit | `tests/rulesAudit.test.ts` + code review | ✅ **14/14 rules hold** (table below) |

## 2. GUI smoke evidence (screenshots in `docs/bmad/qa/screenshots/`)

Checked in a real browser at mobile 390×844 and desktop 1280×800: initial load, spin lifecycle (disabled-while-resolving, banner after 1600 ms reel sequence), mode toggle, challenge warning + computed EV "94.5 per 100 → NEGATIVE", cost deducted **before** animation, payout delta ∈ {0,50,150,400,2000} matching displayed outcome, BANK SIMULATOR processing → "✓ SIMULATION APPROVED +50,000", per-mode statistics tabs, balance chart, achievements counter, Probability Lab run (player return 91.6% vs 90% theoretical) + explicit config adoption toast, reset-guard cancel, zero console errors, zero horizontal overflow.

Key captures: `01-mobile-initial`, `04-mobile-odds-table`, `14-topup-settled`, `15-odds-table-settled`, `16-lab-results`, `17-achievements`, `18-reset-confirm`, `13-desktop`.

## 3. Defects found by QA → fixed → re-verified

| # | Defect | Caught by | Fix | Re-verified |
| --- | --- | --- | --- | --- |
| D1 | **SPIN never resolved**: `SpinButton` invoked `startSpin()` without scheduling `resolveSpin()` after the 1600 ms reel sequence → machine locked in spinning state, button permanently disabled | GUI smoke (real click path); unit tests called the two actions directly and missed the wiring | Timer added in `SpinButton.onPress` (1600 ms = reel 3 stop, per §14) | GUI 23/23 incl. "disabled while resolving" + re-enable |
| D2 | Challenge-mode result banner kept showing the previous Normal-mode outcome after a mode switch (stale banner, cosmetic) | Visual review of `04-mobile-odds-table.png` | Accepted: banner persists until next spin, deltas are clearly currency-tagged (⭐ vs 🪙); no data error | — |
| D3 | Test-side only: rigged `rng()=0` yields 🍒🍒🍒 in Normal Mode (not "no match"); x5 streak needs 5 wins; stats default tab follows active mode | Unit runs | Test expectations corrected to exact rigged-reel math | 55/55 |

## 4. PRD §29 non-negotiables — evidence

| Rule | Evidence |
| --- | --- |
| 1. SIM COINS ≠ FUN POINTS | Separate types/engines/colors (`gameStore.ts`, `design.md §1.3`); GUI shows gold 🪙 vs violet ⭐ |
| 2. SIM COINS only virtual credits | Only mutation paths: `startSpin` deduction, `topUpApply`, `resetSimulation` — all local |
| 3. FUN POINTS cannot be spent | No spend path exists (`rulesAudit` greps: no exchange/convert code) |
| 4. Normal Mode free | `spinNormal(rng)` signature has no cost; `startSpin` normal branch never touches `simCoins` (UT) |
| 5. Challenge costs exactly configured cost | Deduction reads `challengeConfig.spinCost` (UT: 100 before animation; GUI verified) |
| 6. Probabilities visible | `WarningBanner` odds table + `InfoModal` + Lab; rendered from live config (GUI 04/15) |
| 7. No adaptive odds | `spinChallenge(config, rng)` — no behavioral inputs; 20k-spin distribution matches fixed table (UT) |
| 8. Displayed outcome = payout | Deterministic `reelsForCategory`; 5k-spin readback `categoryFromReels(reels) === category` (UT); GUI payout delta check |
| 9. Top-up contacts nobody | Zero network code (`rulesAudit` forbids fetch/XHR/WS/axios); 1.8 s local theatre |
| 10. No real-money functionality | No purchase/withdraw/cash-out/deposit code or wording (`rulesAudit`); button reads "+ ADD SIM COINS" |
| 11. Stats separated per mode | Distinct `normal`/`challenge` stats objects; §9 switch test proves untouched records |
| 12. Explorer can't silently modify Challenge | `simulateBatch` is pure; adoption only via explicit `adoptChallengeConfig` button (UT + GUI toast) |
| 13. Data stays local | localStorage key `vrng-arcade-v1`; no endpoints anywhere (audit) |
| 14. No withdrawal/conversion | No code path converts either currency (`rulesAudit`) |

## 5. Per-story verdicts

| Story | Verdict | Evidence |
| --- | --- | --- |
| 01 Foundation | ✅ PASS | build green, tokens.css ↔ design.md 1:1, storage UT, §25 shape UT |
| 02 Normal Mode | ✅ PASS | uniformity UT, scoring UT, GUI spin cycle + FUN POINTS |
| 03 Challenge Mode | ✅ PASS | distribution UT (20k), §15 consistency UT, GUI deduction + banner + EV 94.5 |
| 04 Toggle & stats | ✅ PASS | §9 preservation UT, GUI stats tabs both modes, ledger formulas UT |
| 05 Top-up | ✅ PASS | validation UT, GUI processing→approved→history; paper/stamp styling capture |
| 06 Streaks & achievements | ✅ PASS | streak/reset/best UT, milestone celebration UT, GUI toast + counter 2/11 |
| 07 Reality check & chart | ✅ PASS | 50-trigger UT + non-refire UT, chart rendered in GUI, formulas UT |
| 08 Probability Explorer | ✅ PASS | EV pinning UT across grid, batch return UT, GUI 91.6% vs 90 + adoption gate |
| 09 Reset/Info/polish | ✅ PASS | reset wipe UT, GUI reset guard, no-overflow check, desktop two-column capture |

## 6. Residual notes (non-blocking)

- Bundle > 500 kB warning from recharts/framer-motion — acceptable for a single-page arcade; code-splitting available later.
- Challenge Mode never renders funny triples (🐔🥔🐟) by design: category→reel mapping guarantees §15 display/payout consistency; funny triples live in Normal Mode (§13 events, §16/§18).
- x20 streak title ("Certified RNG Enjoyer") is rare by nature; milestone logic is unit-tested at x3/x5 and shares the same code path.
