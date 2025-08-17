import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';
import { formatDecimal, toDecimal } from '../../src/utils/decimal';

describe('Header', () => {
  it('renders top-right credits text with formatted value', () => {
    render(React.createElement(App));
    const expected = `Credits: ${formatDecimal(toDecimal('1000'))}`;
    expect(screen.getByText(expected)).toBeTruthy();
  });
});
