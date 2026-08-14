import React from 'react';
import { MapPin, Mail, Phone, Instagram, Facebook, Send, MessageSquare, ShieldCheck, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, logoUrl }) => {
  return (
    <footer className="bg-[#0D0A08] text-amber-50 border-t border-[#D4AF37]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-xl border border-[#D4AF37] bg-white p-0.5 shrink-0 shadow-sm" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-[#FFFDF7] via-[#FAF5EA] to-[#F5EEDC] rounded-xl flex items-center justify-center border-2 border-[#D4AF37] shadow-sm shrink-0">
                  <Shield className="w-5 h-5 text-[#B58E22]" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-xl font-bold tracking-wider text-white">YARED</span>
                  <span className="text-[#D4AF37] font-serif text-sm">❖</span>
                  <span className="font-serif text-xl font-bold tracking-wider text-[#D4AF37]">TIBEB</span>
                </div>
                <p className="text-[9px] tracking-[0.22em] uppercase text-gray-400">
                  ADDIS ABABA · LUXURY HERITAGE
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              The premier destination for authentic Ethiopian traditional fashion, luxury Habesha dresses, tailored Tibeb suits, and heirloom bridal ensembles.
            </p>

            <a 
              href="https://yaredtibeb.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-xs font-bold font-serif tracking-widest text-[#D4AF37] uppercase hover:underline"
            >
              YAREDTIBEB.COM
            </a>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              EXPLORE ATELIER
            </h4>
            <ul className="text-xs space-y-2 text-gray-300 font-sans">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('home')} 
                  className="hover:text-[#D4AF37] transition"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('collections')} 
                  className="hover:text-[#D4AF37] transition"
                >
                  Collection
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('about')} 
                  className="hover:text-[#D4AF37] transition"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('studio')} 
                  className="hover:text-[#D4AF37] transition"
                >
                  Studio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('contact')} 
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a 
                  href="/admin" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/admin');
                    if (onNavigate) onNavigate('admin');
                  }}
                  className="text-amber-400 hover:text-[#D4AF37] transition flex items-center gap-1.5 font-medium cursor-pointer pt-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Admin Portal (/admin)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Studio & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              STUDIO & CONTACT
            </h4>
            <ul className="text-xs space-y-2.5 text-gray-300 font-sans">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>22, Bedria City Mall, Ground Floor, No. 14, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href="tel:+251923095380" className="hover:text-[#D4AF37] transition">+251 92 309 5380</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href="mailto:info@yaredtibeb.com" className="hover:text-[#D4AF37] transition">info@yaredtibeb.com</a>
              </li>
            </ul>
          </div>

          {/* Social & Direct Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              SOCIAL & CONTACT
            </h4>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a href="https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==" target="_blank" rel="noreferrer" title="Instagram (@yared_tibeb)" className="w-8 h-8 rounded-full bg-[#1F1915] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#120E0C] transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/share/1FvXdXCEnC/" target="_blank" rel="noreferrer" title="Facebook" className="w-8 h-8 rounded-full bg-[#1F1915] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#120E0C] transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@yared_tibeb_" target="_blank" rel="noreferrer" title="TikTok (@yared_tibeb_)" className="w-8 h-8 rounded-full bg-[#1F1915] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#120E0C] transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V9.05a8.16 8.16 0 0 0 4.92 1.62V7.22a4.79 4.79 0 0 1-1-.53z"/>
                </svg>
              </a>
              <a href="https://wa.me/251923095380" target="_blank" rel="noreferrer" title="WhatsApp (+251 92 309 5380)" className="w-8 h-8 rounded-full bg-[#1F1915] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#120E0C] transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.283-1.385c1.45.792 3.09 1.21 4.782 1.21 5.508 0 9.988-4.478 9.988-9.984 0-2.668-1.039-5.176-2.927-7.062a9.922 9.922 0 0 0-7.054-2.912zm5.727 14.184c-.242.684-1.2 1.252-1.956 1.416-.52.112-1.2.202-3.486-.745-2.926-1.21-4.81-4.186-4.957-4.382-.144-.196-1.192-1.587-1.192-3.028 0-1.44.755-2.152 1.026-2.441.272-.288.594-.36.792-.36.198 0 .396.002.568.01.182.008.428-.069.67.512.242.58.825 2.015.897 2.16.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.301-.126.589.168.288.748 1.237 1.605 2.002 1.103.983 2.034 1.288 2.322 1.432.288.144.456.12.624-.072.168-.192.72-.84.912-1.128.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.696-.17 1.38z"/>
                </svg>
              </a>
              <a href="https://t.me/+251923095380" target="_blank" rel="noreferrer" title="Telegram (+251 92 309 5380)" className="w-8 h-8 rounded-full bg-[#1F1915] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#120E0C] transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="tel:+251923095380" title="Call Us (+251 92 309 5380)" className="w-8 h-8 rounded-full bg-[#1F1915] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#120E0C] transition">
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-gray-400 font-sans pt-2">
              Direct worldwide insured shipping via DHL Express.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-sans gap-4">
          <p>© 2026 YARED TIBEB. All Rights Reserved. Addis Ababa, Ethiopia.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Privilege Terms</span>
            <span>DHL Insured Worldwide</span>
            <span>Fair Trade Loom Certified</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
