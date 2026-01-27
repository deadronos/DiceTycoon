import React from 'react';
import { InfoTooltip } from '../../InfoTooltip';

interface ConsumableItemData {
    key: string;
    name: string;
    icon: string;
    description: string;
    formula: string;
    currentCount: number;
    costText: string;
    canBuy: boolean;
    isNew: boolean;
}

interface PrestigeConsumablesSectionPresenterProps {
    consumableItems: ConsumableItemData[];
    onBuyUpgrade: (key: string) => void;
}

export const PrestigeConsumablesSectionPresenter: React.FC<PrestigeConsumablesSectionPresenterProps> = ({
    consumableItems,
    onBuyUpgrade,
}) => {
    return (
        <div className="prestige-shop">
            <div className="prestige-category">
                <div className="prestige-category__header">
                    <h3>Consumables</h3>
                    <p>Stockpile resources you can trigger manually during a run.</p>
                </div>
                <div className="prestige-shop-grid">
                    {consumableItems.map(item => (
                        <div key={item.key} className={`prestige-item prestige-item--consumable ${item.canBuy ? 'prestige-item--affordable' : ''}`}>
                            <div className="prestige-item__header">
                                <span className="prestige-item__icon" aria-hidden="true">{item.icon}</span>
                                <div className="prestige-item__text">
                                    <div className="prestige-item__title-row">
                                        <div className="prestige-item__title">{item.name}</div>
                                        <div className="prestige-item__badges">
                                            {item.isNew && <span className="prestige-item__badge prestige-item__badge--new">NEW</span>}
                                        </div>
                                    </div>
                                    <div className="prestige-item__description">{item.description}</div>
                                </div>
                                <InfoTooltip content={item.formula} label={`${item.name} formula`} />
                            </div>

                            <div className="prestige-item__body">
                                <div className="prestige-item__effect">Owned: {item.currentCount}</div>
                                <div className="prestige-item__effect prestige-item__effect--next">Each purchase grants +5 tokens.</div>
                            </div>

                            <div className="prestige-item__footer">
                                <div className="prestige-item__cost">Cost: {item.costText} LP</div>
                                <button
                                    className={item.canBuy ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
                                    onClick={() => onBuyUpgrade(item.key)}
                                    disabled={!item.canBuy}
                                >
                                    Purchase
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
