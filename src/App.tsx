import React, { useEffect, useState, useRef } from 'react';
import { toDecimal, formatDecimal, fromDecimalString } from './utils/decimal';
import Header from './components/Header';
import DiceGrid from './components/DiceGrid';
import Controls from './components/Controls';
import DicePanel from './components/DicePanel';
import Notifications from './components/Notifications';
import './App.css';

type Die = { id: number; locked: boolean; level: number; animationLevel?: number; multiplier?: string; ascensionLevel?: number };

type DieState = Die & { face: number };

const STORAGE_KEY = 'dice-tycoon-save-v1';

export default function App() {
  const [credits, setCredits] = useState(() => toDecimal('1000'));
  const [dice, setDice] = useState<DieState[]>(() => {
    const arr: DieState[] = [];
    for (let i = 0; i < 6; i++) arr.push({ id: i, locked: i > 0, level: 0, animationLevel: 0, ascensionLevel: 0, multiplier: toDecimal(1).toString(), face: 1 });
    return arr;
  });
  const [autoroll, setAutoroll] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(2000);
  const [autorollLevel, setAutorollLevel] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; message: string }[]>([]);
  const nextNotifId = useRef(1);
  const [lastRoll, setLastRoll] = useState<{
    entries: { id: number; face: number; multiplier: string; earned: string }[];
    total: string;
  } | null>(null);
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

  function ascendDie(id: number) {
    setDice(prev => {
      const target = prev.find(d => d.id === id)!;
      const cost = 1000 * Math.pow(4, (target.ascensionLevel || 0)); // exponential ascension cost
      if (!spendCredits(cost)) return prev;
      return prev.map(d => d.id === id ? { ...d, ascensionLevel: (d.ascensionLevel || 0) + 1, multiplier: toDecimal(1).toString(), level: 0 } : d);
    });
  }

  function doRoll() {
    // trigger panel rolling animation
    setRolling(true);
    // stop rolling after animation duration
    window.setTimeout(() => setRolling(false), 800);

    // compute new faces immutably and apply per-die multiplier to earned credits
    let earned = toDecimal(0);
    const entries: { id: number; face: number; multiplier: string; earned: string }[] = [];
    const newDice = dice.map(d => {
      if (d.locked) return d;
      const face = Math.floor(Math.random() * 6) + 1;
      const mult = toDecimal(d.multiplier || '1');
      // ascension factor defined as (ascensionLevel + 1) ^ 10 so default 0 => 1
      const ascBase = (d.ascensionLevel ?? 0) + 1;
      const ascFactor = toDecimal(ascBase).pow(10);
      const gained = mult.times(face).times(ascFactor);
      earned = earned.add(gained);
      entries.push({ id: d.id, face, multiplier: mult.toString(), earned: gained.toString() });
      return { ...d, face };
    });
    setDice(newDice);
    setCredits(c => c.add(earned));
    setLastRoll({ entries, total: earned.toString() });
  }

  // helper to push notifications
  function pushNotification(message: string, ttl = 1500) {
    const id = nextNotifId.current++;
    setNotifications(n => [...n, { id, message }]);
    window.setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), ttl);
  }

  // helper to spend credits (simple number-based check)
  function spendCredits(amount: number) {
    const current = Number(credits.toString());
    if (current >= amount) {
      setCredits(toDecimal(current - amount));
      return true;
    }
    // push a queued notification for insufficient funds
    pushNotification('Insufficient credits');
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
      <div className="dt-credits-topright">Credits: {formatDecimal(credits)}</div>
      <DicePanel faces={dice.map(d => d.face)} rolling={rolling} animationLevels={dice.map(d => d.animationLevel || 0)} />
      <div className="dt-header"><Header credits={formatDecimal(credits)} /></div>
      <div className="dt-last-roll-area">
        <div className="dt-last-roll-title">Last Roll:</div>
        {lastRoll ? (
          <div className="dt-last-roll-expression">
            {lastRoll.entries.map((e, idx) => (
              <span key={e.id} className="dt-last-roll-item">{`[${e.id+1}] ${e.face} × ${formatDecimal(toDecimal(e.multiplier))}`}{idx < lastRoll.entries.length - 1 ? ' + ' : ''}</span>
            ))}
            <span className="dt-last-roll-total"> = {formatDecimal(toDecimal(lastRoll.total))}</span>
          </div>
        ) : (
          <div className="dt-last-roll-expression">—</div>
        )}
  {/* removed duplicate center Controls - keep right-side Controls in layout */}
      </div>
      <div className="dt-layout">
  <div><DiceGrid dice={dice} credits={credits} onLevelUp={levelUpDie} onUnlock={unlockDie} onAnimUnlock={unlockAnim} onAscend={ascendDie} /></div>
        <div><Controls onRoll={doRoll} autoroll={autoroll} setAutoroll={setAutoroll} cooldownMs={cooldownMs} setCooldownMs={setCooldownMs} onAutorollUpgrade={purchaseAutorollUpgrade} autorollUpgradeCost={1000 * Math.pow(2, autorollLevel)} autorollLevel={autorollLevel} affordable={{ autorollUpgrade: Number(credits.toString()) >= 1000 * Math.pow(2, autorollLevel) }} /></div>
      </div>
  <Notifications notifications={notifications} onDismiss={(id) => setNotifications(n => n.filter(x => x.id !== id))} />
    </div>
  );
}
