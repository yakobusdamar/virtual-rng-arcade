# Story 01 — Foundation: Scaffold, Tokens, State, Persistence

## Story
As a player I want a fast, working app shell that remembers my data, so that everything else builds on solid ground.

## Acceptance Criteria
1. Vite + React + TS (strict) + Tailwind v4 + Framer Motion + Recharts + Zustand project runs (`npm run build` green). [UT: build]
2. `src/styles/tokens.css` exports every token from `design.md` as CSS vars + Tailwind `@theme` mapping. [AUDIT]
3. Fonts bundled via `@fontsource/*` (no CDN). [AUDIT]
4. Zustand store `gameStore` with the §25 state shape; `persist` to localStorage key `vrng-arcade-v1`; hydrates on load. [UT]
5. `utils/storage.ts` with `StorageLike` injection (in-memory fallback). [UT]
6. `format.ts`: `Intl.NumberFormat('en-US')` grouping; `formatCoins/formatPoints` never interchangeable (gold vs violet vocabulary). [UT]
7. No network code anywhere. [AUDIT]

## Dev Notes
- Engine code stays pure (no DOM/React imports) for node-env vitest.
- Strict TS, `noUnusedLocals`.
