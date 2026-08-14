import React, { useState, useEffect } from 'react';
import { Product, Currency, Category } from '../types';
import { ProductCard } from './ProductCard';
import { CategoryFilter } from './CategoryFilter';
import { Pagination } from './Pagination';
import { Sparkles } from 'lucide-react';

interface StudioStoreCatalogProps {
  products: Product[];
  currency: Currency;
  isWishlisted?: (productId: string) => boolean;
  onToggleWishlist?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  initialCategory?: Category;
  searchQuery?: string;
  onClearSearch?: () => void;
}

// Helper to determine if a product belongs to a requested collection
export const isProductInCollection = (product: Product, collectionId: string): boolean => {
  if (!collectionId || collectionId === 'all') return true;

  const target = collectionId.toLowerCase().replace(/['’\s-]/g, '');

  // Main category check
  if (product.category) {
    const mainCat = product.category.toLowerCase().replace(/['’\s-]/g, '');
    if (mainCat === target || mainCat.includes(target) || target.includes(mainCat)) return true;
  }

  // Collections array check
  if (product.collections && Array.isArray(product.collections)) {
    if (product.collections.some(c => {
      const norm = c.toLowerCase().replace(/['’\s-]/g, '');
      return norm === target || norm.includes(target) || target.includes(norm);
    })) return true;
  }

  const nameNorm = (product.name || '').toLowerCase();
  const descNorm = (product.description || '').toLowerCase();

  if (target === 'wedding' || target === 'bridal') {
    return nameNorm.includes('wedding') || nameNorm.includes('bridal') || descNorm.includes('wedding') || descNorm.includes('bridal');
  }

  if (target === 'mens' || target === 'men') {
    return nameNorm.includes('men') || nameNorm.includes('male') || descNorm.includes('men') || descNorm.includes('male') || nameNorm.includes('kuta') || nameNorm.includes('suit');
  }

  if (target === 'holiday') {
    return nameNorm.includes('holiday') || nameNorm.includes('enkutatash') || nameNorm.includes('genna') || descNorm.includes('holiday') || descNorm.includes('festival');
  }

  if (target === 'family') {
    return nameNorm.includes('family') || descNorm.includes('family') || descNorm.includes('parent');
  }

  if (target === 'baby') {
    return nameNorm.includes('baby') || nameNorm.includes('child') || nameNorm.includes('junior') || descNorm.includes('baby') || descNorm.includes('child');
  }

  if (target === 'formal') {
    return nameNorm.includes('formal') || nameNorm.includes('gala') || descNorm.includes('formal') || descNorm.includes('gala') || descNorm.includes('evening');
  }

  return nameNorm.includes(target) || descNorm.includes(target);
};

export const StudioStoreCatalog: React.FC<StudioStoreCatalogProps> = ({
  products,
  currency,
  isWishlisted = (_id?: string) => false,
  onToggleWishlist = () => {},
  onQuickView,
  onAddToCart,
  initialCategory = 'all',
  searchQuery = '',
  onClearSearch = () => {},
}) => {
  // Category state
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('featured');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter Panel states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, priceRange, selectedSize, selectedColor, inStockOnly, searchQuery]);

  // Maximum price in dataset for dynamic range slider cap
  const maxPriceInSet = products.reduce((max, p) => Math.max(max, p.priceUSD || 0), 50000);

  // Filter products strictly based on category and filters
  const filteredProducts = products.filter((product) => {
    // 0. Destination matching
    const isStudio = product.category === 'studio' || 
                     (product.collections && (product.collections.includes('studio') || product.collections.includes('studio-only'))) || 
                     Boolean(product.studioCategory && product.studioCategory.trim() !== '');
    const isLiveshow = Boolean(product.collections && product.collections.includes('liveshow'));
    const isCollection = Boolean(product.collections && product.collections.includes('collection')) || (!isStudio && !isLiveshow);

    if (!isCollection && !isProductInCollection(product, selectedCategory)) return false;

    // 1. Category / Collection matching
    if (!isProductInCollection(product, selectedCategory)) {
      return false;
    }

    // 2. Search Query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchAmharic = product.amharicName && product.amharicName.includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchTibeb = product.tibebPattern && product.tibebPattern.toLowerCase().includes(q);
      if (!matchName && !matchAmharic && !matchDesc && !matchTibeb) return false;
    }

    // 3. Price Filter
    if (product.priceUSD < priceRange[0] || product.priceUSD > priceRange[1]) {
      return false;
    }

    // 4. Size Filter
    if (selectedSize !== 'all') {
      if (!product.sizes || !product.sizes.some(s => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
        return false;
      }
    }

    // 5. Color Filter
    if (selectedColor !== 'all') {
      if (!product.colors || !product.colors.some(c => c.toLowerCase().includes(selectedColor.toLowerCase()))) {
        return false;
      }
    }

    // 6. In Stock Only
    if (inStockOnly) {
      if (!product.inStock || product.stockQuantity <= 0) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
    if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
    if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0); // Featured first
  });

  // Total Pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleResetFilters = () => {
    setPriceRange([0, maxPriceInSet]);
    setSelectedSize('all');
    setSelectedColor('all');
    setInStockOnly(false);
    setCurrentPage(1);
    if (searchQuery) onClearSearch();
  };

  return (
    <div className="bg-[#FAF8F3] text-[#1A1817] min-h-[80vh] pb-16">
      
      {/* Category Navigation Bar & Filters */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={filteredProducts.length}
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        maxPossiblePrice={maxPriceInSet}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onResetFilters={handleResetFilters}
      />

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4AF37]/25 text-xs font-serif gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-widest text-[#B58E22]">
              {selectedCategory === 'all' ? 'ALL COLLECTIONS' : `${selectedCategory.toUpperCase()} COLLECTION`}
            </span>
            <span className="text-[#D4AF37]/50">•</span>
            <span className="text-gray-600 italic">
              {filteredProducts.length === 0
                ? '0 items'
                : totalPages > 1
                ? `Showing ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredProducts.length)} of ${filteredProducts.length} items`
                : `Showing ${filteredProducts.length} items`}
            </span>
          </div>
        </div>

        {/* Product Display Grid */}
        {filteredProducts.length === 0 ? (
          <div className="my-16 bg-white rounded-2xl p-12 text-center border border-[#E6D9C0] space-y-4 max-w-lg mx-auto shadow-xs">
            <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-[#181310]">No products found in this collection</h3>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              There are currently no items matching your filter criteria. Try choosing a different collection or resetting your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-6 py-2.5 bg-[#181310] text-[#E5D7B8] text-xs font-serif font-bold uppercase tracking-wider rounded-xl hover:bg-[#8B0000] hover:text-white transition cursor-pointer shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  isWishlisted={isWishlisted(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

      </div>

    </div>
  );
};
