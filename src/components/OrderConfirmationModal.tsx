import React from 'react';
import { Order } from '../types';
import { CheckCircle2, X, ArrowLeft } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onContinueShopping?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onContinueShopping,
}) => {
  if (!order) return null;

  const handleContinue = () => {
    onClose();
    if (onContinueShopping) {
      onContinueShopping();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#FAF6EC] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37] relative my-auto space-y-6 text-[#231B15]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200/80 hover:bg-[#231B15] hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Seal & Header */}
        <div className="text-center space-y-4 pt-2">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231B15]">
              ✅ Thank You for Your Order!
            </h2>
            <p className="font-serif text-base sm:text-lg font-semibold text-emerald-800">
              Your order has been confirmed successfully.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed">
              Thank you for shopping with <strong className="text-[#231B15]">YARED TIBEB</strong>. We have received your order and will process it as soon as possible.
            </p>
          </div>
        </div>

        {/* Order Details Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-5 rounded-2xl border border-[#E5DFD3] text-xs font-serif shadow-xs">
          <div className="p-3 bg-[#FAF6EC]/60 rounded-xl border border-[#E5DFD3] space-y-1">
            <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Order Number</span>
            <span className="font-mono font-bold text-[#231B15] text-sm">{order.id}</span>
          </div>

          <div className="p-3 bg-[#FAF6EC]/60 rounded-xl border border-[#E5DFD3] space-y-1">
            <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Order Date</span>
            <span className="font-bold text-[#231B15] text-sm">{order.createdAt}</span>
          </div>

          <div className="p-3 bg-[#FAF6EC]/60 rounded-xl border border-[#E5DFD3] space-y-1">
            <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Total Amount</span>
            <span className="font-bold text-[#B8860B] text-sm">ETB {order.totalInCurrency.toLocaleString()}</span>
          </div>

          <div className="p-3 bg-[#FAF6EC]/60 rounded-xl border border-[#E5DFD3] space-y-1">
            <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider block">Order Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </span>
          </div>
        </div>

        {/* Footer Contact Details Block */}
        <div className="border-t border-[#E5DFD3] pt-5 space-y-3 text-center">
          <h3 className="font-serif font-bold text-base tracking-widest text-[#231B15] uppercase">
            YARED TIBEB
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-700 font-sans">
            <span>📍 <strong>Address:</strong> Churchill Avenue, Bole Sub-City, Addis Ababa, Ethiopia</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>📞 <strong>Phone:</strong> <a href="tel:+251923095380" className="underline hover:text-[#B8860B]">+251 92 309 5380</a></span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>✉️ <strong>Email:</strong> contact@yaredtibeb.com</span>
          </div>

          <div className="pt-3">
            <button
              onClick={handleContinue}
              className="w-full py-3.5 bg-[#231B15] hover:bg-black text-[#D4AF37] font-serif text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

