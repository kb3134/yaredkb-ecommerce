import React, { useState } from 'react';
import { Share2, Instagram, Facebook, Send, Phone, MessageSquare, Search, X } from 'lucide-react';

export const FollowUsSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const socialChannels = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@yared_tibeb',
      link: 'https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==',
      icon: <Instagram className="w-5 h-5" />
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: 'Yared Tibeb',
      link: 'https://www.facebook.com/share/1FvXdXCEnC/',
      icon: <Facebook className="w-5 h-5" />
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: '@yared_tibeb_',
      link: 'https://www.tiktok.com/@yared_tibeb_',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V9.05a8.16 8.16 0 0 0 4.92 1.62V7.22a4.79 4.79 0 0 1-1-.53z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: '+251 92 309 5380',
      link: 'https://wa.me/251923095380',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.283-1.385c1.45.792 3.09 1.21 4.782 1.21 5.508 0 9.988-4.478 9.988-9.984 0-2.668-1.039-5.176-2.927-7.062a9.922 9.922 0 0 0-7.054-2.912zm5.727 14.184c-.242.684-1.2 1.252-1.956 1.416-.52.112-1.2.202-3.486-.745-2.926-1.21-4.81-4.186-4.957-4.382-.144-.196-1.192-1.587-1.192-3.028 0-1.44.755-2.152 1.026-2.441.272-.288.594-.36.792-.36.198 0 .396.002.568.01.182.008.428-.069.67.512.242.58.825 2.015.897 2.16.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.301-.126.589.168.288.748 1.237 1.605 2.002 1.103.983 2.034 1.288 2.322 1.432.288.144.456.12.624-.072.168-.192.72-.84.912-1.128.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.696-.17 1.38z"/>
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      handle: 'Direct Channel',
      link: 'https://t.me/+251923095380',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    },
    {
      id: 'phone',
      name: 'Call Us',
      handle: '+251 92 309 5380',
      link: 'tel:+251923095380',
      icon: <Phone className="w-5 h-5" />
    }
  ];

  const filteredChannels = socialChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="w-full bg-[#120E0C] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Outer Frame with Gold Border */}
        <div className="bg-[#1B1511] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Top Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 text-[#D4AF37]">
                <Share2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-50">
                  Follow Us On Social Media
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed pl-7 sm:pl-8">
                Stay connected with Yared Tibeb for new collections, live runway showcases, and custom tailoring consultations.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full bg-black/60 border border-[#D4AF37]/40 rounded-xl pl-9 pr-8 py-2 text-xs font-serif text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-[#D4AF37] transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Divider Line */}
          <div className="border-b border-[#D4AF37]/20 w-full" />

          {/* 6 Social Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#16110D] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-4 sm:p-5 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D4AF37]/10"
                >
                  {/* Circular Icon Container */}
                  <div className="w-11 h-11 rounded-full border border-[#D4AF37]/50 bg-black/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#120E0C] transition-all duration-300 mb-3 shadow-xs">
                    {channel.icon}
                  </div>

                  {/* Name */}
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {channel.name}
                  </h4>

                  {/* Handle / Subtitle */}
                  <p className="text-[10px] sm:text-[11px] text-gray-400 group-hover:text-amber-100 transition-colors mt-0.5 font-sans truncate max-w-full">
                    {channel.handle}
                  </p>
                </a>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-400 text-xs font-serif italic">
                No matching social channels found for "{searchQuery}".
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
