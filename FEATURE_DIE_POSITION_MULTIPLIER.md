# Die Position Multiplier Feature

## Summary
Added a position-based multiplier to dice rolls, making higher-numbered dice significantly more valuable and rewarding.

## Changes Made

### 1. Modified Roll Calculation (`src/utils/game-logic.ts`)

**Before:**
```typescript
const credits = die.multiplier.times(face);
```

**After:**
```typescript
const credits = die.multiplier.times(face).times(die.id);
```

This change was applied to:
- `performRoll()` - Regular roll calculations
- `calculateOfflineProgress()` - Offline/autoroll calculations

### 2. Added Tests (`tests/die-position-multiplier.test.ts`)

Created comprehensive test suite with 3 test cases:
- ✅ Tests die #1 and #2 multiply correctly
- ✅ Tests die #1, #2, #3 with higher multiplier
- ✅ Tests all 6 dice earn progressively more

All tests passing! ✅

## Impact Examples

### Example 1: All dice with multiplier=1, roll=6
| Die | Calculation | Credits |
|-----|-------------|---------|
| #1  | 6 × 1 × 1  | 6       |
| #2  | 6 × 1 × 2  | 12      |
| #3  | 6 × 1 × 3  | 18      |
| #4  | 6 × 1 × 4  | 24      |
| #5  | 6 × 1 × 5  | 30      |
| #6  | 6 × 1 × 6  | 36      |
| **Total** | | **126** |

### Example 2: Progression Value
With face=5 and multiplier=2:
- Die #1: 5 × 2 × 1 = **10 credits**
- Die #2: 5 × 2 × 2 = **20 credits** (100% increase!)
- Die #3: 5 × 2 × 3 = **30 credits** (200% increase!)
- Die #6: 5 × 2 × 6 = **60 credits** (500% increase!)

## Benefits

✅ **Makes unlocking new dice much more rewarding**
- Each new die is progressively more valuable
- Die #6 earns 6× more than die #1 for the same roll

✅ **Encourages full progression**
- Players have strong incentive to unlock all 6 dice
- Later dice feel significantly more impactful

✅ **Maintains balance**
- Uses existing Decimal library for large numbers
- Works with offline progress calculations
- Compatible with existing multiplier upgrades

## Testing Results

```
✓ tests/die-position-multiplier.test.ts (3 tests) 
✓ All existing tests still passing
✓ Typecheck passing
✓ Build successful
✓ Linting clean
```

## Formula

**New Credit Formula:**
```
credits_per_die = face_value × die_multiplier × die_position
total_credits = Σ(credits_per_die) for all unlocked dice
```

Where:
- `face_value`: The random die roll (1-6)
- `die_multiplier`: The upgradeable multiplier for that die
- `die_position`: The die's ID (1, 2, 3, 4, 5, or 6)
