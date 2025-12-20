import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { PrestigeShopItem, PrestigeShopKey } from '../../utils/constants';

/**
 * Represents the data needed to render a single item in the Prestige Shop.
 */
export interface PrestigeShopItemPayload {
  /** The unique identifier key for the shop item. */
  key: PrestigeShopKey;
  /** The static configuration of the shop item (name, description, etc.). */
  item: PrestigeShopItem;
  /** The current upgrade level of the item. */
  currentLevel: number;
  /** The cost to purchase the next level. */
  nextCost: DecimalType;
  /** Whether the player has enough currency to buy the item. */
  canBuy: boolean;
  /** Whether the item has reached its maximum level. */
  isMaxed: boolean;
  /** A percentage (0-100) representing progress towards the next purchase or max level. */
  progressPercent: number;
  /** Indicates if this item is recommended for purchase based on game logic. */
  isRecommended: boolean;
  /** Indicates if this item is newly unlocked or available. */
  isNew: boolean;
}
