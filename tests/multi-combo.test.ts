import { describe, it, expect } from 'vitest';
import { detectCombo, getComboMultiplier, getComboMetadata } from '../src/utils/combos';

describe('Multi-Combo Detection', () => {
  describe('detectCombo with multi-combo support', () => {
    it('detects single pair (no multi-combo)', () => {
      const faces = [1, 1, 3, 4, 5, 6];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('pair');
      expect(combo!.face).toBe(1);
      expect(combo!.isMultiCombo).toBe(false);
      expect(combo!.multiCombo).toBeUndefined();
    });

    it('detects multi-combo: two pairs', () => {
      const faces = [1, 1, 3, 3, 5, 6];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('pair');
      expect(combo!.isMultiCombo).toBe(true);
      expect(combo!.multiCombo).toBeDefined();
      expect(combo!.multiCombo!.kind).toBe('pair');
      expect(combo!.multiCombo!.count).toBe(2);
    });

    it('detects multi-combo: triple + pair', () => {
      const faces = [2, 2, 2, 5, 5, 6];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('triple');
      expect(combo!.face).toBe(2);
      expect(combo!.isMultiCombo).toBe(true);
      expect(combo!.multiCombo).toBeDefined();
      expect(combo!.multiCombo!.kind).toBe('pair');
      expect(combo!.multiCombo!.face).toBe(5);
    });

    it('detects multi-combo: two triples', () => {
      const faces = [3, 3, 3, 4, 4, 4];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('triple');
      expect(combo!.isMultiCombo).toBe(true);
      expect(combo!.multiCombo).toBeDefined();
      expect(combo!.multiCombo!.kind).toBe('triple');
    });

    it('detects four of a kind + pair', () => {
      const faces = [2, 2, 2, 2, 5, 5];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('fourKind');
      expect(combo!.face).toBe(2);
      expect(combo!.isMultiCombo).toBe(true);
      expect(combo!.multiCombo).toBeDefined();
      expect(combo!.multiCombo!.kind).toBe('pair');
    });

    it('does not detect multi-combo for flush', () => {
      const faces = [1, 2, 3, 4, 5, 6];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('flush');
      expect(combo!.isMultiCombo).toBe(false);
    });

    it('does not detect multi-combo when only one singleton remains', () => {
      const faces = [1, 1, 1, 2, 3, 4];
      const combo = detectCombo(faces);
      
      expect(combo).not.toBeNull();
      expect(combo!.kind).toBe('triple');
      expect(combo!.isMultiCombo).toBe(false);
    });
  });

  describe('getComboMultiplier with multi-combo', () => {
    it('returns base multiplier for single combo', () => {
      const combo = {
        kind: 'pair' as const,
        count: 2,
        face: 3,
        isMultiCombo: false,
      };
      
      const multiplier = getComboMultiplier(combo);
      expect(multiplier.toNumber()).toBeCloseTo(1.05, 2);
    });

    it('returns boosted multiplier for two pairs', () => {
      const combo = {
        kind: 'pair' as const,
        count: 2,
        face: 1,
        isMultiCombo: true,
        multiCombo: {
          kind: 'pair' as const,
          count: 2,
          face: 3,
        },
      };
      
      // pair (1.05) × pair (1.05) × multi-bonus (1.25) = 1.378125
      const multiplier = getComboMultiplier(combo);
      expect(multiplier.toNumber()).toBeCloseTo(1.378125, 4);
    });

    it('returns boosted multiplier for triple + pair', () => {
      const combo = {
        kind: 'triple' as const,
        count: 3,
        face: 2,
        isMultiCombo: true,
        multiCombo: {
          kind: 'pair' as const,
          count: 2,
          face: 5,
        },
      };
      
      // triple (1.1) × pair (1.05) × multi-bonus (1.25) = 1.44375
      const multiplier = getComboMultiplier(combo);
      expect(multiplier.toNumber()).toBeCloseTo(1.44375, 4);
    });

    it('returns boosted multiplier for two triples', () => {
      const combo = {
        kind: 'triple' as const,
        count: 3,
        face: 3,
        isMultiCombo: true,
        multiCombo: {
          kind: 'triple' as const,
          count: 3,
          face: 4,
        },
      };
      
      // triple (1.1) × triple (1.1) × multi-bonus (1.25) = 1.5125
      const multiplier = getComboMultiplier(combo);
      expect(multiplier.toNumber()).toBeCloseTo(1.5125, 4);
    });

    it('returns boosted multiplier for four of a kind + pair', () => {
      const combo = {
        kind: 'fourKind' as const,
        count: 4,
        face: 2,
        isMultiCombo: true,
        multiCombo: {
          kind: 'pair' as const,
          count: 2,
          face: 5,
        },
      };
      
      // fourKind (1.2) × pair (1.05) × multi-bonus (1.25) = 1.575
      const multiplier = getComboMultiplier(combo);
      expect(multiplier.toNumber()).toBeCloseTo(1.575, 4);
    });
  });

  describe('getComboMetadata for multi-combo', () => {
    it('displays multi-combo message for two pairs', () => {
      const combo = {
        kind: 'pair' as const,
        count: 2,
        face: 1,
        isMultiCombo: true,
        multiCombo: {
          kind: 'pair' as const,
          count: 2,
          face: 3,
        },
      };
      
      const metadata = getComboMetadata(combo);
      expect(metadata.title).toContain('MULTI-COMBO');
      expect(metadata.message).toContain('Pair');
      expect(metadata.message).toContain('1s');
      expect(metadata.message).toContain('3s');
      expect(metadata.rarityLabel).toBe('Multi-Combo');
      expect(metadata.intensity).toBe('legendary');
    });

    it('displays multi-combo message for triple + pair', () => {
      const combo = {
        kind: 'triple' as const,
        count: 3,
        face: 2,
        isMultiCombo: true,
        multiCombo: {
          kind: 'pair' as const,
          count: 2,
          face: 5,
        },
      };
      
      const metadata = getComboMetadata(combo);
      expect(metadata.title).toContain('MULTI-COMBO');
      expect(metadata.message).toContain('Triple');
      expect(metadata.message).toContain('Pair');
      expect(metadata.message).toContain('2s');
      expect(metadata.message).toContain('5s');
    });

    it('displays regular message for single combo', () => {
      const combo = {
        kind: 'triple' as const,
        count: 3,
        face: 4,
        isMultiCombo: false,
      };
      
      const metadata = getComboMetadata(combo);
      expect(metadata.title).not.toContain('MULTI-COMBO');
      expect(metadata.title).toBe('✨ Triple!');
      expect(metadata.message).toContain('three 4s');
    });
  });

  describe('Multi-combo probability and balance', () => {
    it('calculates expected frequency of two pairs', () => {
      // Two pairs from 6 dice: choose 2 pairs from 6 faces
      // Approximate probability with 6 dice rolling independently
      // Actual measurement shows ~38% with our detection algorithm
      const trials = 10000;
      let twoPairCount = 0;
      
      for (let i = 0; i < trials; i++) {
        const faces = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
        const combo = detectCombo(faces);
        
        if (combo?.isMultiCombo && combo.kind === 'pair' && combo.multiCombo?.kind === 'pair') {
          twoPairCount++;
        }
      }
      
      const frequency = twoPairCount / trials;
      // Expected: around 30-45% based on empirical testing
      expect(frequency).toBeGreaterThan(0.25);
      expect(frequency).toBeLessThan(0.50);
    });

    it('verifies multi-combos are common with 6 dice', () => {
      const trials = 10000;
      let multiComboCount = 0;
      
      for (let i = 0; i < trials; i++) {
        const faces = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
        const combo = detectCombo(faces);
        
        if (combo?.isMultiCombo) {
          multiComboCount++;
        }
      }
      
      // With 6 dice, multi-combos (especially two pairs) are actually quite common
      expect(multiComboCount).toBeGreaterThan(0);
      expect(multiComboCount).toBeGreaterThan(trials * 0.3); // At least 30% of trials
    });
  });
});
