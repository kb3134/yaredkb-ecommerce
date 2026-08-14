import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Heart,
  Share2,
  Tag,
  ShieldCheck,
  Sparkles,
  Clock,
  User,
  Ruler,
  Facebook,
  Twitter,
  Send,
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ProductQuickViewModalProps {
  product: Product | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (p: Product, size: string, color: string, customMeasurements?: any, qty?: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onOpenBespokeForm: (p: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  currency,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenBespokeForm,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isCustomMeasurementMode, setIsCustomMeasurementMode] = useState(false);
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [heightLength, setHeightLength] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedSize(
        product.sizes && product.sizes.length > 0 
          ? product.sizes[0] 
          : (product.isBespokeAvailable ? 'BESPOKE' : 'Standard')
      );
      setSelectedColor(
        product.colors && product.colors.length > 0 ? product.colors[0] : 'Original'
      );
      setIsCustomMeasurementMode(false);
      setBust('');
      setWaist('');
      setHips('');
      setHeightLength('');
      setShowShareMenu(false);
    }
  }, [product]);

  if (!product) return null;

  const rateObj = CURRENCY_RATES[currency] || { code: 'ETB' as any, symbol: 'ETB ', rateToUSD: 1 };
  const convertedPrice = Math.round(product.priceUSD * rateObj.rateToUSD);

  const convertedOriginalPrice = product.originalPriceUSD 
    ? Math.round(product.originalPriceUSD * rateObj.rateToUSD)
    : null;

  const hasDiscount = Boolean(convertedOriginalPrice && convertedOriginalPrice > convertedPrice);
  const discountAmount = hasDiscount ? (convertedOriginalPrice! - convertedPrice) : 0;
  const discountPercent = hasDiscount ? Math.round((discountAmount / convertedOriginalPrice!) * 100) : 0;

  const handleAdd = () => {
    const customMeasurements = isCustomMeasurementMode ? {
      bustChest: bust || '',
      waist: waist || '',
      hips: hips || '',
      heightLength: heightLength || '',
      notes: 'Custom Bespoke Tailoring'
    } : undefined;

    onAddToCart(
      product, 
      selectedSize || 'Standard', 
      selectedColor || 'Original', 
      customMeasurements,
      quantity
    );

    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#16110D] rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C5A059]/40 relative my-auto flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Max Image Size & Lookbook Style */}
        <div className="w-full md:w-1/2 bg-[#0F0B08] flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-[#C5A059]/20 overflow-hidden">
          
          <div className="w-full relative flex-1 flex items-center justify-center">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-[350px] sm:h-[420px] md:h-[480px] object-cover object-top transition-all duration-300"
            />

            {/* Image counter if multiple images exist */}
            {product.images.length > 1 && (
              <span className="absolute bottom-4 left-4 bg-black/75 text-[#D4AF37] text-[10px] font-mono px-2.5 py-1 rounded-sm border border-[#C5A059]/30 backdrop-blur-md">
                {selectedImageIndex + 1} / {product.images.length}
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto max-w-full py-2.5 px-3.5 justify-center bg-[#14100D] border-t border-[#C5A059]/10">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-12 h-16 sm:w-14 sm:h-18 rounded-xs overflow-hidden border transition shrink-0 cursor-pointer ${
                    selectedImageIndex === idx 
                      ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 scale-105' 
                      : 'border-gray-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Light Warm Details Panel */}
        <div className="w-full md:w-1/2 bg-[#FAF6F0] text-[#1F1510] p-5 sm:p-6 flex flex-col justify-between relative space-y-3">
          
          {/* Floating Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full text-[#1F1510] hover:text-[#8B0000] hover:bg-black/5 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-3 pr-4">
            
            {/* Header Row: Category & Stock Status */}
            <div className="flex items-center justify-between gap-2 border-b border-[#E6DEC8] pb-2">
              {product.category ? (
                <span className="text-[#C5A059] font-serif font-bold text-xs uppercase tracking-widest">
                  {product.category.toUpperCase()}
                </span>
              ) : <span />}

              {product.inStock && product.stockQuantity > 0 ? (
                <span className="bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                  In Stock ({product.stockQuantity})
                </span>
              ) : (
                <span className="bg-rose-100/90 text-rose-800 border border-rose-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1510] tracking-tight leading-snug">
                {product.name}
              </h2>
            </div>

            {/* Price & Was Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1510]">
                {currency} {convertedPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="line-through text-[#8C7B6B] text-sm sm:text-base font-normal font-sans">
                  {currency} {convertedOriginalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Special Heritage Offer Banner (ONLY if discount exists) */}
            {hasDiscount && (
              <div className="bg-[#F5EFE6] border-l-4 border-[#C5A059] p-3 rounded-r-md flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1510]">
                  <Tag className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Special Heritage Offer: You Save <strong>{currency} {discountAmount.toLocaleString()}</strong></span>
                </div>
                <span className="bg-[#701010] text-[#FFD700] text-[10px] font-bold uppercase px-2.5 py-1 rounded-xs shrink-0">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {/* Admin Specifications / Info Box (Display ONLY information entered by Admin) */}
            {(product.description || (product.details && product.details.length > 0)) && (
              <div className="bg-[#F6F2EA] border border-[#E6DEC8] rounded-md p-4 space-y-2 text-xs text-[#2C221A]">
                {product.description ? (
                  <p className="text-xs text-[#4A3E33] leading-relaxed font-sans">
                    {product.description}
                  </p>
                ) : null}

                {product.details && product.details.length > 0 && (
                  <ul className="space-y-1 pt-1.5 border-t border-[#E6DEC8]/70 mt-1.5 list-disc list-inside text-gray-700">
                    {product.details.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Select Size / Tailoring */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-widest text-[#1F1510] uppercase">
                  SELECT SIZE / TAILORING
                </label>

                {/* Toggle Custom Measurements */}
                <button
                  type="button"
                  onClick={() => setIsCustomMeasurementMode(!isCustomMeasurementMode)}
                  className="text-[11px] font-bold text-[#8B0000] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{isCustomMeasurementMode ? 'Standard Sizes' : 'Custom Measurements'}</span>
                </button>
              </div>

              {!isCustomMeasurementMode ? (
                <div className="flex gap-2 flex-wrap">
                  {/* Size options list */}
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL']).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[44px] px-4 py-2 text-xs font-bold uppercase transition cursor-pointer border ${
                        selectedSize === sz
                          ? 'bg-[#231B15] text-white border-[#231B15] shadow-xs'
                          : 'bg-white text-[#1F1510] border-[#D5CEBF] hover:border-[#231B15]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}

                  {product.isBespokeAvailable && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize('BESPOKE');
                        setIsCustomMeasurementMode(true);
                      }}
                      className={`px-4 py-2 text-xs font-bold uppercase transition cursor-pointer border ${
                        selectedSize === 'BESPOKE' || isCustomMeasurementMode
                          ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-xs'
                          : 'bg-white text-[#8B0000] border-[#8B0000]/60 hover:border-[#8B0000]'
                      }`}
                    >
                      BESPOKE
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-[#F6F2EA] p-3.5 rounded-md border border-[#E6DEC8] space-y-2 text-xs">
                  <p className="font-bold text-[#1F1510]">Enter Custom Tailoring Inputs (Inches / cm):</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Bust/Chest (e.g. 36 in)"
                      value={bust}
                      onChange={e => setBust(e.target.value)}
                      className="p-2 border border-[#D5CEBF] bg-white rounded-xs text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                    <input
                      type="text"
                      placeholder="Waist (e.g. 28 in)"
                      value={waist}
                      onChange={e => setWaist(e.target.value)}
                      className="p-2 border border-[#D5CEBF] bg-white rounded-xs text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                    <input
                      type="text"
                      placeholder="Hips (e.g. 38 in)"
                      value={hips}
                      onChange={e => setHips(e.target.value)}
                      className="p-2 border border-[#D5CEBF] bg-white rounded-xs text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                    <input
                      type="text"
                      placeholder="Shoulder to Floor"
                      value={heightLength}
                      onChange={e => setHeightLength(e.target.value)}
                      className="p-2 border border-[#D5CEBF] bg-white rounded-xs text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Selection (ONLY if admin entered colors) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold tracking-widest text-[#1F1510] uppercase block">
                  COLOR / SILK TONE:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                        selectedColor === col
                          ? 'bg-[#231B15] text-[#D4AF37] border-[#231B15]'
                          : 'bg-white text-gray-700 border-[#D5CEBF] hover:border-[#1F1510]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold tracking-widest text-[#1F1510] uppercase">
                QUANTITY:
              </span>
              <div className="inline-flex items-center border border-[#D5CEBF] bg-white text-xs font-bold text-[#1F1510] rounded-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition cursor-pointer text-sm font-bold select-none"
                >
                  -
                </button>
                <span className="px-4 py-2 font-mono min-w-[36px] text-center border-x border-[#D5CEBF]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100 transition cursor-pointer text-sm font-bold select-none"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Action Buttons Row */}
          <div className="space-y-3 pt-4 border-t border-[#E6DEC8] mt-2">
            
            {/* Interactive Share Panel */}
            {showShareMenu && (
              <div className="bg-[#F5EFE6] border-2 border-[#231B15] rounded-xl p-4 space-y-3 animate-fade-in shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-widest text-[#1F1510] uppercase flex items-center gap-1.5 font-serif">
                    <Share2 className="w-3.5 h-3.5 text-[#8B0000]" />
                    <span>Share This Heritage Piece</span>
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowShareMenu(false)}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#8B0000] hover:text-black cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Social Share Icon Links */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?product=${product.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#3b5998]/5 hover:bg-[#3b5998]/15 text-[#3b5998] transition cursor-pointer border border-[#3b5998]/10"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-[9px] font-sans font-bold mt-1 text-center">Facebook</span>
                  </a>
                  
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?product=${product.id}`)}&text=${encodeURIComponent(`Check out the magnificent handcrafted ${product.name} on Yared Tibeb!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-gray-800/5 hover:bg-gray-800/15 text-gray-800 transition cursor-pointer border border-gray-800/10"
                    title="Share on X"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-[9px] font-sans font-bold mt-1 text-center">X / Twitter</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this breathtaking handcrafted Ethiopian piece on Yared Tibeb: ${product.name} - ${window.location.origin}${window.location.pathname}?product=${product.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#25d366]/5 hover:bg-[#25d366]/15 text-[#25d366] transition cursor-pointer border border-[#25d366]/10"
                    title="Share on WhatsApp"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-[9px] font-sans font-bold mt-1 text-center">WhatsApp</span>
                  </a>

                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?product=${product.id}`)}&media=${encodeURIComponent(product.images[0])}&description=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#bd081c]/5 hover:bg-[#bd081c]/15 text-[#bd081c] transition cursor-pointer border border-[#bd081c]/10"
                    title="Pin on Pinterest"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-[9px] font-sans font-bold mt-1 text-center">Pinterest</span>
                  </a>

                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Luxury Handcrafted Ethiopian Couture: ${product.name}`)}&body=${encodeURIComponent(`Greetings,\n\nI thought you might appreciate seeing this beautiful, high-fashion handcrafted piece from Yared Tibeb:\n\n${product.name}\n\nYou can view and customize this piece here:\n${window.location.origin}${window.location.pathname}?product=${product.id}`)}`}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#7A6B5D]/5 hover:bg-[#7A6B5D]/15 text-[#7A6B5D] transition cursor-pointer border border-[#7A6B5D]/10"
                    title="Share via Email"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-[9px] font-sans font-bold mt-1 text-center">Email</span>
                  </a>
                </div>

                {/* Direct Link Copy Bar */}
                <div className="flex gap-2 items-center pt-2 border-t border-[#E6DEC8]/60">
                  <div className="flex-1 bg-white border border-[#D5CEBF] px-2.5 py-1.5 rounded-md text-[10px] font-mono text-gray-600 truncate">
                    {`${window.location.origin}${window.location.pathname}?product=${product.id}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}?product=${product.id}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-[#231B15] text-white hover:bg-[#8B0000] text-[10px] font-bold uppercase tracking-wider rounded-md transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              
              {/* ADD TO BAG BUTTON */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.inStock || product.stockQuantity <= 0}
                className={`flex-1 py-3.5 px-6 font-serif text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  !product.inStock || product.stockQuantity <= 0
                    ? 'bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed'
                    : addedNotice
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#231B15] hover:bg-[#8B0000] text-white'
                }`}
              >
                {!product.inStock || product.stockQuantity <= 0 ? (
                  <span>OUT OF STOCK</span>
                ) : addedNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO BAG</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG</span>
                  </>
                )}
              </button>

              {/* WISHLIST BUTTON */}
              <button
                type="button"
                onClick={() => onToggleWishlist(product)}
                className={`p-3.5 border border-[#231B15] transition cursor-pointer flex items-center justify-center ${
                  isWishlisted
                    ? 'bg-[#8B0000] text-white border-[#8B0000]'
                    : 'bg-white text-[#231B15] hover:bg-[#231B15] hover:text-white'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>

              {/* SHARE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setShowShareMenu(!showShareMenu);
                  // Also copy the direct link on initial click for immediate convenience!
                  navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}?product=${product.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className={`p-3.5 transition cursor-pointer flex items-center justify-center relative border ${
                  showShareMenu 
                    ? 'bg-[#8B0000] border-[#8B0000] text-white' 
                    : 'bg-white border-[#231B15] text-[#231B15] hover:bg-[#231B15] hover:text-white'
                }`}
                title="Share Creation"
              >
                {copiedLink && !showShareMenu ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

            </div>

            {/* Footer Subtext Note */}
            <div className="text-[11px] text-[#7A6B5D] flex items-center justify-center gap-1.5 pt-1 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span>Worldwide Insured DHL Shipping · Direct from Addis Ababa</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
