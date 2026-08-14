import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      quote: "The Royal Axumite Zuria Kemis surpassed all my expectations for my sister's wedding in Washington DC. The weight of the Shemma and the sparkle of the gold Tibeb threads are breathtaking. Truly heirloom quality!",
      author: "Bethlehem Tassew",
      purchase: "Verified Purchase: Royal Axumite Zuria Kemis",
      stars: 5,
    },
    {
      id: 2,
      quote: "Ordering from Yared Tibeb was seamless. The Emperor's Tibeb Suit fit perfectly out of the box. You can feel the decades of artisan craftsmanship in every stitch of the Tilf embroidery.",
      author: "Dr. Yosef Alemu",
      purchase: "Verified Purchase: Emperor's Tibeb Suit & Netela",
      stars: 5,
    },
    {
      id: 3,
      quote: "YARED TIBEB brings authentic Habesha luxury to the global stage. The Enkutatash dress felt comfortable yet extremely elegant. Highly recommend!",
      author: "Saba Hailu",
      purchase: "Verified Purchase: Enkutatash Gold Heritage Dress",
      stars: 5,
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-24 border-t border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2.5">
          <p className="text-xs font-serif uppercase tracking-[0.25em] text-[#A88020] font-extrabold">
            GLOBAL CUSTOMER ACCLAIM
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#110D0A] tracking-tight">
            Voices of Heritage
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2" />
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-[#E3D6BC] hover:border-[#C59B27] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1.5">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#F5A623] text-[#F5A623] drop-shadow-xs" />
                  ))}
                </div>

                {/* Quote with Enhanced Bold Typography */}
                <p className="font-serif text-[15px] sm:text-base text-[#181310] leading-relaxed font-semibold">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="border-t-2 border-[#F0E6D2] pt-4.5">
                <h4 className="font-serif text-base sm:text-[17px] font-extrabold text-[#110D0A] tracking-wide">
                  {item.author}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
