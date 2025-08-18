declare module '@patashu/break_eternity.js' {
  interface DecimalInstance {
    toString(): string;
    toNumber(): number;
    add(n: any): DecimalInstance;
    plus(n: any): DecimalInstance;
    sub(n: any): DecimalInstance;
    times(n: any): DecimalInstance;
    gte(n: any): boolean;
    lt(n: any): boolean;
    pow(n: any): DecimalInstance;
  }

  interface DecimalConstructor {
    new (value?: number | string): DecimalInstance;
    (value?: number | string): DecimalInstance;
    fromNumber?(n: number): DecimalInstance;
  }

  const Decimal: DecimalConstructor;
  export default Decimal;
}
