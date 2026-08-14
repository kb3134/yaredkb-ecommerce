import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Tag, Check, Shirt } from 'lucide-react';
import { Product } from '../types';

interface HomeImageUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onUploadSuccess: (newProduct: Omit<Product, 'id'>) => void;
}

export const HomeImageUploaderModal: React.FC<HomeImageUploaderModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onUploadSuccess,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'wedding' | 'casual' | 'mens' | 'couture' | 'accessories'>('wedding');
  const [priceUSD, setPriceUSD] = useState<number>(1200);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [designer, setDesigner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const fallbackImg = imageUrl.trim() || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000';

    setTimeout(() => {
      onUploadSuccess({
        name: name.trim(),
        category,
        collections: [category, 'liveshow'],
        priceUSD: Number(priceUSD) || 1200,
        originalPriceUSD: Number(priceUSD) ? Math.round(Number(priceUSD) * 1.25) : 1500,
        inStock: true,
        stockCount: 5,
        rating: 5.0,
        reviewCount: 1,
        image: fallbackImg,
        images: [fallbackImg],
        description: description.trim() || 'Custom bespoke Habesha Kemis garment uploaded live to Yared Tibeb catalog.',
        details: [
          'Hand-woven 100% pure Ethiopian cotton',
          'Intricate Tibeb woven border pattern',
          'Tailored bespoke fit',
          'Featured Live Showcase item',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'Custom'],
        colors: ['Gold & White', 'Royal Crimson', 'Emerald Shemma'],
        isFeatured: true,
        isBestseller: false,
        isNew: true,
        fabricOrigin: 'Addis Ababa Atelier',
        weavingHours: 72,
        studioCategory: '',
      });

      setIsSubmitting(false);
      setName('');
      setImageUrl('');
      setDescription('');
      setDesigner('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#1A1410] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#211B17] via-[#1A1410] to-[#211B17] border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#F5D77F] tracking-wide flex items-center gap-1.5">
                Upload Image to Home Page
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </h3>
              <p className="text-[11px] text-amber-200/70">
                Instantly feature your garment design or atelier upload on the live Home Showcase.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Image Selection */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Garment Image
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D4AF37]/40 rounded-xl cursor-pointer bg-[#211B17]/60 hover:bg-[#211B17] hover:border-[#D4AF37] transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-7 h-7 text-[#D4AF37] mb-2" />
                    <p className="text-xs text-amber-100 font-medium">Click to select photo or drag & drop</p>
                    <p className="text-[10px] text-amber-200/50 mt-1">PNG, JPG or WEBP up to 10MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {imageUrl && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#D4AF37]/40">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] text-[#D4AF37] font-bold">
                    IMAGE READY
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Garment Title */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Garment / Design Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Gold Zuria - Empress Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-100 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="wedding">Bridal & Wedding</option>
                <option value="mens">Men's Kuta & Suit</option>
                <option value="couture">Royal Couture</option>
                <option value="casual">Casual Shemma</option>
                <option value="accessories">Jewelry & Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                value={priceUSD}
                onChange={(e) => setPriceUSD(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-100 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Designer / Artisan */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Designer / Artisan Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Master Weaver Kidane or Your Name"
              value={designer}
              onChange={(e) => setDesigner(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Tell customers about the pattern, weave, or inspiration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D4AF37]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif font-bold uppercase text-amber-200/60 hover:text-amber-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3C85C] text-[#181310] text-xs font-serif font-bold uppercase rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#181310]" />
                  <span>Publish Live to Home</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
