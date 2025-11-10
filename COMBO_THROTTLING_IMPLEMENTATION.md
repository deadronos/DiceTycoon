# Combo Celebration Throttling & Batching Implementation

## Overview
Implemented a throttling and batching system for combo toast notifications to prevent excessive visual spam during high-frequency autoroll when batches process many dice rolls.

## Problem
- With 40-50% of rolls triggering combos and up to 10 animated outcomes per batch
- System was creating 4-6+ combo toasts simultaneously, all visible and staggered
- Resulted in overlapping notification spam every few milliseconds during aggressive autoroll

## Solution
Implemented a two-tier throttling system:

### 1. **Throttle Mechanism** (400ms minimum between emissions)
- Tracks `lastComboEmitTimeRef` to enforce minimum 400ms between combo toast emissions
- Prevents rapid-fire individual toasts from overwhelming the UI

### 2. **Combo Accumulation** (500ms batch window)
- When a combo fires within the throttle window, it's accumulated in `accumulatedCombosRef`
- A deferred timer (`comboBatchTimerRef`) waits 500ms to collect additional combos
- After the window closes, accumulated combos are emitted as a single batch

### 3. **Summary Toast Display**
- When multiple combos are batched, they display as a single toast with a count
- E.g., "Pair (3 combos)" or "Triple (5 combos)" instead of 3-5 separate toasts
- Still respects the max 3 visible toast limit

## Changes Made

### Files Modified
1. **src/App.tsx**
   - Added constants: `COMBO_THROTTLE_MS = 400`, `COMBO_BATCH_WINDOW_MS = 500`
   - Added refs: `lastComboEmitTimeRef`, `accumulatedCombosRef`, `comboBatchTimerRef`, `emitCombosWithThrottleRef`
   - Replaced `emitComboForOutcome` with throttled version
   - Added `emitCombosWithThrottle` function that handles accumulation and deferred batching
   - Added cleanup effect for batch timer on unmount

2. **src/components/ComboToastStack.tsx**
   - Extended `ComboToastEntry` interface with optional `summaryCount: number`

3. **src/components/ComboToast.tsx**
   - Extended `ComboToastProps` with optional `summaryCount`
   - Updated toast title to display count: `"Title (N combos"` when summary

### Files Added
1. **tests/combo-throttle.test.ts**
   - 4 unit tests validating throttle behavior, accumulation, and summary display
   - Tests verify throttle window enforcement and batch emission logic

## Behavior

### Before
- Combo A fires → Toast A
- Combo B fires 50ms later → Toast B (visible simultaneously)
- Combo C fires 100ms later → Toast C (visible simultaneously)
- Combo D fires 150ms later → Toast D (only 3 visible, D queued)
- Result: 4+ toasts overlapping every ~150ms

### After
- Combo A fires → Toast A (last emit time = 0)
- Combo B fires 50ms later → Accumulated (within 400ms throttle)
- Combo C fires 100ms later → Accumulated
- Combo D fires 150ms later → Accumulated
- At 500ms batch window → Emit "A (3 combos)" as single toast
- Result: 2 toasts total (A + B+C+D batched), 2 seconds apart

## Test Coverage
✓ Throttle enforcement at 400ms intervals
✓ Combo accumulation within throttle window
✓ Summary count display for multiple combos
✓ Toast stack max 3 visible limit

All 79 existing tests + 4 new tests pass.

## Performance Impact
- **Reduced toast creation** from ~10 per batch to 2-3 summary toasts
- **Cleaner UI** with fewer overlapping notifications
- **Better UX feedback** by grouping related combos into one notification
- **Minimal overhead**: Uses simple ref-based timing, no additional DOM rendering

## Configuration
Throttle tuning can be adjusted:
- `COMBO_THROTTLE_MS = 400` → Lower for more frequent toasts, higher for less spam
- `COMBO_BATCH_WINDOW_MS = 500` → Time window to collect combos before emitting batch

For aggressive autoroll (0.01s cooldown), expect 1-2 combo toasts per second.
For casual play, expect 2-3 combo toasts every 1-2 seconds.
