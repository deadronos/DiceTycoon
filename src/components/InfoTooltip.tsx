import React from 'react';

/**
 * Props for the InfoTooltip component.
 */
interface InfoTooltipProps {
  /** The content to display inside the tooltip (string or ReactNode). */
  content: React.ReactNode;
  /** Accessible label for the tooltip trigger (defaults to "More info"). */
  label?: string;
  /** Optional custom trigger element (defaults to an info icon). */
  children?: React.ReactNode;
  /** Optional extra CSS classes. */
  className?: string;
}

/**
 * A tooltip component that displays additional information on hover/focus.
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, label = 'More info', children, className }) => {
  return (
    <span className={`tooltip info-tooltip ${className ?? ''}`} aria-label={typeof content === 'string' ? content : undefined}>
      {children ?? <span className="info-tooltip__icon" aria-hidden="true">ℹ️</span>}
      <span className="tooltiptext" role="tooltip">
        {typeof content === 'string' ? <span>{content}</span> : content}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default InfoTooltip;
