import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product, Currency } from '../types';
import { ProductCard } from './ProductCard';

interface RecentUploadsShowcaseProps {
  products: Product[];
  currency: Currency;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const RecentUploadsShowcase: React.FC<RecentUploadsShowcaseProps> = ({
  products,
  currency,
  onQuickView,
  onAddToCart,
  isWishlisted = (_id: string) => false,
  onToggleWishlist = () => {},
}) => {
  // Filter exclusively for Live Showcase products
  const liveshowProducts = products.filter(p => {
    const isStudio = Boolean(p.studioCategory && p.studioCategory.trim() !== '') || 
                     (p.collections && p.collections.includes('studio')) ||
                     p.category === 'studio';
    const isLiveshow = Boolean(p.collections && p.collections.includes('liveshow')) || Boolean(p.isFeatured);
    return isLiveshow;
  });
  const recentProducts = liveshowProducts.slice(0, 4);

  return (
    <section className="relative py-20 bg-[#120D0A] border-y border-[#3A2A1D] text-[#FAF0D7] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 border-b border-[#3A2A1D] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-[#D4AF37]/15 text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest rounded-md font-serif border border-[#D4AF37]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                LIVE SHOW ATELIER SHOWCASE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 text-emerald-300 text-[10px] font-semibold rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Admin Live Feed Active
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF0D7] tracking-tight">
              Live Atelier Masterpieces & Runway Drops
            </h2>
            <p className="text-sm sm:text-base text-[#C5B59B] font-sans leading-relaxed">
              Real-time curated Habesha Kemis, modern Ethiopian haute couture, and bespoke bridal masterworks added live by the Yared Tibeb Atelier admin team.
            </p>
          </div>
        </div>

        {recentProducts.length === 0 ? (
          <div className="bg-[#181310] border border-[#3A2A1D] rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto text-xl font-serif font-bold border border-[#D4AF37]/30">
              YT
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#FAF0D7]">No Live Show Products Yet</h3>
            <p className="text-[#C5B59B] text-sm font-sans max-w-md mx-auto">
              Live runway showcases and atelier masterworks curated by our admin team will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency}
                isWishlisted={isWishlisted(p.id)}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};


