import DecimalImport, { type Decimal as DecimalType } from '@patashu/break_eternity.js';

// Normalize Decimal constructor/function across SSR/ESM interop.
// Some bundlers may wrap default export; ensure we always have a callable/constructable.
type DecimalInput = number | string | DecimalType;

type DecimalFactoryStatics = {
  pow(base: DecimalInput, exponent: number): DecimalType;
  min(a: DecimalInput, b: DecimalInput): DecimalType;
  log10(value: DecimalInput): DecimalType;
};

type DecimalFactory = {
  new(value?: DecimalInput): DecimalType;
  (value?: DecimalInput): DecimalType;
  fromValue?: (value?: DecimalInput) => DecimalType;
  Decimal?: DecimalFactory;
} & Partial<DecimalFactoryStatics>;

const decimalModule = DecimalImport as DecimalFactory;
const Decimal = ((decimalModule.fromValue ? decimalModule : decimalModule.Decimal ?? decimalModule) as
  DecimalFactory & DecimalFactoryStatics);

const isDecimalLike = (value: unknown): value is DecimalType => {
  if (value == null || typeof value === 'function') return false;
  // Check if value is an object type that can have properties
  if (typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    'toNumber' in candidate && typeof candidate.toNumber === 'function' &&
    'toString' in candidate && typeof candidate.toString === 'function'
  );
};

export default Decimal;
export type { DecimalType as Decimal };

/**
 * Convert a number, string, or Decimal to a Decimal instance.
 * @param value The value to convert.
 * @returns A Decimal instance.
 */
export function toDecimal(value: number | string | DecimalType): DecimalType {
  if (isDecimalLike(value)) {
    return value;
  }
  return new Decimal(value as DecimalInput);
}

/**
 * Safely parse a string to Decimal, returning fallback on error.
 * @param str The string to parse.
 * @param fallback The fallback value if parsing fails (defaults to 0).
 * @returns A Decimal instance.
 */
export function fromDecimalString(str: string | undefined, fallback: DecimalType = toDecimal(0)): DecimalType {
  if (!str) return fallback;
  try {
    return new Decimal(str);
  } catch (err) {
    console.error('Failed to parse Decimal:', str, err);
    return fallback;
  }
}

/**
 * Format a Decimal for display with suffixes (K, M, B, T, etc.).
 * @param value The value to format.
 * @param options Formatting options (decimals, style).
 * @returns The formatted string.
 */
export function formatDecimal(
  value: DecimalType | number | string,
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
 * Format a Decimal as a short display string with adaptive precision.
 * @param value The value to format.
 * @returns A short string representation.
 */
export function formatShort(value: DecimalType | number | string): string {
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
 * Format a Decimal with full precision for tooltips.
 * @param value The value to format.
 * @returns The full string representation.
 */
export function formatFull(value: DecimalType | number | string): string {
  const decimal = toDecimal(value);
  return decimal.toString();
}

/**
 * Compare two Decimal values for sorting.
 * @param a First value.
 * @param b Second value.
 * @returns -1 if a < b, 1 if a > b, 0 if equal.
 */
export function compareDecimals(a: DecimalType, b: DecimalType): number {
  if (a.lt(b)) return -1;
  if (a.gt(b)) return 1;
  return 0;
}

/**
 * Check if player can afford a cost.
 * @param credits Current credits available.
 * @param cost Cost to check against.
 * @returns True if credits >= cost.
 */
export function canAfford(credits: DecimalType, cost: DecimalType): boolean {
  return credits.gte(cost);
}

/**
 * Calculate exponential cost scaling.
 * @param baseCost The base cost at level 0/1.
 * @param growthRate The multiplier per level.
 * @param level The target level.
 * @returns The calculated cost.
 */
export function calculateCost(baseCost: DecimalType, growthRate: DecimalType, level: number): DecimalType {
  return baseCost.times(growthRate.pow(level));
}

/**
 * Generate a random die face (1-6).
 * Uses crypto.getRandomValues if available, otherwise Math.random.
 * @returns A random integer between 1 and 6.
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
 * Calculate multiplier based on level.
 * @param baseMultiplier The starting multiplier.
 * @param level The current level.
 * @param multiplierPerLevel The increase per level.
 * @param milestones Optional configuration for milestone bonuses.
 * @returns The calculated multiplier.
 */
export function calculateMultiplier(
  baseMultiplier: DecimalType,
  level: number,
  multiplierPerLevel: DecimalType,
  milestones?: { levels: number[]; bonus: DecimalType }
): DecimalType {
  let mult = baseMultiplier;
  if (level > 1) {
    mult = mult.times(toDecimal(multiplierPerLevel).pow(level - 1));
  }

  if (milestones) {
    const passed = milestones.levels.filter(l => level >= l).length;
    if (passed > 0) {
      mult = mult.times(milestones.bonus.pow(passed));
    }
  }

  return mult;
}
