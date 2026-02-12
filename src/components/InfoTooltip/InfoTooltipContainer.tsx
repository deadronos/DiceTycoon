import React from 'react';
import { InfoTooltipPresenter } from './InfoTooltipPresenter';

interface InfoTooltipContainerProps {
    content: React.ReactNode;
    label?: string;
    children?: React.ReactNode;
    className?: string;
}

export const InfoTooltipContainer: React.FC<InfoTooltipContainerProps> = ({
    content,
    label = 'More info',
    children,
    className,
}) => {
    const ariaLabel = typeof content === 'string' ? content : undefined;

    return (
        <InfoTooltipPresenter
            content={content}
            label={label}
            className={className}
            ariaLabel={ariaLabel}
        >
            {children}
        </InfoTooltipPresenter>
    );
};
