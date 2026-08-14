import { Weaver, CurrencyRate, BrandingImages, StudioCategory } from '../types';

export const CURRENCY_RATES: Record<string, CurrencyRate> = {
  ETB: { code: 'ETB', symbol: 'ETB ', rateToUSD: 1 },
};

// Relative paths to our generated high-res luxury Ethiopian fashion hero images
export const HERO_IMAGE_PRIMARY = '/src/assets/images/ethiopian_luxury_hero_1785390172994.jpg';
export const HERO_IMAGE_CAMPAIGN = '/src/assets/images/ethiopian_couture_campaign_1785390186014.jpg';
export const HABESHA_KEMIS_IMAGE = '/src/assets/images/ethiopian_habesha_kemis_1785527313511.jpg';
export const MENS_ATTIRE_IMAGE = '/src/assets/images/ethiopian_mens_attire_1785527326767.jpg';
export const BRIDAL_COUTURE_IMAGE = '/src/assets/images/ethiopian_bridal_couture_1785527342813.jpg';
export const OROMO_DRESS_IMAGE = '/src/assets/images/ethiopian_oromo_dress_1785527355539.jpg';

export const GOLD_JEWELRY_IMAGE = '/src/assets/images/ethiopian_gold_jewelry_1785752459004.jpg';
export const FAMILY_KEMIS_IMAGE = '/src/assets/images/ethiopian_family_kemis_1785752474519.jpg';
export const NETELA_SCARF_IMAGE = '/src/assets/images/ethiopian_netela_scarf_1785752485820.jpg';

export const DEFAULT_LOGO_IMAGE = '/src/assets/images/yared_official_logo_1786147555847.jpg';

export const DEFAULT_BRANDING_IMAGES: BrandingImages = {
  logoUrl: '/api/uploads/brand-logo.jpg',
  officialLogoUrl: '/api/uploads/brand-logo.jpg',
  footerLogoUrl: '/api/uploads/brand-logo.jpg',
  faviconUrl: '/api/uploads/brand-favicon.png',
  heroBannerUrl: '/api/uploads/hero-primary.jpg',
  heroSecondaryUrl: '/api/uploads/hero-secondary.jpg',
  heroTertiaryUrl: '/api/uploads/hero-tertiary.jpg',
  aboutUsUrl: '/api/uploads/about-us.jpg',
  craftsmanshipUrl: '',
  promotionalBannerUrl: '',
  lookbookUrls: [
    '/api/uploads/lookbook-1.jpg',
    '/api/uploads/lookbook-2.jpg',
    '/api/uploads/lookbook-3.jpg',
    '/api/uploads/lookbook-4.jpg'
  ],
  socialLinks: {
    facebook: 'https://www.facebook.com/share/1FvXdXCEnC/',
    instagram: 'https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==',
    tiktok: 'https://www.tiktok.com/@yared_tibeb_',
    telegram: 'https://t.me/+251923095380'
  },
  heroBannerBadge: '100% ROYAL HERITAGE',
  heroBannerTitle: 'Master Handwoven Shemma',
  heroBannerSubtitle: 'Pure Cotton & Metallic Gold Thread · Addis Ababa Weavers',
  heroSecondaryBadge: 'EMPRESS COUTURE',
  heroSecondaryTitle: 'Royal AXUM Chevron Design',
  heroSecondarySubtitle: 'Hand-embroidered Tibeb Motifs · Custom Atelier Fitting',
  heroTertiaryBadge: 'BESPOKE BRIDAL',
  heroTertiaryTitle: 'Hand-crafted Kemis Gowns',
  heroTertiarySubtitle: '5+ Years of Loom Legacy & Tradition'
};

export const DEFAULT_WEAVERS: Weaver[] = [
  {
    id: 'w-1',
    name: 'Ato Kassahun Tadesse',
    region: 'Shiro Meda, Addis Ababa',
    experienceYears: 32,
    specialty: 'Royal Gold Leaf Tibeb & Axum Geometric Weaving',
    activeLooms: 3,
    rating: 4.98,
    photoUrl: MENS_ATTIRE_IMAGE,
    bio: 'Third-generation master weaver from Chencha, Gamo highlands. Renowned for crafting bespoke royal Kemis for diplomatic banquets and state events.'
  },
  {
    id: 'w-2',
    name: 'Woyzero Genet Tesfaye',
    region: 'Gondar Heritage Atelier',
    experienceYears: 24,
    specialty: 'Silk-Thread Embroidery & Empress Zewditu Motif',
    activeLooms: 2,
    rating: 4.95,
    photoUrl: HABESHA_KEMIS_IMAGE,
    bio: 'Specializes in double-sided hand spinning fine Ethiopian cotton with pure silk accents for luxury wedding attire.'
  },
  {
    id: 'w-3',
    name: 'Ato Yonas Assefa',
    region: 'Dorze Highland Weavers Guild',
    experienceYears: 19,
    specialty: 'Heavy Shemma Draped Kuta & Ceremonial Men Suits',
    activeLooms: 4,
    rating: 4.92,
    photoUrl: HERO_IMAGE_CAMPAIGN,
    bio: 'Pioneer of contemporary Ethiopian menswear, blending traditional Dorze loom textures with sharp Parisian tailoring.'
  }
];

export const LOOKBOOK_HOTSPOTS = [
  {
    id: 'lb-1',
    title: 'Imperial Gala 2026 Collection',
    tagline: 'Hand-loomed in Shiro Meda, worn worldwide.',
    imageUrl: HERO_IMAGE_PRIMARY,
    products: [
      { id: 'prod-001', name: 'Empress Taytu Royal Bridal Kemis', price: 1850, x: 35, y: 45 },
      { id: 'prod-005', name: 'Axumite 24K Gold Filigree Jewelry Set', price: 680, x: 50, y: 30 }
    ]
  },
  {
    id: 'lb-2',
    title: 'The Modern Menswear Atelier',
    tagline: 'Precision tailoring with 3,000 years of Ethiopian heritage.',
    imageUrl: HERO_IMAGE_CAMPAIGN,
    products: [
      { id: 'prod-002', name: 'Emperor Menelik Royal Kuta & Suit', price: 1450, x: 40, y: 50 },
      { id: 'prod-007', name: 'Royal Axum Gold Thread Netela Scarf', price: 380, x: 65, y: 35 }
    ]
  }
];

export const DEFAULT_STUDIO_CATEGORIES: StudioCategory[] = [
  { id: 'sc-wedding', name: 'Wedding', slug: 'wedding', description: 'Royal Habesha bridal and groom wedding attire' },
  { id: 'sc-mens', name: "Men's", slug: 'mens', description: 'Bespoke Men’s Kuta, suits, and ceremonial wear' },
  { id: 'sc-womens', name: "Women's", slug: 'womens', description: 'Handmade luxury Habesha Kemis gowns' },
  { id: 'sc-family', name: 'Family', slug: 'family', description: 'Matching family traditional ensemble sets' },
  { id: 'sc-baby', name: 'Baby', slug: 'baby', description: 'Artisanal traditional wear for children & infants' },
  { id: 'sc-traditional-dresses', name: 'Traditional Dresses', slug: 'traditional-dresses', description: 'Heritage Ethiopian hand-woven dresses & robes' },
  { id: 'sc-modern-traditional', name: 'Modern Traditional Wear', slug: 'modern-traditional-wear', description: 'Contemporary runway Ethiopian fashion blends' },
  { id: 'sc-accessories', name: 'Accessories', slug: 'accessories', description: 'Traditional Meskel crosses, Lemat baskets & leather crafts' },
  { id: 'sc-jewelry', name: 'Jewelry', slug: 'jewelry', description: '24K gold-plated Ethiopian filigree jewelry sets' },
  { id: 'sc-scarves', name: 'Scarves', slug: 'scarves', description: 'Hand-woven Netela and Gabi scarves & shawls' },
  { id: 'sc-cultural-events', name: 'Cultural Events', slug: 'cultural-events', description: 'Enkutatash, Genna, Meskel & Timkat festival couture' },
  { id: 'sc-behind-the-scenes', name: 'Behind the Scenes', slug: 'behind-the-scenes', description: 'Shiro Meda Master Weavers at work on the looms' }
];
