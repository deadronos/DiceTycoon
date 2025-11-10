import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { AutorollState, AutorollSessionStats, GameState } from '../../types/game';
import { RollButton } from '../RollButton';
import { AutorollControls } from '../AutorollControls';
import { StatsPanel } from '../StatsPanel';
import { ComboHistoryPanel } from '../ComboHistoryPanel';
import { AchievementsPanel } from '../AchievementsPanel';
import { SettingsPanel } from '../SettingsPanel';

interface Props {
  isAnyDieRolling: boolean;
  onRoll: () => void;
  autoroll: AutorollState;
  autorollUpgradeCost: DecimalType;
  canUpgradeAutoroll: boolean;
  sessionStats: AutorollSessionStats;
  onToggleAutoroll: () => void;
  onUpgradeAutoroll: () => void;
  onDynamicBatchChange?: (value: boolean) => void;
  onBatchThresholdChange?: (value: number) => void;
  onMaxRollsPerTickChange?: (value: number) => void;
  onAnimationBudgetChange?: (value: number) => void;
  gameState: GameState;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export const GameControlPanel: React.FC<Props> = ({
  isAnyDieRolling,
  onRoll,
  autoroll,
  autorollUpgradeCost,
  canUpgradeAutoroll,
  sessionStats,
  onToggleAutoroll,
  onUpgradeAutoroll,
  onDynamicBatchChange = () => {},
  onBatchThresholdChange = () => {},
  onMaxRollsPerTickChange = () => {},
  onAnimationBudgetChange = () => {},
  gameState,
  onExport,
  onImport,
  onReset,
}) => (
  <div className="controls-panel glass-card">
    <RollButton onRoll={onRoll} disabled={isAnyDieRolling} isRolling={isAnyDieRolling} />

    <AutorollControls
      autoroll={autoroll}
      upgradeCost={autorollUpgradeCost}
      canUpgrade={canUpgradeAutoroll}
      sessionStats={sessionStats}
      onToggle={onToggleAutoroll}
      onUpgrade={onUpgradeAutoroll}
      onDynamicBatchChange={onDynamicBatchChange}
      onBatchThresholdChange={onBatchThresholdChange}
      onMaxRollsPerTickChange={onMaxRollsPerTickChange}
      onAnimationBudgetChange={onAnimationBudgetChange}
    />

    <StatsPanel gameState={gameState} />
    <ComboHistoryPanel comboChain={gameState.stats.comboChain} />
    <AchievementsPanel achievements={gameState.achievements} />
    <SettingsPanel onExport={onExport} onImport={onImport} onReset={onReset} />
  </div>
);

export default GameControlPanel;
