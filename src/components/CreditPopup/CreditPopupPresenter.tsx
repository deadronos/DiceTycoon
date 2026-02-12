import React from 'react';
import { formatShort } from '../../utils/decimal';
import { type Decimal as DecimalType } from '../../utils/decimal';

interface CreditPopupPresenterProps {
    credits: DecimalType;
    rollCount?: number | null;
    isCritical?: boolean;
}

export const CreditPopupPresenter: React.FC<CreditPopupPresenterProps> = ({ credits, rollCount, isCritical }) => {
    return (
        <div className={`credit-popup ${isCritical ? 'critical' : ''}`}>
            {isCritical && <div className="critical-label">CRITICAL!</div>}
            +{formatShort(credits)} 💎
            {typeof rollCount === 'number' && (
                <div className="credit-popup__detail">({rollCount} rolls)</div>
            )}
        </div>
    );
};
