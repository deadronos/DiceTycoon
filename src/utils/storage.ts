import { toDecimal, fromDecimalString } from './decimal';

// Safe localStorage helpers (serialize Decimal instances as strings)
export function safeSave(key: string, data: any) {
  try {
    const serializable: any = { ...data };
    if (serializable.credits) serializable.credits = toDecimal(serializable.credits).toString();
    if (serializable.dice) {
      serializable.dice = serializable.dice.map((die: any) => ({
        ...die,
        multiplier: die.multiplier ? toDecimal(die.multiplier).toString() : die.multiplier,
      }));
    }
    localStorage.setItem(key, JSON.stringify(serializable));
  } catch (err) {
    // swallow; saving should not crash the app
    // eslint-disable-next-line no-console
    console.error('safeSave failed', err);
  }
}

export function safeLoad(key: string, fallback: any) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed.credits) parsed.credits = fromDecimalString(parsed.credits);
    if (parsed.dice) {
      parsed.dice = parsed.dice.map((die: any) => ({
        ...die,
        multiplier: die.multiplier ? String(die.multiplier) : die.multiplier,
      }));
    }
    return parsed;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('safeLoad failed', err);
    return fallback;
  }
}
