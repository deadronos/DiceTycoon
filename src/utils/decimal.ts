// Decimal helpers: this file provides a small wrapper API used by the app.
// It prefers a high-precision Decimal (break_eternity.js) if available, but
// falls back to a safe JS-number based implementation for prototyping and tests.

// Use Decimal from break_eternity.js explicitly (installed by user)
import Decimal from '@patashu/break_eternity.js';

export function toDecimal(x: number | string | Decimal) {
  if (x && typeof (x as any).toString === 'function' && (x as any)._isDecimal) return x as Decimal;
  return new Decimal(typeof x === 'string' ? x : String(x));
}

export function fromDecimalString(s: string) {
  return new Decimal(s);
}

// Robust formatter that avoids converting huge Decimals to native Number when possible.
export function formatDecimal(d: any) {
  try {
    // If it's a small number or Decimal convertible to Number safely, use numeric formatting
    if (typeof d === 'number') {
      const n = d;
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
      return String(n);
    }

    const dec = toDecimal(d);
    // try toNumber if safe range
    if (typeof dec.toNumber === 'function') {
      const approx = dec.toNumber();
      if (Number.isFinite(approx) && Math.abs(approx) < 1e21) {
        if (approx >= 1e9) return (approx / 1e9).toFixed(2) + 'B';
        if (approx >= 1e6) return (approx / 1e6).toFixed(2) + 'M';
        if (approx >= 1e3) return (approx / 1e3).toFixed(2) + 'K';
        return String(approx);
      }
    }

    // Fallback to string-based formatting for very large numbers
    const s = dec.toString();
    if (s.includes('e') || s.includes('E')) return s; // already scientific
    const [intPart] = s.split('.');
    const intLen = intPart.replace('-', '').length;
    if (intLen <= 3) return s;
    // For moderate sizes, still use K/M/B where it makes sense
    if (intLen <= 6) {
      // thousands
      const value = intPart;
      const truncated = value.slice(0, value.length - 3);
      const frac = value.slice(truncated.length, truncated.length + 2) || '0';
      return `${truncated}.${frac}K`;
    }
    if (intLen <= 9) {
      const value = intPart;
      const truncated = value.slice(0, value.length - 6);
      const frac = value.slice(truncated.length, truncated.length + 2) || '0';
      return `${truncated}.${frac}M`;
    }
    if (intLen <= 12) {
      const value = intPart;
      const truncated = value.slice(0, value.length - 9);
      const frac = value.slice(truncated.length, truncated.length + 2) || '0';
      return `${truncated}.${frac}B`;
    }
    // Very large: use compact scientific-like representation: first 3 digits + e+exp
    const exp = intLen - 1;
    const first3 = intPart.slice(0, 3);
    const next = intPart[3] || '0';
    return `${first3}.${next}e+${exp}`;
  } catch (err) {
    return String(d);
  }
}

export function gte(a: any, b: any) {
  const A = toDecimal(a);
  const B = toDecimal(b);
  // use Decimal's comparison if available
  if (typeof A.gte === 'function') return A.gte(B);
  // fallback to string compare (not ideal)
  return A.toString() >= B.toString();
}

export const DecimalHelpers = { toDecimal, fromDecimalString, formatDecimal, gte };
