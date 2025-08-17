import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DiceGrid from '../../src/components/DiceGrid';

describe('DiceGrid', () => {
  it('renders die cards', () => {
    const dice = [ { id: 0, locked: false, level: 0 }, { id: 1, locked: true, level: 0 } ];
    render(React.createElement(DiceGrid, { dice }));
    const cards = document.querySelectorAll('.dt-die-card');
    expect(cards.length).toBe(2);
  });
});
