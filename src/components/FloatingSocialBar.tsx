import React, { useState } from 'react';

export const FloatingSocialBar: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const socialLinks = [
    {
      id: 'instagram',
      label: 'INSTAGRAM',
      href: 'https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==',
      title: 'Instagram (@yared_tibeb)',
      hoverBg: 'hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCB045] hover:text-white hover:border-transparent',
      activeBg: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      )
    },
    {
      id: 'facebook',
      label: 'FACEBOOK',
      href: 'https://www.facebook.com/share/1FvXdXCEnC/',
      title: 'Facebook (Yared Tibeb)',
      hoverBg: 'hover:bg-[#1877F2] hover:text-white hover:border-transparent',
      activeBg: 'bg-[#1877F2] text-white border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'tiktok',
      label: 'TIKTOK',
      href: 'https://www.tiktok.com/@yared_tibeb_',
      title: 'TikTok (@yared_tibeb_)',
      hoverBg: 'hover:bg-[#000000] hover:text-white hover:border-[#D4AF37]',
      activeBg: 'bg-[#000000] text-white border-[#D4AF37]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V9.05a8.16 8.16 0 0 0 4.92 1.62V7.22a4.79 4.79 0 0 1-1-.53z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      label: 'WHATSAPP',
      href: 'https://wa.me/251923095380',
      title: 'WhatsApp (+251 92 309 5380)',
      hoverBg: 'hover:bg-[#25D366] hover:text-white hover:border-transparent',
      activeBg: 'bg-[#25D366] text-white border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.283-1.385c1.45.792 3.09 1.21 4.782 1.21 5.508 0 9.988-4.478 9.988-9.984 0-2.668-1.039-5.176-2.927-7.062a9.922 9.922 0 0 0-7.054-2.912zm5.727 14.184c-.242.684-1.2 1.252-1.956 1.416-.52.112-1.2.202-3.486-.745-2.926-1.21-4.81-4.186-4.957-4.382-.144-.196-1.192-1.587-1.192-3.028 0-1.44.755-2.152 1.026-2.441.272-.288.594-.36.792-.36.198 0 .396.002.568.01.182.008.428-.069.67.512.242.58.825 2.015.897 2.16.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.301-.126.589.168.288.748 1.237 1.605 2.002 1.103.983 2.034 1.288 2.322 1.432.288.144.456.12.624-.072.168-.192.72-.84.912-1.128.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.696-.17 1.38z"/>
        </svg>
      )
    },
    {
      id: 'telegram',
      label: 'TELEGRAM',
      href: 'https://t.me/+251923095380',
      title: 'Telegram (+251 92 309 5380)',
      hoverBg: 'hover:bg-[#229ED9] hover:text-white hover:border-transparent',
      activeBg: 'bg-[#229ED9] text-white border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    },
    {
      id: 'call',
      label: 'CALL STUDIO',
      href: 'tel:+251923095380',
      title: 'Call Studio Concierge (+251 92 309 5380)',
      hoverBg: 'hover:bg-[#0F766E] hover:text-white hover:border-transparent',
      activeBg: 'bg-[#0F766E] text-white border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      )
    }
  ];

  const handleItemClick = (e: React.MouseEvent, item: typeof socialLinks[0]) => {
    // If not expanded, expand this single item first on click
    if (expandedId !== item.id) {
      e.preventDefault();
      setExpandedId(item.id);
    } else {
      // If already expanded, let the default link click open the URL
      // and reset expanded state
      setExpandedId(null);
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2.5 p-1.5 pointer-events-none">
      {socialLinks.map((item) => {
        const isExpanded = expandedId === item.id;

        return (
          <div 
            key={item.id}
            className="pointer-events-auto relative flex items-center justify-end"
            onMouseEnter={() => setExpandedId(item.id)}
            onMouseLeave={() => setExpandedId(null)}
          >
            <a
              href={item.href}
              target={item.id === 'call' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              title={item.title}
              onClick={(e) => handleItemClick(e, item)}
              className={`flex items-center justify-between rounded-l-xl font-serif font-bold text-xs tracking-wider transition-all duration-300 ease-in-out border border-[#D4AF37]/50 shadow-xl cursor-pointer ${
                isExpanded 
                  ? `w-44 sm:w-48 px-3 py-2.5 ${item.activeBg}` 
                  : `w-11 h-11 p-2.5 justify-center bg-[#181310]/95 backdrop-blur-md text-[#D4AF37] ${item.hoverBg}`
              }`}
            >
              {isExpanded && (
                <span className="font-serif font-bold text-[11px] sm:text-xs uppercase tracking-widest text-left truncate mr-2 whitespace-nowrap animate-fadeIn">
                  {item.label}
                </span>
              )}
              
              <div className="shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
};


