import { describe, it, expect, beforeEach } from 'vitest';
import { setupUI } from '../src/ui/app';

describe('UI setup', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('renders credits and roll button', () => {
    setupUI(root);
    const credits = root.querySelector('#credits-value');
    const roll = root.querySelector('#roll');
    expect(credits).not.toBeNull();
    expect(roll).not.toBeNull();
  });
});
