import React, { useRef, useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HorizontalProductSliderProps {
  products: Product[];
  currency: Currency;
  isWishlisted?: (productId: string) => boolean;
  onToggleWishlist?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  title?: string;
  subtitle?: string;
}

export const HorizontalProductSlider: React.FC<HorizontalProductSliderProps> = ({
  products,
  currency,
  isWishlisted = (_productId?: string) => false,
  onToggleWishlist = () => {},
  onQuickView,
  onAddToCart,
  title,
  subtitle
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Drag state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const checkScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(100);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });

    const handleWheel = (e: WheelEvent) => {
      // Support Shift + Mousewheel or standard vertical mousewheel horizontal translation
      if (el.scrollWidth <= el.clientWidth) return;
      const delta = e.deltaX !== 0 ? e.deltaX : (e.shiftKey ? e.deltaY : e.deltaY * 0.8);
      
      if (Math.abs(delta) > 0) {
        if ((delta > 0 && canScrollRight) || (delta < 0 && canScrollLeft)) {
          el.scrollBy({ left: delta * 1.5, behavior: 'auto' });
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      el.removeEventListener('scroll', checkScrollState);
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [canScrollLeft, canScrollRight, products]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  if (products.length === 0) return null;

  return (
    <div className="relative my-6 group/slider select-none">
      {/* Title Header if provided */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
          <div>
            {title && (
              <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#181310] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{title}</span>
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 font-sans">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-500 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
              {products.length} {products.length === 1 ? 'Item' : 'Items'} • Swipe/Scroll horizontally
            </span>
          </div>
        </div>
      )}

      {/* Left Arrow Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1A1817]/90 text-[#D4AF37] border border-[#D4AF37]/50 shadow-xl flex items-center justify-center hover:bg-black hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Right Arrow Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1A1817]/90 text-[#D4AF37] border border-[#D4AF37]/50 shadow-xl flex items-center justify-center hover:bg-black hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Horizontal Slider Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-stretch gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-2 pb-6 px-1 no-scrollbar ${
          isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[270px] sm:w-[310px] md:w-[330px] lg:w-[340px] flex flex-col"
          >
            <ProductCard
              product={product}
              currency={currency}
              isWishlisted={isWishlisted(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>

      {/* Progress Track */}
      <div className="mt-2 flex items-center gap-4 px-2">
        <div className="h-1.5 flex-1 bg-gray-200/80 rounded-full overflow-hidden border border-gray-300/40">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FFF0C2] to-[#D4AF37] transition-all duration-150 rounded-full shadow-xs"
            style={{ width: `${Math.max(10, scrollProgress)}%` }}
          />
        </div>
        <div className="text-[10px] font-mono font-bold text-gray-500 shrink-0 uppercase tracking-widest">
          {products.length} {products.length === 1 ? 'PIECE' : 'PIECES'} IN SLIDER
        </div>
      </div>
    </div>
  );
};
