export type Currency = 'ETB';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  rateToUSD: number;
  rateScreenshotUrl?: string;
  rateUpdatedAt?: string;
}

export type Category = 
  | 'all'
  | 'wedding'
  | 'mens'
  | 'holiday'
  | 'family'
  | 'baby'
  | 'formal'
  | 'Wedding'
  | 'Men\'s'
  | 'Holiday'
  | 'Family'
  | 'Baby'
  | 'Formal'
  | 'Accessory'
  | 'Jewelry'
  | 'Kids Cloth'
  | 'Modern Traditional Dress'
  | 'Oromia Traditional Dress'
  | 'Scarves'
  | 'Traditional Wedding Dress'
  | 'Women Traditional Dress'
  | 'kemis-gowns'
  | 'royal-menswear'
  | string;

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  telegram: string;
}

export interface BrandingImages {
  logoUrl: string;
  officialLogoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  heroBannerUrl: string;
  heroSecondaryUrl: string;
  heroTertiaryUrl?: string;
  aboutUsUrl: string;
  craftsmanshipUrl: string;
  promotionalBannerUrl: string;
  lookbookUrls?: string[];
  socialLinks?: SocialLinks;
  heroBannerBadge?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  heroSecondaryBadge?: string;
  heroSecondaryTitle?: string;
  heroSecondarySubtitle?: string;
  heroTertiaryBadge?: string;
  heroTertiaryTitle?: string;
  heroTertiarySubtitle?: string;
}

export interface Product {
  id: string;
  name: string;
  amharicName?: string;
  category: Category;
  collections?: string[];
  priceUSD: number;
  originalPriceUSD?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBespokeAvailable?: boolean;
  tibebPattern: string;
  fabric: string;
  weaverRegion: string;
  images: string[];
  description: string;
  details: string[];
  sizes: string[];
  colors: string[];
  weavingDays: number;
  studioCategory?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  customMeasurements?: {
    bustChest?: string;
    waist?: string;
    hips?: string;
    heightLength?: string;
    notes?: string;
  };
}

export interface BespokeRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  garmentType: string;
  fabricGrade: 'Superfine Hand-spun Cotton' | 'Royal Silk Blend' | 'Heavy Gold Thread Shemma';
  tibebPatternColor: string;
  measurements: {
    bustChest: string;
    waist: string;
    hips: string;
    shoulderToFloor: string;
    sleeveLength: string;
  };
  eventDate?: string;
  specialNotes?: string;
  status: 'Pending Review' | 'Artisan Assigned' | 'In Loom Weaving' | 'Final Tailoring' | 'Ready for Dispatch' | 'Completed';
  createdAt: string;
  estimatedCompletion: string;
  assignedWeaverId?: string;
}

export interface Weaver {
  id: string;
  name: string;
  amharicTitle?: string;
  region: string;
  experienceYears: number;
  specialty: string;
  activeLooms: number;
  rating: number;
  photoUrl: string;
  bio: string;
}

export interface Order {
  id: string;
  firstName?: string;
  lastName?: string;
  customerName: string;
  email: string;
  phone: string;
  companyName?: string;
  address: string;
  apartment?: string;
  city: string;
  postcode?: string;
  country: string;
  orderNotes?: string;
  items: CartItem[];
  totalUSD: number;
  currency: Currency;
  totalInCurrency: number;
  paymentMethod: 'TeleBirr' | 'CBE Birr' | 'Credit Card' | 'Wire Transfer' | 'TeleBirr / CBE Birr' | string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled' | 'Received' | 'In Loom Weaving' | 'Quality Control' | 'Shipped' | 'Delivered' | string;
  createdAt: string;
  trackingNumber?: string;
}

export interface AdminAnalytics {
  totalRevenueUSD: number;
  totalOrders: number;
  pendingBespoke: number;
  activeWeaversCount: number;
  recentOrders: Order[];
  topCategories: { category: string; salesCount: number; revenueUSD: number }[];
  weeklyRevenue: { day: string; amountUSD: number }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface ContactMessage {
  id: string;
  fullName: string;
  subject: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface StudioCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface StudioImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[]; // e.g. ['wedding', 'womens']
  tags: string[]; // e.g. ['habesha', 'gold-thread', 'bride']
  isFeatured: boolean;
  isHidden: boolean; // if true, hidden from customer gallery
  orderIndex: number;
  createdAt: string;
  productIds?: string[]; // linked store products
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Super Admin' | 'Store Manager' | 'Inventory Specialist' | 'Customer Support';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
  securityQuestion?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  destination: 'collection' | 'studio' | 'liveshow' | 'branding' | 'bespoke' | 'general' | string;
  associatedId?: string;
  associatedTitle?: string;
  uploadedAt: string;
  uploadedBy?: string;
  provider?: 'cloudinary' | 's3' | 'r2' | 'local' | string;
  publicId?: string;
}

export interface StorageConfig {
  provider: 'cloudinary' | 's3' | 'r2' | 'local';
  isCloudReady: boolean;
  providerName: string;
  bucketOrCloudName: string;
  region?: string;
  customPublicUrl?: string;
  folder: string;
}


