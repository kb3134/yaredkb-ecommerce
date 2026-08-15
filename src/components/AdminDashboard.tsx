import React, { useState, useEffect } from 'react';
import { Product, Order, BespokeRequest, Weaver, AdminAnalytics, BrandingImages, ContactMessage, StudioImage, StudioCategory, AdminUser, CurrencyRate } from '../types';
import { isProductInCollection } from './StudioStoreCatalog';
import { AdminStudioManager } from './AdminStudioManager';
import { AdminAccountsManager } from './AdminAccountsManager';
import { CURRENCY_RATES } from '../data/constants';
import { apiFetch } from '../lib/api';
import { 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  Scissors, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Coins, 
  PackageCheck, 
  BarChart3,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  X,
  Tag,
  Mail,
  MailOpen,
  Search,
  Eye,
  Check,
  Phone,
  Calendar,
  AlertCircle,
  Star,
  Sparkles,
  FolderPlus,
  LogOut,
  Shield,
  Key,
  Database,
  ExternalLink,
  Lock,
  Cloud
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  bespokeRequests: BespokeRequest[];
  weavers: Weaver[];
  analytics: AdminAnalytics | null;
  brandingImages?: BrandingImages;
  contactMessages?: ContactMessage[];
  studioImages?: StudioImage[];
  studioCategories?: StudioCategory[];
  currentAdminUser?: AdminUser | null;
  onLogout?: () => void;
  onAddProduct: (pData: any) => void;

  onUpdateProduct: (id: string, pData: any) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateBespokeStatus: (id: string, status: string, weaverId?: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onUpdateOrder?: (orderId: string, updatedFields: Partial<Order>) => void;
  onUpdateBranding?: (updated: Partial<BrandingImages>) => void;
  onToggleReadMessage?: (id: string, read: boolean) => void;
  onDeleteMessage?: (id: string) => void;
  onAddStudioImage?: (imgData: Omit<StudioImage, 'id' | 'createdAt'>) => Promise<boolean>;
  onEditStudioImage?: (id: string, imgData: Partial<StudioImage>) => Promise<boolean>;
  onDeleteStudioImage?: (id: string) => Promise<boolean>;
  onAddStudioCategory?: (catData: { name: string; description?: string }) => Promise<boolean>;
  onEditStudioCategory?: (id: string, catData: { name: string; description?: string }) => Promise<boolean>;
  onDeleteStudioCategory?: (id: string) => Promise<boolean>;
  onReorderStudioImages?: (items: { id: string; orderIndex: number }[]) => Promise<boolean>;
  onRefreshOrders?: () => void;
  onBackToStorefront?: () => void;
  addToast?: (title: string, description?: string) => void;
  currencyRates?: Record<string, CurrencyRate>;
  onUpdateCurrencyRates?: (rates: Record<string, CurrencyRate>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  bespokeRequests,
  weavers,
  analytics,
  brandingImages,
  contactMessages = [],
  studioImages = [],
  studioCategories = [],
  currentAdminUser,
  onLogout,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateBespokeStatus,
  onUpdateOrderStatus,
  onUpdateOrder,
  onUpdateBranding,
  onToggleReadMessage,
  onDeleteMessage,
  onAddStudioImage,
  onEditStudioImage,
  onDeleteStudioImage,
  onAddStudioCategory,
  onEditStudioCategory,
  onDeleteStudioCategory,
  onReorderStudioImages,
  onRefreshOrders,
  onBackToStorefront,
  addToast = (title: string, description?: string) => {},
  currencyRates,
  onUpdateCurrencyRates,
}) => {
  const [adminTab, setAdminTab] = useState<'analytics' | 'branding' | 'studio' | 'products' | 'orders' | 'messages' | 'users' | 'currency'>('products');
  const [msgSearchQuery, setMsgSearchQuery] = useState('');
  const [msgFilter, setMsgFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Edit order state
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('Ethiopia');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editOrderNotes, setEditOrderNotes] = useState('');

  const openOrderDetailsModal = (ord: Order) => {
    setSelectedOrderDetails(ord);
    setIsEditingOrder(false);
    setEditCustomerName(ord.customerName || `${ord.firstName || ''} ${ord.lastName || ''}`.trim());
    setEditEmail(ord.email || '');
    setEditPhone(ord.phone || '');
    setEditAddress(ord.address || '');
    setEditCity(ord.city || '');
    setEditCountry(ord.country || 'Ethiopia');
    setEditPaymentMethod(ord.paymentMethod || 'Credit Card');
    setEditOrderNotes(ord.orderNotes || '');
  };

  const handleSaveOrderEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderDetails) return;

    const updatedFields: Partial<Order> = {
      customerName: editCustomerName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      city: editCity,
      country: editCountry,
      paymentMethod: editPaymentMethod,
      orderNotes: editOrderNotes
    };

    if (onUpdateOrder) {
      onUpdateOrder(selectedOrderDetails.id, updatedFields);
    }

    setSelectedOrderDetails(prev => prev ? { ...prev, ...updatedFields } : null);
    setIsEditingOrder(false);
  };
  const [bLogoUrl, setBLogoUrl] = useState(brandingImages?.logoUrl || '');
  const [bHeroBannerUrl, setBHeroBannerUrl] = useState(brandingImages?.heroBannerUrl || '');
  const [bHeroSecondaryUrl, setBHeroSecondaryUrl] = useState(brandingImages?.heroSecondaryUrl || '');
  const [bHeroTertiaryUrl, setBHeroTertiaryUrl] = useState(brandingImages?.heroTertiaryUrl || '');
  const [bAboutUsUrl, setBAboutUsUrl] = useState(brandingImages?.aboutUsUrl || '');
  const [bCraftsmanshipUrl, setBCraftsmanshipUrl] = useState(brandingImages?.craftsmanshipUrl || '');
  const [bPromotionalBannerUrl, setBPromotionalBannerUrl] = useState(brandingImages?.promotionalBannerUrl || '');
  const [bLookbookUrls, setBLookbookUrls] = useState<string[]>(brandingImages?.lookbookUrls || ['', '', '', '']);

  // Custom slide text states
  const [bHeroBannerBadge, setBHeroBannerBadge] = useState(brandingImages?.heroBannerBadge || '');
  const [bHeroBannerTitle, setBHeroBannerTitle] = useState(brandingImages?.heroBannerTitle || '');
  const [bHeroBannerSubtitle, setBHeroBannerSubtitle] = useState(brandingImages?.heroBannerSubtitle || '');

  const [bHeroSecondaryBadge, setBHeroSecondaryBadge] = useState(brandingImages?.heroSecondaryBadge || '');
  const [bHeroSecondaryTitle, setBHeroSecondaryTitle] = useState(brandingImages?.heroSecondaryTitle || '');
  const [bHeroSecondarySubtitle, setBHeroSecondarySubtitle] = useState(brandingImages?.heroSecondarySubtitle || '');

  const [bHeroTertiaryBadge, setBHeroTertiaryBadge] = useState(brandingImages?.heroTertiaryBadge || '');
  const [bHeroTertiaryTitle, setBHeroTertiaryTitle] = useState(brandingImages?.heroTertiaryTitle || '');
  const [bHeroTertiarySubtitle, setBHeroTertiarySubtitle] = useState(brandingImages?.heroTertiarySubtitle || '');

  // Social Links state
  const [bFacebookUrl, setBFacebookUrl] = useState(brandingImages?.socialLinks?.facebook || 'https://www.facebook.com/share/1FvXdXCEnC/');
  const [bInstagramUrl, setBInstagramUrl] = useState(brandingImages?.socialLinks?.instagram || 'https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==');
  const [bTiktokUrl, setBTiktokUrl] = useState(brandingImages?.socialLinks?.tiktok || 'https://www.tiktok.com/@yared_tibeb_');
  const [bTelegramUrl, setBTelegramUrl] = useState(brandingImages?.socialLinks?.telegram || 'https://t.me/+251923095380');

  // Currency Rate Management States
  const [etbRate, setEtbRate] = useState<number>(CURRENCY_RATES.ETB?.rateToUSD || 1);
  const [etbSymbol, setEtbSymbol] = useState<string>(CURRENCY_RATES.ETB?.symbol || 'ETB ');
  const [etbRateScreenshot, setEtbRateScreenshot] = useState<string>('');
  const [etbUpdatedAt, setEtbUpdatedAt] = useState<string>('');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Live Exchange Rate Simulator States
  const [simUSD, setSimUSD] = useState<string>('100');
  const [simETB, setSimETB] = useState<string>('');

  // Storage Health Check & Configuration State
  const [storageStatus, setStorageStatus] = useState<{
    tested: boolean;
    loading: boolean;
    success?: boolean;
    message?: string;
    repo?: string;
    owner?: string;
    branch?: string;
    canWrite?: boolean;
    hasToken?: boolean;
  }>({ tested: false, loading: false });

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState(false);
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [githubOwnerInput, setGithubOwnerInput] = useState('kb3134');
  const [githubRepoInput, setGithubRepoInput] = useState('yaredkb-ecommerce');
  const [githubBranchInput, setGithubBranchInput] = useState('main');
  const [githubFolderInput, setGithubFolderInput] = useState('public/uploads');
  const [githubConfigNotice, setGithubConfigNotice] = useState<string | null>(null);

  const fetchGitHubConfig = async () => {
    try {
      const res = await apiFetch('/api/storage/github-config');
      if (res.ok) {
        const data = await res.json();
        if (data.owner) setGithubOwnerInput(data.owner);
        if (data.repo) setGithubRepoInput(data.repo);
        if (data.branch) setGithubBranchInput(data.branch);
        if (data.folder) setGithubFolderInput(data.folder);
      }
    } catch {
      // ignore
    }
  };

  const testStorageConnection = async (customToken?: string) => {
    setStorageStatus(prev => ({ ...prev, tested: true, loading: true }));
    try {
      const payload: any = {};
      if (customToken) payload.token = customToken;
      if (githubOwnerInput) payload.owner = githubOwnerInput;
      if (githubRepoInput) payload.repo = githubRepoInput;
      if (githubBranchInput) payload.branch = githubBranchInput;

      const res = await apiFetch('/api/storage/test-github', {
        method: customToken ? 'POST' : 'GET',
        headers: customToken ? { 'Content-Type': 'application/json' } : undefined,
        body: customToken ? JSON.stringify(payload) : undefined
      });
      const data = await res.json();
      setStorageStatus({
        tested: true,
        loading: false,
        success: Boolean(data.success),
        message: data.message || 'Status verified',
        repo: data.repo ? `${data.owner || 'kb3134'}/${data.repo}` : 'kb3134/yaredkb-ecommerce',
        owner: data.owner || 'kb3134',
        branch: data.branch || 'main',
        canWrite: data.canWrite,
        hasToken: Boolean(data.hasToken ?? data.success)
      });
    } catch (err: any) {
      setStorageStatus({
        tested: true,
        loading: false,
        success: false,
        message: `Failed to check connection: ${err.message}`
      });
    }
  };

  const handleSaveAndTestGitHubConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGitHub(true);
    setGithubConfigNotice(null);

    try {
      const res = await apiFetch('/api/storage/github-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubTokenInput.trim() || undefined,
          owner: githubOwnerInput.trim() || 'kb3134',
          repo: githubRepoInput.trim() || 'yaredkb-ecommerce',
          branch: githubBranchInput.trim() || 'main',
          folder: githubFolderInput.trim() || 'public/uploads'
        })
      });

      const data = await res.json();
      setIsSavingGitHub(false);

      if (data.success) {
        setGithubConfigNotice('GitHub configuration updated and verified successfully!');
        if (data.testResult) {
          setStorageStatus({
            tested: true,
            loading: false,
            success: Boolean(data.testResult.success),
            message: data.testResult.message,
            repo: `${data.testResult.owner}/${data.testResult.repo}`,
            owner: data.testResult.owner,
            branch: data.testResult.branch,
            canWrite: data.testResult.canWrite,
            hasToken: Boolean(data.testResult.hasToken ?? data.testResult.success)
          });
        }
      } else {
        setGithubConfigNotice(data.message || 'Failed to update GitHub configuration.');
      }
    } catch (err: any) {
      setIsSavingGitHub(false);
      setGithubConfigNotice(`Error saving GitHub settings: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchGitHubConfig();
    testStorageConnection();
  }, []);

  useEffect(() => {
    if (etbRate) {
      setSimETB((100 * etbRate).toFixed(0));
    }
  }, [etbRate]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await apiFetch('/api/currency-rates');
        if (res.ok) {
          const data = await res.json();
          if (data && data.ETB) {
            setEtbRate(data.ETB.rateToUSD);
            setEtbSymbol(data.ETB.symbol || 'ETB ');
            setEtbRateScreenshot(data.ETB.rateScreenshotUrl || '');
            setEtbUpdatedAt(data.ETB.rateUpdatedAt || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch rates in Admin:', err);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (brandingImages) {
      setBLogoUrl(brandingImages.logoUrl || '');
      setBHeroBannerUrl(brandingImages.heroBannerUrl || '');
      setBHeroSecondaryUrl(brandingImages.heroSecondaryUrl || '');
      setBHeroTertiaryUrl(brandingImages.heroTertiaryUrl || '');
      setBAboutUsUrl(brandingImages.aboutUsUrl || '');
      setBCraftsmanshipUrl(brandingImages.craftsmanshipUrl || '');
      setBPromotionalBannerUrl(brandingImages.promotionalBannerUrl || '');
      setBLookbookUrls(brandingImages.lookbookUrls || ['', '', '', '']);
      
      setBHeroBannerBadge(brandingImages.heroBannerBadge || '');
      setBHeroBannerTitle(brandingImages.heroBannerTitle || '');
      setBHeroBannerSubtitle(brandingImages.heroBannerSubtitle || '');
      
      setBHeroSecondaryBadge(brandingImages.heroSecondaryBadge || '');
      setBHeroSecondaryTitle(brandingImages.heroSecondaryTitle || '');
      setBHeroSecondarySubtitle(brandingImages.heroSecondarySubtitle || '');
      
      setBHeroTertiaryBadge(brandingImages.heroTertiaryBadge || '');
      setBHeroTertiaryTitle(brandingImages.heroTertiaryTitle || '');
      setBHeroTertiarySubtitle(brandingImages.heroTertiarySubtitle || '');

      if (brandingImages.socialLinks) {
        setBFacebookUrl(brandingImages.socialLinks.facebook || '');
        setBInstagramUrl(brandingImages.socialLinks.instagram || '');
        setBTiktokUrl(brandingImages.socialLinks.tiktok || '');
        setBTelegramUrl(brandingImages.socialLinks.telegram || '');
      }
    }
  }, [brandingImages]);

  const autoSaveBranding = (updatedFields: Partial<BrandingImages>) => {
    if (onUpdateBranding) {
      const payload: BrandingImages = {
        logoUrl: updatedFields.logoUrl !== undefined ? updatedFields.logoUrl : bLogoUrl,
        heroBannerUrl: updatedFields.heroBannerUrl !== undefined ? updatedFields.heroBannerUrl : bHeroBannerUrl,
        heroSecondaryUrl: updatedFields.heroSecondaryUrl !== undefined ? updatedFields.heroSecondaryUrl : bHeroSecondaryUrl,
        heroTertiaryUrl: updatedFields.heroTertiaryUrl !== undefined ? updatedFields.heroTertiaryUrl : bHeroTertiaryUrl,
        aboutUsUrl: updatedFields.aboutUsUrl !== undefined ? updatedFields.aboutUsUrl : bAboutUsUrl,
        craftsmanshipUrl: updatedFields.craftsmanshipUrl !== undefined ? updatedFields.craftsmanshipUrl : bCraftsmanshipUrl,
        promotionalBannerUrl: updatedFields.promotionalBannerUrl !== undefined ? updatedFields.promotionalBannerUrl : bPromotionalBannerUrl,
        lookbookUrls: updatedFields.lookbookUrls !== undefined ? updatedFields.lookbookUrls : bLookbookUrls,
        
        heroBannerBadge: updatedFields.heroBannerBadge !== undefined ? updatedFields.heroBannerBadge : bHeroBannerBadge,
        heroBannerTitle: updatedFields.heroBannerTitle !== undefined ? updatedFields.heroBannerTitle : bHeroBannerTitle,
        heroBannerSubtitle: updatedFields.heroBannerSubtitle !== undefined ? updatedFields.heroBannerSubtitle : bHeroBannerSubtitle,
        
        heroSecondaryBadge: updatedFields.heroSecondaryBadge !== undefined ? updatedFields.heroSecondaryBadge : bHeroSecondaryBadge,
        heroSecondaryTitle: updatedFields.heroSecondaryTitle !== undefined ? updatedFields.heroSecondaryTitle : bHeroSecondaryTitle,
        heroSecondarySubtitle: updatedFields.heroSecondarySubtitle !== undefined ? updatedFields.heroSecondarySubtitle : bHeroSecondarySubtitle,
        
        heroTertiaryBadge: updatedFields.heroTertiaryBadge !== undefined ? updatedFields.heroTertiaryBadge : bHeroTertiaryBadge,
        heroTertiaryTitle: updatedFields.heroTertiaryTitle !== undefined ? updatedFields.heroTertiaryTitle : bHeroTertiaryTitle,
        heroTertiarySubtitle: updatedFields.heroTertiarySubtitle !== undefined ? updatedFields.heroTertiarySubtitle : bHeroTertiarySubtitle,

        socialLinks: updatedFields.socialLinks !== undefined ? updatedFields.socialLinks : {
          facebook: bFacebookUrl,
          instagram: bInstagramUrl,
          tiktok: bTiktokUrl,
          telegram: bTelegramUrl
        }
      };
      onUpdateBranding(payload);
    }
  };

  // Admin category/collection filter state
  const [adminSelectedCollection, setAdminSelectedCollection] = useState<string>('all');

  // Helper filter for Admin Products list (supports Studio vs Collection vs categories)
  const filterAdminProducts = (p: Product, filterId: string) => {
    const isStudio = Boolean(p.studioCategory && p.studioCategory.trim() !== '') || 
                    (p.collections && p.collections.includes('studio')) ||
                    p.category === 'studio';
    const isLiveshow = Boolean(p.collections && p.collections.includes('liveshow'));
    const isCollection = Boolean(p.collections && p.collections.includes('collection')) || (!isStudio && !isLiveshow);

    if (filterId === 'studio') return isStudio;
    if (filterId === 'collection') return isCollection;
    if (filterId === 'liveshow') return isLiveshow;
    
    if (!filterId || filterId === 'all') return true;

    return isProductInCollection(p, filterId);
  };

  // Product Add/Edit Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [destCollection, setDestCollection] = useState<boolean>(true);
  const [destLiveShow, setDestLiveShow] = useState<boolean>(false);
  const [destStudio, setDestStudio] = useState<boolean>(false);
  const [pStudioCategory, setPStudioCategory] = useState<string>('traditional-dresses');

  // Product Form state
  const [pName, setPName] = useState('');
  const [pAmharic, setPAmharic] = useState('');
  const [pCategory, setPCategory] = useState<any>('wedding');
  const [pCollections, setPCollections] = useState<string[]>(['wedding']);
  const [pPriceUSD, setPPriceUSD] = useState(1850);
  const [pOriginalPriceUSD, setPOriginalPriceUSD] = useState<number | undefined>(undefined);
  const [pStock, setPStock] = useState(10);
  const [pStatus, setPStatus] = useState<'In Stock' | 'Out of Stock'>('In Stock');
  const [pSizes, setPSizes] = useState('');
  const [pColors, setPColors] = useState('');
  const [pTibeb, setPTibeb] = useState('');
  const [pFabric, setPFabric] = useState('');
  const [pRegion, setPRegion] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pDetails, setPDetails] = useState('');
  const [pFeatured, setPFeatured] = useState(false);
  const [pBespoke, setPBespoke] = useState(true);
  const [pImages, setPImages] = useState<string[]>([]);
  const [pNewImageUrl, setPNewImageUrl] = useState('');
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [isSyncingAllImages, setIsSyncingAllImages] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helper for reading file uploads with client-side canvas compression
  const handleFileUpload = (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
          callback(compressedDataUrl);
        } else {
          callback(String(e.target?.result || ''));
        }
      };
      img.onerror = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      img.src = String(e.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBranding) {
      onUpdateBranding({
        logoUrl: bLogoUrl,
        heroBannerUrl: bHeroBannerUrl,
        heroSecondaryUrl: bHeroSecondaryUrl,
        heroTertiaryUrl: bHeroTertiaryUrl,
        aboutUsUrl: bAboutUsUrl,
        craftsmanshipUrl: bCraftsmanshipUrl,
        promotionalBannerUrl: bPromotionalBannerUrl,
        lookbookUrls: bLookbookUrls
      });
    }
  };

  const handleSyncAllCollectionImages = async () => {
    setIsSyncingAllImages(true);
    try {
      const res = await apiFetch('/api/storage/migrate-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('GitHub Cloud Sync Complete', `Synced ${data.migratedCount || 0} collection images to GitHub repository kb3134/yaredkb-ecommerce.`);
        if (editingProductId) {
          const updated = products.find(p => p.id === editingProductId);
          if (updated && updated.images) setPImages([...updated.images]);
        }
      } else {
        addToast('GitHub Sync Notice', data.message || 'Sync operation complete.');
      }
    } catch (err) {
      addToast('GitHub Sync Error', 'Could not sync collection images to GitHub.');
    } finally {
      setIsSyncingAllImages(false);
    }
  };

  const openAddProductModal = (
    targetDestination: 'collection' | 'studio' | 'liveshow' = 'collection',
    targetCategory: string = 'wedding'
  ) => {
    setEditingProductId(null);
    setPName('');
    setPAmharic('');

    const isStudioTarget = targetDestination === 'studio' || targetCategory === 'studio';
    const isLiveshowTarget = targetDestination === 'liveshow' || targetCategory === 'liveshow';

    if (isStudioTarget) {
      setDestStudio(true);
      setDestCollection(false);
      setDestLiveShow(false);
    } else if (isLiveshowTarget) {
      setDestStudio(false);
      setDestCollection(false);
      setDestLiveShow(true);
    } else {
      setDestStudio(false);
      setDestCollection(true);
      setDestLiveShow(false);
    }

    const defaultStudio = studioCategories && studioCategories.length > 0 ? studioCategories[0].slug : 'traditional-dresses';
    setPStudioCategory(defaultStudio);

    setPCategory(targetCategory && targetCategory !== 'studio' && targetCategory !== 'liveshow' ? targetCategory : 'wedding');
    setPCollections([targetCategory || 'wedding']);
    setPPriceUSD(1850);
    setPOriginalPriceUSD(undefined);
    setPStock(10);
    setPStatus('In Stock');
    setPSizes('');
    setPColors('');
    setPTibeb('');
    setPFabric('');
    setPRegion('');
    setPDesc('');
    setPDetails('');
    setPFeatured(isLiveshowTarget);
    setPBespoke(true);
    setPImages([]);
    setPNewImageUrl('');
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);

    const isLive = Boolean(prod.collections && prod.collections.includes('liveshow')) || Boolean(prod.isFeatured);
    const isStudio = Boolean(prod.studioCategory && prod.studioCategory.trim() !== '') || 
                    Boolean(prod.collections && (prod.collections.includes('studio') || prod.collections.includes('studio-only'))) || 
                    prod.category === 'studio';
    const isCollection = Boolean(prod.collections && prod.collections.includes('collection')) || 
                        (!isLive && !isStudio) || 
                        Boolean(prod.collections && prod.collections.some(c => c !== 'liveshow' && c !== 'studio' && c !== 'studio-only'));

    setDestCollection(isCollection);
    setDestLiveShow(isLive);
    setDestStudio(isStudio);

    setPName(prod.name || '');
    setPAmharic(prod.amharicName || '');
    setPCategory(prod.category || 'wedding');

    const defaultStudio = studioCategories && studioCategories.length > 0 ? studioCategories[0].slug : 'traditional-dresses';
    setPStudioCategory(prod.studioCategory || defaultStudio);

    setPPriceUSD(prod.priceUSD || 0);
    setPOriginalPriceUSD(prod.originalPriceUSD);
    setPStock(prod.stockQuantity ?? 10);
    setPStatus(prod.inStock ? 'In Stock' : 'Out of Stock');
    setPSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setPColors(prod.colors ? prod.colors.join(', ') : '');
    setPTibeb(prod.tibebPattern || '');
    setPFabric(prod.fabric || '');
    setPRegion(prod.weaverRegion || '');
    setPDesc(prod.description || '');
    setPDetails(prod.details ? prod.details.join('\n') : '');
    setPFeatured(Boolean(prod.isFeatured));
    setPBespoke(Boolean(prod.isBespokeAvailable));
    setPImages(prod.images && prod.images.length > 0 ? [...prod.images] : []);
    setPNewImageUrl('');
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!pName.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!pCategory) {
      setFormError('Category is required.');
      return;
    }
    if (!pPriceUSD || Number(pPriceUSD) <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }
    if (pImages.length === 0) {
      setFormError('Upload at least one Product Image. The first image will automatically become the product thumbnail.');
      return;
    }
    if (pStock === undefined || pStock === null || Number(pStock) < 0) {
      setFormError('Stock Quantity must be 0 or greater.');
      return;
    }
    if (!pDesc.trim()) {
      setFormError('Description is required.');
      return;
    }

    const selectedDestinations: string[] = [];
    if (destCollection) selectedDestinations.push('collection');
    if (destLiveShow) selectedDestinations.push('liveshow');
    if (destStudio) selectedDestinations.push('studio');

    if (selectedDestinations.length === 0) {
      setFormError('Please select at least one target upload destination.');
      return;
    }

    const sizesArray = pSizes
      ? pSizes.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const colorsArray = pColors
      ? pColors.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    const detailsArray = pDetails
      ? pDetails
          .split('\n')
          .map(d => d.trim().replace(/^[-•*]\s*/, ''))
          .filter(Boolean)
      : [];

    const isInStock = pStatus === 'In Stock' && Number(pStock) > 0;

    const finalCollectionsSet = new Set<string>();
    if (destStudio) {
      finalCollectionsSet.add('studio');
      if (pCategory && pCategory !== 'collection' && pCategory !== 'liveshow') {
        finalCollectionsSet.add(pCategory);
      }
    } else if (destLiveShow) {
      finalCollectionsSet.add('liveshow');
      if (pCategory && pCategory !== 'collection' && pCategory !== 'studio') {
        finalCollectionsSet.add(pCategory);
      }
    } else {
      finalCollectionsSet.add('collection');
      if (pCategory && pCategory !== 'liveshow' && pCategory !== 'studio') {
        finalCollectionsSet.add(pCategory);
      }
    }

    const finalStudioCategory = destStudio ? (pStudioCategory || pCategory || 'traditional-dresses') : '';

    const payload = {
      name: pName.trim(),
      category: pCategory,
      collections: Array.from(finalCollectionsSet),
      destinations: selectedDestinations,
      priceUSD: Number(pPriceUSD),
      originalPriceUSD: pOriginalPriceUSD ? Number(pOriginalPriceUSD) : undefined,
      stockQuantity: Number(pStock),
      inStock: isInStock,
      description: pDesc.trim(),
      details: detailsArray,
      images: pImages,
      sizes: sizesArray,
      colors: colorsArray,
      amharicName: pAmharic ? pAmharic.trim() : undefined,
      tibebPattern: pTibeb ? pTibeb.trim() : '',
      fabric: pFabric ? pFabric.trim() : '',
      weaverRegion: pRegion ? pRegion.trim() : '',
      isFeatured: destLiveShow || pFeatured,
      isBespokeAvailable: pBespoke,
      studioCategory: finalStudioCategory
    };

    if (editingProductId) {
      onUpdateProduct(editingProductId, payload);
    } else {
      onAddProduct(payload);
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="bg-white text-[#181310] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Banner matching Screenshot 7 exactly */}
        <div className="bg-[#241A14] text-white rounded-xl p-4 sm:p-6 border-2 border-[#D4AF37] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 sm:gap-5 z-10 w-full sm:w-auto">
            {/* Crest Logo */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-br from-[#FFFDF7] via-[#FAF5EA] to-[#F5EEDC] flex items-center justify-center shrink-0 shadow-md overflow-hidden">
              {bLogoUrl ? (
                <img src={bLogoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Shield className="w-7 h-7 text-[#B58E22]" />
              )}
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-wider text-white">
                  YARED ❖ TIBEB
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#D4AF37] uppercase tracking-widest font-serif font-semibold">
                ADDIS ABABA · LUXURY HERITAGE
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-[#D4AF37]/40 mx-2" />

            <div className="hidden md:block space-y-0.5">
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">
                MANAGEMENT PANEL
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Studio Administration
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 z-10 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D4AF37]/20">
            {currentAdminUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-[#D4AF37]/40 text-xs text-[#D4AF37]">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-serif font-bold flex items-center justify-center text-[10px]">
                  {currentAdminUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="font-serif font-bold text-white text-xs">{currentAdminUser.fullName}</div>
                  <div className="text-[10px] text-[#D4AF37] font-mono">@{currentAdminUser.username} · {currentAdminUser.role}</div>
                </div>
              </div>
            )}

            {/* GitHub Storage Quick Manager Button */}
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className={`px-3 py-2 sm:py-2.5 border rounded-lg font-serif font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                storageStatus.success
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/70'
                  : 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30'
              }`}
              title="Manage GitHub Permanent Cloud Storage"
            >
              <Cloud className="w-4 h-4" />
              <span className="hidden md:inline">
                {storageStatus.success ? 'GitHub Connected' : 'GitHub Storage'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                storageStatus.loading ? 'bg-amber-400 animate-ping' : storageStatus.success ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
            </button>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 sm:p-3 bg-black/50 border border-[#D4AF37]/40 rounded-lg text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition cursor-pointer"
              title="Refresh Console"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2.5 sm:py-3 bg-rose-950/40 border border-rose-500/40 text-rose-200 hover:bg-rose-900/60 transition font-serif font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Sign Out of Admin Session"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {onBackToStorefront && (
              <button
                onClick={onBackToStorefront}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#D4AF37] text-[#1A1817] hover:bg-white transition font-serif font-bold text-xs uppercase tracking-wider rounded-md shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>EXIT ADMIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Global GitHub Cloud Storage Interactive Banner */}
        <div className={`rounded-xl p-3.5 sm:p-4 border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-xs ${
          storageStatus.loading
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : storageStatus.success
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            : 'bg-rose-50/90 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg font-bold shrink-0 shadow-xs ${
              storageStatus.loading ? 'bg-amber-200 text-amber-900' : storageStatus.success ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {storageStatus.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : storageStatus.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="font-serif font-bold text-xs sm:text-sm flex flex-wrap items-center gap-2">
                <span>GitHub Permanent Storage:</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/10 font-bold">
                  {storageStatus.repo || 'kb3134/yaredkb-ecommerce'}
                </span>
                {storageStatus.success && (
                  <span className="px-2 py-0.5 bg-emerald-700 text-white font-sans text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Ready · Read & Write
                  </span>
                )}
                {!storageStatus.success && !storageStatus.loading && (
                  <span className="px-2 py-0.5 bg-rose-700 text-white font-sans text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Action Required
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-90 mt-0.5 font-sans leading-relaxed">
                {storageStatus.loading ? 'Verifying GitHub repository credentials...' : storageStatus.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/10">
            <button
              type="button"
              onClick={() => testStorageConnection()}
              disabled={storageStatus.loading}
              className="flex-1 md:flex-none px-3.5 py-1.5 bg-white border border-black/15 hover:bg-black/5 text-[#231B15] rounded-lg font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${storageStatus.loading ? 'animate-spin' : ''}`} />
              <span>Test Connection Now</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="flex-1 md:flex-none px-3.5 py-1.5 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Configure Token</span>
            </button>
          </div>
        </div>

        {/* Mobile View Tab Selector Dropdown */}
        <div className="block md:hidden bg-[#FDFBF7] p-3 rounded-xl border border-[#E5DFD3] shadow-xs">
          <label className="block text-[10px] font-serif font-bold uppercase tracking-widest text-[#706456] mb-1.5">
            Select Admin View Section:
          </label>
          <select
            value={adminTab}
            onChange={(e) => setAdminTab(e.target.value as any)}
            className="w-full py-2.5 px-3 bg-white border border-[#D4AF37]/40 rounded-lg font-serif font-bold text-xs text-[#181310] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="analytics">📊 Dashboard Analytics</option>
            <option value="branding">🖼️ Branding Images</option>
            <option value="products">🛍️ Products Catalog ({products.length})</option>
            <option value="orders">📦 Orders ({orders.length})</option>
            <option value="messages">✉️ Messages ({contactMessages.length})</option>
            <option value="users">👥 Users (1)</option>
          </select>
        </div>

        {/* Tab Navigation Controls (Horizontal Scrollable Pills for Desktop & Mobile) */}
        <div className="flex items-center gap-2 sm:gap-4 border-b border-[#E5DFD3] pb-2 overflow-x-auto no-scrollbar font-serif text-xs font-bold uppercase tracking-wider">
          {[
            { id: 'analytics', label: 'Dashboard Analytics', icon: BarChart3 },
            { id: 'branding', label: 'Branding Images', icon: ImageIcon },
            { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
            { id: 'orders', label: `Orders (${orders.length})`, icon: PackageCheck },
            { 
              id: 'messages', 
              label: `Contact Messages (${contactMessages.length})`, 
              icon: Mail,
              unreadCount: contactMessages.filter(m => !m.read).length 
            },
            { id: 'users', label: 'Users (1)', icon: Users },
          ].map((tab) => {
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`py-2.5 px-3 sm:px-1 transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer rounded-t-lg sm:rounded-none ${
                  isActive 
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 sm:bg-transparent font-bold' 
                    : 'border-transparent text-gray-700 hover:text-[#231B15] hover:bg-black/5 sm:hover:bg-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.unreadCount !== undefined && tab.unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#8B0000] text-white text-[10px] font-sans font-bold rounded-full">
                    {tab.unreadCount} unread
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE ANALYTICS */}
        {adminTab === 'analytics' && (() => {
          const realGrossRevenueETB = orders.reduce((sum, o) => sum + (o.totalInCurrency || o.totalUSD || 0), 0);
          const realCompletedOrdersCount = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

          const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const daysMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

          orders.forEach(ord => {
            if (ord.createdAt) {
              const d = new Date(ord.createdAt);
              if (!isNaN(d.getTime())) {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = dayNames[d.getDay()];
                daysMap[dayName] = (daysMap[dayName] || 0) + (ord.totalInCurrency || ord.totalUSD || 0);
              }
            }
          });

          const maxWeeklyAmt = Math.max(...Object.values(daysMap), 1);

          return (
            <div className="space-y-8 animate-fade-in">
              <h3 className="font-serif font-bold text-2xl text-[#231B15]">
                Studio Executive Analytics
              </h3>

              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex justify-between text-xs text-gray-600 font-serif">
                    <span>Gross Revenue</span>
                    <Coins className="w-4 h-4 text-[#B8860B]" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#231B15]">
                    ETB {realGrossRevenueETB.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#B8860B]" /> Live calculations from store orders
                  </p>
                </div>

                <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex justify-between text-xs text-gray-600 font-serif">
                    <span>Orders Placed</span>
                    <PackageCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#231B15]">
                    {orders.length} Orders
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {realCompletedOrdersCount} Completed / Delivered
                  </p>
                </div>

                <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex justify-between text-xs text-gray-600 font-serif">
                    <span>Garment Catalog</span>
                    <ShoppingBag className="w-4 h-4 text-[#B8860B]" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#231B15]">
                    {products.length} Garments
                  </p>
                  <p className="text-[11px] text-[#B8860B] font-mono font-medium">Active Inventory</p>
                </div>

                <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex justify-between text-xs text-gray-600 font-serif">
                    <span>Admin Accounts</span>
                    <Users className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#231B15]">
                    1 User
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">Yared Studio Administrator</p>
                </div>
              </div>

              {/* Weekly Revenue Bar Visualizer */}
              <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-[#231B15] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#B8860B]" />
                  <span>Weekly Sales Volume (ETB)</span>
                </h3>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 font-serif text-xs bg-white/60 rounded-xl border border-[#E5DFD3]">
                    No order activity yet. Live sales volume will update here in real-time as customer orders are placed.
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2 h-40 items-end pt-6 border-b border-[#E5DFD3] pb-2">
                    {daysList.map((day) => {
                      const amt = daysMap[day] || 0;
                      const heightPercent = amt > 0 ? Math.max(12, Math.round((amt / maxWeeklyAmt) * 100)) : 4;
                      return (
                        <div key={day} className="flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[10px] text-[#B8860B] font-mono font-bold">
                            ETB {amt.toLocaleString()}
                          </span>
                          <div 
                            style={{ height: `${heightPercent}%` }} 
                            className={`w-full transition rounded-t-md ${amt > 0 ? 'bg-[#231B15] hover:bg-[#D4AF37]' : 'bg-gray-200'}`}
                          />
                          <span className="text-[11px] text-gray-600 font-serif">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* TAB: BRANDING IMAGES MANAGEMENT */}
        {adminTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="space-y-8 animate-fade-in">
            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-6 space-y-6 text-[#231B15] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#231B15] flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#B8860B]" />
                    <span>Storefront Branding & Visual Assets</span>
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-0.5">
                    Upload or replace non-product imagery (Hero banners, Crest Logo, About Us section, Lookbook showcase).
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#231B15] text-[#D4AF37] hover:bg-black transition font-serif font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Branding Changes</span>
                </button>
              </div>

              {/* Live GitHub Storage Status Card */}
              <div className={`rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                storageStatus.loading
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : storageStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg font-bold shrink-0 ${
                    storageStatus.loading ? 'bg-amber-200 text-amber-900' : storageStatus.success ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                  }`}>
                    {storageStatus.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : storageStatus.success ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm flex items-center gap-2">
                      <span>GitHub Cloud Storage Target:</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/5 font-semibold">
                        kb3134/yaredkb-ecommerce
                      </span>
                      {storageStatus.success && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-sans text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Ready · Read & Write
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5 font-sans">
                      {storageStatus.loading ? 'Verifying GitHub repository connection...' : storageStatus.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={testStorageConnection}
                  disabled={storageStatus.loading}
                  className="px-3.5 py-1.5 bg-white border border-black/10 hover:bg-black/5 text-[#231B15] rounded-lg font-serif font-bold text-[11px] flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${storageStatus.loading ? 'animate-spin' : ''}`} />
                  <span>Test Connection Now</span>
                </button>
              </div>

              {/* Branding Image Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* 1. Brand Logo Upload */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#B8860B]" />
                      <span>Upload Storefront Logo Image</span>
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">Header & Footer Branding</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#D4AF37] overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-sm">
                      {bLogoUrl ? (
                        <img src={bLogoUrl} alt="Uploaded Logo Preview" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <Shield className="w-8 h-8 text-[#B58E22]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold shadow-xs transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Logo Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  setBLogoUrl(dataUrl);
                                  autoSaveBranding({ logoUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const officialLogo = '/api/uploads/brand-logo.jpg';
                            setBLogoUrl(officialLogo);
                            autoSaveBranding({ logoUrl: officialLogo, officialLogoUrl: officialLogo, footerLogoUrl: officialLogo, faviconUrl: '/api/uploads/brand-favicon.png' });
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-[#231B15] rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          👑 Use Official Logo
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste Logo Image URL..."
                        value={bLogoUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBLogoUrl(val);
                          autoSaveBranding({ logoUrl: val });
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Primary Hero Banner */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm">Primary Hero Banner (Slide 1)</label>
                    <span className="text-[10px] text-gray-500 font-mono">Homepage Hero</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-20 rounded-xl bg-gray-200 border border-[#D4AF37]/50 overflow-hidden shrink-0 mt-1">
                      {bHeroBannerUrl && (
                        <img src={bHeroBannerUrl} alt="Hero" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={bHeroBannerUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBHeroBannerUrl(val);
                            autoSaveBranding({ heroBannerUrl: val });
                          }}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                        />
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Hero Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  setBHeroBannerUrl(dataUrl);
                                  autoSaveBranding({ heroBannerUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Slide 1 Custom Texts */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#E5DFD3]">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 1 Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. 100% ROYAL HERITAGE"
                            value={bHeroBannerBadge}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroBannerBadge(val);
                              autoSaveBranding({ heroBannerBadge: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 1 Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Master Handwoven Shemma"
                            value={bHeroBannerTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroBannerTitle(val);
                              autoSaveBranding({ heroBannerTitle: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 1 Subtitle / Desc</label>
                          <input
                            type="text"
                            placeholder="e.g. Pure Cotton & Gold Thread"
                            value={bHeroBannerSubtitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroBannerSubtitle(val);
                              autoSaveBranding({ heroBannerSubtitle: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 3. Campaign Secondary */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm">Campaign Secondary Banner (Slide 2)</label>
                    <span className="text-[10px] text-gray-500 font-mono">Secondary Banner</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-20 rounded-xl bg-gray-200 border border-[#D4AF37]/50 overflow-hidden shrink-0 mt-1">
                      {bHeroSecondaryUrl && (
                        <img src={bHeroSecondaryUrl} alt="Campaign" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={bHeroSecondaryUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBHeroSecondaryUrl(val);
                            autoSaveBranding({ heroSecondaryUrl: val });
                          }}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                        />
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Campaign File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  setBHeroSecondaryUrl(dataUrl);
                                  autoSaveBranding({ heroSecondaryUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Slide 2 Custom Texts */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#E5DFD3]">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 2 Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. EMPRESS COUTURE"
                            value={bHeroSecondaryBadge}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroSecondaryBadge(val);
                              autoSaveBranding({ heroSecondaryBadge: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 2 Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Royal AXUM Chevron Design"
                            value={bHeroSecondaryTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroSecondaryTitle(val);
                              autoSaveBranding({ heroSecondaryTitle: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 2 Subtitle / Desc</label>
                          <input
                            type="text"
                            placeholder="e.g. Hand-embroidered Tibeb Motifs"
                            value={bHeroSecondarySubtitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroSecondarySubtitle(val);
                              autoSaveBranding({ heroSecondarySubtitle: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 4. Third Hero Banner (Home Banner 3) */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm">3rd Hero Banner (Slide 3)</label>
                    <span className="text-[10px] text-gray-500 font-mono">Home Banner 3</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-20 rounded-xl bg-gray-200 border border-[#D4AF37]/50 overflow-hidden shrink-0 mt-1">
                      {bHeroTertiaryUrl && (
                        <img src={bHeroTertiaryUrl} alt="3rd Hero Banner" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={bHeroTertiaryUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBHeroTertiaryUrl(val);
                            autoSaveBranding({ heroTertiaryUrl: val });
                          }}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                        />
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload 3rd Banner File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  setBHeroTertiaryUrl(dataUrl);
                                  autoSaveBranding({ heroTertiaryUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Slide 3 Custom Texts */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#E5DFD3]">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 3 Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. BESPOKE BRIDAL"
                            value={bHeroTertiaryBadge}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroTertiaryBadge(val);
                              autoSaveBranding({ heroTertiaryBadge: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 3 Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Hand-crafted Kemis Gowns"
                            value={bHeroTertiaryTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroTertiaryTitle(val);
                              autoSaveBranding({ heroTertiaryTitle: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Slide 3 Subtitle / Desc</label>
                          <input
                            type="text"
                            placeholder="e.g. 5+ Years of Loom Legacy"
                            value={bHeroTertiarySubtitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBHeroTertiarySubtitle(val);
                              autoSaveBranding({ heroTertiarySubtitle: val });
                            }}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15] text-xs"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 5. About Us Image */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm">About Us Section Image</label>
                    <span className="text-[10px] text-gray-500 font-mono">Heritage Portrait</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 border border-[#D4AF37]/50 overflow-hidden shrink-0">
                      {bAboutUsUrl && (
                        <img src={bAboutUsUrl} alt="About Us" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={bAboutUsUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBAboutUsUrl(val);
                          autoSaveBranding({ aboutUsUrl: val });
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload About Us File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], (dataUrl) => {
                                setBAboutUsUrl(dataUrl);
                                autoSaveBranding({ aboutUsUrl: dataUrl });
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 6. Craftsmanship Section Image */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm">Heritage Craftsmanship Image</label>
                    <span className="text-[10px] text-gray-500 font-mono">Loom Guild</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 border border-[#D4AF37]/50 overflow-hidden shrink-0 flex items-center justify-center">
                      {bCraftsmanshipUrl ? (
                        <img src={bCraftsmanshipUrl} alt="Craftsmanship" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-serif font-bold">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Image URL (Leave blank to remove)"
                        value={bCraftsmanshipUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBCraftsmanshipUrl(val);
                          autoSaveBranding({ craftsmanshipUrl: val });
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Guild File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  setBCraftsmanshipUrl(dataUrl);
                                  autoSaveBranding({ craftsmanshipUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                        {bCraftsmanshipUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setBCraftsmanshipUrl('');
                              autoSaveBranding({ craftsmanshipUrl: '' });
                              addToast('Image Removed', 'Heritage Craftsmanship image removed successfully.');
                            }}
                            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Image</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Promotional Banner Image */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-4 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-[#231B15] text-sm">Promotional Banner Image</label>
                    <span className="text-[10px] text-gray-500 font-mono">Offer Banner</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-24 h-16 rounded-xl bg-gray-200 border border-[#D4AF37]/50 overflow-hidden shrink-0 flex items-center justify-center">
                      {bPromotionalBannerUrl ? (
                        <img src={bPromotionalBannerUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-serif font-bold">No Banner</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Image URL (Leave blank to remove)"
                        value={bPromotionalBannerUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBPromotionalBannerUrl(val);
                          autoSaveBranding({ promotionalBannerUrl: val });
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg cursor-pointer text-[11px] font-bold">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Banner File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  setBPromotionalBannerUrl(dataUrl);
                                  autoSaveBranding({ promotionalBannerUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                        {bPromotionalBannerUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setBPromotionalBannerUrl('');
                              autoSaveBranding({ promotionalBannerUrl: '' });
                              addToast('Image Removed', 'Promotional Banner image removed successfully.');
                            }}
                            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Image</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. Social Media Links Settings */}
                <div className="bg-[#FAF6EC] border border-[#E5DFD3] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                    <label className="font-serif font-bold text-[#231B15] text-sm">Official Social Media Links ("Follow Us")</label>
                    <span className="text-[10px] text-gray-500 font-mono">About Us & Footer Links</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    {/* Facebook */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Facebook Page URL</label>
                      <input
                        type="text"
                        placeholder="https://facebook.com/..."
                        value={bFacebookUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBFacebookUrl(val);
                          autoSaveBranding({
                            socialLinks: { facebook: val, instagram: bInstagramUrl, tiktok: bTiktokUrl, telegram: bTelegramUrl }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                    </div>

                    {/* Instagram */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Instagram Profile URL</label>
                      <input
                        type="text"
                        placeholder="https://instagram.com/..."
                        value={bInstagramUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBInstagramUrl(val);
                          autoSaveBranding({
                            socialLinks: { facebook: bFacebookUrl, instagram: val, tiktok: bTiktokUrl, telegram: bTelegramUrl }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                    </div>

                    {/* TikTok */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">TikTok Profile URL</label>
                      <input
                        type="text"
                        placeholder="https://tiktok.com/@..."
                        value={bTiktokUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBTiktokUrl(val);
                          autoSaveBranding({
                            socialLinks: { facebook: bFacebookUrl, instagram: bInstagramUrl, tiktok: val, telegram: bTelegramUrl }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                    </div>

                    {/* Telegram */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Telegram Link URL</label>
                      <input
                        type="text"
                        placeholder="https://t.me/..."
                        value={bTelegramUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBTelegramUrl(val);
                          autoSaveBranding({
                            socialLinks: { facebook: bFacebookUrl, instagram: bInstagramUrl, tiktok: bTiktokUrl, telegram: val }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-[#231B15]"
                      />
                    </div>

                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#231B15] text-[#D4AF37] hover:bg-black transition font-serif font-bold text-xs uppercase rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Branding Images</span>
                </button>
              </div>

            </div>
          </form>
        )}

        {/* TAB: STUDIO GALLERY MANAGEMENT */}
        {adminTab === 'studio' && (
          <div className="animate-fade-in">
            <AdminStudioManager
              studioImages={studioImages}
              studioCategories={studioCategories}
              products={products}
              onAddImage={onAddStudioImage || (async () => false)}
              onEditImage={onEditStudioImage || (async () => false)}
              onDeleteImage={onDeleteStudioImage || (async () => false)}
              onAddCategory={onAddStudioCategory || (async () => false)}
              onEditCategory={onEditStudioCategory || (async () => false)}
              onDeleteCategory={onDeleteStudioCategory || (async () => false)}
              onReorderImages={onReorderStudioImages}
              addToast={addToast}
            />
          </div>
        )}

        {/* TAB 2: PRODUCTS INVENTORY CRUD */}
        {adminTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#231B15]">
                  Garment Catalog Management
                </h3>
                <p className="text-xs text-gray-600 font-sans mt-0.5">
                  Filter catalog products by studio and category.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => openAddProductModal(adminSelectedCollection === 'studio' ? 'studio' : adminSelectedCollection === 'liveshow' ? 'liveshow' : 'collection', 'wedding')}
                  className="px-5 py-2.5 bg-[#D4AF37] text-[#181310] font-serif font-bold text-xs uppercase rounded-xl hover:bg-[#F3C85C] transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#181310]" />
                  <span>+ Add Product</span>
                </button>
              </div>
            </div>

            {/* Studio & Collection Category Admin Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5DFD3]">
              {[
                { id: 'all', label: 'All Garments' },
                { id: 'collection', label: '1. Collection' },
                { id: 'studio', label: '2. Studio' },
                { id: 'liveshow', label: '3. Live Showcase' },
              ].map((cat) => {
                const isSelected = adminSelectedCollection === cat.id;
                const count = products.filter(p => filterAdminProducts(p, cat.id)).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setAdminSelectedCollection(cat.id)}
                    className={`px-4 py-2 text-xs font-serif font-bold uppercase rounded-lg transition border cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#231B15] text-[#D4AF37] border-[#D4AF37] shadow-md'
                        : 'bg-white text-gray-700 border-[#E5DFD3] hover:border-[#D4AF37] hover:text-[#231B15]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                      isSelected ? 'bg-[#D4AF37] text-[#231B15]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-xs">
                  <thead className="bg-[#231B15] text-[#D4AF37] font-serif uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5">ITEM</th>
                    <th className="p-3.5">CATEGORY</th>
                    <th className="p-3.5">PRICE</th>
                    <th className="p-3.5">STOCK</th>
                    <th className="p-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3] text-[#231B15] font-medium">
                  {products.filter(p => filterAdminProducts(p, adminSelectedCollection)).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-sans">
                        No garments in this filter category yet. Click <strong>+ Add New Product</strong> above to add one.
                      </td>
                    </tr>
                  ) : (
                    products.filter(p => filterAdminProducts(p, adminSelectedCollection)).map((p) => (
                      <tr key={p.id} className="hover:bg-[#F5EFE4] transition">
                        <td className="p-3.5 flex items-center gap-3">
                          <img 
                            src={p.images[0]} 
                            alt="" 
                            className="w-10 h-12 object-cover rounded border border-gray-300 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-[#231B15] text-sm">{p.name}</p>
                            <p className="text-[11px] text-gray-500 italic">{p.tibebPattern}</p>
                            {p.isFeatured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 bg-[#D4AF37] text-[#181310] font-serif font-bold text-[9px] uppercase rounded shadow-xs">
                                <Sparkles className="w-2.5 h-2.5" />
                                Live Home Showcase
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {(p.collections && p.collections.length > 0 ? p.collections : [p.category]).map((col) => (
                              <span key={col} className="px-2 py-0.5 bg-[#FAF0D7] text-[#5C3A10] border border-[#E5D3AC] text-[10px] font-serif font-bold rounded uppercase">
                                {col}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#231B15]">
                          ETB {p.priceUSD.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className={p.stockQuantity > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                            {p.stockQuantity} in stock
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="px-2.5 py-1 rounded bg-[#231B15] text-[#D4AF37] hover:bg-black transition font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Edit Piece"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="px-2.5 py-1 rounded bg-red-100 text-red-800 hover:bg-red-800 hover:text-white transition font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Delete Piece"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* TAB 3: CLIENT ORDERS PIPELINE */}
        {adminTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <h3 className="font-serif text-xl font-bold text-[#231B15]">
                Customer Order Fulfillment
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-500 font-sans">
                  Showing {orders.length} total customer orders
                </p>
                {onRefreshOrders && (
                  <button
                    onClick={onRefreshOrders}
                    className="px-3 py-1 bg-[#231B15] text-[#D4AF37] hover:bg-black rounded-lg text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Fetch latest orders from server"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Live Orders</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#231B15] text-[#D4AF37] font-serif uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5">ORDER & DATE</th>
                      <th className="p-3.5">CUSTOMER</th>
                      <th className="p-3.5">BILLING / SHIPPING</th>
                      <th className="p-3.5">ITEMS & QTY</th>
                      <th className="p-3.5">TOTAL</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD3] text-[#231B15]">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500 font-serif">
                          No orders recorded yet.
                        </td>
                      </tr>
                    ) : orders.map((ord, idx) => {
                      const totalAmt = ord.totalInCurrency || ord.totalUSD;
                      return (
                        <tr key={`${ord.id}-${idx}`} className="hover:bg-[#F5EFE4] transition">
                          <td className="p-3.5">
                            <p className="font-mono font-bold text-[#231B15]">{ord.id}</p>
                            <p className="text-[11px] text-gray-500">{ord.createdAt || '2026-07-30'}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-bold text-[#231B15]">{ord.customerName}</p>
                            <p className="text-[11px] text-gray-500">{ord.email}</p>
                            <p className="text-[11px] text-gray-500">{ord.phone}</p>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <p className="font-medium text-[#231B15] truncate">{ord.address}</p>
                            <p className="text-[11px] text-gray-500">{ord.city}, {ord.country}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-bold text-[#231B15]">
                              {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
                              {ord.items?.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                            </p>
                          </td>
                          <td className="p-3.5 font-bold font-serif text-[#B8860B]">
                            ETB {totalAmt.toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'Completed' || ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : ord.status === 'Processing' || ord.status === 'In Loom Weaving'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : ord.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {ord.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-y-1">
                            <button
                              onClick={() => openOrderDetailsModal(ord)}
                              className="px-3 py-1 bg-[#231B15] text-[#D4AF37] font-serif font-bold text-[11px] rounded-lg hover:bg-black transition cursor-pointer"
                            >
                              View & Edit Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDER DETAILS MODAL INSPECTOR */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] text-[#231B15] border border-[#E5DFD3] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scale-up">
              
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-200/60 text-gray-700 hover:bg-gray-300 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-[#E5DFD3] pb-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#B8860B]">
                    Order Inspector & Fulfillment
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#231B15]">
                    Order Ref: {selectedOrderDetails.id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Placed on {selectedOrderDetails.createdAt || '2026-07-30'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingOrder(!isEditingOrder)}
                  className="mr-8 px-3.5 py-1.5 rounded-xl border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white font-serif text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingOrder ? 'Cancel Edit' : 'Edit Info'}</span>
                </button>
              </div>

              {/* Status Selector Header */}
              <div className="p-4 bg-amber-50/70 border border-[#E5DFD3] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-gray-700 block mb-0.5">Fulfillment Status:</span>
                  <span className="text-gray-500">Update status to manage order lifecycle</span>
                </div>
                <select
                  value={selectedOrderDetails.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedOrderDetails(prev => prev ? { ...prev, status: newStatus as any } : null);
                    if (onUpdateOrderStatus) {
                      onUpdateOrderStatus(selectedOrderDetails.id, newStatus);
                    } else {
                      selectedOrderDetails.status = newStatus as any;
                    }
                  }}
                  className="bg-white border-2 border-[#B8860B] rounded-xl px-4 py-2 font-serif font-bold text-xs text-[#231B15] shadow-xs cursor-pointer focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* EDIT MODE FORM vs VIEW MODE */}
              {isEditingOrder ? (
                <form onSubmit={handleSaveOrderEdit} className="space-y-4 p-4 bg-white border border-[#E5DFD3] rounded-2xl text-xs font-sans">
                  <h4 className="font-serif font-bold text-sm text-[#231B15] border-b border-[#E5DFD3] pb-2">
                    Update Customer & Order Details (Backend)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Method</label>
                      <input
                        type="text"
                        value={editPaymentMethod}
                        onChange={(e) => setEditPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Order Notes</label>
                      <textarea
                        rows={2}
                        value={editOrderNotes}
                        onChange={(e) => setEditOrderNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingOrder(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-serif text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#B8860B] text-white rounded-lg font-serif text-xs font-bold hover:bg-amber-700 transition"
                    >
                      Save Changes to Backend
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Customer & Shipping Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="p-4 bg-white border border-[#E5DFD3] rounded-2xl space-y-1.5">
                      <h4 className="font-serif font-bold text-sm text-[#231B15] border-b border-[#E5DFD3] pb-1">
                        Customer Details
                      </h4>
                      <p><strong className="text-gray-700">Name:</strong> {selectedOrderDetails.customerName}</p>
                      <p><strong className="text-gray-700">Email:</strong> {selectedOrderDetails.email}</p>
                      <p><strong className="text-gray-700">Phone:</strong> {selectedOrderDetails.phone}</p>
                      {selectedOrderDetails.companyName && (
                        <p><strong className="text-gray-700">Company:</strong> {selectedOrderDetails.companyName}</p>
                      )}
                    </div>

                    <div className="p-4 bg-white border border-[#E5DFD3] rounded-2xl space-y-1.5">
                      <h4 className="font-serif font-bold text-sm text-[#231B15] border-b border-[#E5DFD3] pb-1">
                        Shipping & Billing Address
                      </h4>
                      <p><strong className="text-gray-700">Street:</strong> {selectedOrderDetails.address}</p>
                      {selectedOrderDetails.apartment && (
                        <p><strong className="text-gray-700">Apt/Unit:</strong> {selectedOrderDetails.apartment}</p>
                      )}
                      <p><strong className="text-gray-700">City / Town:</strong> {selectedOrderDetails.city}</p>
                      {selectedOrderDetails.postcode && (
                        <p><strong className="text-gray-700">Postcode:</strong> {selectedOrderDetails.postcode}</p>
                      )}
                      <p><strong className="text-gray-700">Country:</strong> {selectedOrderDetails.country}</p>
                    </div>
                  </div>

                  {selectedOrderDetails.orderNotes && (
                    <div className="p-3 bg-amber-50 border border-[#E5DFD3] rounded-xl text-xs space-y-1">
                      <span className="font-bold text-[#231B15]">Customer Order Notes:</span>
                      <p className="italic text-gray-700">"{selectedOrderDetails.orderNotes}"</p>
                    </div>
                  )}
                </>
              )}

              {/* Ordered Items List */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#231B15]">
                  Ordered Products ({selectedOrderDetails.items?.length || 0})
                </h4>

                <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white divide-y divide-[#E5DFD3] text-xs">
                  {selectedOrderDetails.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-10 h-12 object-cover rounded-lg border border-gray-200 bg-amber-50"
                        />
                        <div>
                          <p className="font-serif font-bold text-[#231B15]">{item.product.name}</p>
                          <p className="text-[11px] text-gray-500">
                            Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-[#B8860B]">
                        ETB {(item.product.priceUSD * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Footer */}
              <div className="border-t border-[#E5DFD3] pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Payment Method</span>
                  <span className="font-serif font-bold text-xs text-emerald-800">
                    {selectedOrderDetails.paymentMethod || 'Cash on Delivery'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Amount</span>
                  <span className="font-serif font-bold text-xl text-[#B8860B]">
                    ETB {(selectedOrderDetails.totalInCurrency || selectedOrderDetails.totalUSD).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="w-full py-3 bg-[#231B15] text-[#D4AF37] font-serif text-xs font-bold uppercase rounded-xl hover:bg-black transition cursor-pointer"
                >
                  Close Order Inspector
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: CONTACT MESSAGES */}
        {adminTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#231B15]">
                  Client Contact Inquiries
                </h3>
                <p className="text-xs text-gray-600 font-sans">
                  View, search, and manage incoming messages from the Yared Tibeb Contact Us page.
                </p>
              </div>

              {/* Quick Status Stats */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white border border-[#E5DFD3] rounded-xl text-xs font-semibold text-[#231B15] shadow-xs flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#B8860B]" />
                  <span>Total: <strong>{contactMessages.length}</strong></span>
                </div>
                <div className="px-3 py-1.5 bg-[#8B0000]/10 border border-[#8B0000]/30 rounded-xl text-xs font-semibold text-[#8B0000] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-pulse" />
                  <span>Unread: <strong>{contactMessages.filter(m => !m.read).length}</strong></span>
                </div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#EFE9DC] p-1 rounded-xl w-full sm:w-auto text-xs font-serif font-bold">
                <button
                  onClick={() => setMsgFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    msgFilter === 'all' 
                      ? 'bg-[#1A1817] text-[#D4AF37] shadow-xs' 
                      : 'text-gray-700 hover:text-[#1A1817]'
                  }`}
                >
                  All ({contactMessages.length})
                </button>
                <button
                  onClick={() => setMsgFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    msgFilter === 'unread' 
                      ? 'bg-[#1A1817] text-[#D4AF37] shadow-xs' 
                      : 'text-gray-700 hover:text-[#1A1817]'
                  }`}
                >
                  Unread ({contactMessages.filter(m => !m.read).length})
                </button>
                <button
                  onClick={() => setMsgFilter('read')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    msgFilter === 'read' 
                      ? 'bg-[#1A1817] text-[#D4AF37] shadow-xs' 
                      : 'text-gray-700 hover:text-[#1A1817]'
                  }`}
                >
                  Read ({contactMessages.filter(m => m.read).length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, subject, message..."
                  value={msgSearchQuery}
                  onChange={(e) => setMsgSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-[#1A1817] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
                {msgSearchQuery && (
                  <button 
                    onClick={() => setMsgSearchQuery('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

            </div>

            {/* Messages Table */}
            {(() => {
              let filtered = contactMessages.filter(m => {
                if (msgFilter === 'unread') return !m.read;
                if (msgFilter === 'read') return m.read;
                return true;
              });

              if (msgSearchQuery.trim()) {
                const q = msgSearchQuery.toLowerCase();
                filtered = filtered.filter(m => 
                  m.fullName.toLowerCase().includes(q) ||
                  m.email.toLowerCase().includes(q) ||
                  (m.phone && m.phone.toLowerCase().includes(q)) ||
                  m.subject.toLowerCase().includes(q) ||
                  m.message.toLowerCase().includes(q)
                );
              }

              if (filtered.length === 0) {
                return (
                  <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-12 text-center space-y-3">
                    <Mail className="w-10 h-10 text-gray-300 mx-auto" />
                    <h4 className="font-serif text-lg font-bold text-gray-700">No Messages Found</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      {msgSearchQuery 
                        ? `No contact messages match your search "${msgSearchQuery}".` 
                        : 'There are currently no contact messages in this category.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#231B15] text-[#D4AF37] font-serif uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                          <th className="p-4">STATUS</th>
                          <th className="p-4">SENDER NAME</th>
                          <th className="p-4">EMAIL & PHONE</th>
                          <th className="p-4">SUBJECT & PREVIEW</th>
                          <th className="p-4">DATE RECEIVED</th>
                          <th className="p-4 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DFD3] text-[#231B15]">
                        {filtered.map((msg) => (
                          <tr 
                            key={msg.id} 
                            className={`transition ${
                              !msg.read ? 'bg-[#FFFDF7] font-medium' : 'hover:bg-[#F5EFE4]/60'
                            }`}
                          >
                            {/* Status Badge */}
                            <td className="p-4 shrink-0">
                              {msg.read ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-serif font-bold text-[10px] uppercase">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Read
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8B0000] text-white rounded-md font-serif font-bold text-[10px] uppercase shadow-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                                  Unread
                                </span>
                              )}
                            </td>

                            {/* Sender Name */}
                            <td className="p-4 font-serif font-bold text-sm text-[#1A1817]">
                              {msg.fullName}
                            </td>

                            {/* Email & Phone */}
                            <td className="p-4 space-y-0.5 font-sans">
                              <a href={`mailto:${msg.email}`} className="block text-[#1A1817] hover:text-[#8B0000] font-semibold underline">
                                {msg.email}
                              </a>
                              {msg.phone && (
                                <span className="block text-gray-500 text-[11px] font-mono">
                                  {msg.phone}
                                </span>
                              )}
                            </td>

                            {/* Subject & Preview */}
                            <td className="p-4 space-y-0.5 max-w-xs">
                              <span className="block font-serif font-bold text-xs text-[#1A1817] truncate">
                                {msg.subject}
                              </span>
                              <span className="block text-gray-500 text-[11px] truncate font-sans">
                                {msg.message}
                              </span>
                            </td>

                            {/* Date Received */}
                            <td className="p-4 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {/* View Message Button */}
                                <button
                                  onClick={() => {
                                    setSelectedMessage(msg);
                                    if (!msg.read && onToggleReadMessage) {
                                      onToggleReadMessage(msg.id, true);
                                    }
                                  }}
                                  className="p-2 bg-[#1A1817] text-[#D4AF37] hover:bg-[#8B0000] hover:text-white rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1 text-[11px] font-serif font-bold"
                                  title="View Full Message"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="hidden lg:inline">View</span>
                                </button>

                                {/* Toggle Read/Unread Button */}
                                <button
                                  onClick={() => {
                                    if (onToggleReadMessage) {
                                      onToggleReadMessage(msg.id, !msg.read);
                                    }
                                  }}
                                  className={`p-2 rounded-lg border transition cursor-pointer ${
                                    msg.read
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                                  }`}
                                  title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                                >
                                  {msg.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete message from ${msg.fullName}?`)) {
                                      if (onDeleteMessage) {
                                        onDeleteMessage(msg.id);
                                      }
                                    }
                                  }}
                                  className="p-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition cursor-pointer"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB: DATABASE IMAGE & MEDIA STORE REMOVED */}

        {/* TAB 4: USERS ACCOUNT MANAGEMENT */}
        {adminTab === 'users' && (
          <div className="animate-fade-in">
            <AdminAccountsManager
              currentAdminUser={currentAdminUser || null}
              addToast={addToast || (() => {})}
            />
          </div>
        )}

      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFBF7] text-[#1A1817] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37] space-y-5 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#231B15]">
                  {editingProductId ? 'Edit Garment' : 'Add New Garment'}
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  YARED TIBEB Retail & Atelier Catalog
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#231B15] hover:text-[#D4AF37] transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Target Upload Destination Switcher (Mutually Exclusive - Radio Mode) */}
              <div className="bg-[#FAF6ED] p-3.5 rounded-2xl border border-[#D4AF37]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-xs text-[#231B15] uppercase tracking-wider flex items-center gap-1.5">
                    <span>Target Upload Destination</span>
                    <span className="text-[10px] text-[#B8860B] font-mono font-semibold">
                      (Select exactly one exclusive destination)
                    </span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Collection */}
                  <button
                    type="button"
                    onClick={() => {
                      setDestCollection(true);
                      setDestLiveShow(false);
                      setDestStudio(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-serif font-bold transition flex flex-col items-start gap-1 cursor-pointer text-left border relative ${
                      destCollection
                        ? 'bg-[#231B15] text-[#D4AF37] border-[#D4AF37] shadow-md'
                        : 'bg-white text-gray-500 hover:bg-stone-100 border-[#E5DFD3]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FolderPlus className={`w-4 h-4 shrink-0 ${destCollection ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <span>1. Collection</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${destCollection ? 'border-[#D4AF37] bg-[#D4AF37] text-[#181310]' : 'border-gray-300'}`}>
                        {destCollection && <div className="w-1.5 h-1.5 rounded-full bg-[#181310]" />}
                      </div>
                    </div>
                    <div className="text-[10px] font-sans font-normal opacity-80 leading-tight">
                      Standard retail line catalog
                    </div>
                  </button>

                  {/* Option 2: Studio */}
                  <button
                    type="button"
                    onClick={() => {
                      setDestCollection(false);
                      setDestLiveShow(false);
                      setDestStudio(true);
                      if (!pStudioCategory || pStudioCategory === '') {
                        const defaultStudio = studioCategories && studioCategories.length > 0 ? studioCategories[0].slug : 'traditional-dresses';
                        setPStudioCategory(defaultStudio);
                      }
                    }}
                    className={`p-3 rounded-xl text-xs font-serif font-bold transition flex flex-col items-start gap-1 cursor-pointer text-left border relative ${
                      destStudio
                        ? 'bg-[#8B0000] text-white border-[#D4AF37] shadow-md'
                        : 'bg-white text-gray-500 hover:bg-stone-100 border-[#E5DFD3]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Sparkles className={`w-4 h-4 shrink-0 ${destStudio ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <span>2. Studio</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${destStudio ? 'border-[#D4AF37] bg-[#D4AF37] text-[#181310]' : 'border-gray-300'}`}>
                        {destStudio && <div className="w-1.5 h-1.5 rounded-full bg-[#181310]" />}
                      </div>
                    </div>
                    <div className="text-[10px] font-sans font-normal opacity-80 leading-tight">
                      Bespoke showcase & Atelier gallery
                    </div>
                  </button>

                  {/* Option 3: Live Showcase */}
                  <button
                    type="button"
                    onClick={() => {
                      setDestCollection(false);
                      setDestLiveShow(true);
                      setDestStudio(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-serif font-bold transition flex flex-col items-start gap-1 cursor-pointer text-left border relative ${
                      destLiveShow
                        ? 'bg-[#D4AF37] text-[#181310] border-[#181310] shadow-md'
                        : 'bg-white text-gray-500 hover:bg-stone-100 border-[#E5DFD3]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Upload className={`w-4 h-4 shrink-0 ${destLiveShow ? 'text-[#181310]' : 'text-gray-400'}`} />
                        <span>3. Live Showcase</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${destLiveShow ? 'border-[#181310] bg-[#181310] text-[#D4AF37]' : 'border-gray-300'}`}>
                        {destLiveShow && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                      </div>
                    </div>
                    <div className="text-[10px] font-sans font-normal opacity-80 leading-tight">
                      Featured live on Home page
                    </div>
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block font-bold text-[#231B15] mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={pName} 
                  onChange={e => setPName(e.target.value)} 
                  placeholder="e.g. Traditional Habesha Kemis - Empress Edition"
                  className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs font-serif font-bold text-[#231B15] focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>

              {/* Retail Category and Studio Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#231B15] mb-1">
                    Retail Line Category <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={pCategory} 
                    onChange={e => setPCategory(e.target.value)} 
                    className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs text-[#231B15] font-serif font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="wedding">Wedding Collection</option>
                    <option value="mens">Men's Collection</option>
                    <option value="holiday">Holiday Collection</option>
                    <option value="family">Family Collection</option>
                    <option value="baby">Baby Collection</option>
                    <option value="formal">Formal Collection</option>
                    <option value="traditional-dresses">Traditional Dresses</option>
                    <option value="habesha-kemis">Habesha Kemis</option>
                  </select>
                </div>

                {destStudio ? (
                  <div>
                    <label className="block font-bold text-[#231B15] mb-1">
                      Studio Atelier Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pStudioCategory}
                      onChange={e => setPStudioCategory(e.target.value)}
                      className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs text-[#231B15] font-serif font-bold focus:outline-none focus:border-[#D4AF37]"
                    >
                      {(studioCategories || []).map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name} Studio</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center text-gray-500 text-[11px] font-sans">
                    <span>Enable "Studio" destination above to assign to an Atelier Studio category.</span>
                  </div>
                )}
              </div>



              {/* Price & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#231B15] mb-1">
                    Sale Price (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    step="any"
                    value={pPriceUSD} 
                    onChange={e => setPPriceUSD(Number(e.target.value))} 
                    placeholder="e.g. 1850"
                    className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white font-bold text-emerald-800 text-xs focus:outline-none focus:border-[#D4AF37]" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#231B15] mb-1">
                    Original Price (ETB) <span className="text-xs font-normal text-gray-500">(Optional)</span>
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    step="any"
                    value={pOriginalPriceUSD === undefined ? '' : pOriginalPriceUSD} 
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setPOriginalPriceUSD(val);
                    }} 
                    placeholder="e.g. 2100"
                    className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs text-[#231B15] font-semibold focus:outline-none focus:border-[#D4AF37]" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#231B15] mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={pStock} 
                    onChange={e => setPStock(Number(e.target.value))} 
                    placeholder="e.g. 10"
                    className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs text-[#231B15] font-semibold focus:outline-none focus:border-[#D4AF37]" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#231B15] mb-1">
                    Product Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pStatus}
                    onChange={e => setPStatus(e.target.value as 'In Stock' | 'Out of Stock')}
                    className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Discount Indicator */}
              {pOriginalPriceUSD && pOriginalPriceUSD > pPriceUSD && (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    🏷️ <span>Active Discount / Sale Calculated:</span>
                  </span>
                  <span>
                    You are offering a <strong>{Math.round(((pOriginalPriceUSD - pPriceUSD) / pOriginalPriceUSD) * 100)}% OFF</strong> discount (Saves customer <strong>{(pOriginalPriceUSD - pPriceUSD).toLocaleString()} ETB</strong>)
                  </span>
                </div>
              )}

              {/* Live Home Showcase Feature Checkbox */}
              <div className="bg-[#FAF6ED] p-3.5 rounded-2xl border border-[#D4AF37]/50 flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <label htmlFor="pFeaturedCheckbox" className="font-serif font-bold text-xs uppercase text-[#231B15] flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Publish & Feature on "Live Home Showcase"</span>
                  </label>
                  <p className="text-[11px] text-gray-600">
                    Check this option to feature this product and its uploaded images directly in the "Live Home Showcase" section on the front page.
                  </p>
                </div>
                <input
                  id="pFeaturedCheckbox"
                  type="checkbox"
                  checked={pFeatured}
                  onChange={(e) => setPFeatured(e.target.checked)}
                  className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Upload Product Images Section */}
              <div className="space-y-3 bg-[#F7F3E9] p-4 rounded-2xl border border-[#E5DFD3]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#231B15] text-xs flex items-center gap-2">
                    <span>Upload Product Images</span>
                    <span className="text-red-500">*</span>
                    <span className="px-2 py-0.5 bg-[#231B15] text-[#D4AF37] font-mono text-[10px] rounded-full">
                      {pImages.length} {pImages.length === 1 ? 'image' : 'images'}
                    </span>
                  </label>
                  <span className="text-[11px] text-[#B8860B] font-serif font-bold italic">
                    ★ First image automatically becomes the Product Thumbnail
                  </span>
                </div>

                {/* GitHub Cloud Storage Status Banner (Matching screenshot) */}
                <div className="bg-[#E8F8F0] p-3 sm:p-3.5 rounded-2xl border border-[#22C55E]/40 text-[#065F46] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#22C55E]/20 text-[#15803D] flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[#064E3B] flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span>GitHub Cloud Storage Target:</span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/90 border border-[#22C55E]/30 font-semibold text-[#065F46]">
                          kb3134/yaredkb-ecommerce
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#059669] text-white font-sans text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-xs">
                          READY · READ & WRITE
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 mt-0.5 font-sans font-medium text-[#047857]">
                        Successfully verified repository https://github.com/kb3134/yaredkb-ecommerce (Branch: main) with Read & Write access!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncAllCollectionImages}
                    disabled={isSyncingAllImages}
                    className="px-3.5 py-2 bg-white hover:bg-[#F0FDF4] text-[#065F46] border border-[#22C55E]/40 font-serif font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAllImages ? 'animate-spin text-[#059669]' : ''}`} />
                    <span>{isSyncingAllImages ? 'Syncing Collection...' : 'Sync All Collection Images to GitHub'}</span>
                  </button>
                </div>

                {/* File Upload Button + Image URL input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition shadow-sm ${
                    isUploadingProductImage ? 'bg-gray-400 text-white cursor-wait' : 'bg-[#231B15] hover:bg-black text-[#D4AF37]'
                  }`}>
                    <Upload className={`w-4 h-4 ${isUploadingProductImage ? 'animate-bounce text-white' : 'text-[#D4AF37]'}`} />
                    <span>{isUploadingProductImage ? 'Uploading & Syncing to GitHub...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingProductImage}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          setIsUploadingProductImage(true);
                          handleFileUpload(file, async (dataUrl) => {
                            try {
                              const res = await apiFetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  image: dataUrl,
                                  name: `${pName || 'collection'}-${Date.now()}`,
                                  destination: 'collection'
                                })
                              });
                              const data = await res.json();
                              if (data.success && data.url) {
                                setPImages(prev => [...prev, data.url]);
                                addToast('Image Uploaded to GitHub', `Image synced to kb3134/yaredkb-ecommerce repository!`);
                              } else {
                                setPImages(prev => [...prev, dataUrl]);
                              }
                            } catch {
                              setPImages(prev => [...prev, dataUrl]);
                            } finally {
                              setIsUploadingProductImage(false);
                              setFormError(null);
                            }
                          });
                        }
                      }}
                    />
                  </label>

                  <div className="flex flex-1 gap-1">
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)..."
                      value={pNewImageUrl}
                      onChange={(e) => setPNewImageUrl(e.target.value)}
                      className="flex-1 p-2.5 border border-[#E5DFD3] rounded-xl bg-white text-xs font-mono text-[#231B15]"
                    />
                    <button
                      type="button"
                      disabled={isUploadingProductImage || !pNewImageUrl.trim()}
                      onClick={async () => {
                        if (!pNewImageUrl.trim()) return;
                        const urlInput = pNewImageUrl.trim();
                        setPNewImageUrl('');
                        setIsUploadingProductImage(true);
                        try {
                          const res = await apiFetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              image: urlInput,
                              name: `${pName || 'collection'}-${Date.now()}`,
                              destination: 'collection'
                            })
                          });
                          const data = await res.json();
                          if (data.success && data.url) {
                            setPImages(prev => [...prev, data.url]);
                            addToast('Image Synced to GitHub', 'Image URL processed and pushed to GitHub storage target!');
                          } else {
                            setPImages(prev => [...prev, urlInput]);
                          }
                        } catch {
                          setPImages(prev => [...prev, urlInput]);
                        } finally {
                          setIsUploadingProductImage(false);
                          setFormError(null);
                        }
                      }}
                      className="px-4 py-2.5 bg-[#D4AF37] text-[#1A1817] font-bold rounded-xl hover:bg-amber-400 text-xs transition shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isUploadingProductImage ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Add & Sync Image</span>
                    </button>
                  </div>
                </div>

                {/* Images Preview Grid */}
                {pImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {pImages.map((img, idx) => {
                      const isGitHubSynced = img.includes('raw.githubusercontent.com') || img.includes('github.com');
                      return (
                        <div 
                          key={idx} 
                          className={`relative group h-32 rounded-xl overflow-hidden border-2 shadow-sm transition bg-white ${
                            idx === 0 ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : 'border-[#E5DFD3]'
                          }`}
                        >
                          <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Thumbnail badge for first image */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-[#231B15] text-[#D4AF37] text-[9px] font-serif font-bold px-2 py-0.5 rounded uppercase shadow-md">
                              ★ Primary Thumbnail
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const newImgs = [pImages[idx], ...pImages.filter((_, i) => i !== idx)];
                                setPImages(newImgs);
                              }}
                              className="absolute top-1 left-1 bg-black/70 hover:bg-[#D4AF37] hover:text-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm transition opacity-90 group-hover:opacity-100"
                              title="Set as Thumbnail"
                            >
                              Set Thumbnail
                            </button>
                          )}

                          {/* GitHub Sync Status Tag */}
                          <span className={`absolute bottom-1 left-1 text-[9px] font-serif font-bold px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs shadow-xs ${
                            isGitHubSynced ? 'bg-[#059669]/90 text-white' : 'bg-amber-600/90 text-white'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            <span>{isGitHubSynced ? 'GitHub Synced' : 'Ready to Sync'}</span>
                          </span>

                          {/* Delete image button */}
                          <button
                            type="button"
                            onClick={() => setPImages(pImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full hover:bg-red-600 transition shadow-md cursor-pointer"
                            title="Delete image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-[#E5DFD3] rounded-xl text-center text-gray-500 text-xs">
                    No images added yet. Upload an image file or paste a URL above to sync directly to GitHub Cloud Storage target <strong className="text-[#065F46] font-mono">kb3134/yaredkb-ecommerce</strong>.
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#231B15] mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows={3} 
                  required
                  value={pDesc} 
                  onChange={e => setPDesc(e.target.value)} 
                  placeholder="Enter complete product description, hand-weaving details, silk quality, and traditional heritage..."
                  className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs leading-relaxed focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>

              {/* Key Product Details & Highlights (Bullet Points) */}
              <div>
                <label className="block font-bold text-[#231B15] mb-0.5">
                  Key Details & Highlights <span className="text-gray-400 font-normal">(Bullet points in Details modal)</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-1">
                  Enter key feature bullet points line by line (e.g. <span className="font-mono">Pure silk-cotton blend</span> on line 1, <span className="font-mono">Authentic hand-woven loom finish</span> on line 2)
                </p>
                <textarea 
                  rows={3} 
                  value={pDetails} 
                  onChange={e => setPDetails(e.target.value)} 
                  placeholder={'Pure silk-cotton blend\nAuthentic hand-woven loom finish\nIncludes matching royal veil'}
                  className="w-full p-3 border border-[#E5DFD3] rounded-xl bg-white text-xs leading-relaxed focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>

              {/* Available Sizes (Optional) */}
              <div>
                <label className="block font-bold text-[#231B15] mb-0.5">
                  Available Sizes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-1">
                  Enter sizes separated by commas (e.g. <span className="font-mono">S, M, L, XL, Custom Fit</span>)
                </p>
                <input 
                  type="text" 
                  value={pSizes} 
                  onChange={e => setPSizes(e.target.value)} 
                  placeholder="e.g. S, M, L, XL, Tailored"
                  className="w-full p-2.5 border border-[#E5DFD3] rounded-xl bg-white text-xs focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>

              {/* Available Colors (Optional) */}
              <div>
                <label className="block font-bold text-[#231B15] mb-0.5">
                  Available Colors <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-1">
                  Enter colors separated by commas (e.g. <span className="font-mono">Gold & White, Crimson, Ivory</span>)
                </p>
                <input 
                  type="text" 
                  value={pColors} 
                  onChange={e => setPColors(e.target.value)} 
                  placeholder="e.g. Gold, Ivory, Royal Red"
                  className="w-full p-2.5 border border-[#E5DFD3] rounded-xl bg-white text-xs focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-[#E5DFD3]">
                <button 
                  type="button" 
                  onClick={() => setIsProductModalOpen(false)} 
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#231B15] rounded-xl font-bold transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#231B15] hover:bg-black text-[#D4AF37] border border-[#D4AF37]/50 font-serif font-bold uppercase tracking-wider rounded-xl shadow-lg transition text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {editingProductId ? 'Save Changes' : 'Save & Add Garment'}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Contact Message Details Inspector Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#FDFBF7] text-[#1A1817] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37] space-y-6 my-auto relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs font-bold uppercase tracking-widest text-[#B8860B]">
                    CLIENT INQUIRY DETAILS
                  </span>
                  {selectedMessage.read ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] uppercase">
                      Read
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#8B0000] text-white rounded font-bold text-[10px] uppercase">
                      Unread
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1817]">
                  {selectedMessage.subject}
                </h3>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-full bg-gray-200 text-gray-700 hover:bg-black hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5EFE4] p-4 rounded-2xl border border-[#E5DFD3] text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 font-serif font-bold uppercase tracking-wider block text-[10px]">
                  SENDER NAME
                </span>
                <span className="font-serif font-bold text-sm text-[#1A1817]">
                  {selectedMessage.fullName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-serif font-bold uppercase tracking-wider block text-[10px]">
                  DATE RECEIVED
                </span>
                <span className="font-mono text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#B8860B]" />
                  {new Date(selectedMessage.createdAt).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-serif font-bold uppercase tracking-wider block text-[10px]">
                  EMAIL ADDRESS
                </span>
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className="font-sans font-semibold text-[#8B0000] hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {selectedMessage.email}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-serif font-bold uppercase tracking-wider block text-[10px]">
                  PHONE NUMBER
                </span>
                {selectedMessage.phone ? (
                  <a 
                    href={`tel:${selectedMessage.phone}`}
                    className="font-mono font-semibold text-[#1A1817] hover:text-[#8B0000] flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#B8860B]" />
                    {selectedMessage.phone}
                  </a>
                ) : (
                  <span className="text-gray-400 italic font-sans">Not provided</span>
                )}
              </div>
            </div>

            {/* Message Body Box */}
            <div className="space-y-2">
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-gray-700">
                Message Content
              </label>
              <div className="p-5 bg-white border border-gray-300 rounded-2xl text-sm font-sans leading-relaxed text-[#1A1817] shadow-inner whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5DFD3]">
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Toggle Read / Unread */}
                <button
                  type="button"
                  onClick={() => {
                    const nextRead = !selectedMessage.read;
                    if (onToggleReadMessage) {
                      onToggleReadMessage(selectedMessage.id, nextRead);
                    }
                    setSelectedMessage(prev => prev ? { ...prev, read: nextRead } : null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto ${
                    selectedMessage.read
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  {selectedMessage.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                  <span>{selectedMessage.read ? 'Mark as Unread' : 'Mark as Read'}</span>
                </button>

                {/* Delete Message */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete message from ${selectedMessage.fullName}?`)) {
                      if (onDeleteMessage) {
                        onDeleteMessage(selectedMessage.id);
                      }
                      setSelectedMessage(null);
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-100 text-rose-800 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1A1817] text-[#D4AF37] hover:bg-black rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition"
              >
                Close Inspector
              </button>

            </div>

          </div>
        </div>
      )}

      {/* GitHub Storage Quick Configuration & Status Modal */}
      {isGitHubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#241A14] text-[#D4AF37] rounded-xl border border-[#D4AF37]/50">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#181310]">
                    GitHub Permanent Cloud Storage
                  </h3>
                  <p className="text-xs text-gray-500 font-sans">
                    Automatic upload and asset storage destination
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGitHubModalOpen(false)}
                className="p-2 text-gray-400 hover:text-black rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Card */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              storageStatus.loading
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : storageStatus.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 font-serif text-sm">
                  {storageStatus.loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                  ) : storageStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                  )}
                  <span>Storage Status: {storageStatus.success ? 'Ready · Connected' : 'Requires Setup'}</span>
                </span>
                {storageStatus.canWrite && (
                  <span className="px-2 py-0.5 bg-emerald-700 text-white font-sans text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Read & Write
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed font-sans opacity-90">
                {storageStatus.message}
              </p>
            </div>

            {/* Config Notice Alert */}
            {githubConfigNotice && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{githubConfigNotice}</span>
              </div>
            )}

            {/* GitHub Form Settings */}
            <form onSubmit={handleSaveAndTestGitHubConfig} className="space-y-4 text-xs font-sans">
              
              {/* Token Input */}
              <div className="space-y-1.5">
                <label className="font-serif font-bold text-[#181310] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>GitHub Personal Access Token</span>
                  </span>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#B8860B] hover:underline flex items-center gap-1"
                  >
                    <span>Generate on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={githubTokenInput}
                    onChange={(e) => setGithubTokenInput(e.target.value)}
                    placeholder="Enter or paste github_pat_... or ghp_..."
                    className="w-full py-2.5 px-3 bg-white border border-[#D4AF37]/50 rounded-xl font-mono text-xs text-[#181310] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Must have <strong>repo</strong> permissions or <strong>Contents: Read and write</strong> enabled for this repo.
                </p>
              </div>

              {/* Repo & Owner Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-serif font-bold text-[#181310]">Repository Owner</label>
                  <input
                    type="text"
                    value={githubOwnerInput}
                    onChange={(e) => setGithubOwnerInput(e.target.value)}
                    placeholder="kb3134"
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl font-mono text-xs text-[#181310] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-serif font-bold text-[#181310]">Repository Name</label>
                  <input
                    type="text"
                    value={githubRepoInput}
                    onChange={(e) => setGithubRepoInput(e.target.value)}
                    placeholder="yaredkb-ecommerce"
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl font-mono text-xs text-[#181310] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Branch & Folder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-serif font-bold text-[#181310]">Target Branch</label>
                  <input
                    type="text"
                    value={githubBranchInput}
                    onChange={(e) => setGithubBranchInput(e.target.value)}
                    placeholder="main"
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl font-mono text-xs text-[#181310] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-serif font-bold text-[#181310]">Upload Folder</label>
                  <input
                    type="text"
                    value={githubFolderInput}
                    onChange={(e) => setGithubFolderInput(e.target.value)}
                    placeholder="public/uploads"
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl font-mono text-xs text-[#181310] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => testStorageConnection(githubTokenInput || undefined)}
                  disabled={storageStatus.loading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 rounded-xl font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${storageStatus.loading ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsGitHubModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingGitHub}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#241A14] text-[#D4AF37] hover:bg-black rounded-xl font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    {isSavingGitHub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save & Test Now</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Media Picker Modal removed */}

    </div>
  );
};

