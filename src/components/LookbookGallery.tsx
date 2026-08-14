import React from 'react';
import { LOOKBOOK_HOTSPOTS } from '../data/mockData';
import { Product, Currency } from '../types';
import { Sparkles, ArrowRight, Eye, ShoppingBag } from 'lucide-react';

interface LookbookGalleryProps {
  currency: Currency;
  onQuickViewProduct: (p: Product) => void;
  lookbookUrls?: string[];
}

export const LookbookGallery: React.FC<LookbookGalleryProps> = () => {
  return null;
};
