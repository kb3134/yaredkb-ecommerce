import React, { useState } from 'react';
import { Product, Currency } from '../types';
import { CURRENCY_RATES } from '../data/constants';
import { Heart, Eye, ShoppingBag, Scissors, Check, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product, size: string, color: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const selectedSize = product.sizes[0] || 'Standard';

  // Convert price from USD to active currency rate
  const rateObj = CURRENCY_RATES[currency] || { code: 'ETB' as any, symbol: 'ETB ', rateToUSD: 1 };
  const convertedPrice = Math.round(product.priceUSD * rateObj.rateToUSD);
  const originalPriceConverted = product.originalPriceUSD 
    ? Math.round(product.originalPriceUSD * rateObj.rateToUSD) 
    : null;

  const hasDiscount = Boolean(originalPriceConverted && originalPriceConverted > convertedPrice);
  const discountPercent = hasDiscount && originalPriceConverted ? Math.round(((originalPriceConverted - convertedPrice) / originalPriceConverted) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize, product.colors[0] || 'Original');
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group cursor-pointer bg-[#181310] rounded-2xl border border-[#3A2A1D] hover:border-[#D4AF37] shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative text-[#FAF0D7]"
    >
      
      {/* Top Floating Badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-[#8B0000] text-[#FFD700] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border border-[#D4AF37]/40 shadow-sm animate-pulse">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#181310]/95 text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border border-[#D4AF37]/40 shadow-sm">
              Imperial Edition
            </span>
          )}
          {product.isBespokeAvailable && (
            <span className="bg-[#181310]/95 backdrop-blur-md text-[#FAF0D7] border border-[#3A2A1D] text-[10px] font-serif font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
              <Scissors className="w-3 h-3 text-[#D4AF37]" />
              <span>Bespoke Fit</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-md ${
            isWishlisted 
              ? 'bg-[#8B0000] text-white' 
              : 'bg-[#181310]/80 text-[#FAF0D7] hover:text-[#D4AF37] hover:bg-[#181310]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Product Image Frame with Hover Quick View */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#241C16]">
        <img
          src={product.images[activeImageIndex] || product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          onMouseEnter={() => {
            if (product.images.length > 1) setActiveImageIndex(1);
          }}
          onMouseLeave={() => setActiveImageIndex(0)}
        />

        {/* Quick View Button on Bottom Right of Image */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2.5 bg-[#181310]/90 hover:bg-[#181310] text-[#FAF0D7] rounded-full shadow-lg transition transform hover:scale-110 cursor-pointer border border-[#3A2A1D]"
            title="Quick View"
          >
            <Eye className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Product Info Section Matching the Uploaded UI UX Design */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-[#181310] space-y-4">
        <div>
          {/* Top Meta & Star Rating */}
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-serif uppercase tracking-wider text-[#D4AF37] font-semibold">
              {product.tibebPattern || product.category || 'SILK-THREAD BLEND'}
            </span>
            <div className="flex items-center gap-1 text-[#D4AF37] bg-[#2A2017] px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
              <Star className="w-3 h-3 fill-[#D4AF37]" />
              <span className="font-bold text-[10px]">4.8 <span className="text-gray-400 font-normal">(38)</span></span>
            </div>
          </div>

          {/* Product Main Title */}
          <h3 className="font-serif text-lg font-bold text-[#FAF0D7] group-hover:text-[#D4AF37] transition-colors line-clamp-1 tracking-tight">
            {product.name}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-[#C5B59B] font-sans line-clamp-2 mt-2 leading-relaxed">
            {product.description || "Exquisite bespoke traditional Habesha Kemis masterpiece hand-woven by master artisans."}
          </p>
        </div>

        {/* Price & Availability Section */}
        <div className="space-y-3 pt-3 border-t border-[#3A2A1D]">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase font-serif tracking-widest text-gray-400">Price</div>
              <div className="font-serif font-bold text-lg text-[#D4AF37]">
                {convertedPrice.toLocaleString()} <span className="text-xs font-normal text-gray-300">{rateObj.symbol}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-serif tracking-widest text-gray-400">Availability</div>
              <div className="text-xs font-semibold text-emerald-400">
                {product.inStock && product.stockQuantity > 0 ? `${product.stockQuantity} Ready in Stock` : 'Made to Order'}
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="px-3 py-2.5 bg-transparent hover:bg-[#2A2017] text-[#FAF0D7] border border-[#D4AF37]/40 rounded-xl font-serif text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Custom Tailor</span>
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock || product.stockQuantity <= 0}
              className={`px-3 py-2.5 rounded-xl font-serif text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                !product.inStock || product.stockQuantity <= 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : addedAnimation
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#D4AF37] hover:bg-[#C59B27] text-[#181310]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

