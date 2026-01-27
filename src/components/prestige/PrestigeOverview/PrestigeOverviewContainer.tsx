import React from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import type { GameState } from '../../../types/game';
import { formatFull, formatShort } from '../../../utils/decimal';
import { PrestigeOverviewPresenter } from './PrestigeOverviewPresenter';

interface PrestigeOverviewContainerProps {
    gameState: GameState;
    luckGain: DecimalType;
    currentLuck: DecimalType;
    projectedLuck: DecimalType;
    luckMultiplier: DecimalType;
    luckGainBoost: DecimalType;
    shopMultiplier: DecimalType;
    autorollBoost: DecimalType;
    autorollReductionPercent: number;
    luckProgressPercent: number;
    onConfirm: () => void;
    onClose: () => void;
}

const formatMultiplier = (value: DecimalType): string => `×${value.toFixed(2)}`;

export const PrestigeOverviewContainer: React.FC<PrestigeOverviewContainerProps> = ({
    gameState,
    luckGain,
    currentLuck,
    projectedLuck,
    luckMultiplier,
    luckGainBoost,
    shopMultiplier,
    autorollBoost,
    autorollReductionPercent,
    luckProgressPercent,
    onConfirm,
    onClose,
}) => {
    const prestigeFormulaTooltip = (
        <div>
            <div><strong>Luck Gain Formula</strong></div>
            <div>floor(max(log10(credits) − 2, 0) × 0.5 × (1 + 0.10 × Luck Fabricator level))</div>
            <div className="tooltip-meta-row">Current credits: {formatFull(gameState.credits)}</div>
        </div>
    );

    const luckMultiplierTooltip = (
        <div>
            <div><strong>Luck Multiplier</strong></div>
            <div>1 + Luck Points × 0.02 (capped at 10×)</div>
            <div className="tooltip-meta-row">Luck Points: {formatFull(currentLuck)}</div>
        </div>
    );

    const luckBoostTooltip = (
        <div>
            <div><strong>Luck Fabricator Boost</strong></div>
            <div>Each level increases prestige luck gains by +10% multiplicatively.</div>
        </div>
    );

    const shopMultiplierTooltip = (
        <div>
            <div><strong>Fortune Amplifier</strong></div>
            <div>Every level adds +5% permanent credit multiplier.</div>
        </div>
    );

    const autorollTooltip = (
        <div>
            <div><strong>Temporal Accelerator</strong></div>
            <div>Autoroll cooldown is multiplied by 0.95 per level (stacking multiplicatively).</div>
        </div>
    );

    return (
        <PrestigeOverviewPresenter
            luckGain={formatShort(luckGain)}
            luckMultiplier={formatMultiplier(luckMultiplier)}
            luckGainBoost={formatMultiplier(luckGainBoost)}
            shopMultiplier={formatMultiplier(shopMultiplier)}
            autorollBoost={formatMultiplier(autorollBoost)}
            autorollReductionPercent={autorollReductionPercent}
            currentLuck={formatShort(currentLuck)}
            projectedLuck={formatShort(projectedLuck)}
            luckProgressPercent={luckProgressPercent}
            prestigeFormulaTooltip={prestigeFormulaTooltip}
            luckMultiplierTooltip={luckMultiplierTooltip}
            luckBoostTooltip={luckBoostTooltip}
            shopMultiplierTooltip={shopMultiplierTooltip}
            autorollTooltip={autorollTooltip}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    );
};
