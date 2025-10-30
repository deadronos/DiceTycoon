import { describe, it, expect } from 'vitest';

// This test file is disabled because the UI is now React-based
// The setupUI function no longer exists
describe.skip('UI setup (legacy)', () => {
  it('placeholder', () => {
    expect(true).toBe(true);
  });
});
