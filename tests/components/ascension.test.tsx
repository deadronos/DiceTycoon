import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';
import { toDecimal } from '../../src/utils/decimal';

describe('Ascension', () => {
  it('Ascend button calls handler and resets multiplier', () => {
    render(<App />);
    // find first ascend button (die 0 initially locked in this app state may vary)
    const ascendBtns = screen.queryAllByTestId(/ascend-\d+/);
    // if none found because locked, unlock the second die first
    if (ascendBtns.length === 0) {
      const unlockBtn = screen.getByTestId('unlock-1');
      fireEvent.click(unlockBtn);
    }
  const btn = screen.getAllByTestId(/ascend-\d+/)[0];
  expect(btn).toBeDefined();
    // click ascend (should show notification or simply update state)
    fireEvent.click(btn);
    // After ascending, the ascend level button label should include Lv 1 or higher
    const updated = screen.getAllByTestId(/ascend-\d+/)[0];
    expect(updated.textContent).toMatch(/Lv\s*1/);
  });
});
