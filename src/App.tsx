import React, { useEffect, useState, useRef } from 'react';
import { toDecimal, formatDecimal, fromDecimalString } from './utils/decimal';
import Header from './components/Header';
import DiceGrid from './components/DiceGrid';
import Controls from './components/Controls';
import './App.css';

type Die = { id: number; locked: boolean; level: number; animationLevel?: number; multiplier?: string };

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
  const [autorollLevel, setAutorollLevel] = useState(0);
  const autorollRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
          const parsed = JSON.parse(raw);
          setCredits(fromDecimalString(parsed.credits));
          setDice(parsed.dice.map((d: any) => ({ ...d })));
          setAutoroll(Boolean(parsed.autoroll));
          if (parsed.cooldownMs) setCooldownMs(parsed.cooldownMs);
          if (parsed.autorollLevel) setAutorollLevel(parsed.autorollLevel || 0);
        }
    } catch (e) { }
  }, []);

  useEffect(() => {
    const toSave = { credits: credits.toString(), dice, autoroll, cooldownMs, autorollLevel };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [credits, dice, autoroll, cooldownMs, autorollLevel]);

  function doRoll() {
    let sum = toDecimal(0);
    setDice(prev => {
      prev.forEach(d => { if (!d.locked) { const face = Math.floor(Math.random() * 6) + 1; sum = sum.add(face); } });
      return prev;
    });
    setCredits(c => c.add(sum));
  }

  // helper to spend credits (simple number-based check)
  function spendCredits(amount: number) {
    const current = Number(credits.toString());
    if (current >= amount) {
      setCredits(toDecimal(current - amount));
      return true;
    }
    return false;
  }

  function unlockDie(id: number) {
    const cost = 500 * (id + 1);
    if (!spendCredits(cost)) return;
    setDice(prev => prev.map(d => d.id === id ? { ...d, locked: false } : d));
  }

  function levelUpDie(id: number) {
    setDice(prev => {
      const target = prev.find(d => d.id === id)!;
      const cost = Math.floor(50 * Math.pow(1.5, target.level));
      if (!spendCredits(cost)) return prev;
      return prev.map(d => d.id === id ? { ...d, level: d.level + 1, multiplier: toDecimal(Math.pow(1.15, d.level + 1)).toString() } : d);
    });
  }

  function unlockAnim(id: number) {
    setDice(prev => {
      const target = prev.find(d => d.id === id)!;
      const cost = 200 * ((target.animationLevel ?? 0) + 1);
      if (!spendCredits(cost)) return prev;
      return prev.map(d => d.id === id ? { ...d, animationLevel: (d.animationLevel || 0) + 1 } : d);
    });
  }

  function purchaseAutorollUpgrade() {
    const cost = 1000 * Math.pow(2, autorollLevel);
    if (!spendCredits(cost)) return;
    setAutorollLevel(l => l + 1);
    setCooldownMs(c => Math.max(200, c - 200));
  }

  useEffect(() => {
    if (autoroll) { autorollRef.current = window.setInterval(() => { doRoll(); }, cooldownMs); }
    else if (autorollRef.current) { clearInterval(autorollRef.current); autorollRef.current = null; }
    return () => { if (autorollRef.current) { clearInterval(autorollRef.current); autorollRef.current = null; } };
  }, [autoroll, cooldownMs]);

  return (
    <div className="dt-container">
      <div className="dt-header"><Header credits={formatDecimal(credits)} /></div>
      <div className="dt-layout">
        <div><DiceGrid dice={dice} onLevelUp={levelUpDie} onUnlock={unlockDie} onAnimUnlock={unlockAnim} /></div>
        <div><Controls onRoll={doRoll} autoroll={autoroll} setAutoroll={setAutoroll} cooldownMs={cooldownMs} setCooldownMs={setCooldownMs} onAutorollUpgrade={purchaseAutorollUpgrade} autorollUpgradeCost={1000 * Math.pow(2, autorollLevel)} autorollLevel={autorollLevel} /></div>
      </div>
    </div>
  );
}
