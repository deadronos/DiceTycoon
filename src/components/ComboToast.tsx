import React, { useEffect } from 'react';
import type { ComboResult } from '../types/combo';
import { getComboMetadata, type ComboMetadata } from '../utils/combos';

interface ComboToastProps {
  combo: ComboResult | null;
  metadata?: ComboMetadata | null;
  visible: boolean;
  onClose: () => void;
}

export const ComboToast: React.FC<ComboToastProps> = ({ combo, metadata, visible, onClose }) => {
  useEffect(() => {
    if (!combo || !visible) return;
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [combo, visible, onClose]);

  if (!combo) return null;

  const data = metadata ?? getComboMetadata(combo);

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
      <div className="combo-toast__title">{data.title}</div>
      <div className="combo-toast__message">{data.message}</div>
    </div>
  );
};
