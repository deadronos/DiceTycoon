import React, { useMemo } from 'react';
import type { ComboChainStats } from '../../types/game';
import { getComboMetadata } from '../../utils/combos';
import { ComboHistoryPanelPresenter } from './ComboHistoryPanelPresenter';

interface ComboHistoryPanelContainerProps {
    comboChain: ComboChainStats;
}

export const ComboHistoryPanelContainer: React.FC<ComboHistoryPanelContainerProps> = ({ comboChain }) => {
    const chainBonusPercent = comboChain.current > 1 ? (comboChain.current - 1) * 10 : 0;

    const formattedHistory = useMemo(() => {
        return comboChain.history.map((entry, index) => {
            const meta = getComboMetadata(entry.combo);
            return {
                id: `${entry.timestamp}-${index}`,
                title: meta.title,
                message: meta.message,
                bonusPercent: meta.bonusPercent,
                intensity: meta.intensity,
                chain: entry.chain,
            };
        });
    }, [comboChain.history]);

    return (
        <ComboHistoryPanelPresenter
            currentChain={comboChain.current}
            bestChain={comboChain.best}
            chainBonusPercent={chainBonusPercent}
            history={formattedHistory}
        />
    );
};
