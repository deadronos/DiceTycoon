import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { PrestigeShopItem, PrestigeShopKey } from '../../utils/constants';

export interface PrestigeShopItemPayload {
  key: PrestigeShopKey;
  item: PrestigeShopItem;
  currentLevel: number;
  nextCost: DecimalType;
  canBuy: boolean;
  isMaxed: boolean;
  progressPercent: number;
  isRecommended: boolean;
  isNew: boolean;
}
