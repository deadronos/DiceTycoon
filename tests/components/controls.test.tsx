import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Controls from '../../src/components/Controls';

describe('Controls', () => {
  it('renders and calls roll and autoroll upgrade', () => {
    const onRoll = vi.fn();
    const setAutoroll = vi.fn();
    const setCooldown = vi.fn();
    const onAutorollUpgrade = vi.fn();
    render(React.createElement(Controls, { onRoll, autoroll: false, setAutoroll, cooldownMs: 2000, setCooldownMs: setCooldown, onAutorollUpgrade, autorollUpgradeCost: 1000, autorollLevel: 0 }));
    fireEvent.click(screen.getByTestId('roll-btn'));
    fireEvent.click(screen.getByTestId('autoroll-upgrade'));
    expect(onRoll).toHaveBeenCalled();
    expect(onAutorollUpgrade).toHaveBeenCalled();
  });
});
