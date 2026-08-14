import React, { useState } from 'react';
import { CartItem, Currency, Order } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  AlertCircle, 
  CreditCard, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText,
  Package,
  Sparkles
} from 'lucide-react';

interface CheckoutViewProps {
  cartItems: CartItem[];
  currency: Currency;
  onBackToCart: () => void;
  onBackToShopping: () => void;
  onPlaceOrder: (orderPayload: any) => Promise<void> | void;
  confirmedOrder: Order | null;
  onResetConfirmedOrder: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  currency,
  onBackToCart,
  onBackToShopping,
  onPlaceOrder,
  confirmedOrder,
  onResetConfirmedOrder,
}) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Validation & Loading State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rateObj = CURRENCY_RATES[currency] || { code: 'ETB', symbol: 'ETB ', rateToUSD: 1 };

  // Calculate Subtotal & Total with discounts and savings
  const subtotalETB = cartItems.reduce((acc, item) => acc + (item.product.priceUSD * item.quantity), 0);
  const originalSubtotalETB = cartItems.reduce((acc, item) => {
    const origPrice = item.product.originalPriceUSD || item.product.priceUSD;
    return acc + (origPrice * item.quantity);
  }, 0);
  const totalSavingsETB = originalSubtotalETB - subtotalETB;
  const totalETB = subtotalETB;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!address.trim()) newErrors.address = 'Street address is required';
    if (!city.trim()) newErrors.city = 'Town / City is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!validate()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      customerName: `${firstName.trim()} ${lastName.trim()}`,
      companyName: companyName.trim(),
      country,
      address: address.trim(),
      apartment: apartment.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
      phone: phone.trim(),
      email: email.trim(),
      orderNotes: orderNotes.trim(),
      items: cartItems,
      totalUSD: totalETB,
      currency: 'ETB',
      totalInCurrency: totalETB,
      status: 'Pending'
    };

    try {
      await onPlaceOrder(orderPayload);
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is successfully placed, render Order Success View
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in text-[#231B15]">
        
        {/* Header Success Banner */}
        <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231B15]">
              ✅ Thank You for Your Order!
            </h1>
            <p className="font-serif text-lg font-semibold text-emerald-800">
              Your order has been confirmed successfully.
            </p>
            <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed">
              Thank you for shopping with <strong className="text-[#231B15]">YARED TIBEB</strong>. We have received your order and will process it as soon as possible.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[#E5DFD3] text-left text-xs font-serif">
            <div className="p-4 bg-white/90 rounded-2xl border border-[#E5DFD3] space-y-1">
              <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Order Number</span>
              <span className="font-mono font-bold text-[#231B15] text-base">{confirmedOrder.id}</span>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-[#E5DFD3] space-y-1">
              <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Order Date</span>
              <span className="font-bold text-[#231B15] text-sm">{confirmedOrder.createdAt}</span>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-[#E5DFD3] space-y-1">
              <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Total Amount</span>
              <span className="font-bold text-[#B8860B] text-base">ETB {confirmedOrder.totalInCurrency.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-[#E5DFD3] space-y-1">
              <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Order Status</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-[#231B15] flex items-center justify-between border-b border-[#E5DFD3] pb-4">
            <span className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#B8860B]" />
              <span>Purchased Items</span>
            </span>
            <span className="text-xs font-sans text-gray-500">{confirmedOrder.items.length} item(s)</span>
          </h2>

          <div className="divide-y divide-[#E5DFD3]">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="py-4 flex gap-4 items-center">
                <img 
                  src={item.product.images[0]} 
                  alt={item.product.name} 
                  className="w-16 h-20 object-cover rounded-xl border border-[#E5DFD3] bg-amber-50 shrink-0"
                />
                <div className="flex-1 text-xs space-y-1">
                  <p className="font-serif font-bold text-[#231B15] text-base">{item.product.name}</p>
                  <p className="text-gray-600 font-sans">
                    Size: <span className="font-semibold text-black">{item.selectedSize}</span> | Qty: <span className="font-semibold text-black">{item.quantity}</span>
                  </p>
                  <p className="text-[#B8860B] font-mono font-bold text-sm">
                    ETB {(item.product.priceUSD * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5DFD3] pt-4 space-y-2 text-sm font-serif">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-[#231B15]">ETB {confirmedOrder.totalInCurrency.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-bold text-emerald-700">Free Doorstep Courier</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#231B15] pt-3 border-t border-[#E5DFD3]">
              <span>Grand Total</span>
              <span className="text-[#B8860B]">ETB {confirmedOrder.totalInCurrency.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Contact Info Footer Block & Continue Shopping */}
        <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm">
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-[#231B15] tracking-widest uppercase">
              YARED TIBEB
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-gray-700 font-sans">
              <span className="flex items-center gap-1.5">
                📍 <strong>Address:</strong> Churchill Avenue, Bole Sub-City, Addis Ababa, Ethiopia
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="flex items-center gap-1.5">
                📞 <strong>Phone:</strong> +251 91 123 4567
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="flex items-center gap-1.5">
                ✉️ <strong>Email:</strong> contact@yaredtibeb.com
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5DFD3]">
            <button
              onClick={() => {
                onResetConfirmedOrder();
                onBackToShopping();
              }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#231B15] hover:bg-black text-[#D4AF37] font-serif text-sm font-bold uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-md hover:shadow-lg transform active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Standard Checkout View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#231B15]">
      
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
        <div>
          <button
            onClick={onBackToCart}
            className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase text-[#B8860B] hover:text-black transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shopping Bag</span>
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231B15]">
            Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-serif text-gray-500">
          <span className="text-gray-400">Bag</span>
          <span>&rarr;</span>
          <span className="font-bold text-[#231B15] border-b-2 border-[#B8860B] pb-0.5">Checkout</span>
          <span>&rarr;</span>
          <span className="text-gray-400">Order Complete</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-[#FDFBF7] border border-[#E5DFD3] rounded-3xl space-y-4">
          <ShoppingBag className="w-12 h-12 text-[#B8860B] mx-auto" />
          <h2 className="font-serif text-xl font-bold text-[#231B15]">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            Please add luxury garments to your bag before proceeding to checkout.
          </p>
          <button
            onClick={onBackToShopping}
            className="px-6 py-2.5 bg-[#231B15] text-[#D4AF37] font-serif text-xs font-bold uppercase rounded-xl hover:bg-black transition cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Billing Details & Additional Information (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Billing Details Section */}
            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-4">
                <User className="w-5 h-5 text-[#B8860B]" />
                <h2 className="font-serif text-xl font-bold text-[#231B15]">
                  Billing Details
                </h2>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-bold mb-1">Please fix the required fields before submitting:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs font-serif">
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div id="field-firstName">
                    <label className="block font-bold text-[#231B15] mb-1.5">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                      }}
                      placeholder="e.g. Yared"
                      className={`w-full p-3 rounded-xl border bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition ${
                        errors.firstName ? 'border-red-500 bg-red-50/30' : 'border-[#E5DFD3]'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-600 text-[11px] mt-1 font-sans">{errors.firstName}</p>}
                  </div>

                  <div id="field-lastName">
                    <label className="block font-bold text-[#231B15] mb-1.5">
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                      }}
                      placeholder="e.g. Tassew"
                      className={`w-full p-3 rounded-xl border bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition ${
                        errors.lastName ? 'border-red-500 bg-red-50/30' : 'border-[#E5DFD3]'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-600 text-[11px] mt-1 font-sans">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Company Name (optional) */}
                <div>
                  <label className="block font-bold text-[#231B15] mb-1.5">
                    Company Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Addis Ababa Enterprise"
                    className="w-full p-3 rounded-xl border border-[#E5DFD3] bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition"
                  />
                </div>

                {/* Country / Region */}
                <div>
                  <label className="block font-bold text-[#231B15] mb-1.5">
                    Country / Region <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5DFD3] bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition cursor-pointer"
                  >
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>

                {/* Street Address */}
                <div id="field-address">
                  <label className="block font-bold text-[#231B15] mb-1.5">
                    Street Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                    }}
                    placeholder="House number and street name"
                    className={`w-full p-3 rounded-xl border bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition ${
                      errors.address ? 'border-red-500 bg-red-50/30' : 'border-[#E5DFD3]'
                    }`}
                  />
                  {errors.address && <p className="text-red-600 text-[11px] mt-1 font-sans">{errors.address}</p>}
                </div>

                {/* Apartment, Suite, Unit */}
                <div>
                  <label className="block font-bold text-[#231B15] mb-1.5">
                    Apartment, suite, unit, etc. <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full p-3 rounded-xl border border-[#E5DFD3] bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition"
                  />
                </div>

                {/* Town / City & Postcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div id="field-city">
                    <label className="block font-bold text-[#231B15] mb-1.5">
                      Town / City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                      }}
                      placeholder="e.g. Addis Ababa"
                      className={`w-full p-3 rounded-xl border bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition ${
                        errors.city ? 'border-red-500 bg-red-50/30' : 'border-[#E5DFD3]'
                      }`}
                    />
                    {errors.city && <p className="text-red-600 text-[11px] mt-1 font-sans">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-[#231B15] mb-1.5">
                      Postcode / ZIP <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full p-3 rounded-xl border border-[#E5DFD3] bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div id="field-phone">
                    <label className="block font-bold text-[#231B15] mb-1.5">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      placeholder="e.g. +251 91 123 4567"
                      className={`w-full p-3 rounded-xl border bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition ${
                        errors.phone ? 'border-red-500 bg-red-50/30' : 'border-[#E5DFD3]'
                      }`}
                    />
                    {errors.phone && <p className="text-red-600 text-[11px] mt-1 font-sans">{errors.phone}</p>}
                  </div>

                  <div id="field-email">
                    <label className="block font-bold text-[#231B15] mb-1.5">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="e.g. yared@example.com"
                      className={`w-full p-3 rounded-xl border bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition ${
                        errors.email ? 'border-red-500 bg-red-50/30' : 'border-[#E5DFD3]'
                      }`}
                    />
                    {errors.email && <p className="text-red-600 text-[11px] mt-1 font-sans">{errors.email}</p>}
                  </div>
                </div>

              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-4">
                <FileText className="w-5 h-5 text-[#B8860B]" />
                <h2 className="font-serif text-xl font-bold text-[#231B15]">
                  Additional Information
                </h2>
              </div>

              <div>
                <label className="block font-serif font-bold text-[#231B15] mb-1.5 text-xs">
                  Order Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery, preferred delivery time, or custom fitting requests."
                  className="w-full p-3 rounded-xl border border-[#E5DFD3] bg-white font-sans text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none transition resize-y"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Payment Method (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-24">
              
              <h2 className="font-serif text-xl font-bold text-[#231B15] border-b border-[#E5DFD3] pb-4 flex items-center justify-between">
                <span>Your Order</span>
                <span className="text-xs font-sans font-normal text-gray-500">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </h2>

              {/* Product List Table */}
              <div className="space-y-3 divide-y divide-[#E5DFD3] max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => {
                  const itemTotal = item.product.priceUSD * item.quantity;
                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-12 h-14 object-cover rounded-lg border border-[#E5DFD3] bg-amber-50 shrink-0"
                        />
                        <div>
                          <p className="font-serif font-bold text-[#231B15] line-clamp-1">{item.product.name}</p>
                          <p className="text-[11px] text-gray-500 font-sans">
                            Qty: <span className="font-medium text-black">{item.quantity}</span> | {item.selectedSize}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-[#231B15] shrink-0 space-y-0.5">
                        {item.product.originalPriceUSD && item.product.originalPriceUSD > item.product.priceUSD && (
                          <div className="text-[10px] text-gray-400 line-through">
                            ETB {(item.product.originalPriceUSD * item.quantity).toLocaleString()}
                          </div>
                        )}
                        <div>
                          ETB {itemTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal & Total Calculations */}
              <div className="border-t border-[#E5DFD3] pt-4 space-y-2 text-xs font-serif">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#231B15]">
                    {totalSavingsETB > 0 ? (
                      <span className="space-x-1.5">
                        <span className="line-through text-gray-400 font-normal">ETB {originalSubtotalETB.toLocaleString()}</span>
                        <span>ETB {subtotalETB.toLocaleString()}</span>
                      </span>
                    ) : `ETB ${subtotalETB.toLocaleString()}`}
                  </span>
                </div>

                {totalSavingsETB > 0 && (
                  <div className="flex justify-between text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                    <span className="flex items-center gap-1.5 font-semibold">
                      🏷️ <span>Total Saved (Discounts)</span>
                    </span>
                    <span className="font-bold">- ETB {totalSavingsETB.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700 items-center">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                    <Truck className="w-3.5 h-3.5" /> Free Delivery (Ethiopia)
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#231B15] pt-3 border-t border-[#E5DFD3]">
                  <span>Total</span>
                  <span className="text-[#B8860B]">ETB {totalETB.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#231B15] hover:bg-black text-[#D4AF37] font-serif text-sm font-bold uppercase tracking-widest rounded-2xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <span>&bull;</span>
                    <span>ETB {totalETB.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* Security & Guarantees */}
              <div className="pt-2 text-center text-[11px] text-gray-500 font-sans space-y-1">
                <p className="flex items-center justify-center gap-1.5 font-medium text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Guaranteed Handwoven Quality</span>
                </p>
                <p>Fast & secure courier dispatch across Addis Ababa & regional Ethiopia.</p>
              </div>

            </div>

          </div>

        </form>
      )}

    </div>
  );
};
