# Feature Ideas for Dice Tycoon

Based on the codebase analysis, here are three proposed features to improve stability, progression, and gameplay depth.

## 1. Optimized Offline Progress (Stability & Performance)

### Problem
The current offline progress implementation in `src/utils/offline-progress.ts` simulates game ticks in a loop (`for (let i = 0; i < rollsPerformed; i++)`).
- **Performance Risk:** If a player is offline for a long time (e.g., days) or has a very fast autoroll speed (e.g., 0.01s), this loop can run millions of times.
- **Consequence:** This freezes the main thread upon game load, potentially crashing the browser or causing a poor user experience.

### Solution
Replace the iterative simulation with a mathematical approximation (closed-form calculation).

**Implementation Details:**
- **Calculate Total Offline Rolls:** `N = (offlineTime / cooldown)`.
- **Estimate Average Roll Value:** Instead of rolling RNG `N` times, use `(min_roll + max_roll) / 2 * multiplier` (or a weighted average if probabilities vary).
- **Estimate Combo Bonus:** Apply a conservative "average combo multiplier" based on probability statistics (e.g., probability of a Pair * pair multiplier + ...).
- **Apply in Bulk:** `totalCredits = averageRollValue * N`.
- **Cap:** Ensure a reasonable cap (e.g., 24 hours) to encourage active play, though the optimized math allows for indefinite offline time.

### Value
- **Scalability:** Supports infinite offline time without performance degradation.
- **Stability:** Removes the risk of browser freezes.

---

## 2. Achievement Rewards System (Progression)

### Problem
The current achievement system (`src/utils/achievements.ts`) tracks milestones but provides no tangible gameplay reward. They are purely cosmetic.

### Solution
Enhance achievements to provide rewards, integrating them into the core loop.

**Implementation Details:**
- **Data Structure Update:** Add a `reward` field to the `AchievementDefinition` interface.
  ```typescript
  interface AchievementReward {
    type: 'global_multiplier' | 'luck_points';
    value: Decimal;
  }
  ```
- **Reward Types:**
  - **Global Multiplier:** Small permanent boost (e.g., +1% credits) per achievement.
  - **Luck Points:** One-time grant of prestige currency.
- **UI Update:** Show the reward in the `AchievementsPanel`.
- **Logic:** Apply these bonuses in `src/utils/game-roll.ts` (multiplier) or upon unlock (luck).

### Value
- **Incentive:** Gives players a concrete reason to chase specific goals.
- **Satisfaction:** Makes unlocking an achievement feel more impactful.

---

## 3. Die Specialization / Unique Abilities (Gameplay Depth)

### Problem
Currently, all 6 die slots are functionally identical. The only difference is the order in which they are unlocked.

### Solution
Assign unique passive abilities to specific die slots to differentiate them and add strategic depth.

**Implementation Details:**
- **Abilities:**
  - **Die 1 (The Starter):** No special ability (baseline).
  - **Die 2 (Buffer):** +10% multiplier to adjacent dice.
  - **Die 3 (Rusher):** 5% chance to trigger an immediate extra roll.
  - **Die 4 (Combo Master):** Triples the value of combos it participates in.
  - **Die 5 (Lucky):** +5% chance for higher face values (weighted RNG).
  - **Die 6 (Tycoon):** +5% Global Multiplier.
- **Logic:** Update `executeRoll` in `src/utils/roll-helpers.ts` to check for these flags and apply effects during calculation.
- **UI:** Display the passive ability on the `DieCard`.

### Value
- **Strategy:** Makes the order of unlocking and upgrading dice more interesting.
- **Variety:** Breaks the monotony of identical units.
