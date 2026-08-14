import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Truck, 
  Check, 
  CreditCard,
  Building2,
  PhoneCall
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (orderPayload: any) => void;
  onGoToCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onGoToCheckout,
}) => {
  if (!isOpen) return null;

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');

  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [paymentMethod, setPaymentMethod] = useState<'TeleBirr' | 'CBE Birr' | 'Credit Card' | 'Wire Transfer'>('Credit Card');

  const rateObj = CURRENCY_RATES[currency] || { code: 'ETB' as any, symbol: 'ETB ', rateToUSD: 1 };

  // Subtotal in USD
  const subtotalUSD = cartItems.reduce((acc, item) => acc + (item.product.priceUSD * item.quantity), 0);
  const discountAmountUSD = (subtotalUSD * discountPercent) / 100;
  const totalUSD = Math.max(0, subtotalUSD - discountAmountUSD);

  const subtotalConverted = Math.round(subtotalUSD * rateObj.rateToUSD);
  const totalConverted = Math.round(totalUSD * rateObj.rateToUSD);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'ADDIS2026' || promoCode.trim().toUpperCase() === 'HABESHALUXE') {
      setDiscountPercent(15);
      setPromoMsg('15% Imperial Discount Applied!');
    } else {
      setPromoMsg('Invalid promo code. Try ADDIS2026');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const orderPayload = {
      customerName,
      email,
      phone,
      address,
      city,
      country,
      items: cartItems,
      totalUSD,
      currency,
      totalInCurrency: totalConverted,
      paymentMethod
    };

    onPlaceOrder(orderPayload);
    setCheckoutStep('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] text-[#1A1817] shadow-2xl border-l border-[#D4AF37]/30 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-[#1A1817] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-lg font-bold">
                {checkoutStep === 'cart' ? 'Your Shopping Bag' : 'Imperial Checkout'}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-[#8B0000]" />
                </div>
                <h3 className="font-serif text-xl font-bold">Your Bag is Empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our luxury Habesha Kemis gowns, royal menswear, and handwoven silk Shemma.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#1A1817] text-[#D4AF37] text-xs font-serif font-bold uppercase rounded-xl hover:bg-[#8B0000] hover:text-white transition"
                >
                  Explore Collections
                </button>
              </div>
            ) : checkoutStep === 'cart' ? (
              
              /* Cart View */
              <div className="space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item, idx) => {
                    const itemConverted = Math.round(item.product.priceUSD * rateObj.rateToUSD);
                    return (
                      <div 
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                        className="p-3 bg-white border border-gray-200 rounded-2xl flex gap-3 relative shadow-sm"
                      >
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-20 h-24 object-cover object-top rounded-xl border"
                          referrerPolicy="no-referrer"
                        />

                        <div className="flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="font-serif font-bold text-sm text-[#1A1817] line-clamp-1">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                                className="text-gray-400 hover:text-[#8B0000] p-1"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[11px] text-gray-500 font-serif italic">
                              Size: <strong>{item.selectedSize}</strong> • Color: {item.selectedColor}
                            </p>

                            {item.customMeasurements && (
                              <div className="mt-1 p-1.5 bg-amber-50 rounded text-[10px] text-amber-900">
                                <strong>Custom Sizing:</strong> {item.customMeasurements.bustChest} / {item.customMeasurements.waist}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="font-serif font-bold text-sm">
                              {rateObj.symbol}{itemConverted.toLocaleString()}
                            </span>

                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded"
                              >
                                -
                              </button>
                              <span className="font-mono text-xs font-bold px-1">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Box */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. ADDIS2026)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-1.5 bg-[#1A1817] text-[#D4AF37] text-xs font-bold rounded-xl hover:bg-[#8B0000] hover:text-white transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMsg && (
                    <p className={`text-[11px] font-semibold ${discountPercent > 0 ? 'text-emerald-700' : 'text-[#8B0000]'}`}>
                      {promoMsg}
                    </p>
                  )}
                </div>

              </div>

            ) : (

              /* Checkout Form View */
              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
                
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-sm text-[#8B0000] border-b pb-1">1. Delivery Address</h3>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Sifan Tadesse" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Email *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="sifan@domain.com" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Phone *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="+251 911 000 111" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Street Address *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Bole Atlas, Villa 12" 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">City *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Addis Ababa / London" 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Country *</label>
                      <select 
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white"
                      >
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                      </select>
                    </div>
                  </div>
                </div>

              </form>

            )}

          </div>

          {/* Footer Summary & Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-white space-y-4">
              
              {/* Cost summary breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{rateObj.symbol}{subtotalConverted.toLocaleString()}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Imperial Discount ({discountPercent}%):</span>
                    <span>-{rateObj.symbol}{Math.round((subtotalConverted * discountPercent) / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>DHL Worldwide Express:</span>
                  <span className="text-emerald-600 font-bold">COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#1A1817] border-t border-gray-200 pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#8B0000]">{rateObj.symbol}{totalConverted.toLocaleString()}</span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  onClick={() => {
                    onClose();
                    if (onGoToCheckout) {
                      onGoToCheckout();
                    } else {
                      setCheckoutStep('checkout');
                    }
                  }}
                  className="w-full py-3.5 bg-[#1A1817] text-[#D4AF37] hover:bg-[#8B0000] hover:text-white transition font-serif font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="px-4 py-3 bg-gray-200 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    className="flex-1 py-3 bg-[#8B0000] text-white hover:bg-red-900 transition font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Place Imperial Order</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
