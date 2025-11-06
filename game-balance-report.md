# DiceTycoon — Game Balance Report

Date: 2025-11-06

This report examines the core balance formulas, thresholds, and progression curves implemented in `src/utils/*` (notably `game-logic.ts`, `constants.ts`, `decimal.ts`, and `combos.ts`). It documents the current formulas, derives numeric examples for common progression points, highlights potential balance issues or exploits, and gives actionable recommendations with suggested parameter changes for playtesting.

---

## 1) Core formulas (extract)

- Per-die roll contribution (performed in `performRoll`):

  credits per die = die.multiplier × face × die.id

  total baseCredits = Σ (die.multiplier × face_i × die.id) for each unlocked die

- Combo multiplier (from `combos.ts`):

  finalCredits = baseCredits × getComboMultiplier(combo)

  getComboMultiplier maps kinds → multipliers: pair 1.05, triple 1.1, fourKind 1.2, fiveKind 1.35, sixKind 1.6, flush 2.0

- Combo chain bonus (consecutive combo streak):

  chainBonus = 1 + 0.1 × max(currentChain - 1, 0)  (i.e., +10% per extra consecutive combo)

- Prestige / Luck effects:

  getLuckMultiplier(state): returns min(1 + luckPoints × 0.02, 10)

  calculateLuckGain(state): floor( max(log10(totalCredits) - 2, 0) × 0.25 × luckBoost )

  luckBoost (Luck Fabricator shop) = 1 + 0.1 × level

  applyPrestigeMultipliers multiplies baseCredits × luckMult × shopMult

- Die level multiplier (from `decimal.calculateMultiplier`):

  multiplier(level) = BASE_MULTIPLIER × MULTIPLIER_PER_LEVEL^(level - 1)

  GAME_CONSTANTS: BASE_MULTIPLIER = 1, MULTIPLIER_PER_LEVEL = 1.5

- Costs:

  - Unlock die i: BASE_UNLOCK_COST × UNLOCK_COST_MULTIPLIER^(i - 1)
    (BASE_UNLOCK_COST = 10, UNLOCK_COST_MULTIPLIER = 5)
  - Level up cost at currentLevel L: BASE_LEVEL_COST × LEVEL_COST_GROWTH^L
    (BASE_LEVEL_COST = 10, LEVEL_COST_GROWTH = 1.75)
  - Autoroll unlocking: AUTOROLL_UNLOCK_COST = 50
  - Autoroll upgrade (currentLevel > 0): AUTOROLL_UPGRADE_COST × AUTOROLL_COST_GROWTH^currentLevel
    (AUTOROLL_UPGRADE_COST = 100, AUTOROLL_COST_GROWTH = 2)
  - Prestige shop items use baseCost × costGrowth^currentLevel (see `PRESTIGE_SHOP_ITEMS`)

---

## 2) Numeric examples & intuition

All numeric values use Decimal in code; here are representative numbers using current constants.

1) Unlock costs (dieId 1..6):

   - Die 1: 10 × 5^0 = 10
   - Die 2: 10 × 5^1 = 50
   - Die 3: 250
   - Die 4: 1,250
   - Die 5: 6,250
   - Die 6: 31,250

   Observation: unlock costs are extremely stepwise and escalate ×5 each slot — buying higher dice becomes exponentially more expensive.

2) Expected base roll with 6 unlocked dice (all multipliers = 1), average face = 3.5:

   sum die.id = 1 + 2 + 3 + 4 + 5 + 6 = 21
   expected baseCredits per roll ≈ 3.5 × 21 = 73.5 credits/roll

   Example deterministic roll (faces = 4): total = 4 × 21 = 84 (see tests).

3) Die leveling: multiplier growth vs cost

   - Multiplier per level = 1.5^(level - 1)
     - Level 1 multiplier = 1
     - Level 2 multiplier = 1.5
     - Level 5 multiplier ≈ 1.5^4 ≈ 5.06

   - Level up cost curve (BASE_LEVEL_COST=10, GROWTH=1.75)
     - cost at currentLevel=0 => 10 × 1.75^0 = 10
     - currentLevel=1 => 17.5
     - currentLevel=4 => 10 × 1.75^4 ≈ 93.79

   Balancing: multiplier growth per level (×1.5) is aggressive but level costs are moderate at early levels; this enables noticeable power spikes when players invest multiple levels into a single die.

4) Autoroll costs & cooldowns

   - Unlock autoroll: 50 credits
   - Upgrade cost growth doubles per level (growth = 2), e.g. level 1 cost 100×2^1 = 200 (function uses currentLevel)
   - Base cooldown = 2s. getAutorollCooldown(level) uses 0.9^level (10% faster per level). Additional prestige shop reductions multiply by 0.95^shopLevel. Net cooldown = 2 × 0.9^level × 0.95^shopLevel.

   Autoroll improvements are effective (time-based) but costs escalate quickly — high levels are expensive.

5) Prestige luck thresholds (current implementation)

   calculateLuckGain uses floor( (log10(totalCredits) - 2) × 0.25 × luckBoost ), floored.

   - Need log10(totalCredits) - 2 >= 4 to produce rawGain >= 1 (assuming luckBoost = 1), so log10 >= 6 ⇒ credits >= 10^6 to get 1 luck point.
   - To get 2 luck points: base >= 8 ⇒ credits >= 10^10.

   Observation: luck points are extremely sparse; first luck point requires ~10 million credits under default parameters.

---

## 3) Potential balance concerns and edge cases

1) Very steep unlock cost multiplier (×5 per die)

   - Pros: Forces players to progress and invest in earlier dice first; creates clear tiered progression.
   - Cons: Later dice become gated by very large steps, which may feel like artificial walls. If die slot 6 becomes too valuable (because of die.id weighting), players may be required to grind a lot to access later slots.

2) Die position (die.id) linearly multiplies face rewards

   - This creates guaranteed dominance of higher-index dice in per-roll income (die 6 yields 6× the face contribution of die 1, all else equal). Combined with level multipliers, a single heavily-leveled high-index die can dominate earnings.

   - Potential exploit: focusing upgrades on highest-index dice yields more efficient returns per upgrade dollar; narrowing player choice can be less interesting.

3) Multiplier per level (×1.5 per level) vs level cost (×1.75 per level on cost exponent)

   - Multiplier growth is steep but level costs also grow; however, because multiplier growth is exponential with base 1.5 and cost growth is 1.75, direct ROI per level should be profiled. Early levels are cheap and powerful (good sense of progression), but mid-late levels may still be efficient to stack on a single die.

4) Prestige/luck gating is extremely conservative

   - The luck gain formula yields the first luck point at ~1e7 credits. That is relatively late; if the intended pacing is to require substantial play before the first prestige, that's fine — otherwise consider loosening it.

5) Autoroll upgrade costs escalate quickly (growth 2)

   - Doubling cost per level makes autoroll high-level access very gatey. Depending on intended game loop, this either preserves long-term goals or unnecessarily penalizes players who value QoL.

6) Combo rewards are modest (max 2.0× for flush) but chain bonuses add a persistent +10% per consecutive combo which can synergize with high multipliers and become significant when combined with high luck/shop multipliers.

---

## 4) Concrete recommendations (with suggested parameters for playtesting)

Recommendation A — Smooth unlock costs (reduce step scaling)

- Change UNLOCK_COST_MULTIPLIER from 5 → 3 (or to 2.5 for gentler curve). Example new costs:
  - Die 1..6: 10, 30, 90, 270, 810, 2430 (with ×3)

  Rationale: reduces sudden walls and lets players access mid-tier dice earlier, which diversifies upgrade choices. If you prefer a hard gate, keep ×5 but consider providing alternate unlock paths (prestige shop discount or timed unlocks).

Recommendation B — Re-balance die position weighting

- Option B1 (mild): change per-die contribution to die.multiplier × face × sqrt(die.id)
  - This reduces dominance of highest slots while preserving ordering.

- Option B2 (cosmetic): keep die.id weighting but add diminishing return on multiplier when applied to higher-index dice (e.g., per-die multiplier factor *= 1 / (1 + 0.05 × (die.id - 1))).

  Rationale: prevents single-slot dominance and encourages distributing upgrades across dice.

Recommendation C — Adjust prestige luck formula for earlier, more frequent prestige feedback

- Option C1: increase luck scalar from 0.25 → 0.5 (double prestige rate). Then first luck point at log10(totalCredits)-3 >= 2 ⇒ log10 >=5 ⇒ credits >= 1e5.

- Option C2: reduce subtract constant from 3 → 2 (calculateLuckGain uses log10(totalCredits)-2). Then first point at log10 >=6 ⇒ credits >= 1e6.

  Rationale: awarding small prestige progress earlier keeps prestige loop meaningful and reduces grind. Choose C1 for fast prestige cycles, C2 for moderate.

Recommendation D — Softening autoroll upgrade costs

- Reduce AUTOROLL_COST_GROWTH from 2 → 1.5 or lower the AUTOROLL_UPGRADE_COST base from 100 → 50. This maintains autoroll as a long-term target but reduces prohibitive costs.

Recommendation E — Monitor multiplier vs cost ROI

- Add a telemetry metric (or run local simulation) that computes expected credits-per-credit-invested for leveling a die at various levels and die indices. If ROI remains >1 for many levels, consider increasing level cost growth or reducing multiplierPerLevel from 1.5 → 1.4.

Recommendation F — Provide alternative sinks / ways to progress

- Consider adding small prestige shop discounts (temporary unlock coupons), daily challenges that grant unlock subsidies, or achievements that grant partial unlock cost refunds. This helps players who feel stuck at the exponential unlock steps.

---

## 5) Quick playtest parameter presets

For rapid iteration, try these two presets in separate branches for A/B testing:

- Preset Soft Progression (encourages quicker access, less grind):
  - UNLOCK_COST_MULTIPLIER = 3
  - MULTIPLIER_PER_LEVEL = 1.45
  - LEVEL_COST_GROWTH = 1.8
  - calculateLuckGain: multiply raw by 0.5 instead of 0.25

- Preset Tight Progression (harder, late-game focused):
  - UNLOCK_COST_MULTIPLIER = 5 (keep)
  - MULTIPLIER_PER_LEVEL = 1.5 (keep)
  - LEVEL_COST_GROWTH = 1.8 (slightly increase)
  - calculateLuckGain: subtract 3 as-is but increase luckBoost scaling in shop (e.g., +0.15 per level)

---

## 6) Suggested next steps / experiments

1. Instrument small simulation: write a unit that simulates purchasing a single die to level N at each die index and records credits-per-credit-invested and payback period (in rolls). Use Decimal so simulation matches runtime math.
2. Run a few playtest sessions with Preset Soft and Tight and collect time-to-first-autoroll, time-to-first-prestige, and player choices (did they focus on die 6?).
3. If die position remains too dominant, implement Option B1 (sqrt scaling) and re-run simulation.
4. Consider UX feedback (player perception): if players report long idle waiting for unlocks, prioritize lower unlock multiplier or an alternate unlock mechanic.

---

## 7) Verification notes

- I inspected source files: `src/utils/game-logic.ts`, `src/utils/constants.ts`, `src/utils/decimal.ts`, `src/utils/combos.ts` and relevant tests under `tests/` to verify example numbers (tests agree with die.id weighting and roll math).

- No code changes made — this file is advisory. If you'd like, I can open a small PR that adjusts constants to any of the presets above and run the test suite.

---

If you'd like, I can:

- run a param sweep simulator and include CSV outputs for ROI per die per level, or
- implement one chosen preset and run the test suite / smoke playtest in an instrumented environment.

End of report.
