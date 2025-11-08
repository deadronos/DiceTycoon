import React, { useMemo } from 'react';
import Decimal from '../utils/decimal';
import type { GameState } from '../types/game';
import { formatFull, formatShort } from '../utils/decimal';

interface Props {
  gameState: GameState;
}

export const StatsPanel: React.FC<Props> = ({ gameState }) => {
  const unlockedDiceCount = useMemo(() => gameState.dice.filter(d => d.unlocked).length, [gameState.dice]);
  const totalLevels = useMemo(() => gameState.dice.reduce((sum, d) => sum + d.level, 0), [gameState.dice]);
  const totalCreditsEarned = gameState.stats.totalCreditsEarned;
  const creditsPerRoll = useMemo(() => {
    return gameState.totalRolls > 0
      ? totalCreditsEarned.div(gameState.totalRolls)
      : new Decimal(0);
  }, [gameState.totalRolls, totalCreditsEarned]);
  const recentSampleSize = gameState.stats.recentRolls.length;
  const averageRecent = useMemo(() => {
    return recentSampleSize > 0
      ? gameState.stats.recentRolls.reduce((sum, value) => sum.plus(new Decimal(value)), new Decimal(0)).div(recentSampleSize)
      : new Decimal(0);
  }, [gameState.stats.recentRolls, recentSampleSize]);
  const bestRoll = gameState.stats.bestRoll;

  return (
    <div className="stats-section glass-card">
      <h3>📊 Stats</h3>
      <div className="stat-grid">
        <div className="stat-item">
          <div className="stat-label">Unlocked Dice</div>
          <div className="stat-value">
            {unlockedDiceCount} / {gameState.dice.length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Levels</div>
          <div className="stat-value">{totalLevels}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Credits / Roll</div>
          <div className="stat-value" title={formatFull(creditsPerRoll)}>
            {formatShort(creditsPerRoll)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Best Roll Ever</div>
          <div className="stat-value" title={formatFull(bestRoll)}>
            {formatShort(bestRoll)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">{`Average Roll ${recentSampleSize > 0 ? `(last ${recentSampleSize})` : ''}`}</div>
          <div className="stat-value" title={formatFull(averageRecent)}>
            {recentSampleSize > 0 ? formatShort(averageRecent) : '—'}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Credits Earned</div>
          <div className="stat-value" title={formatFull(totalCreditsEarned)}>
            {formatShort(totalCreditsEarned)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Prestiges Performed</div>
          <div className="stat-value">{gameState.prestige?.totalPrestiges ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
