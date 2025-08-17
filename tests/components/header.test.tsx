import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../../src/components/Header';

describe('Header', () => {
  it('renders credits text', () => {
    render(React.createElement(Header, { credits: '1.23K' }));
    expect(screen.getByTestId('credits')).toBeTruthy();
  });
});
