import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DieCard from '../../src/components/DieCard';

describe('DieCard', () => {
  it('shows unlock button when locked and calls onUnlock', () => {
    const die = { id: 0, locked: true, level: 0, animationLevel: 0 };
    const onUnlock = vi.fn();
    render(React.createElement(DieCard, { die, onUnlock }));
    const btn = screen.getByTestId('unlock-0');
    fireEvent.click(btn);
    expect(onUnlock).toHaveBeenCalled();
  });

  it('shows level up and anim buttons when unlocked and calls handlers', () => {
    const die = { id: 1, locked: false, level: 2, animationLevel: 0 };
    const onLevelUp = vi.fn();
    const onAnimUnlock = vi.fn();
    render(React.createElement(DieCard, { die, onLevelUp, onAnimUnlock }));
    fireEvent.click(screen.getByTestId('levelup-1'));
    fireEvent.click(screen.getByTestId('animup-1'));
    expect(onLevelUp).toHaveBeenCalled();
    expect(onAnimUnlock).toHaveBeenCalled();
  });
});
