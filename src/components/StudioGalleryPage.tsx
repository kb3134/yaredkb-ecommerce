import React, { useState, useMemo, useEffect } from 'react';
import { StudioImage, StudioCategory, Product, Currency } from '../types';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import { ResponsiveCategoryBar } from './ResponsiveCategoryBar';
import { CURRENCY_RATES } from '../data/mockData';
import { Search, Filter, Sparkles, Eye, X, ArrowUpDown, Tag, Calendar, Layers, ChevronRight, MessageSquare, Compass, RefreshCw, ShoppingBag, Coins } from 'lucide-react';

interface StudioGalleryPageProps {
  studioImages: StudioImage[];
  studioCategories: StudioCategory[];
  products?: Product[];
  currency?: Currency;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product, size: string, color: string) => void;
  wishlistProductIds?: string[];
  onToggleWishlist?: (product: Product) => void;
}

export const StudioGalleryPage: React.FC<StudioGalleryPageProps> = ({
  studioImages,
  studioCategories: _propStudioCategories,
  products = [],
  currency = 'ETB',
  onQuickView = (_p) => {},
  onAddToCart = (_p, _s, _c) => {},
  wishlistProductIds = [],
  onToggleWishlist = (_p) => {},
}) => {
  const studioCategories = useMemo<StudioCategory[]>(() => _propStudioCategories, [_propStudioCategories]);

  // Filters & Controls
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const rateObj = useMemo(() => CURRENCY_RATES[currency] || { code: 'ETB', symbol: 'ETB ', rateToUSD: 1 }, [currency]);

  // Calculate maximum price of studio products
  const maxProductPriceInCurrency = useMemo(() => {
    if (!products || products.length === 0) return 100000;
    const studioProducts = products.filter(p => {
      const pStudioCat = (p.studioCategory || '').toLowerCase().trim();
      const isStudioCol = p.collections?.includes('studio') || p.category === 'studio';
      return pStudioCat !== '' || isStudioCol;
    });
    if (studioProducts.length === 0) return 100000;
    const maxUSD = Math.max(...studioProducts.map(p => p.priceUSD || 0), 1000);
    return Math.ceil(maxUSD * rateObj.rateToUSD);
  }, [products, rateObj]);

  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>(100000);

  // Sync state max price with calculated maximum when currency or products load
  useEffect(() => {
    if (maxProductPriceInCurrency > 0) {
      setSelectedMaxPrice(maxProductPriceInCurrency);
    }
  }, [maxProductPriceInCurrency]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, selectedMaxPrice]);

  // Selected Image for Lightbox Modal
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<StudioImage | null>(null);

  // Helper to normalize strings for category matching
  const matchCategory = (img: StudioImage, catSlugOrName: string): boolean => {
    if (!catSlugOrName || catSlugOrName === 'all') return true;
    const target = catSlugOrName.toLowerCase().replace(/['’\s-]/g, '');

    return img.categories.some(c => {
      const norm = c.toLowerCase().replace(/['’\s-]/g, '');
      return norm === target || norm.includes(target) || target.includes(norm);
    });
  };

  // Extract all unique tags across images
  const allTags = useMemo(() => {
    const set = new Set<string>();
    studioImages.forEach(img => {
      if (img.tags && Array.isArray(img.tags)) {
        img.tags.forEach(t => set.add(t.toLowerCase().trim()));
      }
    });
    return Array.from(set).sort();
  }, [studioImages]);

    // Compute Category Counts
    const categoryCounts = useMemo(() => {
      const counts: Record<string, number> = { all: 0 };
      
      // Count only from products with studio indicators
      products.forEach(p => {
        const pStudioCat = (p.studioCategory || '').toLowerCase().trim();
        const isStudioCol = p.collections?.includes('studio') || p.category === 'studio';
        
        if (pStudioCat !== '' || isStudioCol) {
          counts.all++;
          
          // For products, we match against studio categories
          studioCategories.forEach(cat => {
            const targetCat = pStudioCat || p.category;
            const target = targetCat.toLowerCase().replace(/['’\s-]/g, '');
            const catSlugNorm = cat.slug.toLowerCase().replace(/['’\s-]/g, '');
            const catNameNorm = cat.name.toLowerCase().replace(/['’\s-]/g, '');
            
            if (target === catSlugNorm || target === catNameNorm || target.includes(catSlugNorm) || catSlugNorm.includes(target)) {
              counts[cat.slug] = (counts[cat.slug] || 0) + 1;
            }
          });
        }
      });

      return counts;
    }, [studioCategories, products]);

    // Filter products for the active studio category
    const filteredStudioProducts = useMemo(() => {
      if (!products || products.length === 0) return [];
      
      // Only display products that are designated as Studio products
      const studioProducts = products.filter(p => {
        const pStudioCat = (p.studioCategory || '').toLowerCase().trim();
        const isStudioCol = p.collections?.includes('studio') || p.category === 'studio';
        return pStudioCat !== '' || isStudioCol;
      });

      let results = studioProducts;

      // 1. Category Filter
      if (selectedCategory !== 'all') {
        const target = selectedCategory.toLowerCase().replace(/['’\s-]/g, '');
        results = results.filter(p => {
          const pStudioCat = (p.studioCategory || '').toLowerCase().trim();
          if (pStudioCat) {
            return pStudioCat.replace(/['’\s-]/g, '') === target;
          }
          const pCat = String(p.category).toLowerCase().replace(/['’\s-]/g, '');
          const inCollections = p.collections?.some(c => c.toLowerCase().replace(/['’\s-]/g, '') === target);
          return pCat === target || inCollections;
        });
      }

      // 2. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        results = results.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }

      // 2.5. Price Filter
      if (selectedMaxPrice > 0) {
        results = results.filter(p => {
          const converted = Math.round(p.priceUSD * rateObj.rateToUSD);
          return converted <= selectedMaxPrice;
        });
      }

      // 3. Sort
      results = [...results].sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
        if (sortBy === 'a-z') return a.name.localeCompare(b.name);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });

      return results;
    }, [products, selectedCategory, searchQuery, sortBy, selectedMaxPrice, rateObj]);

    // Total pages calculation
    const totalPages = Math.ceil(filteredStudioProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudioProducts = filteredStudioProducts.slice(startIndex, startIndex + itemsPerPage);

    const handleReset = () => {
      setSelectedCategory('all');
      setSearchQuery('');
      setSortBy('featured');
      setSelectedMaxPrice(maxProductPriceInCurrency);
      setCurrentPage(1);
    };

  return (
    <div className="bg-[#FAF8F3] text-[#231B15] min-h-screen pb-20">
      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-[#E5DFD3] p-4 sm:p-5 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or tag..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FDFBF7] border border-[#E5DFD3] rounded-lg text-xs font-sans text-[#231B15] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Quick Stats */}
          <div className="flex flex-wrap items-center justify-between md:justify-end w-full md:w-auto gap-4">
            <div className="text-xs font-serif text-gray-600">
              Showing <span className="font-bold text-[#231B15]">{filteredStudioProducts.length}</span> Studio items
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="studio-sort" className="text-xs font-serif text-gray-500 flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Sort by:</span>
              </label>
              <select
                id="studio-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 bg-[#FDFBF7] border border-[#E5DFD3] rounded-lg text-xs font-serif font-bold text-[#231B15] focus:outline-none focus:border-[#D4AF37] transition cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Title (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Left Sidebar + Right Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR: CATEGORIES & TAG FILTERS */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Categories Box */}
            <div className="bg-white rounded-xl border border-[#E5DFD3] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
                <h2 className="font-serif font-bold text-sm text-[#231B15] flex items-center gap-2 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>Studio Categories</span>
                </h2>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-[10px] font-sans text-[#8B0000] hover:underline font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Mobile/Tablet Responsive Slider View */}
              <div className="block lg:hidden">
                <ResponsiveCategoryBar
                  categories={[
                    { id: 'all', label: 'All Studio', count: categoryCounts.all || 0 },
                    ...studioCategories.map(cat => ({
                      id: cat.slug,
                      label: cat.name,
                      count: categoryCounts[cat.slug] || 0,
                    }))
                  ]}
                  selectedCategoryId={selectedCategory}
                  onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setVisibleCount(8);
                  }}
                  containerBgColor="#FFFFFF"
                />
              </div>

              {/* Desktop Vertical List View */}
              <div className="hidden lg:flex lg:flex-col lg:space-y-1 lg:overflow-y-auto lg:max-h-[420px] pr-1">
                {/* All Categories Option */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setVisibleCount(8);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-serif transition flex items-center justify-between gap-2 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#231B15] text-[#D4AF37] border border-[#D4AF37] font-bold shadow-xs'
                      : 'bg-transparent text-gray-700 hover:bg-[#FDFBF7] hover:text-[#231B15]'
                  }`}
                >
                  <span className="whitespace-nowrap">All Studio</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedCategory === 'all' ? 'bg-[#D4AF37] text-[#231B15]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {categoryCounts.all || 0}
                  </span>
                </button>

                {/* Categories List */}
                {studioCategories.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase() || selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  const count = categoryCounts[cat.slug] || 0;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setVisibleCount(8);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-serif transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#231B15] text-[#D4AF37] border border-[#D4AF37] font-bold shadow-xs'
                          : 'bg-transparent text-gray-700 hover:bg-[#FDFBF7] hover:text-[#231B15]'
                      }`}
                    >
                      <span className="truncate pr-1 whitespace-nowrap">{cat.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-[#D4AF37] text-[#231B15]' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Box */}
            <div className="bg-white rounded-xl border border-[#E5DFD3] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
                <h2 className="font-serif font-bold text-sm text-[#231B15] flex items-center gap-2 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-[#D4AF37]" />
                  <span>Price Filter</span>
                </h2>
                {selectedMaxPrice < maxProductPriceInCurrency && (
                  <button
                    onClick={() => setSelectedMaxPrice(maxProductPriceInCurrency)}
                    className="text-[10px] font-sans text-[#8B0000] hover:underline font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 font-serif">
                  <span>Max Price:</span>
                  <span className="font-bold text-[#231B15]">
                    {rateObj.symbol}{selectedMaxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxProductPriceInCurrency}
                  step={rateObj.symbol.trim() === 'ETB' ? 1000 : 50}
                  value={selectedMaxPrice}
                  onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-serif">
                  <span>{rateObj.symbol}0</span>
                  <span>{rateObj.symbol}{maxProductPriceInCurrency.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Products */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Store Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/20 text-[#8B0000] text-[10px] font-serif font-bold uppercase tracking-widest">
                  <ShoppingBag className="w-3 h-3 text-[#8B0000]" />
                  <span>Bespoke Order & Retail Line</span>
                </div>
                <h2 className="font-serif font-extrabold text-xl text-[#231B15]">
                  Shop the {selectedCategory === 'all' ? 'Atelier Studio' : studioCategories.find(c => c.slug === selectedCategory)?.name || 'Related'} Garments
                </h2>
                <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-2xl">
                  Handcrafted, made-to-measure masterpieces weaving heritage motifs into luxury apparel. Click any garment to customize sizing and color.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="text-xs font-serif font-bold text-gray-600 bg-white border border-[#E5DFD3] px-3.5 py-2 rounded-xl shrink-0 shadow-3xs">
                  <span className="text-[#8B0000]">{filteredStudioProducts.length}</span> Masterpieces Uploaded
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredStudioProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5DFD3] p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
                <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto animate-pulse" />
                <h3 className="font-serif font-bold text-lg text-[#231B15]">No Studio Products Found</h3>
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  No handcrafted garments matched your selected category or search keywords.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-[#231B15] text-[#D4AF37] text-xs font-serif font-bold uppercase tracking-wider rounded-md hover:bg-black transition cursor-pointer"
                >
                  Reset Studio Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedStudioProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      isWishlisted={wishlistProductIds.includes(product.id)}
                      onToggleWishlist={onToggleWishlist}
                      onQuickView={onQuickView}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
