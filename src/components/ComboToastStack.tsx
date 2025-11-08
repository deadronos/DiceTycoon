import React from 'react';
import { ComboToast } from './ComboToast';
import { type ComboResult } from '../types/combo';
import { type ComboMetadata } from '../utils/combos';

export interface ComboToastEntry {
  id: number;
  combo: ComboResult;
  metadata: ComboMetadata;
  visible: boolean;
}

interface Props {
  comboToasts: ComboToastEntry[];
  onClose: (id: number) => void;
}

export const ComboToastStack: React.FC<Props> = ({ comboToasts, onClose }) => (
  <div className="combo-toast-stack" aria-live="polite" aria-relevant="additions text">
    {comboToasts.map(toast => (
      <ComboToast
        key={toast.id}
        combo={toast.combo}
        metadata={toast.metadata}
        visible={toast.visible}
        onClose={() => onClose(toast.id)}
      />
    ))}
  </div>
);

export default ComboToastStack;
