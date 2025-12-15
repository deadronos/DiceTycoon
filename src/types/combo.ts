/**
 * Represents the type of a dice combination.
 * - 'pair': Two dice with the same face value.
 * - 'triple': Three dice with the same face value.
 * - 'fourKind': Four dice with the same face value.
 * - 'fiveKind': Five dice with the same face value.
 * - 'sixKind': Six dice with the same face value.
 * - 'flush': All dice have distinct face values (e.g., 1-2-3-4-5-6).
 */
export type ComboKind =
  | 'pair'
  | 'triple'
  | 'fourKind'
  | 'fiveKind'
  | 'sixKind'
  | 'flush';

/**
 * Represents the intensity or rarity of a combo, used for visual effects.
 * - 'low': Basic combos like pairs.
 * - 'medium': Intermediate combos like triples.
 * - 'high': Rare combos like four-of-a-kind.
 * - 'legendary': Extremely rare combos like five-of-a-kind or six-of-a-kind.
 */
export type ComboIntensity = 'low' | 'medium' | 'high' | 'legendary';

/**
 * Describes the result of a combo detection on a set of dice.
 */
export interface ComboResult {
  /** The specific kind of combo detected (e.g., 'pair', 'flush'). */
  kind: ComboKind;
  /** Number of dice contributing to the combo. */
  count: number;
  /**
   * Face value involved in the combo. Only present for of-a-kind combos.
   * Flush combos will leave this undefined and instead populate {@link faces}.
   */
  face?: number;
  /** Ordered list of faces involved in the combo, useful for straights/flushes. */
  faces?: number[];
  /** Additional combo detected simultaneously (e.g., two pairs, two triples). */
  multiCombo?: {
    kind: ComboKind;
    count: number;
    face?: number;
  };
  /** Whether this is a multi-combo (grants bonus multiplier). */
  isMultiCombo?: boolean;
}
