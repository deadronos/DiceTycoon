import React from 'react';
import type { ComboResult } from '../../types/combo';
import { getComboMetadata, type ComboMetadata } from '../../utils/combos';
import { ComboToastPresenter } from './ComboToastPresenter';

interface ComboToastContainerProps {
    combo: ComboResult | null;
    metadata?: ComboMetadata | null;
    visible: boolean;
    onClose: () => void;
    summaryCount?: number;
}

export const ComboToastContainer: React.FC<ComboToastContainerProps> = ({
    combo,
    metadata,
    visible,
    onClose,
    summaryCount,
}) => {
    if (!combo) return null;

    const data = metadata ?? getComboMetadata(combo);
    const titleText = summaryCount ? `${data.title} (${summaryCount} combos)` : data.title;

    return (
        <ComboToastPresenter
            visible={visible}
            onClose={onClose}
            intensity={data.intensity}
            title={titleText}
            rarityLabel={data.rarityLabel}
            message={data.message}
            multiplierText={data.multiplier.toFixed(2)}
            bonusPercent={data.bonusPercent}
        />
    );
};
