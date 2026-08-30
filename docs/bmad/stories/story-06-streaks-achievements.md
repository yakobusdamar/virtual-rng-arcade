# Story 06 — Streaks & Achievements

## Story
As a player I want streaks and achievements that reward playing with the math, not against it.

## Acceptance Criteria
1. Streak = consecutive winning spins, tracked separately per mode (normal win: funPoints>10; challenge win: returned>0). [UT §17]
2. Milestones: x3 small celebration, x5 screen effect, x10 achievement, x20 title "Certified RNG Enjoyer" (persisted). [UT + GUI]
3. Streak display 🔥 STREAK: N on machine; resets on loss. [GUI]
4. Achievements (§23): first_spin, lucky_streak_x5, chicken_farmer, potato_legend, rng_survivor_100, statistician, reality_check_100 + bonus: streak_x10, jackpot, lab_rat, fictional_billionaire. [UT each predicate]
5. Unlock → toast (gold, bounce) + persisted with timestamp; achievement panel lists all with locked/unlocked state. [GUI]
6. "Statistician" unlocks on first stats open. [UT]
