# Story 04 — Mode Toggle & Separate Statistics

## Story
As a player I want to switch Normal ↔ Challenge 😈 anytime without losing or mixing my records.

## Acceptance Criteria
1. Always-visible active mode indicator (toggle + mode label on machine). [GUI §4]
2. Toggle slides with spring; NORMAL cyan / CHALLENGE 😈 pink. [GUI/design]
3. Switching never resets, merges, or modifies either mode's stats. [UT §9]
4. Stats modal shows separate NORMAL MODE STATS and CHALLENGE MODE STATS blocks with §21 field lists. [GUI + UT]
5. Challenge stats include §20 ledger: starting/current balance, spins, spent, returned, net (= returned − spent), return rate (= returned/spent × 100), biggest win, longest loss streak. [UT]
6. Normal stats show §21: spins, FUN POINTS earned, most common symbol, triples, best streak, rare combinations. [UT]
