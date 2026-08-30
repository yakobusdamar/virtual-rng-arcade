# Story 05 — Virtual Top-Up Simulator & Transaction History

## Story
As a player I want a funny, obviously fictional BANK SIMULATOR that adds SIM COINS locally.

## Acceptance Criteria
1. "+ ADD SIM COINS" opens 🏦 BANK SIMULATOR modal (design.md paper style, SIMULATION ONLY stamp). [GUI §10.1]
2. Amount input + quick amounts; validation (integer > 0, ≤ 1,000,000). [UT]
3. On confirm: processing animation ~1.8s with progress bar + rotating messages ("Contacting absolutely nobody…"), then "✓ SIMULATION APPROVED" + amount + random line from §10.2 pool. [GUI]
4. Credits added immediately after approval; transaction `{ type:'virtual_topup', amount, timestamp }` stored locally. [UT §11]
5. Transaction history list grouped by TODAY / earlier dates, newest first. [GUI + UT]
6. Zero network calls; wording never implies real money. [AUDIT §29.9/10]
