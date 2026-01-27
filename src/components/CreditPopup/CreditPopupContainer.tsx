import React, { useEffect } from 'react';
import { type Decimal as DecimalType } from '../../utils/decimal';
import { CREDIT_POPUP_DURATION } from '../../utils/constants';
import { CreditPopupPresenter } from './CreditPopupPresenter';

interface CreditPopupContainerProps {
    credits: DecimalType;
    rollCount?: number | null;
    isCritical?: boolean;
    onComplete: () => void;
}

export const CreditPopupContainer: React.FC<CreditPopupContainerProps> = ({ credits, rollCount, onComplete, isCritical }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, CREDIT_POPUP_DURATION);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <CreditPopupPresenter
            credits={credits}
            rollCount={rollCount}
            isCritical={isCritical}
        />
    );
};
