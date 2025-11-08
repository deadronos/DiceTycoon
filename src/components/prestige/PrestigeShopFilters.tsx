import React from 'react';

export type PrestigeShopFilterOption = 'all' | 'affordable' | 'recommended';

interface Props {
  filter: PrestigeShopFilterOption;
  setFilter: (value: PrestigeShopFilterOption) => void;
}

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
