import React from 'react';
import { ComboToast } from '../ComboToast';
import { type ComboToastEntry } from './ComboToastStackContainer';

interface ComboToastStackPresenterProps {
    comboToasts: ComboToastEntry[];
    onClose: (id: number) => void;
}

export const ComboToastStackPresenter: React.FC<ComboToastStackPresenterProps> = ({
    comboToasts,
    onClose,
}) => (
    <div className="combo-toast-stack" aria-live="polite" aria-relevant="additions text">
        {comboToasts.map(toast => (
            <ComboToast
                key={toast.id}
                combo={toast.combo}
                metadata={toast.metadata}
                visible={toast.visible}
                summaryCount={toast.summaryCount}
                onClose={() => onClose(toast.id)}
            />
        ))}
    </div>
);
