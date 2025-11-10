/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@patashu/break_eternity.js' {
  export interface DecimalInstance {
    toString(): string;
    toNumber(): number;
    toFixed(decimals: number): string;
    toExponential(decimals: number): string;
    floor(): DecimalInstance;
    add(n: any): DecimalInstance;
    plus(n: any): DecimalInstance;
    sub(n: any): DecimalInstance;
    minus(n: any): DecimalInstance;
    times(n: any): DecimalInstance;
    div(n: any): DecimalInstance;
    gte(n: any): boolean;
    gt(n: any): boolean;
    lt(n: any): boolean;
    lte(n: any): boolean;
    eq(n: any): boolean;
    pow(n: any): DecimalInstance;
    e: number;
  }

  export interface DecimalConstructor {
    new (value?: number | string): DecimalInstance;
    (value?: number | string): DecimalInstance;
    fromNumber?(n: number): DecimalInstance;
    pow(base: number | DecimalInstance, exponent: number | DecimalInstance): DecimalInstance;
  }

  const Decimal: DecimalConstructor;
  export default Decimal;
  export type Decimal = DecimalInstance;
}
