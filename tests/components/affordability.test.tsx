import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DiceGrid from '../../src/components/DiceGrid';
import { toDecimal } from '../../src/utils/decimal';

describe('Affordability', () => {
  it('disables buttons when credits are low', () => {
    const dice = [ { id: 0, locked: false, level: 5, animationLevel: 0 }, { id: 1, locked: true, level: 0, animationLevel: 0 } ];
    const lowCredits = toDecimal(0);
    render(<DiceGrid dice={dice} credits={lowCredits} onLevelUp={() => {}} onUnlock={() => {}} onAnimUnlock={() => {}} />);
    const levelBtn = screen.getByTestId('levelup-0');
    expect(levelBtn.disabled).toBe(true);
  });
});
