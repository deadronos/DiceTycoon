import React from 'react';
import { InfoTooltip } from '../../InfoTooltip';

interface PrestigeShopItemPresenterProps {
    name: string;
    icon: string;
    description: string;
    formula: string;
    currentLevel: number;
    maxLevel: number;
    costText: string;
    canBuy: boolean;
    isMaxed: boolean;
    progressPercent: number;
    isRecommended: boolean;
    isNew: boolean;
    currentEffect?: string;
    nextEffect?: string;
    onBuy: () => void;
    itemClassNames: string;
}

export const PrestigeShopItemPresenter: React.FC<PrestigeShopItemPresenterProps> = ({
    name,
    icon,
    description,
    formula,
    currentLevel,
    maxLevel,
    costText,
    canBuy,
    isMaxed,
    progressPercent,
    isRecommended,
    isNew,
    currentEffect,
    nextEffect,
    onBuy,
    itemClassNames,
}) => {
    return (
        <div className={itemClassNames}>
            <div className="prestige-item__header">
                <span className="prestige-item__icon" aria-hidden="true">{icon}</span>
                <div className="prestige-item__text">
                    <div className="prestige-item__title-row">
                        <div className="prestige-item__title">{name}</div>
                        <div className="prestige-item__badges">
                            {isNew && <span className="prestige-item__badge prestige-item__badge--new">NEW</span>}
                            {isRecommended && (
                                <span className="prestige-item__badge prestige-item__badge--recommended">Recommended</span>
                            )}
                        </div>
                    </div>
                    <div className="prestige-item__description">{description}</div>
                </div>
                <InfoTooltip content={formula} label={`${name} formula`} />
            </div>

            <div className="prestige-item__body">
                <div className="prestige-item__level-row">
                    <span>
                        Level {currentLevel}
                        {maxLevel > 0 && ` / ${maxLevel}`}
                    </span>
                    {maxLevel > 0 && (
                        <div className="prestige-progress" aria-hidden="true">
                            <div className="prestige-progress__bar" style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}
                </div>

                <div className="prestige-item__effects">
                    {currentEffect && (
                        <div className="prestige-item__effect">{currentEffect}</div>
                    )}
                    {nextEffect && !isMaxed && (
                        <div className="prestige-item__effect prestige-item__effect--next">
                            {nextEffect}
                        </div>
                    )}
                </div>
            </div>

            <div className="prestige-item__footer">
                <div className="prestige-item__cost">
                    {isMaxed ? 'Maxed out' : `Cost: ${costText} LP`}
                </div>
                <button
                    className={canBuy && !isMaxed ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
                    onClick={onBuy}
                    disabled={!canBuy || isMaxed}
                >
                    {isMaxed ? 'Complete' : 'Purchase'}
                </button>
            </div>
        </div>
    );
};
