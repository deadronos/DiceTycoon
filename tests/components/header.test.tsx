import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../../src/App';

describe('Header', () => {
  it('renders header with credits display', () => {
    render(<App />);
    expect(screen.getByText('🎲 Dice Tycoon')).toBeTruthy();
    const creditsStatus = screen.getByRole('status', {
      name: /Current Credits/i,
    });
    expect(creditsStatus.textContent ?? '').toMatch(/💰\s*0\s*Credits/i);
  });
});
