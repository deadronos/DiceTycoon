// Decimal helpers: this file provides a small wrapper API used by the app.
// It prefers a high-precision Decimal (break_eternity.js) if available, but
// falls back to a safe JS-number based implementation for prototyping and tests.

// Use Decimal from break_eternity.js explicitly (installed by user)
import Decimal from 'break_eternity.js';

export function toDecimal(x: number | string) {
  return new Decimal(typeof x === 'string' ? x : String(x));
}

export function fromDecimalString(s: string) {
  return new Decimal(s);
}

export function formatDecimal(d: any) {
  // Convert to number for friendly formatting; Decimal.toNumber may exist
  const n = typeof d === 'number' ? d : (d && typeof d.toNumber === 'function' ? d.toNumber() : Number(d.toString()));
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return String(n);
}

export const DecimalHelpers = { toDecimal, fromDecimalString, formatDecimal };
