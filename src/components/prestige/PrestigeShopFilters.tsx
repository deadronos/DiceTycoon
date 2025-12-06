import React from 'react';

/**
 * Filter options available in the Prestige Shop.
 */
export type PrestigeShopFilterOption = 'all' | 'affordable' | 'recommended';

/**
 * Props for the PrestigeShopFilters component.
 */
interface Props {
  /** The currently selected filter option. */
  filter: PrestigeShopFilterOption;
  /** Callback to update the selected filter. */
  setFilter: (value: PrestigeShopFilterOption) => void;
}

/**
 * Displays a dropdown to filter items in the Prestige Shop.
 */
export const PrestigeShopFilters: React.FC<Props> = ({ filter, setFilter }) => (
  <div className="prestige-shop__filters">
    <label htmlFor="prestige-shop-filter">Filter</label>
    <select
      id="prestige-shop-filter"
      value={filter}
      onChange={event => setFilter(event.target.value as PrestigeShopFilterOption)}
    >
      <option value="all">All Upgrades</option>
      <option value="affordable">Affordable Now</option>
      <option value="recommended">Recommended Picks</option>
    </select>
  </div>
);

export default PrestigeShopFilters;
