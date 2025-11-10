import { GAME_CONSTANTS } from './constants';
import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { ComboResult, ComboKind, ComboIntensity } from '../types/combo';

const COMBO_PRIORITY: Array<{ threshold: number; kind: ComboKind }> = [
  { threshold: 6, kind: 'sixKind' },
  { threshold: 5, kind: 'fiveKind' },
  { threshold: 4, kind: 'fourKind' },
  { threshold: 3, kind: 'triple' },
  { threshold: 2, kind: 'pair' },
];

const COMBO_LABELS: Record<ComboKind, string> = {
  pair: 'Pair',
  triple: 'Triple',
  fourKind: 'Four of a Kind',
  fiveKind: 'Five of a Kind',
  sixKind: 'Six of a Kind',
  flush: 'Royal Flush',
};

const COMBO_INTENSITY: Record<ComboKind, ComboIntensity> = {
  pair: 'low',
  triple: 'medium',
  fourKind: 'medium',
  fiveKind: 'high',
  sixKind: 'legendary',
  flush: 'legendary',
};

const COMBO_EMOJIS: Record<ComboKind, string> = {
  pair: '🎉',
  triple: '✨',
  fourKind: '🔥',
  fiveKind: '⚡️',
  sixKind: '🌟',
  flush: '🌈',
};

// Bonus multipliers applied to total roll when a combo is detected.
// Values chosen to give small rewards for common combos and larger
// rewards for rare combos (flush/six of a kind).
const COMBO_BONUS_MULTIPLIER: Record<ComboKind, number> = {
  pair: 1.05,
  triple: 1.1,
  fourKind: 1.2,
  fiveKind: 1.35,
  sixKind: 1.6,
  flush: 2.0,
};

// Multi-combo bonus: additional multiplier when multiple combos are detected
const MULTI_COMBO_BONUS = 1.25; // +25% bonus for simultaneous combos

export function getComboMultiplier(combo: ComboResult): DecimalType {
  if (!combo) return new Decimal(1);
  const primaryValue = COMBO_BONUS_MULTIPLIER[combo.kind] ?? 1;
  let totalMultiplier = new Decimal(primaryValue);
  
  // Apply multi-combo bonus if present
  if (combo.isMultiCombo && combo.multiCombo) {
    const secondaryValue = COMBO_BONUS_MULTIPLIER[combo.multiCombo.kind] ?? 1;
    // Multiply primary × secondary × multi-combo bonus
    totalMultiplier = totalMultiplier.times(secondaryValue).times(MULTI_COMBO_BONUS);
  }
  
  return totalMultiplier;
}

const numberWord = (value: number): string => {
  const words: Record<number, string> = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
  };
  return words[value] ?? value.toString();
};

/**
 * Detect combos from a list of rolled faces. Returns null if no combo was found.
 * Now supports multi-combo detection (e.g., two pairs, two triples).
 */
export function detectCombo(faces: number[]): ComboResult | null {
  if (faces.length < 2) {
    return null;
  }

  const faceCounts = new Map<number, number>();
  let maxCount = 0;
  let maxFace = faces[0];

  for (const face of faces) {
    const newCount = (faceCounts.get(face) ?? 0) + 1;
    faceCounts.set(face, newCount);
    if (newCount > maxCount) {
      maxCount = newCount;
      maxFace = face;
    }
  }

  const sortedFaces = [...faces].sort((a, b) => a - b);
  const expectedStraight = Array.from(
    { length: GAME_CONSTANTS.DIE_FACES },
    (_, index) => index + 1
  );
  const isFlush =
    faces.length === GAME_CONSTANTS.DIE_FACES &&
    expectedStraight.every((value, index) => sortedFaces[index] === value);

  if (isFlush) {
    return {
      kind: 'flush',
      count: faces.length,
      faces: sortedFaces,
      isMultiCombo: false,
    };
  }

  // Find primary combo
  let primaryCombo: { kind: ComboKind; count: number; face: number } | null = null;
  for (const { threshold, kind } of COMBO_PRIORITY) {
    if (maxCount >= threshold) {
      primaryCombo = { kind, count: maxCount, face: maxFace };
      break;
    }
  }

  if (!primaryCombo) return null;

  // Check for multi-combo: look for a secondary combo among remaining dice
  const remainingFaces = faces.filter(f => f !== maxFace);
  if (remainingFaces.length >= 2) {
    const secondaryCounts = new Map<number, number>();
    let secondaryMaxCount = 0;
    let secondaryMaxFace = remainingFaces[0];

    for (const face of remainingFaces) {
      const newCount = (secondaryCounts.get(face) ?? 0) + 1;
      secondaryCounts.set(face, newCount);
      if (newCount > secondaryMaxCount) {
        secondaryMaxCount = newCount;
        secondaryMaxFace = face;
      }
    }

    // Check if secondary combo qualifies (at least a pair)
    if (secondaryMaxCount >= 2) {
      let secondaryKind: ComboKind | null = null;
      for (const { threshold, kind } of COMBO_PRIORITY) {
        if (secondaryMaxCount >= threshold) {
          secondaryKind = kind;
          break;
        }
      }

      if (secondaryKind) {
        return {
          kind: primaryCombo.kind,
          count: primaryCombo.count,
          face: primaryCombo.face,
          isMultiCombo: true,
          multiCombo: {
            kind: secondaryKind,
            count: secondaryMaxCount,
            face: secondaryMaxFace,
          },
        };
      }
    }
  }

  return {
    kind: primaryCombo.kind,
    count: primaryCombo.count,
    face: primaryCombo.face,
    isMultiCombo: false,
  };
}

export interface ComboMetadata {
  title: string;
  message: string;
  intensity: ComboIntensity;
  emoji: string;
  multiplier: number;
  bonusPercent: number;
  rarityLabel: string;
}

const INTENSITY_LABEL: Record<ComboIntensity, string> = {
  low: 'Common',
  medium: 'Rare',
  high: 'Epic',
  legendary: 'Legendary',
};

export function getComboMetadata(combo: ComboResult): ComboMetadata {
  const label = COMBO_LABELS[combo.kind];
  const emoji = COMBO_EMOJIS[combo.kind];
  const intensity = COMBO_INTENSITY[combo.kind];
  const multiplier = getComboMultiplier(combo).toNumber();
  const percent = Math.round((multiplier - 1) * 100);
  const rarityLabel = INTENSITY_LABEL[intensity];

  if (combo.kind === 'flush' && combo.faces) {
    const sequence = combo.faces.join(' · ');
    return {
      title: `${emoji} ${label}!`,
      message: `Perfect sequence rolled: ${sequence} (+${percent}% credits)` ,
      intensity,
      emoji,
      multiplier,
      bonusPercent: percent,
      rarityLabel,
    };
  }

  const faceWord = combo.face ? `${combo.face}s` : 'dice';
  const countWord = numberWord(combo.count);
  
  // Multi-combo messaging
  if (combo.isMultiCombo && combo.multiCombo) {
    const secondaryLabel = COMBO_LABELS[combo.multiCombo.kind];
    const secondaryEmoji = COMBO_EMOJIS[combo.multiCombo.kind];
    const secondaryFaceWord = combo.multiCombo.face ? `${combo.multiCombo.face}s` : 'dice';
    const secondaryCountWord = numberWord(combo.multiCombo.count);
    
    return {
      title: `${emoji}${secondaryEmoji} MULTI-COMBO!`,
      message: `${label} (${countWord} ${faceWord}) + ${secondaryLabel} (${secondaryCountWord} ${secondaryFaceWord})! (+${percent}% credits)`,
      intensity: 'legendary',
      emoji: `${emoji}${secondaryEmoji}`,
      multiplier,
      bonusPercent: percent,
      rarityLabel: 'Multi-Combo',
    };
  }

  return {
    title: `${emoji} ${label}!`,
    message: `You rolled ${countWord} ${faceWord}! (+${percent}% credits)`,
    intensity,
    emoji,
    multiplier,
    bonusPercent: percent,
    rarityLabel,
  };
}
