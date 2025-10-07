import React from 'react';
import { Store } from '../types';
import { STORES } from '../constants';

interface FilterSidebarProps {
  selectedStores: Store[];
  onStoreToggle: (store: Store) => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  allCategories: string[];
  priceRange: { min: number; max: number };
  onPriceChange: (range: { min: number; max: number }) => void;
  minDiscount: number;
  onDiscountChange: (discount: number) => void;
  onResetFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedStores,
  onStoreToggle,
  selectedCategories,
  onCategoryToggle,
  allCategories,
  priceRange,
  onPriceChange,
  minDiscount,
  onDiscountChange,
  onResetFilters,
}) => {
  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-white p-6 rounded-lg shadow-lg h-fit sticky top-24">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Szűrők</h2>

      {/* Store Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Üzletek</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {STORES.map(({ name }) => (
            <label key={name} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStores.includes(name)}
                onChange={() => onStoreToggle(name)}
                className="h-4 w-4 rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
              />
              <span className="ml-3 text-sm text-gray-600">{name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Kategóriák</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {allCategories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryToggle(category)}
                className="h-4 w-4 rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
              />
              <span className="ml-3 text-sm text-gray-600">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Árkategória (Ft)</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) => onPriceChange({ ...priceRange, min: Number(e.target.value) || 0 })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#2A9D8F] focus:ring-[#2A9D8F] sm:text-sm"
            placeholder="Min"
          />
          <span>-</span>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) => onPriceChange({ ...priceRange, max: Number(e.target.value) || 100000 })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#2A9D8F] focus:ring-[#2A9D8F] sm:text-sm"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Discount Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Minimum kedvezmény</h3>
        <input
          type="range"
          min="0"
          max="90"
          step="5"
          value={minDiscount}
          onChange={(e) => onDiscountChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2A9D8F]"
        />
        <div className="text-center mt-2 font-medium text-[#2A9D8F]">{minDiscount}%</div>
      </div>
      
      <button
        onClick={onResetFilters}
        className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A9D8F]"
      >
        Szűrők törlése
      </button>
    </aside>
  );
};

export default FilterSidebar;