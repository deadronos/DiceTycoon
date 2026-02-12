import React from 'react';
import { type ComboResult } from '../../types/combo';
import { type ComboMetadata } from '../../utils/combos';
import { ComboToastStackPresenter } from './ComboToastStackPresenter';

export interface ComboToastEntry {
    id: number;
    combo: ComboResult;
    metadata: ComboMetadata;
    visible: boolean;
    summaryCount?: number;
}

interface ComboToastStackContainerProps {
    comboToasts: ComboToastEntry[];
    onClose: (id: number) => void;
}

export const ComboToastStackContainer: React.FC<ComboToastStackContainerProps> = ({
    comboToasts,
    onClose,
}) => {
    return (
        <ComboToastStackPresenter
            comboToasts={comboToasts}
            onClose={onClose}
        />
    );
};
