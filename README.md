# Virtual RNG Arcade Simulator

🎰 A simulation & arcade game: reel-spinning RNG fun on the outside, a transparent probability experiment on the inside. **No real money exists anywhere** — SIM COINS and FUN POINTS are fictional, live only in your browser, and can never be bought, sold, or exchanged.

- **NORMAL mode** — free unlimited spins, FUN POINTS for funny combinations (🐔🐔🐔).
- **CHALLENGE mode 😈** — 100 SIM COINS per spin, fixed visible odds, negative long-term expected value (94.5 per 100 by default), reality checks at 50/100/500 spins.
- **🏦 BANK SIMULATOR** — a satirical fictional top-up that contacts absolutely nobody.
- **🔬 Probability Lab** — bend house edge & volatility and watch 10,000 simulated spins prove the math.

Built per `prd.md` with React 18 + TypeScript + Tailwind v4 + Zustand + Framer Motion + Recharts. Design tokens: `design.md`. BMAD artifacts: `docs/bmad/`.

```bash
npm install
npm run dev       # develop
npm test          # 55 unit/integration tests + §29 rules audit
npm run build     # typecheck + production build
npm run preview   # serve the build
```
