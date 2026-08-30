# design.md — Design Token System
**Product:** Virtual RNG Arcade Simulator (per `prd.md`)
**Visual direction (PRD §27):** Retro Arcade + Probability Laboratory + Satirical Bank
**Feel:** arcade machine × cozy casual game × RNG experiment × funny fake banking interface. Playful, fictional, transparent.

---

## 0. How to use this file

Every token below is exported as a CSS custom property in `src/styles/tokens.css` (`:root`) and mapped into Tailwind v4 via `@theme`. Components must consume **semantic tokens only** — never raw hex values — so the theme can be re-skinned without touching components.

Token naming convention:

```
--{category}-{role}-{variant}
```

Categories: `color`, `font`, `text`, `space`, `radius`, `shadow`, `motion`, `z`, `breakpoint`.

---

## 1. Color tokens

### 1.1 Primitives — "Cabinet" surfaces (dark arcade shell)

| Token | Value | Use |
| --- | --- | --- |
| `--color-cabinet-950` | `#07070F` | Page background (deepest) |
| `--color-cabinet-900` | `#0B0B18` | App background |
| `--color-cabinet-800` | `#12122A` | Panel / card background |
| `--color-cabinet-700` | `#1A1A3D` | Raised panel, toggle track, input bg |
| `--color-cabinet-600` | `#26264F` | Hover surface |
| `--color-line` | `#2E2E5E` | 1px borders, dividers |
| `--color-line-bright` | `#3D3D7A` | Focused border |

### 1.2 Primitives — Neon & signal colors

| Token | Value | Use |
| --- | --- | --- |
| `--color-neon-pink` | `#FF2E88` | Primary arcade accent, SPIN button, CHALLENGE mode |
| `--color-neon-pink-soft` | `#FF5FA8` | Pink hover |
| `--color-neon-cyan` | `#22D3EE` | NORMAL mode accent, links, info highlights |
| `--color-lab-green` | `#4ADE80` | Terminal/lab readouts, success |
| `--color-danger-red` | `#FF5252` | Negative values, NET loss, destructive |
| `--color-warn-amber` | `#FFB020` | Warnings, ⚠️ banners |
| `--color-info-blue` | `#38BDF8` | Informational accents |

### 1.3 Currency tokens (hard PRD §29 rule 1 — never interchangeable)

| Token | Value | Use |
| --- | --- | --- |
| `--color-sim-coin` | `#FFC94D` | **SIM COINS** — always gold, always coin context |
| `--color-sim-coin-deep` | `#E0A62E` | SIM COIN borders / chart line |
| `--color-fun-point` | `#B388FF` | **FUN POINTS** — always violet, always score context |
| `--color-fun-point-deep` | `#8B5CF6` | FUN POINT borders / chart line |

> **Rule:** SIM COINS are gold + 🪙-style framing; FUN POINTS are violet + ⭐-score framing. Components must never render one with the other's tokens, never mix them in one number, and never show an exchange rate.

### 1.4 Primitives — "Satirical Bank" paper (Top-Up Simulator modal only)

| Token | Value | Use |
| --- | --- | --- |
| `--color-paper-bg` | `#F3EBD3` | Bank Simulator modal "official paper" background |
| `--color-paper-ink` | `#1C1B16` | Paper text |
| `--color-paper-line` | `#C9BE9C` | Paper borders |
| `--color-stamp-red` | `#D64545` | SIMULATION ONLY rubber stamp |

### 1.5 Text & state semantics

| Token | Value | Use |
| --- | --- | --- |
| `--color-text-primary` | `#F4F2FF` | Primary text |
| `--color-text-secondary` | `#A9A7C9` | Secondary text |
| `--color-text-muted` | `#6E6C96` | Tertiary/caption |
| `--color-text-on-accent` | `#0B0B18` | Text on pink/gold fills |
| `--color-state-win` | `#4ADE80` | Win result flash |
| `--color-state-lose` | `#FF5252` | Loss result flash |
| `--color-state-jackpot` | `#FFC94D` | Jackpot celebration |

### 1.6 Glow tokens (CRT/neon language)

| Token | Value |
| --- | --- |
| `--shadow-glow-pink` | `0 0 16px rgba(255,46,136,.45)` |
| `--shadow-glow-cyan` | `0 0 16px rgba(34,211,238,.40)` |
| `--shadow-glow-gold` | `0 0 18px rgba(255,201,77,.45)` |
| `--shadow-glow-green` | `0 0 14px rgba(74,222,128,.40)` |

**Accessibility:** body text must use `text-primary`/`text-secondary` on cabinet-800+ (≥ 7:1 / ≥ 4.6:1). Neon colors are accents/labels ≥ 14px bold or decorative; never body copy. Gold `#FFC94D` and violet `#B388FF` on cabinet-900 both pass ≥ 7:1.

---

## 2. Typography tokens

| Token | Value | Use |
| --- | --- | --- |
| `--font-display` | `"Press Start 2P", monospace` | Title, section headers, SPIN, mode labels |
| `--font-body` | `"Space Grotesk", system-ui, sans-serif` | Body, paragraphs, buttons |
| `--font-mono` | `"Space Mono", ui-monospace, monospace` | All numerics, stats, lab/terminal text |

**Numeric rule:** every currency/stat readout uses `font-mono` + `font-variant-numeric: tabular-nums` and `Intl.NumberFormat("en-US")` grouping (`50,000`).

Display scale (Press Start 2P renders large — keep small):

| Token | Size / line |
| --- | --- |
| `--text-display-xl` | 1.75rem / 1.35 — app title only |
| `--text-display-lg` | 1.25rem / 1.4 — screen titles |
| `--text-display-md` | 1rem / 1.45 — section headers, SPIN label |
| `--text-display-sm` | 0.75rem / 1.5 — labels, chips |
| `--text-display-2xs` | 0.625rem / 1.6 — tiny arcade captions |

Body scale: `--text-xs 12/16 · --text-sm 14/20 · --text-base 16/24 · --text-lg 18/26 · --text-xl 20/28`.

---

## 3. Spacing, radius, borders

Space scale (4px base): `--space-1 4 · 2 8 · 3 12 · 4 16 · 6 24 · 8 32 · 12 48 · 16 64`.

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 6px | Chips, inputs |
| `--radius-md` | 10px | Buttons, small panels |
| `--radius-lg` | 14px | Cards, modals, reel window |
| `--radius-xl` | 20px | Machine shell, hero panels |
| `--radius-pill` | 999px | Toggle, pills |

| Token | Value |
| --- | --- |
| `--border-hairline` | 1px solid `var(--color-line)` |
| `--border-thick` | 3px solid |

---

## 4. Shadow & depth tokens

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-chunky` | `4px 4px 0 0 rgba(0,0,0,.6)` | Buttons, cards — retro hard offset |
| `--shadow-chunky-lg` | `6px 6px 0 0 rgba(0,0,0,.6)` | Machine shell, SPIN |
| `--shadow-inset-reel` | `inset 0 2px 14px rgba(0,0,0,.8)` | Reel windows |
| `--shadow-overlay` | `0 12px 40px rgba(0,0,0,.6)` | Modals |

Press interaction = translate(2px,2px) + drop to `--shadow-chunky` (chunky shadow shrinks) — never opacity-only.

---

## 5. Motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `--motion-instant` | 100ms | Hovers, presses |
| `--motion-fast` | 200ms | Toggles, chips |
| `--motion-base` | 300ms | Panels, modals |
| `--motion-slow` | 500ms | Celebrations |
| `--motion-ease-standard` | `cubic-bezier(.2,.8,.2,1)` | Default |
| `--motion-ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | Entrances, pops, win labels (v2: replaces bounce) |
| `--motion-ease-out-quart` | `cubic-bezier(.25,1,.5,1)` | Shakes, flash settle, count-up |
| `--motion-ease-reel-stop` | `cubic-bezier(.15,.9,.25,1.05)` | Reel landing (mechanical settle — the one intentional overshoot) |

**Reel timings (PRD §14 baseline; §14 calls them "suggested", anticipation builds on them):**

| Token | Value |
| --- | --- |
| `--motion-reel-1` | 800ms |
| `--motion-reel-2` | 1200ms |
| `--motion-reel-3` | 1600ms |
| `--motion-anticipation` | +900ms on reel 3 — challenge BIG/JACKPOT only; pulsing gold ring from reel-2 landing |
| `--motion-anticipation-soft` | +500ms on reel 3 — normal mode when reels 1–2 match |
| `--motion-reel-frame` | 60ms per symbol pass (tick SFX every 3rd frame) |
| `--motion-result-flash` | 600ms |
| `--motion-count-up` | 450ms, out-expo — all currency readouts tick, never jump |
| `--motion-stamp-in` | 250ms (scale 1.6 → 1, rotate −6°, out-expo) |
| `--motion-topup-processing` | 1800ms total progress bar |

**Game-feel layer (v2, inspired by premium slot craft, satirical identity kept):**

| Effect | Spec |
| --- | --- |
| Win tiers | `tierOf(outcome)` → 0 none · 1 banner burst (20 particles) · 2 win strip over machine (46 particles) · 3 rays + count-up + screen shake (90) · 4 JACKPOT takeover: rotating rays, dim, confetti (170), big shake, "100% fictional. As always." |
| Shake | `shake-x` 420ms keyframes on app shell; skipped under reduced motion |
| Rays | `repeating-conic-gradient`, radial mask, 14s rotation, gold at 16% alpha |
| Symbol tints | one hue per symbol (§7b); landing = halo flash `cell-land` 450ms + drop-in scale 1.12 → 1 |
| Ambient | 7 drifting sparkles behind the cabinet (9–15s loops, alpha ≤ .34); radial gold glow behind machine; 4 bezel studs |
| SPIN idle | sheen sweep every 4.6s; hover scale 1.02; press squash 0.98 + chunky translate |
| SFX | WebAudio synth, master gain 0.12, muted via `vrng-muted` (🔊/🔇 in header): click, reel ticks, per-reel thud (pitch rises), tier-scaled win arpeggio, jackpot fanfare, coin drop on top-up approval |
| Streak | 🔥 pulses from x3; amber ember glow at machine bezel edges while streak ≥ 3 |

**`prefers-reduced-motion: reduce`** → reels crossfade (150ms) instead of spin, no shake/particles/rays, count-up renders instantly, celebrations become static highlights. Spin sequence timing (stagger) is preserved.

---

## 6. Layout tokens

| Token | Value |
| --- | --- |
| `--breakpoint-sm` | 480px |
| `--breakpoint-md` | 768px |
| `--breakpoint-lg` | 1024px |
| `--z-raised` | 10 |
| `--z-sticky` | 20 |
| `--z-overlay` | 40 |
| `--z-modal` | 50 |
| `--z-toast` | 60 |
| `--z-celebration` | 70 |

App is a single column, max-width `480px` on mobile → `960px` two-column (machine | side panels) ≥ `md`. Touch targets ≥ 44px.

---

## 7. Component tokens

| Component | Tokens |
| --- | --- |
| **SPIN button** | bg `neon-pink`, text `text-on-accent`, `font-display md`, `shadow-chunky-lg`, glow-pink; disabled = 40% opacity, no glow; challenge spin disabled state shows "NEED COINS" |
| **Reel window** | bg gradient `cabinet-700 → cabinet-800`, `radius-lg`, `shadow-inset-reel`, symbol size `clamp(2rem, 8vw, 3rem)`, win flash `state-win` glow |
| **Mode toggle** | pill track `cabinet-700`; NORMAL side `neon-cyan`, CHALLENGE 😈 side `neon-pink`; knob slides with `motion-fast` + ease-bounce; active mode always visibly labeled (PRD §4) |
| **Panel/card** | bg `cabinet-800`, `border-hairline`, `radius-lg`, `shadow-chunky` |
| **Warning banner (Challenge)** | bg `rgba(255,176,32,.12)`, border `warn-amber`, mono text |
| **Rubber stamp** | `stamp-red`, mono uppercase, 3px double border, rotate −6°, "SIMULATION ONLY" |
| **Bank Simulator modal** | `paper-bg`/`paper-ink` inside dark overlay; chunky paper shadow; obviously fictional ("BANK SIMULATOR", "Contacting absolutely nobody…") |
| **Progress bar (top-up)** | track `cabinet-700`, fill `lab-green` with glow-green |
| **Achievement toast** | slide-down pill, gold border, `motion-ease-bounce` |
| **Achievement rarity** | common `text-muted` · rare `neon-cyan` · epic `fun-point` · legendary `sim-coin` |
| **Chart (balance history)** | line `sim-coin-deep`, loss region fill `rgba(255,82,82,.15)`, win spikes dot `state-win`, grid `color-line` at 40% |
| **Probability Explorer** | sliders: track `line`, thumb `info-blue`; readouts mono on `cabinet-900` terminal panel with `lab-green` values; visually framed as "LAB" — separated from live machine by a dashed divider + "SANDBOX — does not affect gameplay" caption |

### Iconography
Emoji symbols are the game icons (PRD §13): 🍒 🍋 ⭐ 🍀 💎 🐔 🥔 🐟. UI icons are minimal emoji/unicode (🔥 📊 🏆 ⚠️ 🏦). No real brand marks anywhere.

### 7b. Symbol tints (one hue per symbol — presentation only, never payout logic)

| Symbol | Tint | | Symbol | Tint |
| --- | --- | --- | --- | --- |
| 🍒 cherry | `#FF5C7A` | | 💎 diamond | `#22D3EE` |
| 🍋 lemon | `#FFE066` | | 🐔 chicken | `#FFD9A8` |
| ⭐ star | `#FFC94D` | | 🥔 potato | `#D9A05B` |
| 🍀 clover | `#6EE7A0` | | 🐟 fish | `#6AA8FF` |

Each reel cell renders a radial halo of its symbol tint (~22% alpha) and flashes `brightness 1.9 → 1` on landing.

### 7c. Machine bezel & ambient
Gold gradient bezel (`frame-gold-1 → 2 → 3`) wraps the machine panel, 4 glowing studs in the corners, soft radial gold glow behind the shell, 7 drifting sparkles behind the cabinet. This is *our* gold language (arcade bezel), not casino-branding gold; the satire stays: every win overlay says the prize is fictional.

### 7d. SFX
Synthesized WebAudio (no assets, no network), master gain 0.12, header mute toggle persists to `vrng-muted`. Sounds: button click, reel tick, per-reel landing thud (pitch steps up per reel), win arpeggio scaled by tier, jackpot fanfare, coin-drop on top-up approval, low blip on blocked/insufficient interactions.

---

## 8. Voice & copy tokens (PRD §18 personality)

- Result messages: Indonesian-flavored humor for wins, English lab-speak for stats. Funny but never promising real value.
- Every money-adjacent surface carries a "SIMULATION ONLY" marker (stamp, banner, or caption).
- Top-up approval messages pool (PRD §10.2): "Bank simulator has approved absolutely nothing." / "Imaginary accountant approves." / "Funds are fictional. Congratulations." / "Reality remains financially unchanged."

---

## 9. Do / Don't (from PRD §27 + §29)

**Do:** neon-on-dark arcade shell; lab-terminal panels for stats; paper-bank modal satire; chunky retro shadows; playful emoji; transparent odds displayed like an experiment readout.

**Don't:** real bank/payment/gambling branding (no logo lookalikes, no QRIS-style payment codes); green "casino felt" clichés; real-money visual affordances (no "Buy", "Deposit", "Withdraw" wording — use "ADD SIM COINS"); mixing SIM COIN and FUN POINT visual language; adaptive odds hints.
