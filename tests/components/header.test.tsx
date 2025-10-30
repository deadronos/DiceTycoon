import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../../src/App';

describe('Header', () => {
  it('renders header with credits display', () => {
    render(<App />);
    expect(screen.getByText('🎲 Dice Tycoon')).toBeTruthy();
    expect(screen.getByText(/Credits/i)).toBeTruthy();
  });
});
