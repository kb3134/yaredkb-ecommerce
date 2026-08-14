import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CategoryOption {
  id: string;
  label: string;
  count?: number;
}

interface ResponsiveCategoryBarProps {
  categories: CategoryOption[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  containerBgColor?: string;
  className?: string;
}

export const ResponsiveCategoryBar: React.FC<ResponsiveCategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className = '',
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent scroll background when drawer is open on mobile
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const activeCategory = categories.find((cat) => {
    const catIdLower = cat.id.toLowerCase();
    const selectedLower = (selectedCategoryId || '').toLowerCase();
    return (
      selectedLower === catIdLower ||
      (catIdLower === 'mens' && selectedLower === "men's") ||
      (catIdLower === "men's" && selectedLower === 'mens')
    );
  }) || categories[0];

  const handleCategorySelect = (id: string) => {
    onSelectCategory(id);
    setIsDrawerOpen(false);
  };

  return (
    <div className={`w-full ${className}`}>
      
      {/* -------------------------------------------------------------
          1. DESKTOP VIEW (≥1024px): Full Horizontal Row Unchanged
         ------------------------------------------------------------- */}
      <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2.5 w-full">
        {categories.map((cat) => {
          const catIdLower = cat.id.toLowerCase();
          const selectedLower = (selectedCategoryId || '').toLowerCase();
          const isActive =
            selectedLower === catIdLower ||
            (catIdLower === 'mens' && selectedLower === "men's") ||
            (catIdLower === "men's" && selectedLower === 'mens');

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`min-h-[44px] px-4 py-2 text-xs font-serif font-bold tracking-widest uppercase transition-all duration-300 rounded-md cursor-pointer whitespace-nowrap border flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-[#181310] text-[#D4AF37] border-[#D4AF37] shadow-md scale-[1.02]'
                    : 'bg-white text-[#181310] border-gray-200 hover:border-[#D4AF37] hover:bg-amber-50/50'
                }`}
              >
                <span>{cat.label}</span>
                {typeof cat.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
                      isActive ? 'bg-[#D4AF37] text-[#181310]' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
        })}
      </div>

      {/* -------------------------------------------------------------
          2. TABLET & MOBILE VIEW (<1024px): Premium Hamburger Icon & Drawer
         ------------------------------------------------------------- */}
      <div className="flex lg:hidden items-center justify-between w-full">
        
        {/* Hamburger Menu Trigger Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          aria-label="Open Category Navigation Menu"
          aria-expanded={isDrawerOpen}
          className="min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#181310] border border-[#D4AF37]/50 shadow-md flex items-center gap-3 transition-all duration-200 hover:border-[#D4AF37] active:scale-95 cursor-pointer text-[#D4AF37]"
        >
          {/* Minimal 3-line / Hamburger icon */}
          <div className="w-5 h-5 flex flex-col justify-center items-center gap-1.5">
            <span
              className={`w-4.5 h-0.5 bg-[#D4AF37] rounded-full transition-transform duration-300 ${
                isDrawerOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-4.5 h-0.5 bg-[#D4AF37] rounded-full transition-opacity duration-300 ${
                isDrawerOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`w-4.5 h-0.5 bg-[#D4AF37] rounded-full transition-transform duration-300 ${
                isDrawerOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>

          <div className="flex items-center gap-2 text-left">
            <span className="font-serif text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
              CATEGORY:
            </span>
            <span className="font-serif text-xs font-bold uppercase tracking-wider text-white">
              {activeCategory ? activeCategory.label : 'ALL COLLECTIONS'}
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-[#D4AF37]/70 ml-1" />
        </button>

      </div>

      {/* -------------------------------------------------------------
          3. SLIDE-OUT CATEGORY DRAWER (<1024px) - Portaled to Body Root
         ------------------------------------------------------------- */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                {/* Backdrop Overlay (z-[99998] to be in front of all sticky headers and menus) */}
                <motion.div
                  key="category-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[99998] cursor-pointer"
                />

                {/* Slide-out Panel (z-[99999] to be in front of backdrop & all page layers) */}
                <motion.div
                  key="category-drawer-panel"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
                  className="fixed top-0 left-0 bottom-0 z-[99999] w-[82vw] max-w-[320px] sm:w-[300px] h-full h-screen bg-[#FAF6EA] border-r border-[#D4AF37]/40 shadow-2xl flex flex-col justify-between overflow-hidden"
                >
                  {/* Drawer Top Header */}
                  <div>
                    <div className="p-4 sm:p-5 bg-[#181310] text-[#D4AF37] flex items-center justify-between border-b border-[#D4AF37]/30">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-serif text-xs font-bold uppercase tracking-widest text-amber-100">
                          Product Categories
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDrawerOpen(false)}
                        aria-label="Close menu"
                        className="w-8 h-8 rounded-lg bg-[#261E1A] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#181310] transition-colors cursor-pointer"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Vertical Category Items */}
                    <div className="p-4 sm:p-5 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
                      {categories.map((cat) => {
                        const catIdLower = cat.id.toLowerCase();
                        const selectedLower = (selectedCategoryId || '').toLowerCase();
                        const isActive =
                          selectedLower === catIdLower ||
                          (catIdLower === 'mens' && selectedLower === "men's") ||
                          (catIdLower === "men's" && selectedLower === 'mens');

                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`w-full min-h-[46px] px-4 py-3 text-xs font-serif font-bold tracking-wider uppercase rounded-lg border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'bg-[#181310] text-[#D4AF37] border-[#D4AF37] shadow-md scale-[1.01]'
                                : 'bg-white text-[#181310] border-gray-200 hover:border-[#D4AF37] hover:bg-amber-50/60'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                              {cat.label}
                            </span>

                            {typeof cat.count === 'number' && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isActive
                                    ? 'bg-[#D4AF37] text-[#181310]'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {cat.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drawer Footer Info */}
                  <div className="p-4 bg-amber-100/40 border-t border-amber-200/60 text-[11px] font-serif text-gray-600 italic text-center">
                    Select a collection to filter garments
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
