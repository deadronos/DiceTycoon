import React from 'react';

interface InfoTooltipPresenterProps {
    content: React.ReactNode;
    label: string;
    children?: React.ReactNode;
    className?: string;
    ariaLabel?: string;
}

export const InfoTooltipPresenter: React.FC<InfoTooltipPresenterProps> = ({
    content,
    label,
    children,
    className,
    ariaLabel,
}) => {
    return (
        <span className={`tooltip info-tooltip ${className ?? ''}`} aria-label={ariaLabel}>
            {children ?? <span className="info-tooltip__icon" aria-hidden="true">ℹ️</span>}
            <span className="tooltiptext" role="tooltip">
                {typeof content === 'string' ? <span>{content}</span> : content}
            </span>
            <span className="sr-only">{label}</span>
        </span>
    );
};
