import { GAME_CONSTANTS } from './constants';
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
  sixKind: 'high',
  flush: 'high',
};

const COMBO_EMOJIS: Record<ComboKind, string> = {
  pair: '🎉',
  triple: '✨',
  fourKind: '🔥',
  fiveKind: '⚡️',
  sixKind: '🌟',
  flush: '🌈',
};

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
    };
  }

  for (const { threshold, kind } of COMBO_PRIORITY) {
    if (maxCount >= threshold) {
      return {
        kind,
        count: maxCount,
        face: maxFace,
      };
    }
  }

  return null;
}

export interface ComboMetadata {
  title: string;
  message: string;
  intensity: ComboIntensity;
  emoji: string;
}

export function getComboMetadata(combo: ComboResult): ComboMetadata {
  const label = COMBO_LABELS[combo.kind];
  const emoji = COMBO_EMOJIS[combo.kind];
  const intensity = COMBO_INTENSITY[combo.kind];

  if (combo.kind === 'flush' && combo.faces) {
    const sequence = combo.faces.join(' · ');
    return {
      title: `${emoji} ${label}!`,
      message: `Perfect sequence rolled: ${sequence}`,
      intensity,
      emoji,
    };
  }

  const faceWord = combo.face ? `${combo.face}s` : 'dice';
  const countWord = numberWord(combo.count);

  return {
    title: `${emoji} ${label}!`,
    message: `You rolled ${countWord} ${faceWord}!`,
    intensity,
    emoji,
  };
}
