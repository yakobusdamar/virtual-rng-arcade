# Story 08 — Probability Explorer Sandbox

## Story
As a player I want a lab sandbox where I adjust house edge and volatility and watch 10,000 simulated spins prove the math.

## Acceptance Criteria
1. Sliders: House Advantage 0–20%, Volatility LOW–HIGH. [GUI §22]
2. "Run" simulates 10,000 spins batch and shows PLAYER RETURN % and SYSTEM ADVANTAGE % (+ simulated balance sparkline). [UT: return ≈ 100 − houseEdge within tolerance]
3. Theoretical expected return of the generated config displayed and ≈ 100 − houseEdge. [UT]
4. Sandbox clearly separated from live gameplay (LAB framing, dashed divider, "does not affect gameplay" caption). [GUI]
5. Live Challenge config changes ONLY via explicit "ADOPT CONFIG" action; adoption updates EV display accordingly. [UT + AUDIT §29.12]
6. Sandbox spins never touch real balances, stats, or achievements. [UT]
