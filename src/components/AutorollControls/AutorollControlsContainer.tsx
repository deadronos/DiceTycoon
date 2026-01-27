import React, { useState, useEffect } from 'react';
import { AutorollState, AutorollSessionStats } from '../../types/game';
import { type Decimal as DecimalType } from '../../utils/decimal';
import { AutorollControlsPresenter } from './AutorollControlsPresenter';

interface AutorollControlsContainerProps {
    autoroll: AutorollState;
    upgradeCost: DecimalType;
    canUpgrade: boolean;
    sessionStats: AutorollSessionStats;
    onToggle: () => void;
    onUpgrade: () => void;
    onDynamicBatchChange?: (value: boolean) => void;
    onBatchThresholdChange?: (value: number) => void;
    onMaxRollsPerTickChange?: (value: number) => void;
    onAnimationBudgetChange?: (value: number) => void;
}

export const AutorollControlsContainer: React.FC<AutorollControlsContainerProps> = ({
    autoroll,
    upgradeCost,
    canUpgrade,
    sessionStats,
    onToggle,
    onUpgrade,
    onDynamicBatchChange = () => { },
    onBatchThresholdChange = () => { },
    onMaxRollsPerTickChange = () => { },
    onAnimationBudgetChange = () => { },
}) => {
    const [activeSeconds, setActiveSeconds] = useState<number | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        const startedAt = sessionStats.startedAt;
        if (!startedAt) {
            // Use setTimeout to avoid synchronous setState during render/effect trigger
            setTimeout(() => setActiveSeconds(null), 0);
            return;
        }

        const updateElapsed = () => {
            const elapsedMs = Date.now() - startedAt;
            setActiveSeconds(elapsedMs > 0 ? Math.floor(elapsedMs / 1000) : 0);
        };

        updateElapsed();
        const intervalId = window.setInterval(updateElapsed, 1000);
        return () => window.clearInterval(intervalId);
    }, [sessionStats.startedAt]);

    const cooldownSeconds = autoroll.cooldown.toNumber();
    const rollsPerMinute = autoroll.level > 0 ? Math.round((60 / cooldownSeconds) * 10) / 10 : 0;
    const autorollActive = autoroll.enabled && autoroll.level > 0;
    const progressStyle = {
        animationDuration: `${Math.max(cooldownSeconds, 0.1)}s`,
    } as React.CSSProperties;

    const cooldownMs = autoroll.cooldown.toNumber() * 1000;
    const thresholdRatio = cooldownMs > 0 ? autoroll.batchThresholdMs / cooldownMs : 1;
    const batchPreviewRolls = Math.min(
        autoroll.maxRollsPerTick,
        Math.max(1, Math.round(thresholdRatio))
    );

    const isBatchActive = autoroll.dynamicBatch && cooldownMs > 0 && cooldownMs < autoroll.batchThresholdMs;
    const displayBatchSize = isBatchActive ? `${batchPreviewRolls} / tick` : '1 (single)';

    return (
        <AutorollControlsPresenter
            autoroll={autoroll}
            upgradeCost={upgradeCost}
            canUpgrade={canUpgrade}
            sessionStats={sessionStats}
            onToggle={onToggle}
            onUpgrade={onUpgrade}
            onDynamicBatchChange={onDynamicBatchChange}
            onBatchThresholdChange={onBatchThresholdChange}
            onMaxRollsPerTickChange={onMaxRollsPerTickChange}
            onAnimationBudgetChange={onAnimationBudgetChange}
            activeSeconds={activeSeconds}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            rollsPerMinute={rollsPerMinute}
            autorollActive={autorollActive}
            progressStyle={progressStyle}
            displayBatchSize={displayBatchSize}
        />
    );
};
