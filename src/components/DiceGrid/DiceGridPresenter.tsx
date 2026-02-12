import React from 'react';
import { DieCard } from '../DieCard';
import { type Decimal as DecimalType } from '../../utils/decimal';

interface DiceGridPresenterProps {
    buyAmount: number | 'max';
    setBuyAmount: (amount: number | 'max') => void;
    diceData: Array<{
        die: any;
        unlockCost?: DecimalType;
        levelUpCost?: DecimalType;
        levelsToBuy: number;
        animationUnlockCost?: DecimalType;
        onUnlock: () => void;
        onLevelUp: () => void;
        onUnlockAnimation: () => void;
        canUnlock: boolean;
        canLevelUp: boolean;
        canUnlockAnimation: boolean;
    }>;
}

export const DiceGridPresenter: React.FC<DiceGridPresenterProps> = ({
    buyAmount,
    setBuyAmount,
    diceData,
}) => {
    return (
        <div className="dice-section-container">
            <div className="buy-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Buy Amount:</span>
                {[1, 10].map(amount => (
                    <button
                        key={amount}
                        className={`btn btn-small ${buyAmount === amount ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setBuyAmount(amount)}
                    >
                        x{amount}
                    </button>
                ))}
                <button
                    className={`btn btn-small ${buyAmount === 'max' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setBuyAmount('max')}
                >
                    Max
                </button>
            </div>

            <div className="dice-grid">
                {diceData.map(data => (
                    <DieCard
                        key={data.die.id}
                        die={data.die}
                        unlockCost={data.unlockCost}
                        levelUpCost={data.levelUpCost}
                        levelsToBuy={data.levelsToBuy}
                        animationUnlockCost={data.animationUnlockCost}
                        onUnlock={data.onUnlock}
                        onLevelUp={data.onLevelUp}
                        onUnlockAnimation={data.onUnlockAnimation}
                        canUnlock={data.canUnlock}
                        canLevelUp={data.canLevelUp}
                        canUnlockAnimation={data.canUnlockAnimation}
                    />
                ))}
            </div>
        </div>
    );
};
