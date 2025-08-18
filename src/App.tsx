import React, { useEffect, useState, useRef } from 'react';
import Decimal from '@patashu/break_eternity.js';
import { toDecimal, formatDecimal, fromDecimalString, DecimalHelpers } from './utils/decimal';
import { safeSave, safeLoad } from './utils/storage';
type DecimalInstance = InstanceType<typeof Decimal>;
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
  // DecimalInstance type inside component
  type DI = DecimalInstance;
  // Import gamestate from JSON in textbox
  function importGameState() {
    try {
      const parsed = JSON.parse(exportImportValue);
      setCredits(fromDecimalString(parsed.credits));
      setDice(parsed.dice.map((d: any) => ({ ...d })));
      setAutoroll(Boolean(parsed.autoroll));
      setCooldownMs(parsed.cooldownMs || 2000);
      setAutorollLevel(parsed.autorollLevel || 0);
      setLastRoll(null);
      setShowExportImport('none');
      pushNotification('Game state imported!');
    } catch (e) {
      pushNotification('Import failed: Invalid JSON');
    }
  }
  // Export current gamestate as JSON
  function exportGameState() {
    const toExport = { credits: credits.toString(), dice, autoroll, cooldownMs, autorollLevel };
    setExportImportValue(JSON.stringify(toExport, null, 2));
    setShowExportImport('export');
  }
  // Helper to get default dice state
  function getDefaultDice(): DieState[] {
    const arr: DieState[] = [];
    for (let i = 0; i < 6; i++) arr.push({ id: i, locked: i > 0, level: 0, animationLevel: 0, ascensionLevel: 0, multiplier: toDecimal(1).toString(), face: 1 });
    return arr;
  }

  // Reset game state to defaults
  function resetGame() {
    setCredits(toDecimal('1000'));
    setDice(getDefaultDice());
    setAutoroll(false);
    setCooldownMs(2000);
    setAutorollLevel(0);
    setLastRoll(null);
    setNotifications([]);
    setShowExportImport('none');
    setExportImportValue('');
    localStorage.removeItem(STORAGE_KEY);
    pushNotification('Game reset!');
  }
  // Start player with 1000 credits by default (matches tests and initial game balance)
  const [credits, setCredits] = useState<DI>(() => toDecimal('1000') as DI);
  const [dice, setDice] = useState<DieState[]>(() => getDefaultDice());
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

  // Export/Import textbox state
  const [showExportImport, setShowExportImport] = useState<'none' | 'export' | 'import'>('none');
  const [exportImportValue, setExportImportValue] = useState('');

  useEffect(() => {
    const loaded = safeLoad(STORAGE_KEY, null);
    if (loaded) {
      setCredits(fromDecimalString(loaded.credits));
      setDice(loaded.dice.map((d: any) => ({ ...d })));
      setAutoroll(Boolean(loaded.autoroll));
      if (loaded.cooldownMs) setCooldownMs(loaded.cooldownMs);
      if (loaded.autorollLevel) setAutorollLevel(loaded.autorollLevel || 0);
    }
  }, []);

  useEffect(() => {
    const toSave = { credits: credits.toString(), dice, autoroll, cooldownMs, autorollLevel };
    safeSave(STORAGE_KEY, toSave);
  }, [credits, dice, autoroll, cooldownMs, autorollLevel]);

  function ascendDie(id: number) {
    setDice(prev => {
      const target = prev.find(d => d.id === id)!;
  // exponential ascension cost using Decimal: 1000 * 4^(ascensionLevel)
  const costDec = toDecimal(1000).times(toDecimal(4).pow(toDecimal(target.ascensionLevel || 0)));
  if (!spendCredits(costDec)) return prev;
  return prev.map(d => d.id === id ? { ...d, ascensionLevel: (d.ascensionLevel || 0) + 1, multiplier: toDecimal(1).toString(), level: 0 } : d);
    });
  }

  function doRoll() {
    // trigger panel rolling animation
    setRolling(true);
    window.setTimeout(() => setRolling(false), 800);

    // compute new faces immutably and apply per-die multiplier to earned credits
    let earned = toDecimal(0); // <-- declare earned here
    const entries: { id: number; face: number; multiplier: string; earned: string }[] = [];
    const newDice = dice.map(d => {
      if (d.locked) return d;
      const face = Math.floor(Math.random() * 6) + 1;
      const mult = toDecimal(d.multiplier || '1');
      const ascBase = (d.ascensionLevel ?? 0) + 1;
      const ascFactor = toDecimal(ascBase).pow(10);
      const gained = mult.times(face).times(ascFactor);
      earned = earned.add(gained);
      entries.push({ id: d.id, face, multiplier: mult.toString(), earned: gained.toString() });
      return { ...d, face };
    });
    setDice(newDice);
  setCredits((c: DI) => c.add(earned) as DI);
    setLastRoll({ entries, total: earned.toString() });
  }

  // helper to push notifications
  function pushNotification(message: string, ttl = 1500) {
    const id = nextNotifId.current++;
    setNotifications(n => [...n, { id, message }]);
    window.setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), ttl);
  }

  // helper to spend credits using Decimal comparisons
  function spendCredits(amount: number | string | any) {
    const cost = toDecimal(amount);
    if (DecimalHelpers.gte(credits, cost)) {
      // Always use Decimal subtraction (no numeric fallback)
      setCredits((c: DecimalInstance) => c.sub(cost));
      return true;
    }
    pushNotification('Insufficient credits');
    return false;
  }

  function unlockDie(id: number) {
  const costDec = toDecimal(500).times(toDecimal(id + 1));
  if (!spendCredits(costDec)) return;
    setDice(prev => prev.map(d => d.id === id ? { ...d, locked: false } : d));
  }

  function levelUpDie(id: number) {
    setDice(prev => {
      const target = prev.find(d => d.id === id)!;
  // cost = 50 * (1.5 ^ level) using Decimal
  const costDec = toDecimal(50).times(toDecimal(1.5).pow(toDecimal(target.level)));
  if (!spendCredits(costDec)) return prev;
  return prev.map(d => d.id === id ? { ...d, level: d.level + 1, multiplier: toDecimal(1.15).pow(toDecimal(d.level + 1)).toString() } : d);
    });
  }

  function unlockAnim(id: number) {
    setDice(prev => {
      const target = prev.find(d => d.id === id)!;
  const costDec = toDecimal(200).times(toDecimal((target.animationLevel ?? 0) + 1));
  if (!spendCredits(costDec)) return prev;
  return prev.map(d => d.id === id ? { ...d, animationLevel: (d.animationLevel || 0) + 1 } : d);
    });
  }

  function purchaseAutorollUpgrade() {
  const costDec = toDecimal(1000).times(toDecimal(2).pow(toDecimal(autorollLevel)));
  if (!spendCredits(costDec)) return;
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
            {lastRoll.entries.map((e, idx) => {
              // Find ascension multiplier for this die
                const die = dice.find(d => d.id === e.id);
                const ascBase = (die?.ascensionLevel ?? 0) + 1;
                const ascFactor = toDecimal(ascBase).pow(toDecimal(10));
                return (
                  <span key={e.id} className="dt-last-roll-item">
                    {`[${e.id+1}] ${e.face} × ${formatDecimal(toDecimal(e.multiplier))} × ${formatDecimal(ascFactor)}`}
                    {idx < lastRoll.entries.length - 1 ? ' + ' : ''}
                  </span>
                );
            })}
            <span className="dt-last-roll-total"> = {formatDecimal(toDecimal(lastRoll.total))}</span>
          </div>
        ) : (
          <div className="dt-last-roll-expression">—</div>
        )}
      </div>
      <div className="dt-layout">
        <div><DiceGrid dice={dice} credits={credits} onLevelUp={levelUpDie} onUnlock={unlockDie} onAnimUnlock={unlockAnim} onAscend={ascendDie} /></div>
  <div><Controls onRoll={doRoll} autoroll={autoroll} setAutoroll={setAutoroll} cooldownMs={cooldownMs} setCooldownMs={setCooldownMs} onAutorollUpgrade={purchaseAutorollUpgrade} autorollUpgradeCost={1000 * Math.pow(2, autorollLevel)} autorollLevel={autorollLevel} affordable={{ autorollUpgrade: DecimalHelpers.gte(credits, toDecimal(1000).times(toDecimal(2).pow(toDecimal(autorollLevel)))) }} /></div>
      </div>
      {/* Bottom controls for reset/export/import */}
      <div className="dt-bottom-controls dt-bottom-controls--spaced">
        <button data-testid="reset-btn-bottom" onClick={resetGame} className="dt-btn--spaced">Reset</button>
        <button data-testid="export-btn-bottom" onClick={exportGameState} className="dt-btn--spaced">Export</button>
        <button data-testid="import-btn-bottom" onClick={() => { setShowExportImport('import'); setExportImportValue(''); }} className="dt-btn--spaced">Import</button>
      </div>
      {/* Export/Import textbox */}
        {showExportImport !== 'none' && (
      <div className="dt-export-import-area">
            <textarea
              data-testid="export-import-textarea"
              value={exportImportValue}
              onChange={e => setExportImportValue(e.target.value)}
              rows={8}
        className="dt-export-import-textarea"
              placeholder={showExportImport === 'import' ? 'Paste gamestate JSON here...' : ''}
              readOnly={showExportImport === 'export'}
            />
            <div className="dt-export-import-actions" data-testid="export-import-actions">
              {showExportImport === 'import' && (
                <button data-testid="export-import-action-import" onClick={importGameState} className="dt-btn--spaced">Import</button>
              )}
              <button data-testid="export-import-action-close" onClick={() => { setShowExportImport('none'); setExportImportValue(''); }}>Close</button>
            </div>
          </div>
        )}
      <Notifications notifications={notifications} onDismiss={(id) => setNotifications(n => n.filter(x => x.id !== id))} />
    </div>
  );
}
