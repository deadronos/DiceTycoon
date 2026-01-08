import { useState, useCallback, useRef, useEffect } from 'react';
import Decimal from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { type AutorollBatchOutcome } from '../utils/autorollBatchRunner';
import { createBatchAnimationPlan } from '../utils/autorollBatchAnimations';
import { getComboMetadata, type ComboMetadata } from '../utils/combos';
import type { ComboResult } from '../types/combo';
import { CREDIT_POPUP_DURATION } from '../utils/constants';
import type { ComboToastEntry } from '../components/ComboToastStack';

const COMBO_TOAST_AUTO_DISMISS_MS = 3000;
const BATCH_POPUP_SPACING = CREDIT_POPUP_DURATION + 150;
const COMBO_THROTTLE_MS = 400;
const COMBO_BATCH_WINDOW_MS = 500;

export const useGameFeedback = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupCredits, setPopupCredits] = useState(new Decimal(0));
  const [popupRollCount, setPopupRollCount] = useState<number | null>(null);
  const [popupIsCritical, setPopupIsCritical] = useState(false);
  const [comboToasts, setComboToasts] = useState<ComboToastEntry[]>([]);
  const [lastComboMetadata, setLastComboMetadata] = useState<ComboMetadata | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState<number | null>(null);

  const comboToastTimersRef = useRef<Map<number, number>>(new Map());
  const batchAnimationTimersRef = useRef<number[]>([]);
  const lastComboEmitTimeRef = useRef<number>(0);
  const accumulatedCombosRef = useRef<ComboResult[]>([]);
  const comboBatchTimerRef = useRef<number | null>(null);
  const emitCombosWithThrottleRef = useRef<((combos: ComboResult[]) => void) | null>(null);

  // Cleanup timers
  useEffect(() => {
    const timers = comboToastTimersRef.current;
    return () => {
      timers.forEach(timerId => window.clearTimeout(timerId));
      timers.clear();

      batchAnimationTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
      batchAnimationTimersRef.current = [];

      if (comboBatchTimerRef.current) {
        window.clearTimeout(comboBatchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const activeIds = new Set(comboToasts.map(toast => toast.id));
    comboToastTimersRef.current.forEach((timerId, toastId) => {
      if (!activeIds.has(toastId)) {
        window.clearTimeout(timerId);
        comboToastTimersRef.current.delete(toastId);
      }
    });
  }, [comboToasts]);

  const handleComboToastClose = useCallback((id: number) => {
    const timerId = comboToastTimersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      comboToastTimersRef.current.delete(id);
    }
    setComboToasts(prev =>
      prev.map(toast => (toast.id === id ? { ...toast, visible: false } : toast))
    );
    window.setTimeout(() => {
      setComboToasts(prev => prev.filter(toast => toast.id !== id));
    }, 320);
  }, []);

  const emitCombosWithThrottle = useCallback((combos: ComboResult[]) => {
    if (combos.length === 0) return;

    const now = Date.now();
    const elapsed = now - lastComboEmitTimeRef.current;

    if (elapsed < COMBO_THROTTLE_MS) {
      accumulatedCombosRef.current.push(...combos);

      if (comboBatchTimerRef.current) {
        window.clearTimeout(comboBatchTimerRef.current);
      }

      comboBatchTimerRef.current = window.setTimeout(() => {
        if (emitCombosWithThrottleRef.current && accumulatedCombosRef.current.length > 0) {
          emitCombosWithThrottleRef.current(accumulatedCombosRef.current);
        }
        accumulatedCombosRef.current = [];
        comboBatchTimerRef.current = null;
      }, COMBO_BATCH_WINDOW_MS);

      return;
    }

    lastComboEmitTimeRef.current = now;

    const primaryCombo = combos[0];
    const isSummary = combos.length > 1;
    const metadata = getComboMetadata(primaryCombo);
    const timestamp = now + Math.random();

    setComboToasts(prev => {
      const next = [
        {
          id: timestamp,
          combo: primaryCombo,
          metadata,
          visible: true,
          summaryCount: isSummary ? combos.length : undefined,
        },
        ...prev.filter(toast => toast.id !== timestamp),
      ];
      return next.slice(0, 3);
    });

    const timerId = window.setTimeout(() => {
      handleComboToastClose(timestamp);
    }, COMBO_TOAST_AUTO_DISMISS_MS);
    comboToastTimersRef.current.set(timestamp, timerId);
    setLastComboMetadata(metadata);
    setConfettiTrigger(timestamp);
  }, [handleComboToastClose]);

  useEffect(() => {
    emitCombosWithThrottleRef.current = emitCombosWithThrottle;
  }, [emitCombosWithThrottle]);

  const emitComboForOutcome = useCallback((combo: ComboResult) => {
    emitCombosWithThrottle([combo]);
  }, [emitCombosWithThrottle]);

  const showRollFeedback = useCallback((outcome: AutorollBatchOutcome & { isCritical?: boolean }, rollCount: number | null = null) => {
    setPopupCredits(outcome.creditsEarned);
    setPopupRollCount(rollCount);
    setPopupIsCritical(!!outcome.isCritical);
    setShowPopup(true);
    if (outcome.combo) {
      emitComboForOutcome(outcome.combo);
    }
  }, [emitComboForOutcome]);

  const clearBatchAnimationTimers = useCallback(() => {
    batchAnimationTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    batchAnimationTimersRef.current = [];
  }, []);

  const scheduleBatchOutcome = useCallback((outcome: AutorollBatchOutcome, delay: number) => {
    const timerId = window.setTimeout(() => showRollFeedback(outcome), delay);
    batchAnimationTimersRef.current.push(timerId);
  }, [showRollFeedback]);

  const scheduleAggregatedPopup = useCallback((credits: DecimalType, rolls: number, delay: number) => {
    const timerId = window.setTimeout(() => {
      showRollFeedback({ creditsEarned: credits, combo: null }, rolls);
    }, delay);
    batchAnimationTimersRef.current.push(timerId);
  }, [showRollFeedback]);

  const emitSampledAnimations = useCallback((outcomes: AutorollBatchOutcome[], animationBudget: number) => {
    clearBatchAnimationTimers();
    const plan = createBatchAnimationPlan(outcomes, animationBudget);
    plan.sampled.forEach((outcome, index) => {
      const delay = index * BATCH_POPUP_SPACING;
      scheduleBatchOutcome(outcome, delay);
    });
    if (plan.remainder.length > 0) {
      const delay = plan.sampled.length * BATCH_POPUP_SPACING + 100;
      scheduleAggregatedPopup(plan.aggregatedCredits, plan.remainder.length, delay);
    }
  }, [clearBatchAnimationTimers, scheduleBatchOutcome, scheduleAggregatedPopup]);

  const handlePopupComplete = useCallback(() => {
    setShowPopup(false);
    setPopupRollCount(null);
    setPopupIsCritical(false);
  }, []);

  return {
    feedbackState: {
      showPopup,
      popupCredits,
      popupRollCount,
      popupIsCritical,
      comboToasts,
      lastComboMetadata,
      confettiTrigger,
    },
    actions: {
      handlePopupComplete,
      handleComboToastClose,
      showRollFeedback,
      emitSampledAnimations,
    },
  };
};
