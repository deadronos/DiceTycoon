import { describe, it, expect } from 'vitest';
import { toDecimal, fromDecimalString, formatDecimal } from '../src/utils/decimal';

describe('Decimal helpers', () => {
  it('adds numbers correctly', () => {
    const a = toDecimal(2);
    const b = toDecimal(3);
    const c = a.add(b);
    expect(Number(c.toString())).toBe(5);
  });

  it('formats large numbers', () => {
    expect(formatDecimal(1234567)).toContain('M');
    expect(formatDecimal(1234)).toContain('K');
  });

  it('fromDecimalString produces decimal like object', () => {
    const d = fromDecimalString('42');
    expect(Number(d.toString())).toBe(42);
  });
});
