export type ComboKind =
  | 'pair'
  | 'triple'
  | 'fourKind'
  | 'fiveKind'
  | 'sixKind'
  | 'flush';

export type ComboIntensity = 'low' | 'medium' | 'high';

export interface ComboResult {
  kind: ComboKind;
  /** Number of dice contributing to the combo */
  count: number;
  /**
   * Face value involved in the combo. Only present for of-a-kind combos.
   * Flush combos will leave this undefined and instead populate {@link faces}.
   */
  face?: number;
  /** Ordered list of faces involved in the combo, useful for straights/flushes */
  faces?: number[];
}
