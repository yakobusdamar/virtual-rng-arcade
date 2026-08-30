# PRD.md — Virtual RNG Arcade Simulator

## 1. Product Overview

**Product Name:** Virtual RNG Arcade Simulator
**Product Type:** Casual RNG / probability simulation
**Platform:** Web application

Virtual RNG Arcade Simulator adalah permainan simulasi berbasis RNG yang menggunakan mekanisme reel spinning, virtual credits, scoring, statistics, achievements, dan probability experiments.

Produk ini dirancang sebagai **simulasi dan arcade game**.

Tidak ada transaksi finansial nyata.

The application must never support:

* Real money deposits
* Real payments
* Payment gateways
* QRIS
* Real bank accounts
* Credit cards
* E-wallets
* Cryptocurrency
* Withdrawals
* Cash-out
* Real-world prizes
* Transferable balances
* Purchasable credits

All currencies and rewards exist only inside the application.

---

# 2. Core Design Principles

The experience should be:

* Fast
* Visually satisfying
* Funny
* Transparent
* Experiment-driven
* Mobile-friendly

The player should be able to understand the basic interaction immediately:

> Add virtual SIM COINS → Spin → Get result → Observe balance and statistics.

The product should never imply that users can make real money.

---

# 3. Virtual Economy

The application uses exactly two separate values.

## 3.1 SIM COINS

SIM COINS are used as gameplay credits.

SIM COINS are required to perform spins in Challenge Mode.

SIM COINS:

* Have no real-world value
* Cannot be purchased
* Cannot be exchanged
* Cannot be withdrawn
* Cannot be transferred
* Exist only in local application storage

Example:

```text
SIM COINS
50,000
```

---

## 3.2 FUN POINTS

FUN POINTS represent player score and progression.

FUN POINTS are earned from:

* Matches
* Rare combinations
* Achievements
* Special events

FUN POINTS are never used as a currency.

They cannot be spent.

They exist only for:

* Score
* Progression
* Statistics
* Achievements

Example:

```text
FUN POINTS
12,450
```

SIM COINS and FUN POINTS must never be treated as interchangeable values.

---

# 4. Game Modes

The application has exactly two primary gameplay modes:

1. Normal Mode
2. Challenge Mode

The active mode must always be visible.

---

# 5. Normal Mode

Normal Mode is designed as a casual RNG playground.

Rules:

* No SIM COIN cost
* Unlimited spins
* Pure independent RNG
* FUN POINTS can be earned
* Statistics are tracked separately from Challenge Mode

Each reel result is generated independently.

Example:

```text
🍒 ⭐ 🍋
```

Normal Mode does not simulate a house advantage.

The primary purpose is:

* Entertainment
* RNG experimentation
* Unlocking achievements
* Collecting funny combinations

---

# 6. Challenge Mode 😈

Challenge Mode is a probability experiment.

Each spin costs:

```text
100 SIM COINS
```

Challenge Mode uses a fixed probability table and reward structure designed to produce a negative long-term expected value.

This must be transparent to the player.

The application must never secretly change odds based on:

* Player balance
* Number of losses
* Number of wins
* Session duration
* Player behavior

There must be no adaptive manipulation.

The probability system must remain fixed for the selected Challenge Mode configuration.

---

# 7. Challenge Mode Probability Model

Example configuration:

| Result Category | Probability | SIM COIN Return |
| --------------- | ----------: | --------------: |
| No Match        |         55% |               0 |
| Small Win       |         25% |              50 |
| Medium Win      |         12% |             150 |
| Big Win         |          6% |             400 |
| Jackpot         |          2% |           2,000 |

Spin cost:

```text
100 SIM COINS
```

The application must calculate the expected return automatically.

Display:

```text
EXPECTED RETURN

X SIM COINS
per 100 SIM COINS spent

LONG-TERM EXPECTATION

NEGATIVE
```

The exact calculated expected value must be used.

Do not display a hardcoded value if configuration values change.

---

# 8. Challenge Mode Transparency

The Challenge Mode interface must clearly display:

```text
⚠️ SIMULATION ONLY

This mode uses a negative
long-term expected value.

Short-term wins are possible.

Long-term results may trend negative.
```

The player can inspect:

* Spin cost
* Probabilities
* Rewards
* Expected return

---

# 9. Mode Toggle

Example:

```text
┌─────────────────────────────────┐
│                                 │
│  NORMAL          CHALLENGE 😈   │
│                                 │
│     ○──────────────●            │
│                                 │
└─────────────────────────────────┘
```

When switching modes:

* Do not reset statistics
* Do not merge mode statistics
* Preserve separate records

Example:

```text
NORMAL MODE STATS

Spins: 1,240
FUN POINTS: 22,500


CHALLENGE MODE STATS

Spins: 520
SIM COINS Spent: 52,000
SIM COINS Returned: 39,200
Net: -12,800
```

---

# 10. Virtual Top-Up Simulator

SIM COINS can be added using a fictional local simulation.

The feature is called:

```text
+ ADD SIM COINS
```

This is not a payment system.

It does not contact any external service.

It does not connect to any bank.

---

## 10.1 Top-Up Screen

```text
┌──────────────────────────────┐
│ 🏦 BANK SIMULATOR            │
│                              │
│ Add Virtual SIM COINS        │
│                              │
│ Amount                       │
│ [ 10,000                   ] │
│                              │
│ [ ADD SIM COINS ]            │
│                              │
│ SIMULATION ONLY              │
└──────────────────────────────┘
```

The user enters a virtual amount.

The application immediately creates a fictional transaction.

---

## 10.2 Approval Animation

Example:

```text
PROCESSING...

████████░░░░

Contacting absolutely nobody...
```

Then:

```text
✓ SIMULATION APPROVED

+10,000 SIM COINS
```

Random messages:

* "Bank simulator has approved absolutely nothing."
* "Imaginary accountant approves."
* "Funds are fictional. Congratulations."
* "Reality remains financially unchanged."

---

# 11. Virtual Transaction History

The application stores fictional transactions locally.

Example:

```text
TODAY

+10,000 SIM COINS
SIMULATION APPROVED

+50,000 SIM COINS
SIMULATION APPROVED
```

Suggested data structure:

```javascript
{
  type: "virtual_topup",
  amount: 10000,
  timestamp: "ISO_TIMESTAMP"
}
```

No transaction must leave the browser.

---

# 12. Main Game Screen

```text
┌──────────────────────────────────┐
│ VIRTUAL RNG ARCADE               │
│                                  │
│ NORMAL MODE                      │
│                                  │
│ SIM COINS     50,000             │
│ FUN POINTS    12,450             │
│                                  │
│    ┌────┬────┬────┐              │
│    │ 🍒 │ ⭐ │ 🍋 │              │
│    └────┴────┴────┘              │
│                                  │
│          [ SPIN ]                │
│                                  │
│ 🔥 STREAK: 3                     │
│                                  │
│ [STATS] [ACHIEVEMENTS] [INFO]    │
└──────────────────────────────────┘
```

---

# 13. Reel System

Use three reels.

Possible symbols:

* 🍒 Cherry
* 🍋 Lemon
* ⭐ Star
* 🍀 Clover
* 💎 Diamond
* 🐔 Chicken
* 🥔 Potato
* 🐟 Fish

The humorous symbols should have special events.

Example:

```text
🐔 🐔 🐔

CHICKEN EVENT!

You have received:
ABSOLUTELY NOTHING USEFUL.
```

---

# 14. Spin Animation

When SPIN is pressed:

1. Validate active mode.
2. If Challenge Mode, verify SIM COINS >= spin cost.
3. Deduct spin cost before animation in Challenge Mode.
4. Disable SPIN button.
5. Start all reels.
6. Stop Reel 1.
7. Stop Reel 2.
8. Stop Reel 3.
9. Resolve outcome.
10. Apply rewards.
11. Update statistics.
12. Trigger result animation.
13. Re-enable SPIN.

Suggested timing:

```text
Reel 1: 800ms
Reel 2: 1200ms
Reel 3: 1600ms
```

The button must remain disabled while a spin is resolving.

---

# 15. Outcome Resolution

Outcome resolution must follow the active mode.

## Normal Mode

Use independent RNG for each reel.

No SIM COINS are deducted.

FUN POINTS are awarded based on symbol combinations.

---

## Challenge Mode

The outcome category must be selected according to the fixed Challenge Mode probability table.

The reel symbols should then visually represent the selected category.

Example:

```text
Selected outcome:
MEDIUM WIN

Visual result:
🍒 🍒 ⭐
```

Rewards must follow the configured payout table.

The displayed outcome must always match the actual reward.

Never display a winning combination with a losing payout.

---

# 16. FUN POINT Scoring

FUN POINTS are awarded for gameplay achievements and combinations.

Example:

| Event                | FUN POINTS |
| -------------------- | ---------: |
| Any spin             |        +10 |
| Two matching symbols |        +50 |
| Three Cherry         |       +200 |
| Three Star           |       +500 |
| Three Diamond        |     +1,000 |
| Three Chicken        |       +777 |
| Three Potato         |       +999 |

FUN POINTS are separate from SIM COINS.

Challenge Mode SIM COIN returns must never be represented as FUN POINT rewards.

---

# 17. Streak System

A streak represents consecutive spins with a defined winning outcome.

Streaks are tracked separately per mode.

Milestones:

* x3 → Small celebration
* x5 → Screen effect
* x10 → Special achievement
* x20 → Rare title

Example title:

```text
Certified RNG Enjoyer
```

---

# 18. Funny Messages

The game should have personality.

### Small Win

> "MENANG! Jangan lihat statistik dulu."

### Big Win

> "Screenshot cepat. Statistik belum sempat protes."

### Loss Streak

> "Probability is working. Unfortunately for you."

### Triple Potato

> "🥔🥔🥔 Potato economics has collapsed."

### Triple Chicken

> "🐔🐔🐔 You are now a virtual farmer."

---

# 19. Challenge Mode Reality Check

Trigger summary screens after:

* 50 spins
* 100 spins
* 500 spins

Example:

```text
📊 100 CHALLENGE SPINS

Starting Balance
50,000

Total Spent
10,000

Total Returned
7,800

NET RESULT
-2,200

RETURN RATE
78%
```

Then:

> "You didn't lose every spin. That's the clever part."

The system must display factual session statistics.

---

# 20. Session Analytics

Challenge Mode must track:

* Starting balance
* Current balance
* Total spins
* Total SIM COINS spent
* Total SIM COINS returned
* Net result
* Return percentage
* Biggest win
* Longest loss streak

Formula:

```text
Net Result
=
Total Returned
-
Total Spent
```

Return Rate:

```text
Return Rate
=
(Total Returned / Total Spent) × 100
```

---

# 21. Statistics

Statistics must be separated by mode.

## Normal Mode

Track:

* Total spins
* FUN POINTS earned
* Most common symbol
* Triple matches
* Best streak
* Rare combinations

## Challenge Mode

Track:

* Total spins
* Starting balance
* Current balance
* Total spent
* Total returned
* Net result
* Return rate
* Biggest win
* Longest loss streak

Never merge Normal Mode and Challenge Mode financial simulation statistics.

---

# 22. Probability Explorer

Create an educational sandbox.

Users can adjust:

```text
House Advantage

0% ───────●────── 20%

Volatility

LOW ───────●────── HIGH
```

The application should run a simulated batch of virtual spins.

Example:

```text
10,000 SIMULATED SPINS

PLAYER RETURN
78%

SYSTEM ADVANTAGE
22%
```

This sandbox must be clearly separated from live gameplay.

Changing Probability Explorer settings must not affect Challenge Mode gameplay unless the user explicitly creates and starts a new simulation configuration.

---

# 23. Achievements

Examples:

### 🎯 First Spin

Perform your first spin.

### 🔥 Lucky Streak

Reach streak x5.

### 🐔 Chicken Farmer

Get three chickens.

### 🥔 Potato Legend

Get three potatoes.

### 🎲 RNG Survivor

Perform 100 spins.

### 📊 Statistician

Open statistics.

### 💀 Reality Check

Complete 100 Challenge Mode spins.

---

# 24. Charts

Provide a balance history chart for Challenge Mode.

Example conceptual result:

```text
50,000 ──╮
         ╰─╮
           ╰──╮
              ╰────╮
                   ╰──── 📉
```

Users should be able to see:

* Balance over time
* Individual spin outcomes
* Wins versus losses

Big wins should be visible as spikes.

The chart should make long-term trends easy to understand.

---

# 25. Persistence

Use browser localStorage.

Suggested structure:

```javascript
{
  simCoins: 50000,

  funPoints: 12450,

  normalMode: {
    totalSpins: 1240,
    bestStreak: 8,
    symbolStats: {}
  },

  challengeMode: {
    totalSpins: 520,
    totalSpent: 52000,
    totalReturned: 39200,
    biggestWin: 2000,
    longestLossStreak: 14,
    balanceHistory: []
  },

  transactions: [],

  achievements: []
}
```

The application requires:

* No login
* No backend
* No database server

---

# 26. Reset Simulation

Provide:

```text
RESET SIMULATION
```

Confirmation:

```text
Are you sure?

This will erase:

• SIM COINS
• FUN POINTS
• Statistics
• Achievements
• Transaction history

[CANCEL]

[RESET EVERYTHING]
```

---

# 27. Visual Direction

Visual style:

**Retro Arcade + Probability Laboratory + Satirical Bank**

Combine:

* Arcade machine
* Cozy casual game
* RNG experiment
* Funny fake banking interface

Avoid:

* Real bank branding
* Real payment provider branding
* Real gambling platform branding

The experience should feel playful and fictional.

---

# 28. Technical Stack

Recommended:

```text
React
TypeScript
Tailwind CSS
Framer Motion
Recharts
```

Alternative:

```text
HTML
CSS
JavaScript
```

Recommended architecture:

```text
src/

components/
  ReelMachine
  SpinButton
  ModeToggle
  BalanceDisplay
  TopupModal
  Statistics
  AchievementPanel
  ProbabilityExplorer

engine/
  normalModeEngine
  challengeModeEngine
  scoringEngine
  probabilityEngine

store/
  gameStore

utils/
  storage
  calculations
```

---

# 29. Non-Negotiable Rules

The AI builder must follow these rules:

1. SIM COINS and FUN POINTS are separate systems.
2. SIM COINS are only virtual credits.
3. FUN POINTS cannot be spent.
4. Normal Mode has no SIM COIN spin cost.
5. Challenge Mode costs exactly the configured SIM COINS per spin.
6. Challenge Mode probabilities must be visible.
7. Challenge Mode odds must not secretly adapt to player behavior.
8. The displayed outcome must match the actual payout.
9. Virtual top-up must not contact external financial systems.
10. No real-world money functionality may exist.
11. Statistics must be separated by game mode.
12. Probability Explorer must not silently modify Challenge Mode.
13. All persistent data must remain local unless a future version explicitly introduces non-financial cloud saves.
14. No withdrawal or conversion system may exist.

---

# 30. AI Builder Final Instructions

Build a polished single-page web application.

Priority order:

1. Smooth and satisfying reel animation.
2. Clear separation between Normal and Challenge Mode.
3. Transparent Challenge Mode probability system.
4. Funny Virtual Top-Up Simulator.
5. Excellent mobile experience.
6. Accurate statistics.
7. Balance history chart.
8. Achievements.
9. Probability Explorer.
10. localStorage persistence.

The final experience should feel like:

> 🎰 An entertaining RNG arcade machine that gradually reveals the mathematics behind long-term losing probability.

The application should be funny and visually satisfying, while maintaining transparent simulation mechanics.

No real financial transactions may exist anywhere in the application.
