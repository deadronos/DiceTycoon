import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { AutorollState, AutorollSessionStats, GameState } from '../../types/game';
import { RollButton } from '../RollButton';
import { AutorollControls } from '../AutorollControls';
import { StatsPanel } from '../StatsPanel';
import { ComboHistoryPanel } from '../ComboHistoryPanel';
import { AchievementsPanel } from '../AchievementsPanel';
import { SettingsPanel } from '../SettingsPanel';

/**
 * Props for the GameControlPanel component.
 */
interface Props {
  /** Whether any die is currently animating a roll. */
  isAnyDieRolling: boolean;
  /** Callback to trigger a manual roll. */
  onRoll: () => void;
  /** Current state of the autoroll feature. */
  autoroll: AutorollState;
  /** Cost to upgrade the autoroll feature. */
  autorollUpgradeCost: DecimalType;
  /** Whether the player can afford to upgrade autoroll. */
  canUpgradeAutoroll: boolean;
  /** Statistics for the current autoroll session. */
  sessionStats: AutorollSessionStats;
  /** Callback to toggle autoroll on/off. */
  onToggleAutoroll: () => void;
  /** Callback to purchase an autoroll upgrade. */
  onUpgradeAutoroll: () => void;
  /** Callback to change dynamic batching setting. */
  onDynamicBatchChange?: (value: boolean) => void;
  /** Callback to change batch threshold setting. */
  onBatchThresholdChange?: (value: number) => void;
  /** Callback to change max rolls per tick setting. */
  onMaxRollsPerTickChange?: (value: number) => void;
  /** Callback to change animation budget setting. */
  onAnimationBudgetChange?: (value: number) => void;
  /** The full game state for displaying sub-panels. */
  gameState: GameState;
  /** Callback to export save data. */
  onExport: () => void;
  /** Callback to import save data. */
  onImport: () => void;
  /** Callback to reset game data. */
  onReset: () => void;
}

/**
 * The main control panel containing roll buttons, autoroll controls, and statistics/settings tabs.
 */
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
