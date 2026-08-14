import React, { useState } from 'react';
import { Category } from '../types';
import { SlidersHorizontal, Sparkles, X, Check, RotateCcw } from 'lucide-react';
import { ResponsiveCategoryBar, CategoryOption } from './ResponsiveCategoryBar';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultsCount: number;
  searchQuery: string;
  onClearSearch: () => void;
  
  // Filter panel state
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
  maxPossiblePrice?: number;
  selectedSize?: string;
  onSizeChange?: (size: string) => void;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  inStockOnly?: boolean;
  onInStockChange?: (inStock: boolean) => void;
  onResetFilters?: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  resultsCount,
  searchQuery,
  onClearSearch,
  priceRange = [0, 50000],
  onPriceRangeChange,
  maxPossiblePrice = 50000,
  selectedSize = 'all',
  onSizeChange,
  selectedColor = 'all',
  onColorChange,
  inStockOnly = false,
  onInStockChange,
  onResetFilters,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'ALL COLLECTIONS' },
    { id: 'wedding', label: 'WEDDING' },
    { id: 'mens', label: "MEN'S" },
    { id: 'holiday', label: 'HOLIDAY' },
    { id: 'family', label: 'FAMILY' },
    { id: 'baby', label: 'BABY' },
    { id: 'formal', label: 'FORMAL' },
    { id: 'studio', label: 'STUDIO ATELIER' },
  ];

  const availableSizes = ['all', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Fit'];
  const availableColors = ['all', 'Gold', 'White', 'Crimson', 'Navy', 'Emerald', 'Ivory'];

  // Calculate total active filters count
  const activeFiltersCount = 
    (selectedSize !== 'all' ? 1 : 0) +
    (selectedColor !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPossiblePrice ? 1 : 0);

  return (
    <div className="bg-white/95 border-y border-[#D4AF37]/25 py-2.5 sm:py-3 sticky top-16 z-30 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Search Notice */}
        {searchQuery && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B0000]" />
              <span>Filtering for: <strong className="font-serif italic text-[#8B0000]">"{searchQuery}"</strong> ({resultsCount} items found)</span>
            </div>
            <button 
              onClick={onClearSearch}
              className="text-xs font-semibold text-[#8B0000] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Categories Bar & Controls Row - Responsive Slider for Tablet & Mobile, Row for Desktop */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="w-full lg:max-w-3xl">
            <ResponsiveCategoryBar
              categories={categories.map(c => ({ id: c.id, label: c.label }))}
              selectedCategoryId={selectedCategory}
              onSelectCategory={(id) => onSelectCategory(id as Category)}
              containerBgColor="#FAF6EA"
            />
          </div>

          {/* Right Controls: Sort & Filter Toggle */}
          <div className="flex items-center justify-between lg:justify-end gap-3 text-xs pt-1 lg:pt-0 border-t lg:border-t-0 border-amber-200/50">
            
            {/* Filters Button with Count Badge */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-sm font-serif text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer border ${
                isFilterPanelOpen || activeFiltersCount > 0
                  ? 'bg-[#D4AF37] text-[#1A1817] border-[#B59228] shadow-sm'
                  : 'bg-[#C5A059] text-white border-[#B59228] hover:bg-[#B59228]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-[#1A1817] text-amber-300 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Expandable Filters Panel */}
        {isFilterPanelOpen && (
          <div className="pt-4 border-t border-[#D4AF37]/30 mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-5 rounded-md border border-amber-200/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Filter 1: Price Range */}
            <div className="space-y-2">
              <label className="block text-[11px] font-serif font-bold uppercase tracking-widest text-[#1A1817]">
                Price Range (ETB)
              </label>
              <div className="flex items-center justify-between text-xs text-gray-700 font-serif font-mono font-bold">
                <span>ETB {(priceRange[0] * 1).toLocaleString()}</span>
                <span>ETB {(priceRange[1] * 1).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxPossiblePrice}
                step={1000}
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange && onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>

            {/* Filter 2: Size Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-serif font-bold uppercase tracking-widest text-[#1A1817]">
                Size
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => onSizeChange && onSizeChange(sz)}
                    className={`px-2.5 py-1 text-xs font-serif rounded-xs border cursor-pointer transition ${
                      selectedSize === sz
                        ? 'bg-[#1A1817] text-amber-300 border-[#1A1817]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-amber-400'
                    }`}
                  >
                    {sz === 'all' ? 'All Sizes' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Color Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-serif font-bold uppercase tracking-widest text-[#1A1817]">
                Color Theme
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => onColorChange && onColorChange(col)}
                    className={`px-2.5 py-1 text-xs font-serif rounded-xs border cursor-pointer transition ${
                      selectedColor === col
                        ? 'bg-[#1A1817] text-amber-300 border-[#1A1817]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-amber-400'
                    }`}
                  >
                    {col === 'all' ? 'All Colors' : col}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 4: Availability & Reset */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="block text-[11px] font-serif font-bold uppercase tracking-widest text-[#1A1817]">
                  Availability
                </label>
                <label className="flex items-center gap-2 text-xs font-serif text-gray-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => onInStockChange && onInStockChange(e.target.checked)}
                    className="rounded-xs border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span>Show In-Stock Items Only</span>
                </label>
              </div>

              {/* Reset Filters Action */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-[11px] text-gray-500 font-serif italic">{resultsCount} items match</span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={onResetFilters}
                    className="flex items-center gap-1 text-xs text-[#8B0000] font-serif font-semibold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
