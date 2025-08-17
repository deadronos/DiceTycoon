import { describe, it, expect, beforeEach } from 'vitest';
import { setupUI } from '../src/ui/app';
import { formatDecimal, toDecimal } from '../src/utils/decimal';

describe('UI setup', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('renders credits and roll button with formatted credits', () => {
    setupUI(root);
    const credits = root.querySelector('#credits-value');
    const roll = root.querySelector('#roll');
    expect(credits).not.toBeNull();
    expect(roll).not.toBeNull();
    expect(credits!.textContent).toBe(formatDecimal(toDecimal('1000')));
  });
});
