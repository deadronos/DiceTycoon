import React from 'react';
import { ComboToast } from './ComboToast';
import { type ComboResult } from '../types/combo';
import { type ComboMetadata } from '../utils/combos';

/**
 * Represents a single toast entry in the stack.
 */
export interface ComboToastEntry {
  /** Unique ID for the toast. */
  id: number;
  /** The combo result associated with the toast. */
  combo: ComboResult;
  /** Metadata for display. */
  metadata: ComboMetadata;
  /** Whether the toast is visible. */
  visible: boolean;
  /** Optional summary count for grouped toasts. */
  summaryCount?: number;
}

/**
 * Props for the ComboToastStack component.
 */
interface Props {
  /** List of active toasts to display. */
  comboToasts: ComboToastEntry[];
  /** Callback to close a specific toast. */
  onClose: (id: number) => void;
}

/**
 * Manages a stack of combo notification toasts.
 */
export const ComboToastStack: React.FC<Props> = ({ comboToasts, onClose }) => (
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

export default ComboToastStack;
