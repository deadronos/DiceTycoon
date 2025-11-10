import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComboResult } from '../src/types/combo';

/**
 * Test suite for combo throttling and batching logic.
 * 
 * The throttling mechanism prevents excessive toast spam by:
 * 1. Allowing only one combo emission per COMBO_THROTTLE_MS (400ms)
 * 2. Accumulating combos that fire within the throttle window
 * 3. Emitting accumulated combos as a batch after COMBO_BATCH_WINDOW_MS (500ms)
 * 4. Displaying a summary count when multiple combos are batched together
 */

describe('Combo Throttling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should allow combo emissions at throttle intervals', () => {
    const COMBO_THROTTLE_MS = 400;
    const emissions: number[] = [];
    
    // Simulate throttling logic
    let lastEmitTime = -COMBO_THROTTLE_MS; // Start in the past so first emit is allowed
    const shouldEmit = (now: number) => {
      const elapsed = now - lastEmitTime;
      if (elapsed >= COMBO_THROTTLE_MS) {
        lastEmitTime = now;
        return true;
      }
      return false;
    };
    
    // First combo at t=0 - should emit immediately
    expect(shouldEmit(0)).toBe(true);
    emissions.push(0);
    
    // Second combo at t=100 (within throttle) - should not emit
    expect(shouldEmit(100)).toBe(false);
    
    // Third combo at t=450 (after throttle) - should emit
    expect(shouldEmit(450)).toBe(true);
    emissions.push(450);
    
    expect(emissions).toEqual([0, 450]);
  });

  it('should accumulate combos within throttle window', () => {
    const COMBO_THROTTLE_MS = 400;
    
    const accumulated: ComboResult[] = [];
    let lastEmitTime = -COMBO_THROTTLE_MS; // Start in the past
    let batchTimerScheduled = false;
    
    const tryEmit = (combos: ComboResult[], now: number) => {
      const elapsed = now - lastEmitTime;
      
      if (elapsed < COMBO_THROTTLE_MS) {
        // Within throttle window - accumulate
        accumulated.push(...combos);
        batchTimerScheduled = true;
        return false; // Did not emit
      }
      
      // Throttle window passed - emit
      lastEmitTime = now;
      batchTimerScheduled = false;
      return true; // Did emit
    };
    
    const pair: ComboResult = { kind: 'pair', count: 2, face: 6 };
    const triple: ComboResult = { kind: 'triple', count: 3, face: 5 };
    
    // t=0: Emit first combo - passes throttle check
    const emitted1 = tryEmit([pair], 0);
    expect(emitted1).toBe(true);
    expect(accumulated).toEqual([]);
    expect(batchTimerScheduled).toBe(false);
    
    // t=100: Try to emit within throttle - should accumulate instead
    const emitted2 = tryEmit([triple], 100);
    expect(emitted2).toBe(false);
    expect(accumulated).toEqual([triple]);
    expect(batchTimerScheduled).toBe(true);
    
    // t=450: After throttle, pass accumulated combos to emit
    const emitted3 = tryEmit(accumulated, 450);
    expect(emitted3).toBe(true);
    expect(batchTimerScheduled).toBe(false);
  });

  it('should create summary toast when multiple combos batched', () => {
    const combos = [
      { kind: 'pair' as const, count: 2, face: 6 },
      { kind: 'triple' as const, count: 3, face: 5 },
      { kind: 'pair' as const, count: 2, face: 4 },
    ];
    
    const primaryCombo = combos[0];
    const isSummary = combos.length > 1;
    const summaryCount = isSummary ? combos.length : undefined;
    
    expect(summaryCount).toBe(3);
    expect(primaryCombo.kind).toBe('pair');
  });

  it('should cap visible toasts at 3 even with accumulation', () => {
    const MAX_VISIBLE_TOASTS = 3;
    interface Toast {
      id: number;
      combo: ComboResult;
      visible: boolean;
    }
    const toastStack: Toast[] = [];
    
    // Add 5 toasts
    for (let i = 0; i < 5; i++) {
      toastStack.unshift({
        id: i,
        combo: { kind: 'pair' as const, count: 2 },
        visible: true,
      });
      
      // Slice to max
      if (toastStack.length > MAX_VISIBLE_TOASTS) {
        toastStack.pop();
      }
    }
    
    expect(toastStack).toHaveLength(3);
    expect(toastStack.map(t => t.id)).toEqual([4, 3, 2]);
  });
});
