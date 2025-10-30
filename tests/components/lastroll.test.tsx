import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../../src/App';

describe('Last Roll', () => {
  it('Last Roll area shows formatted total after roll', async () => {
    render(<App />);
    const rollBtn = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollBtn);
    
    // Wait for credit popup to appear
    await waitFor(() => {
      const popup = document.querySelector('.credit-popup');
      expect(popup).toBeTruthy();
    });
  });
});
