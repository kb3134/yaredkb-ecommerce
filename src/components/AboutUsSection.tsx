import React from 'react';
import { Eye, Target } from 'lucide-react';
import { SocialLinks } from '../types';
import { HABESHA_KEMIS_IMAGE } from '../data/constants';

interface AboutUsSectionProps {
  aboutUsUrl?: string;
  socialLinks?: SocialLinks;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ aboutUsUrl, socialLinks }) => {
  const activeImage = aboutUsUrl || HABESHA_KEMIS_IMAGE;

  const links = {
    facebook: socialLinks?.facebook || 'https://www.facebook.com/share/1FvXdXCEnC/',
    instagram: socialLinks?.instagram || 'https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==',
    tiktok: socialLinks?.tiktok || 'https://www.tiktok.com/@yared_tibeb_',
    telegram: socialLinks?.telegram || 'https://t.me/+251923095380',
  };

  return (
    <section className="bg-[#0D0A08] text-white py-16 lg:py-24 border-t border-b border-[#D4AF37]/30 relative overflow-hidden">
      
      {/* Background Subtle Accent Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <p className="text-xs font-serif uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            Timeless Tradition, Modern Luxury
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-amber-50">
            About Us — Yared Tibeb
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-2" />
        </div>

        {/* Brand Narrative & Image Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Feature Image with Overlay */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl group">
              <img
                src={activeImage}
                alt="Yared Tibeb Master Artisanal Embroidery"
                referrerPolicy="no-referrer"
                className="w-full h-[450px] lg:h-[520px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#1A1817]/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/30">
                <h4 className="font-serif text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Master Detail & Precision Stitching
                </h4>
                <p className="text-[11px] text-gray-300 font-sans mt-1 leading-relaxed">
                  Fine woven fabrics (menen), premium threads (fetil), and intricate hand embroidery.
                </p>
              </div>
            </div>
          </div>

          {/* Right Brand Narrative & Vision/Mission */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37]">
                Welcome to Yared Tibeb!
              </h3>
              <p className="font-serif text-base text-amber-100/95 italic font-medium leading-relaxed">
                We bring the timeless beauty of traditional Ethiopian artistry into the modern wardrobe.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-sans">
                Every Yared Tibeb garment is a masterclass in detail—crafted from fine woven fabrics (menen), premium threads (fetil), and brought to life through intricate hand embroidery and precision Singer stitching. We create high-quality, statement cultural attire that lets you celebrate your heritage with elegance, no matter where you are in the world.
              </p>
            </div>

            {/* Vision & Mission Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Vision Card */}
              <div className="p-6 bg-[#1F1915] border border-[#D4AF37]/30 rounded-2xl space-y-3 hover:border-[#D4AF37] transition shadow-md group">
                <div className="flex items-center gap-2.5 text-[#D4AF37]">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/20 transition">
                    <Eye className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-amber-50">Our Vision</h4>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  To be recognized internationally as a premier Ethiopian luxury brand, celebrated for the seamless union of cultural heritage and contemporary design.
                </p>
              </div>

              {/* Mission Card */}
              <div className="p-6 bg-[#1F1915] border border-[#D4AF37]/30 rounded-2xl space-y-3 hover:border-[#D4AF37] transition shadow-md group">
                <div className="flex items-center gap-2.5 text-[#D4AF37]">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/20 transition">
                    <Target className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-amber-50">Our Mission</h4>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  To safeguard Ethiopia's artistic lineage by integrating time-honored handcrafting traditions with refined modern tailoring, ensuring our heritage endures across generations.
                </p>
              </div>

            </div>

          </div>

        </div>





      </div>
    </section>
  );
};
