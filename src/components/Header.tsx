import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Crown,
  Sparkles,
  Gem,
  ChevronRight,
  Shield,
  Calendar,
  Clock,
  Upload
} from 'lucide-react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';

interface HeaderProps {
  logoUrl?: string;
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenUploadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl,
  currentCurrency,
  onCurrencyChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenUploadModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'collections', label: 'COLLECTIONS' },
    { id: 'studio', label: 'STUDIO' },
    { id: 'about', label: 'ABOUT US' },
    { id: 'contact', label: 'CONTACT US' },
  ];

  const activeRateObj = CURRENCY_RATES.ETB || { rateToUSD: 112, symbol: 'ETB ', rateScreenshotUrl: '', rateUpdatedAt: '' };

  return (
    <>
      {/* Top Luxury Announcement Ticker */}
      <div className="bg-[#0A0807] text-[#F5D77F] text-xs font-serif font-bold py-2 px-3 sm:px-6 border-b border-[#D4AF37]/30 text-center flex items-center justify-center tracking-widest uppercase select-none">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
            <span className="font-bold tracking-[0.18em]">YARED TIBEB ATELIER — AUTHENTIC ETHIOPIAN HAUTE COUTURE & BESPOKE KEMIS</span>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-[#0E0B0A] backdrop-blur-md border-b-2 border-[#D4AF37]/40 transition-all shadow-xl">
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-[#F5D77F] hover:text-white transition cursor-pointer shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
          </button>

          {/* Brand Logo */}
          <div 
            onClick={() => {
              setActiveTab('home');
            }}
            className="cursor-pointer group flex items-center gap-2 select-none shrink transition transform hover:scale-[1.01] min-w-0"
          >
            {/* Brand Crest / Logo Image */}
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Yared Tibeb Logo" 
                className="h-9 sm:h-11 w-auto max-w-[48px] sm:max-w-[56px] object-contain rounded-xl border border-[#D4AF37] shrink-0 shadow-sm bg-white p-0.5" 
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FFFDF7] via-[#FAF5EA] to-[#F5EEDC] rounded-xl flex items-center justify-center border-2 border-[#D4AF37] shadow-sm shrink-0 group-hover:border-[#F5D77F] transition duration-300">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-[#B58E22]" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 font-cinzel text-base sm:text-2xl font-extrabold tracking-wider sm:tracking-widest text-[#F5D77F] leading-none">
                <span>YARED</span>
                <span className="text-[#D4AF37] text-[10px] sm:text-xs">❖</span>
                <span className="gold-gradient-text drop-shadow-sm">TIBEB</span>
              </div>
              <div className="text-[7.5px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.22em] uppercase text-[#D4AF37] font-bold mt-0.5 truncate max-w-[130px] sm:max-w-none">
                ADDIS ABABA · LUXURY HERITAGE
              </div>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 sm:gap-6 flex-nowrap whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                  }}
                  className={`py-1 text-[11px] sm:text-xs tracking-[0.14em] font-bold font-sans transition-all relative cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'text-[#FFF0C2] drop-shadow-md' 
                      : 'text-[#D4AF37] hover:text-[#FFF0C2]'
                  }`}
                >
                  <span className="whitespace-nowrap">{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFF0C2] to-[#D4AF37] rounded-full shadow-md" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">


            {/* Search Icon */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-1.5 sm:p-2.5 text-[#F5D77F] hover:text-white transition cursor-pointer hover:scale-105 transform"
              title="Search Catalog"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              className="p-1.5 sm:p-2.5 text-[#F5D77F] hover:text-red-400 transition relative cursor-pointer hover:scale-105 transform"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#8B0000] text-white text-[9px] sm:text-[10px] min-w-[17px] h-4.5 rounded-full flex items-center justify-center font-extrabold shadow-md border border-[#D4AF37] px-1">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={onOpenCart}
              className="p-1.5 sm:p-2.5 text-[#F5D77F] hover:text-white transition relative cursor-pointer hover:scale-105 transform"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#D4AF37] text-black text-[9px] sm:text-[10px] min-w-[17px] h-4.5 rounded-full flex items-center justify-center font-extrabold border border-black shadow-md px-1">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0E0B0A] border-b-2 border-[#D4AF37]/40 px-6 py-6 animate-fade-in space-y-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-3 px-4 rounded-xl text-base font-sans font-extrabold tracking-widest flex items-center justify-between transition border cursor-pointer ${
                    activeTab === link.id 
                      ? 'bg-black text-[#FFF0C2] border-[#D4AF37] shadow-md' 
                      : 'text-[#D4AF37] border-transparent hover:bg-black/40 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-5 h-5 opacity-80 text-[#D4AF37]" />
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Overlay Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#D4AF37]/40">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2 text-[#181310]">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold">Search Yared Tibeb Atelier</h3>
              </div>
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-[#8B0000] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by Habesha Kemis, Tibeb motif, Silk Shemma, Zuria, Gold threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-3.5 bg-white border border-[#D4AF37]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-[#181310] font-sans text-sm shadow-inner"
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap text-xs text-gray-500 font-serif">
                <span className="font-bold text-[#181310]">Popular Suggestions:</span>
                <button onClick={() => { setSearchQuery('Zuria Kemis'); setSearchModalOpen(false); setActiveTab('collections'); }} className="hover:text-[#8B0000] underline cursor-pointer">Zuria Kemis</button>
                <button onClick={() => { setSearchQuery('Emperor Suit'); setSearchModalOpen(false); setActiveTab('collections'); }} className="hover:text-[#8B0000] underline cursor-pointer">Emperor Suit</button>
                <button onClick={() => { setSearchQuery('Gold Netela'); setSearchModalOpen(false); setActiveTab('collections'); }} className="hover:text-[#8B0000] underline cursor-pointer">Gold Netela</button>
              </div>

              <button
                onClick={() => {
                  setActiveTab('collections');
                  setSearchModalOpen(false);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#181310] text-[#D4AF37] rounded-xl text-xs font-serif font-bold tracking-wider uppercase hover:bg-[#8B0000] hover:text-white transition shadow-md cursor-pointer"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

