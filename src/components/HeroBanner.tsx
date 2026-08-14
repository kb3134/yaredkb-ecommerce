import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Crown, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HERO_IMAGE_PRIMARY, HERO_IMAGE_CAMPAIGN, HABESHA_KEMIS_IMAGE } from '../data/mockData';

interface HeroBannerProps {
  heroBannerUrl?: string;
  heroSecondaryUrl?: string;
  heroTertiaryUrl?: string;
  heroBannerBadge?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  heroSecondaryBadge?: string;
  heroSecondaryTitle?: string;
  heroSecondarySubtitle?: string;
  heroTertiaryBadge?: string;
  heroTertiaryTitle?: string;
  heroTertiarySubtitle?: string;
  onExploreCollections: () => void;
  onBookBespoke: () => void;
  onOpenUploadModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  heroBannerUrl,
  heroSecondaryUrl,
  heroTertiaryUrl,
  heroBannerBadge,
  heroBannerTitle,
  heroBannerSubtitle,
  heroSecondaryBadge,
  heroSecondaryTitle,
  heroSecondarySubtitle,
  heroTertiaryBadge,
  heroTertiaryTitle,
  heroTertiarySubtitle,
  onExploreCollections,
  onBookBespoke,
  onOpenUploadModal,
}) => {
  const slides = [
    {
      url: heroBannerUrl || HERO_IMAGE_PRIMARY,
      badge: heroBannerBadge || '100% ROYAL HERITAGE',
      title: heroBannerTitle || 'Master Handwoven Shemma',
      subtitle: heroBannerSubtitle || 'Pure Cotton & Metallic Gold Thread · Addis Ababa Weavers',
    },
    {
      url: heroSecondaryUrl || HERO_IMAGE_CAMPAIGN,
      badge: heroSecondaryBadge || 'EMPRESS COUTURE',
      title: heroSecondaryTitle || 'Royal AXUM Chevron Design',
      subtitle: heroSecondarySubtitle || 'Hand-embroidered Tibeb Motifs · Custom Atelier Fitting',
    },
    {
      url: heroTertiaryUrl || HABESHA_KEMIS_IMAGE,
      badge: heroTertiaryBadge || 'BESPOKE BRIDAL',
      title: heroTertiaryTitle || 'Hand-crafted Kemis Gowns',
      subtitle: heroTertiarySubtitle || '5+ Years of Loom Legacy & Tradition',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="bg-white text-[#181310] pt-8 sm:pt-12 pb-10 sm:pb-14 lg:pb-16 border-b border-[#D4AF37]/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Visual Image Frame with Dynamic Slide Carousel */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Image Frame & Slider Container */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl group h-[480px] sm:h-[580px] bg-[#14100D]">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`hero-slide-${currentSlide}`}
                    initial={{ opacity: 0, scale: 1.05, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -20 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <img
                      src={slides[currentSlide].url}
                      alt={slides[currentSlide].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Left / Right Carousel Controls */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-md transition cursor-pointer z-20 shadow-lg"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-md transition cursor-pointer z-20 shadow-lg"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Top Right Royal Badge */}
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-[#241E1A] text-[#D4AF37] border-2 border-[#D4AF37] flex flex-col items-center justify-center font-serif text-[9px] font-bold text-center p-1 shadow-2xl leading-tight select-none z-20">
                  <Crown className="w-4 h-4 text-[#D4AF37] mb-0.5" />
                  <span className="font-cinzel">{slides[currentSlide].badge.split(' ')[0]}</span>
                  <span className="font-cinzel">{slides[currentSlide].badge.split(' ').slice(1).join(' ')}</span>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-[#C5A059]/40 shadow-xl z-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <h4 className="font-serif text-sm font-bold text-[#1A1817]">
                        {slides[currentSlide].title}
                      </h4>
                    </div>
                    {/* Slide Indicator Dots */}
                    <div className="flex items-center gap-1.5">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentSlide ? 'w-5 bg-[#C5A059]' : 'w-2 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    {slides[currentSlide].subtitle}
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* Right Typography Column */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4 sm:space-y-5">
            
            {/* Eyebrow Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-[#C5A059]/40 text-[11px] font-serif font-bold tracking-[0.14em] text-[#634E27] uppercase">
              <span>TIMELESS TRADITION · MODERN LUXURY</span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#110D0A]">
              Elegance Woven <br />
              <span className="text-[#B88E28] italic font-serif font-semibold drop-shadow-xs">Through Generations</span>
            </h1>

            {/* Narrative */}
            <p className="text-[#332A22] text-sm sm:text-[15px] leading-relaxed max-w-xl font-sans font-normal">
              <span className="font-semibold text-[#181310]">YARED TIBEB</span> crafts bespoke traditional Habesha dresses, tailored Men's Tibeb suits, and bridal ensembles. Each piece honors centuries-old looms, transforming pure Ethiopian cotton and gold metallic threads into timeless luxury.
            </p>

            {/* Stats Row */}
            <div className="pt-2.5 grid grid-cols-2 gap-4 border-t border-[#C5A059]/30 text-left">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#181310]">100%</p>
                <p className="text-[11px] text-[#5A4E42] uppercase tracking-wider font-semibold mt-0.5">
                  HANDMADE ARTISANAL
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#181310]">5+ Yrs</p>
                <p className="text-[11px] text-[#5A4E42] uppercase tracking-wider font-semibold mt-0.5">
                  LOOM LEGACY
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onExploreCollections}
                className="w-full sm:w-auto px-8 py-4 bg-[#211B17] text-[#D4AF37] hover:bg-[#382E28] transition-all font-serif font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3 shadow-lg group cursor-pointer border border-[#D4AF37]/30"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

