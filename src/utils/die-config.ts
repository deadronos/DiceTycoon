/**
 * Configuration for die abilities.
 */
export const DIE_ABILITIES: Record<number, { name: string; description: string }> = {
  1: { name: 'The Starter', description: 'Reliable first die.' },
  2: { name: 'Buffer', description: '+10% multiplier to adjacent dice.' },
  3: { name: 'Rusher', description: '5% chance to trigger an immediate extra roll.' },
  4: { name: 'Combo Master', description: 'Triples the value of combos it participates in.' },
  5: { name: 'Lucky', description: '+5% chance for higher face values.' },
  6: { name: 'Tycoon', description: '+5% Global Multiplier.' },
};

/**
 * Returns the character string for a die face number (e.g. 1 -> ⚀).
 * @param face The die face number (1-6).
 * @returns The unicode character for the die face.
 */
export const getDieFace = (face: number): string => {
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return faces[face - 1] || '⚀';
};
