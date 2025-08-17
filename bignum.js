// Lightweight BigNum helper using BigInt for large integer coin values
// API:
// BN(value) -> wraps number/String/BigInt
// BN.add(a,b), BN.mul(a,b), BN.toString(bn) -> human-readable (K/M/B/T...)

(function(global){
  function BN(v){
    if(v instanceof BN) return v;
    if(typeof v === 'bigint') { this.v = v; }
    else if(typeof v === 'number') { this.v = BigInt(Math.floor(v)); }
    else if(typeof v === 'string') { this.v = BigInt(v.replace(/[^0-9]/g,'')); }
    else { this.v = BigInt(0); }
  }
  BN.prototype.toBigInt = function(){ return this.v; }
  BN.from = (v)=> new BN(v);
  BN.add = (a,b)=> new BN((BN.from(a).v) + (BN.from(b).v));
  BN.sub = (a,b)=> new BN((BN.from(a).v) - (BN.from(b).v));
  BN.mul = (a,b)=> new BN((BN.from(a).v) * (BN.from(b).v));
  BN.div = (a,b)=> new BN((BN.from(a).v) / (BN.from(b).v));
  BN.lt = (a,b)=> (BN.from(a).v) < (BN.from(b).v);

  const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  BN.format = function(a){
    const n = BN.from(a).v;
    if(n < 1000n) return n.toString();
    let idx = 0;
    let val = n;
    while(val >= 1000n && idx < SUFFIXES.length-1){
      val = val / 1000n;
      idx++;
    }
    // show one decimal
    const rem = (n / (100n * (1000n ** BigInt(idx)))) % 10n; // rough
    const main = Number(val);
    return `${main}.${rem}${SUFFIXES[idx]}`;
  }

  global.BN = BN;
})(window);
