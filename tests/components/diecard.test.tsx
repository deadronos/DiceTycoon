import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DieCard } from '../../src/components/DieCard';
import Decimal from '@patashu/break_eternity.js';

describe('DieCard', () => {
  it('shows unlock button when locked and calls onUnlock', () => {
    const die = { 
      id: 1, 
      unlocked: false, 
      level: 0, 
      animationLevel: 0,
      multiplier: new Decimal(1),
      currentFace: 1,
      isRolling: false
    };
    const onUnlock = vi.fn();
    const onLevelUp = vi.fn();
    const onUnlockAnimation = vi.fn();
    render(<DieCard 
      die={die} 
      onUnlock={onUnlock} 
      onLevelUp={onLevelUp}
      onUnlockAnimation={onUnlockAnimation}
      canUnlock={true}
      canLevelUp={false}
      canUnlockAnimation={false}
      unlockCost={new Decimal(100)}
    />);
    const btn = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(btn);
    expect(onUnlock).toHaveBeenCalled();
  });

  it('shows level up and anim buttons when unlocked and calls handlers', () => {
    const die = { 
      id: 1, 
      unlocked: true, 
      level: 2, 
      animationLevel: 0,
      multiplier: new Decimal(2),
      currentFace: 3,
      isRolling: false
    };
    const onUnlock = vi.fn();
    const onLevelUp = vi.fn();
    const onUnlockAnimation = vi.fn();
    render(<DieCard 
      die={die} 
      onUnlock={onUnlock}
      onLevelUp={onLevelUp}
      onUnlockAnimation={onUnlockAnimation}
      canUnlock={false}
      canLevelUp={true}
      canUnlockAnimation={true}
      levelUpCost={new Decimal(200)}
      animationUnlockCost={new Decimal(50)}
    />);
    const levelUpBtn = screen.getByRole('button', { name: /level up/i });
    const animBtn = screen.getByRole('button', { name: /unlock animation/i });
    fireEvent.click(levelUpBtn);
    fireEvent.click(animBtn);
    expect(onLevelUp).toHaveBeenCalled();
    expect(onUnlockAnimation).toHaveBeenCalled();
  });
});
