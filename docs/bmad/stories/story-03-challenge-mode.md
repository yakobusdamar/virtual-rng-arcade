# Story 03 — Challenge Mode Engine + Transparency

## Story
As a player I want a Challenge Mode that honestly simulates negative-EV odds, with every number inspectable.

## Acceptance Criteria
1. Spin costs exactly 100 SIM COINS from config, deducted **before** animation. [UT + GUI]
2. Insufficient balance → spin blocked with clear message, no deduction. [UT + GUI]
3. Category sampled from fixed table (55/25/12/6/2 → 0/50/150/400/2000). [UT: 10k-spin distribution within tolerance]
4. Category→reels deterministic mapping (NO_MATCH=3 distinct, SMALL=1 pair, MEDIUM=triple 🍒/🍋/🍀, BIG=⭐⭐⭐, JACKPOT=💎💎💎); displayed outcome always matches payout. [UT: exhaustive per-category consistency]
5. Expected return computed from config (never hardcoded): default = 94.5 per 100, labeled LONG-TERM EXPECTATION: NEGATIVE. [UT]
6. ⚠️ SIMULATION ONLY banner (§8 copy) always visible in Challenge Mode; probabilities, cost, rewards, EV inspectable (banner + INFO). [GUI + AUDIT]
7. Odds never adapt: `spinChallenge(config, rng)` takes no behavior/balance inputs. [AUDIT §29.7]
8. Challenge SIM COIN returns never add FUN POINTS and vice versa. [AUDIT §29.1]

## Dev Notes
- Reward applied = table return for sampled category; balance delta always equals displayed outcome value.
