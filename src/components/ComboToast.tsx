import React from 'react';
import type { ComboResult } from '../types/combo';
import { getComboMetadata, type ComboMetadata } from '../utils/combos';

interface ComboToastProps {
  combo: ComboResult | null;
  metadata?: ComboMetadata | null;
  visible: boolean;
  onClose: () => void;
  summaryCount?: number;
}

export const ComboToast: React.FC<ComboToastProps> = ({ combo, metadata, visible, onClose, summaryCount }) => {
  if (!combo) return null;

  const data = metadata ?? getComboMetadata(combo);
  const rarityClass = `combo-toast__rarity combo-toast__rarity-${data.intensity}`;
  const multiplierText = data.multiplier.toFixed(2);
  const titleText = summaryCount ? `${data.title} (${summaryCount} combos)` : data.title;

  return (
    <div className={`combo-toast combo-${data.intensity} ${visible ? 'show' : ''}`} role="status">
      <button
        type="button"
        className="combo-toast__close"
        onClick={onClose}
        aria-label="Dismiss combo notification"
      >
        ×
      </button>
      <div className="combo-toast__header">
        <div className="combo-toast__title">{titleText}</div>
        <span className={rarityClass}>{data.rarityLabel}</span>
      </div>
      <div className="combo-toast__message">{data.message}</div>
      <div className="combo-toast__multiplier" aria-label={`Combo multiplier ${multiplierText}x`}>
        ×{multiplierText} Credits — +{data.bonusPercent}%
      </div>
    </div>
  );
};
