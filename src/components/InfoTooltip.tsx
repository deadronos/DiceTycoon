import React from 'react';

interface InfoTooltipProps {
  content: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

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
