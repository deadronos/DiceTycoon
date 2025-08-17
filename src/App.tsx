import React, { useEffect, useState, useRef } from 'react';
import { DecimalHelpers, toDecimal, formatDecimal, fromDecimalString } from './utils/decimal';

type Die = {
  id: number;
  locked: boolean;
  level: number;
  animationLevel: number;
  multiplier: string; // stored as Decimal string
};

const STORAGE_KEY = 'dice-tycoon-save-v1';

export default function App() {
  const [credits, setCredits] = useState(() => toDecimal('1000'));
  const [dice, setDice] = useState<Die[]>(() => {
    const arr: Die[] = [];
    for (let i = 0; i < 6; i++) arr.push({ id: i, locked: i > 0, level: 0, animationLevel: 0, multiplier: toDecimal(1).toString() });
    return arr;
  });
  const [autoroll, setAutoroll] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(2000);
  const autorollRef = useRef<number | null>(null);

  // load save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCredits(fromDecimalString(parsed.credits));
        setDice(parsed.dice.map((d: any) => ({ ...d })));
        setAutoroll(Boolean(parsed.autoroll));
        if (parsed.cooldownMs) setCooldownMs(parsed.cooldownMs);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // persist
  useEffect(() => {
    const toSave = { credits: credits.toString(), dice, autoroll, cooldownMs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [credits, dice, autoroll, cooldownMs]);

  function doRoll() {
    let sum = toDecimal(0);
    setDice(prev => {
      prev.forEach(d => {
        if (!d.locked) {
          const face = Math.floor(Math.random() * 6) + 1;
          sum = sum.add(face);
        }
      });
      return prev;
    });
    setCredits(c => c.add(sum));
  }

  // autoroll loop
  useEffect(() => {
    if (autoroll) {
      autorollRef.current = window.setInterval(() => { doRoll(); }, cooldownMs);
    } else {
      if (autorollRef.current) {
        clearInterval(autorollRef.current);
        autorollRef.current = null;
      }
    }
    return () => { if (autorollRef.current) { clearInterval(autorollRef.current); autorollRef.current = null; } };
  }, [autoroll, cooldownMs]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#6C5CE7' }}>Credits: <span data-testid="credits">{formatDecimal(credits)}</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {dice.map(d => (
              <div key={d.id} style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, minHeight: 140, position: 'relative' }}>
                {d.locked ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', borderRadius: 10 }}>Locked — unlock for 500</div>
                ) : (
                  <div>
                    <div style={{ fontSize: 22 }}>[{d.id + 1}]</div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>Level: {d.level}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10 }}>
          <button data-testid="roll-btn" style={{ width: '100%', padding: 16, background: '#6C5CE7', color: 'white', border: 'none', borderRadius: 8, fontSize: 18 }} onClick={() => doRoll()}>Roll</button>
          <div style={{ height: 12 }} />
          <div style={{ fontSize: 12 }}>Autoroll: <input data-testid="autoroll" type="checkbox" checked={autoroll} onChange={e => setAutoroll(e.target.checked)} /></div>
          <div style={{ height: 12 }} />
          <div style={{ fontSize: 12 }}>Cooldown (ms): <input data-testid="cooldown" type="number" value={cooldownMs} onChange={e => setCooldownMs(Number(e.target.value))} /></div>
        </div>
      </div>
    </div>
  );
}
