import React from 'react';

export default function Controls({ onRoll, autoroll, setAutoroll, cooldownMs, setCooldownMs, onAutorollUpgrade, autorollUpgradeCost, autorollLevel }: any) {
  return (
    <div className="dt-controls">
      <button data-testid="roll-btn" className="dt-roll-btn" onClick={onRoll}>Roll</button>
      <div className="dt-small">
        <label htmlFor="autoroll-input">Autoroll:</label>
        <input id="autoroll-input" data-testid="autoroll" aria-label="Autoroll toggle" type="checkbox" checked={autoroll} onChange={(e) => setAutoroll(e.target.checked)} />
      </div>
      <div className="dt-small">
        <label htmlFor="cooldown-input">Cooldown (ms):</label>
        <input id="cooldown-input" data-testid="cooldown" aria-label="Cooldown" type="number" value={cooldownMs} onChange={(e) => setCooldownMs(Number(e.target.value))} />
      </div>
  <div className="dt-gap-8" />
      <div className="dt-small">
        <button data-testid="autoroll-upgrade" onClick={onAutorollUpgrade}>Upgrade Autoroll (Level {autorollLevel}) - Cost: {autorollUpgradeCost}</button>
      </div>
    </div>
  );
}
