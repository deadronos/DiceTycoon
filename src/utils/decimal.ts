import Decimal from '@patashu/break_eternity.js';

/**
 * Convert a number, string, or Decimal to a Decimal instance
 */
export function toDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Safely parse a string to Decimal, returning fallback on error
 */
export function fromDecimalString(str: string | undefined, fallback: Decimal = new Decimal(0)): Decimal {
  if (!str) return fallback;
  try {
    return new Decimal(str);
  } catch (err) {
    console.error('Failed to parse Decimal:', str, err);
    return fallback;
  }
}

/**
 * Format a Decimal for display with suffixes (K, M, B, T, etc.)
 */
export function formatDecimal(
  value: Decimal | number | string,
  options: { decimals?: number; style?: 'suffixed' | 'scientific' | 'engineering' } = {}
): string {
  const decimal = toDecimal(value);
  const { decimals = 2, style = 'suffixed' } = options;

  if (style === 'scientific') {
    return decimal.toExponential(decimals);
  }

  if (style === 'engineering') {
    const exp = decimal.e;
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = decimal.div(Decimal.pow(10, engExp));
    return `${mantissa.toFixed(decimals)}e${engExp}`;
  }

  // Suffixed format
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const tier = Math.floor(decimal.e / 3);

  if (tier <= 0) {
    return decimal.toFixed(decimals);
  }

  if (tier >= suffixes.length) {
    return decimal.toExponential(decimals);
  }

  const suffix = suffixes[tier];
  const scaled = decimal.div(Decimal.pow(10, tier * 3));
  return `${scaled.toFixed(decimals)}${suffix}`;
}

/**
 * Format a Decimal as a short display string with adaptive precision
 */
export function formatShort(value: Decimal | number | string): string {
  const decimal = toDecimal(value);
  
  if (decimal.lt(1000)) {
    return decimal.toFixed(0);
  }
  
  if (decimal.lt(1000000)) {
    return formatDecimal(decimal, { decimals: 1, style: 'suffixed' });
  }
  
  return formatDecimal(decimal, { decimals: 2, style: 'suffixed' });
}

/**
 * Format a Decimal with full precision for tooltips
 */
export function formatFull(value: Decimal | number | string): string {
  const decimal = toDecimal(value);
  return decimal.toString();
}

/**
 * Compare two Decimal values for sorting
 */
export function compareDecimals(a: Decimal, b: Decimal): number {
  if (a.lt(b)) return -1;
  if (a.gt(b)) return 1;
  return 0;
}

/**
 * Check if player can afford a cost
 */
export function canAfford(credits: Decimal, cost: Decimal): boolean {
  return credits.gte(cost);
}

/**
 * Calculate exponential cost scaling
 */
export function calculateCost(baseCost: Decimal, growthRate: Decimal, level: number): Decimal {
  return baseCost.times(growthRate.pow(level));
}

/**
 * Generate a random die face (1-6)
 */
export function rollDie(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (array[0] % 6) + 1;
  }
  // Fallback to Math.random
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Calculate multiplier based on level
 */
export function calculateMultiplier(baseMultiplier: Decimal, level: number, multiplierPerLevel: Decimal): Decimal {
  if (level <= 1) return baseMultiplier;
  return baseMultiplier.times(Decimal.pow(multiplierPerLevel, level - 1));
}
