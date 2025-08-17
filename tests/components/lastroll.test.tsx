import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';

describe('Last Roll', () => {
  it('Last Roll area shows formatted total after roll', () => {
    render(<App />);
  const rollBtn = screen.getAllByTestId('roll-btn')[0];
    fireEvent.click(rollBtn);
    // wait a bit for animation timeout (App uses 800ms)
    return new Promise((resolve) => setTimeout(() => {
  const lastRoll = screen.getByText(/Last Roll:/i);
  expect(lastRoll).toBeTruthy();
  // total should be displayed with = sign and a number-like token
  const total = screen.getByText(/=/);
  expect(total).toBeTruthy();
      resolve(undefined);
    }, 900));
  });
});
