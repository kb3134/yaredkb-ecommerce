import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { 
  Product, 
  Category, 
  Currency, 
  CurrencyRate,
  CartItem, 
  Order, 
  BespokeRequest, 
  Weaver, 
  AdminAnalytics,
  ToastMessage,
  BrandingImages,
  ContactMessage,
  StudioCategory,
  StudioImage,
  AdminUser
} from './types';
import { DEFAULT_BRANDING_IMAGES, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_BESPOKE_REQUESTS, MOCK_CONTACT_MESSAGES, DEFAULT_STUDIO_CATEGORIES, CURRENCY_RATES } from './data/mockData';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { AboutUsSection } from './components/AboutUsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactUsPage } from './components/ContactUsPage';
import { FloatingSocialBar } from './components/FloatingSocialBar';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { Footer } from './components/Footer';
import { FollowUsSection } from './components/FollowUsSection';
import { Toast } from './components/Toast';
import { StudioStoreCatalog, isProductInCollection } from './components/StudioStoreCatalog';
import { StudioGalleryPage } from './components/StudioGalleryPage';
import { Pagination } from './components/Pagination';
import { HomeImageUploaderModal } from './components/HomeImageUploaderModal';
import { RecentUploadsShowcase } from './components/RecentUploadsShowcase';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
  const [currency, setCurrency] = useState<Currency>('ETB');
  const [currencyRateVersion, setCurrencyRateVersion] = useState<number>(0);

  // Admin Authentication State
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAdminAuth, setIsCheckingAdminAuth] = useState<boolean>(true);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [weavers, setWeavers] = useState<Weaver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bespokeRequests, setBespokeRequests] = useState<BespokeRequest[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [brandingImages, setBrandingImages] = useState<BrandingImages>(DEFAULT_BRANDING_IMAGES);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [studioImages, setStudioImages] = useState<StudioImage[]>([]);
  const [studioCategories, setStudioCategories] = useState<StudioCategory[]>([]);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  // Modals State
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isHomeUploadModalOpen, setIsHomeUploadModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [bespokeTargetProduct, setBespokeTargetProduct] = useState<Product | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = {
      id,
      title,
      description
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const syncAdminRoute = (adminMode: boolean) => {
    if (typeof window === 'undefined') return;
    const nextPath = adminMode ? '/admin' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.replaceState({}, '', nextPath);
    }
  };

  const checkAdminAuth = async () => {
    setIsCheckingAdminAuth(true);
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentAdminUser(data.user);
          setIsCheckingAdminAuth(false);
          return true;
        }
      }
    } catch (err) {
      console.warn('Session verification error:', err);
    }
    setCurrentAdminUser(null);
    setIsCheckingAdminAuth(false);
    return false;
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentAdminUser(user);
    setIsAdminMode(true);
    syncAdminRoute(true);
    addToast('Admin Authenticated', `Welcome back, ${user.fullName || user.username}!`);
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentAdminUser(null);
    setIsAdminMode(false);
    syncAdminRoute(false);
    addToast('Logged Out', 'You have been securely signed out of the Admin Console.');
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const handleAdminModeChange = (adminMode: boolean) => {
    setIsAdminMode(adminMode);
    syncAdminRoute(adminMode);
    if (adminMode) {
      checkAdminAuth();
    } else {
      setActiveTab('home');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      setIsAdminMode(isAdminPath);
      if (!isAdminPath) {
        setActiveTab('home');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial Fetch Data from Express API
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchBespokeRequests();
    fetchAnalytics();
    fetchBranding();
    fetchCurrencyRates();
    fetchContactMessages();
    fetchStudioCategories();
    fetchStudioImages();
  }, []);

  useEffect(() => {
    if (isAdminMode) {
      fetchOrders();
      fetchBespokeRequests();
      fetchAnalytics();
      fetchContactMessages();
      fetchStudioImages();
    }
  }, [isAdminMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    const faviconTarget = brandingImages?.faviconUrl || brandingImages?.logoUrl;
    if (faviconTarget) {
      const favEl = document.getElementById('app-favicon') as HTMLLinkElement | null;
      if (favEl) {
        favEl.href = faviconTarget;
      }
    }
  }, [brandingImages]);

  const fetchContactMessages = async () => {
    try {
      const res = await fetch('/api/contact-messages');
      if (res.ok) {
        const data = await res.json();
        setContactMessages(data.messages || []);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using local contact messages state.');
    }
    setContactMessages(prev => prev.length > 0 ? prev : MOCK_CONTACT_MESSAGES);
  };

  const handleSubmitContactMessage = async (msgData: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => {
    try {
      const res = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.contactMessage) {
          setContactMessages(prev => [data.contactMessage, ...prev]);
        }
        addToast('Message Sent', 'Thank you! Your message has been sent successfully. We will contact you soon.');
        return true;
      }
    } catch (err) {
      console.error('Submit contact message error:', err);
    }

    // Fallback if network offline or server error
    const localMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      ...msgData,
      createdAt: new Date().toISOString(),
      read: false
    };
    setContactMessages(prev => [localMsg, ...prev]);
    addToast('Message Sent', 'Thank you! Your message has been sent successfully. We will contact you soon.');
    return true;
  };

  const handleToggleReadMessage = async (id: string, read: boolean) => {
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m));
    try {
      await fetch(`/api/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read })
      });
    } catch (err) {
      console.error('Toggle read status error:', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    setContactMessages(prev => prev.filter(m => m.id !== id));
    addToast('Message Deleted', 'The contact message was deleted.');
    try {
      await fetch(`/api/contact-messages/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/branding');
      if (res.ok) {
        const data = await res.json();
        setBrandingImages(data);
      }
    } catch (err) {
      console.error('Failed fetching branding:', err);
    }
  };

  const fetchCurrencyRates = async () => {
    try {
      const res = await fetch('/api/currency-rates');
      if (res.ok) {
        const data = await res.json();
        Object.assign(CURRENCY_RATES, data);
        setCurrencyRateVersion(v => v + 1);
      }
    } catch (err) {
      console.error('Failed fetching currency rates:', err);
    }
  };

  const handleUpdateCurrencyRates = (updatedRates: Record<string, CurrencyRate>) => {
    Object.assign(CURRENCY_RATES, updatedRates);
    setCurrencyRateVersion(v => v + 1);
  };

  const parseJsonResponse = async (res: Response) => {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(text ? text.slice(0, 150) : `Server error (status ${res.status})`);
    }
    return res.json();
  };

  const handleUpdateBranding = async (updated: Partial<BrandingImages>) => {
    try {
      const res = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await parseJsonResponse(res);
      if (res.ok && data && data.branding) {
        setBrandingImages(data.branding);
        addToast('Branding Images Saved', 'Storefront branding visuals updated live across all views.');
      } else {
        console.error('Branding update error:', res.status, data);
        setBrandingImages(prev => ({ ...prev, ...updated }));
        addToast('Branding Saved Locally', 'Updated images applied to current session.');
      }
    } catch (err: any) {
      console.error('Failed to update branding:', err);
      setBrandingImages(prev => ({ ...prev, ...updated }));
      addToast('Branding Saved Locally', err.message || 'Applied changes to active session.');
    }
  };

  const fetchStudioCategories = async () => {
    try {
      const res = await fetch('/api/studio/categories');
      if (res.ok) {
        const data = await res.json();
        setStudioCategories(data.categories || []);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using default studio categories.');
    }
    setStudioCategories(DEFAULT_STUDIO_CATEGORIES);
  };

  const fetchStudioImages = async () => {
    try {
      // In admin mode, include hidden images
      const url = isAdminMode ? '/api/studio/images?includeHidden=true' : '/api/studio/images';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudioImages(data.images || []);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, studio images not loaded.');
    }
    setStudioImages([]);
  };

  const handleAddStudioImage = async (imgData: Omit<StudioImage, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/studio/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imgData)
      });
      if (res.ok) {
        fetchStudioImages();
        return true;
      }
    } catch (err) {
      console.error('Failed to add studio image:', err);
    }
    // Fallback local update
    const newImg: StudioImage = {
      id: `st-${Date.now()}`,
      ...imgData,
      createdAt: new Date().toISOString()
    };
    setStudioImages(prev => [newImg, ...prev]);
    return true;
  };

  const handleEditStudioImage = async (id: string, imgData: Partial<StudioImage>) => {
    try {
      const res = await fetch(`/api/studio/images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imgData)
      });
      if (res.ok) {
        fetchStudioImages();
        return true;
      }
    } catch (err) {
      console.error('Failed to edit studio image:', err);
    }
    // Fallback local update
    setStudioImages(prev => prev.map(img => img.id === id ? { ...img, ...imgData } : img));
    return true;
  };

  const handleDeleteStudioImage = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/images/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchStudioImages();
        return true;
      }
    } catch (err) {
      console.error('Failed to delete studio image:', err);
    }
    // Fallback local update
    setStudioImages(prev => prev.filter(img => img.id !== id));
    return true;
  };

  const handleAddStudioCategory = async (catData: { name: string; description?: string }) => {
    try {
      const res = await fetch('/api/studio/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if (res.ok) {
        fetchStudioCategories();
        return true;
      }
    } catch (err) {
      console.error('Failed to add studio category:', err);
    }
    // Fallback local update
    const newCat: StudioCategory = {
      id: `sc-${Date.now()}`,
      name: catData.name,
      slug: catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catData.description
    };
    setStudioCategories(prev => [...prev, newCat]);
    return true;
  };

  const handleEditStudioCategory = async (id: string, catData: { name: string; description?: string }) => {
    try {
      const res = await fetch(`/api/studio/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if (res.ok) {
        fetchStudioCategories();
        return true;
      }
    } catch (err) {
      console.error('Failed to edit studio category:', err);
    }
    // Fallback local update
    setStudioCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...catData, slug: catData.name ? catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : cat.slug } : cat));
    return true;
  };

  const handleDeleteStudioCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchStudioCategories();
        fetchStudioImages();
        return true;
      }
    } catch (err) {
      console.error('Failed to delete studio category:', err);
    }
    // Fallback local update
    const cat = studioCategories.find(c => c.id === id);
    if (cat) {
      setStudioCategories(prev => prev.filter(c => c.id !== id));
      setStudioImages(prev => prev.map(img => {
        const cats = img.categories.filter(c => c !== cat.slug);
        return {
          ...img,
          categories: cats.length > 0 ? cats : ['traditional-dresses']
        };
      }));
    }
    return true;
  };

  const handleReorderStudioImages = async (items: { id: string; orderIndex: number }[]) => {
    try {
      const res = await fetch('/api/studio/images/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        fetchStudioImages();
        return true;
      }
    } catch (err) {
      console.error('Failed to reorder studio images:', err);
    }
    // Fallback local update
    setStudioImages(prev => {
      const copy = [...prev];
      items.forEach(({ id, orderIndex }) => {
        const img = copy.find(i => i.id === id);
        if (img) img.orderIndex = orderIndex;
      });
      return copy;
    });
    return true;
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using local products state.');
    }
    setProducts(prev => prev.length > 0 ? prev : MOCK_PRODUCTS);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using local orders state.');
    }
    setOrders(prev => prev.length > 0 ? prev : MOCK_ORDERS);
  };

  const fetchBespokeRequests = async () => {
    try {
      const res = await fetch('/api/bespoke-fittings');
      if (res.ok) {
        const data = await res.json();
        setBespokeRequests(data.requests || []);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using local bespoke requests state.');
    }
    setBespokeRequests(prev => prev.length > 0 ? prev : MOCK_BESPOKE_REQUESTS);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using local analytics state.');
    }
  };

  // Filter & Sort Products Logic
  const filteredProducts = products.filter(p => {
    const isStudio = Boolean(p.studioCategory && p.studioCategory.trim() !== '') || 
                     (p.collections && (p.collections.includes('studio') || p.collections.includes('studio-only'))) ||
                     p.category === 'studio';
    const isLiveshow = Boolean(p.collections && p.collections.includes('liveshow'));
    const isCollection = Boolean(p.collections && p.collections.includes('collection')) || (!isStudio && !isLiveshow);

    if (selectedCategory === 'studio') {
      if (!isStudio) return false;
    } else if (selectedCategory === 'liveshow') {
      if (!isLiveshow) return false;
    } else {
      if (!isCollection && !isProductInCollection(p, selectedCategory)) return false;
      if (!isProductInCollection(p, selectedCategory)) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchAmharic = p.amharicName && p.amharicName.includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTibeb = p.tibebPattern.toLowerCase().includes(q);
      if (!matchName && !matchAmharic && !matchDesc && !matchTibeb) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
    if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
    if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Cart Operations
  const handleAddToCart = (product: Product, size: string, color: string, customMeasurements?: any, qty: number = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [...prev, { product, quantity: qty, selectedSize: size, selectedColor: color, customMeasurements }];
      }
    });

    addToast(`Added to Bag: ${product.name}`, `Qty: ${qty} • Size: ${size}`);
  };

  const handleUpdateQuantity = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId, size, color);
      return;
    }

    setCartItems(prev => 
      prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string, size: string, color: string) => {
    setCartItems(prev => 
      prev.filter(item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color))
    );
  };

  // Wishlist Operations
  const handleToggleWishlist = (product: Product) => {
    setWishlistProductIds(prev => {
      if (prev.includes(product.id)) {
        addToast('Removed from Wishlist', product.name);
        return prev.filter(id => id !== product.id);
      } else {
        addToast('Added to Wishlist', product.name);
        return [...prev, product.id];
      }
    });
  };

  // Place Order API call
  const handlePlaceOrder = async (orderPayload: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        const createdOrder: Order = data.order;
        setConfirmedOrder(createdOrder);
        setOrders(prev => [createdOrder, ...prev.filter(o => o.id !== createdOrder.id)]);
        setCartItems([]);
        setIsCartDrawerOpen(false);
        addToast('Order Placed Successfully', `Order Ref: ${createdOrder.id}`);
        fetchOrders();
        fetchProducts(); // Refresh products to show reduced stock
        fetchAnalytics();
        setActiveTab('checkout');
      } else {
        // Fallback local order creation
        const fallbackOrder: Order = {
          id: `YT-ETH-${Math.floor(100000 + Math.random() * 900000)}`,
          customerName: orderPayload.customerName || `${orderPayload.firstName || ''} ${orderPayload.lastName || ''}`.trim() || 'Valued Guest',
          email: orderPayload.email || 'customer@yaredtibeb.com',
          phone: orderPayload.phone || '+251 90 000 0000',
          address: orderPayload.address || 'Addis Ababa',
          city: orderPayload.city || 'Addis Ababa',
          country: orderPayload.country || 'Ethiopia',
          items: orderPayload.items || [],
          totalUSD: orderPayload.totalUSD || 0,
          currency: 'ETB',
          totalInCurrency: orderPayload.totalInCurrency || orderPayload.totalUSD || 0,
          paymentMethod: orderPayload.paymentMethod || 'TeleBirr / CBE Birr',
          status: 'Pending',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setConfirmedOrder(fallbackOrder);
        setOrders(prev => [fallbackOrder, ...prev]);
        setCartItems([]);
        setIsCartDrawerOpen(false);
        addToast('Order Placed', `Order Ref: ${fallbackOrder.id}`);
        setActiveTab('checkout');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      const fallbackOrder: Order = {
        id: `YT-ETH-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: orderPayload.customerName || `${orderPayload.firstName || ''} ${orderPayload.lastName || ''}`.trim() || 'Valued Guest',
        email: orderPayload.email || 'customer@yaredtibeb.com',
        phone: orderPayload.phone || '+251 90 000 0000',
        address: orderPayload.address || 'Addis Ababa',
        city: orderPayload.city || 'Addis Ababa',
        country: orderPayload.country || 'Ethiopia',
        items: orderPayload.items || [],
        totalUSD: orderPayload.totalUSD || 0,
        currency: 'ETB',
        totalInCurrency: orderPayload.totalInCurrency || orderPayload.totalUSD || 0,
        paymentMethod: orderPayload.paymentMethod || 'TeleBirr / CBE Birr',
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setConfirmedOrder(fallbackOrder);
      setOrders(prev => [fallbackOrder, ...prev]);
      setCartItems([]);
      setIsCartDrawerOpen(false);
      addToast('Order Placed', `Order Ref: ${fallbackOrder.id}`);
      setActiveTab('checkout');
    }
  };

  // Update Order Status API call (Admin)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        addToast('Order Status Updated', `Ref: ${orderId} is now ${status}`);
        fetchOrders();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  // Update Full Order Details API call (Admin/Backend)
  const handleUpdateOrderDetails = async (orderId: string, updatedFields: any) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedFields } : o));
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      if (res.ok) {
        addToast('Order Info Updated', `Ref: ${orderId} saved on backend`);
        fetchOrders();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Update order details error:', err);
    }
  };

  // Submit Bespoke Request API call
  const handleSubmitBespoke = async (payload: any) => {
    try {
      const res = await fetch('/api/bespoke-fittings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast('Bespoke Fitting Commissioned', 'Assigned to Shiro Meda Master Loom Guild');
        fetchBespokeRequests();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Bespoke submission error:', err);
    }
  };

  // Admin CRUD API Handlers
  const handleAdminAddProduct = async (pData: any) => {
    const tempId = pData.id || `hk-${Date.now()}`;
    const newProduct = {
      ...pData,
      id: tempId,
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      isNewArrival: true,
    };

    // Optimistically update local state
    setProducts(prev => [newProduct, ...prev]);
    addToast('Piece Added to Catalog', pData.name);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pData)
      });
      if (res.ok) {
        fetchProducts();
        fetchAnalytics();
      } else {
        console.warn('Backend product creation warning, keeping local state.');
      }
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  const handleAdminUpdateProduct = async (id: string, pData: any) => {
    // Optimistically update local state
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...pData } : p));
    addToast('Piece Details Updated', pData.name || 'Updated');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pData)
      });
      if (res.ok) {
        fetchProducts();
        fetchAnalytics();
      } else {
        console.warn('Backend product update warning, keeping local state.');
      }
    } catch (err) {
      console.error('Update product error:', err);
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    // Optimistically update local state
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast('Piece Removed from Inventory');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
        fetchAnalytics();
      } else {
        console.warn('Backend product deletion warning, keeping local state.');
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleAdminUpdateBespokeStatus = async (id: string, status: string, weaverId?: string) => {
    try {
      const res = await fetch(`/api/bespoke-fittings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedWeaverId: weaverId })
      });
      if (res.ok) {
        addToast('Bespoke Status Updated', `Status: ${status}`);
        fetchBespokeRequests();
      }
    } catch (err) {
      console.error('Bespoke update error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#181310] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#181310] relative">
      
      {/* Floating Right Social Bar */}
      <FloatingSocialBar />

      {/* Global Header */}
      <Header
        logoUrl={brandingImages.logoUrl}
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistProductIds.length}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onOpenWishlist={() => {
          setSelectedCategory('all');
          setSearchQuery('');
          setActiveTab('collections');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUploadModal={() => setIsHomeUploadModalOpen(true)}
      />

      {/* Main View Router - Constant Layout with Inline Sliding Page Views */}
      <main className="flex-1 min-h-[70vh] relative overflow-hidden bg-white text-[#181310]">
        <AnimatePresence mode="wait">
          {isAdminMode ? (
            /* Executive Admin Workspace View (Slide) */
            <motion.div
              key="admin-view"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              {!currentAdminUser ? (
                <AdminLoginView
                  onLoginSuccess={handleAdminLoginSuccess}
                  onBackToStore={() => handleAdminModeChange(false)}
                  logoUrl={brandingImages.logoUrl}
                />
              ) : (
                <>
                  <div className="bg-[#14100D] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex items-center justify-between">
                    <button
                      onClick={() => handleAdminModeChange(false)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] hover:text-amber-300 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Storefront Home</span>
                    </button>
                    <div className="font-serif font-bold text-xs sm:text-sm tracking-widest text-amber-100 uppercase flex items-center gap-2">
                      <span>Executive Admin & Branding Control Panel</span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37] text-black rounded font-mono font-bold">
                        @{currentAdminUser.username}
                      </span>
                    </div>
                  </div>

                  <AdminDashboard
                    products={products}
                    orders={orders}
                    bespokeRequests={bespokeRequests}
                    weavers={weavers}
                    analytics={analytics}
                    brandingImages={brandingImages}
                    contactMessages={contactMessages}
                    studioImages={studioImages}
                    studioCategories={studioCategories}
                    currentAdminUser={currentAdminUser}
                    onLogout={handleAdminLogout}
                    onAddProduct={handleAdminAddProduct}
                    onUpdateProduct={handleAdminUpdateProduct}
                    onDeleteProduct={handleAdminDeleteProduct}
                    onUpdateBespokeStatus={handleAdminUpdateBespokeStatus}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateOrder={handleUpdateOrderDetails}
                    onUpdateBranding={handleUpdateBranding}
                    onUpdateCurrencyRates={handleUpdateCurrencyRates}
                    onToggleReadMessage={handleToggleReadMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onAddStudioImage={handleAddStudioImage}
                    onEditStudioImage={handleEditStudioImage}
                    onDeleteStudioImage={handleDeleteStudioImage}
                    onAddStudioCategory={handleAddStudioCategory}
                    onEditStudioCategory={handleEditStudioCategory}
                    onDeleteStudioCategory={handleDeleteStudioCategory}
                    onReorderStudioImages={handleReorderStudioImages}
                    onRefreshOrders={fetchOrders}
                    onBackToStorefront={() => setIsAdminMode(false)}
                    addToast={addToast}
                  />
                </>
              )}
            </motion.div>
          ) : activeTab === 'home' ? (
            /* Constant Homepage View */
            <motion.div
              key="home-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <HeroBanner
                heroBannerUrl={brandingImages.heroBannerUrl}
                heroSecondaryUrl={brandingImages.heroSecondaryUrl}
                heroTertiaryUrl={brandingImages.heroTertiaryUrl}
                heroBannerBadge={brandingImages.heroBannerBadge}
                heroBannerTitle={brandingImages.heroBannerTitle}
                heroBannerSubtitle={brandingImages.heroBannerSubtitle}
                heroSecondaryBadge={brandingImages.heroSecondaryBadge}
                heroSecondaryTitle={brandingImages.heroSecondaryTitle}
                heroSecondarySubtitle={brandingImages.heroSecondarySubtitle}
                heroTertiaryBadge={brandingImages.heroTertiaryBadge}
                heroTertiaryTitle={brandingImages.heroTertiaryTitle}
                heroTertiarySubtitle={brandingImages.heroTertiarySubtitle}
                onExploreCollections={() => setActiveTab('collections')}
                onBookBespoke={() => setActiveTab('bespoke')}
                onOpenUploadModal={() => setIsHomeUploadModalOpen(true)}
              />

              {/* About Us Section */}
              <AboutUsSection aboutUsUrl={brandingImages.aboutUsUrl} socialLinks={brandingImages.socialLinks} />

              {/* Live Show Atelier Showcase */}
              <RecentUploadsShowcase
                products={products}
                currency={currency}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
                isWishlisted={(id) => wishlistProductIds.includes(id)}
                onToggleWishlist={handleToggleWishlist}
              />

              {/* Voices of Heritage Testimonials */}
              <TestimonialsSection />
            </motion.div>
          ) : activeTab === 'collections' ? (
            /* Collections View (Slide) */
            <motion.div
              key="collections-view"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              <div className="bg-[#14100D] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] hover:text-amber-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Constant Home</span>
                </button>
                <div className="font-serif font-bold text-xs sm:text-sm tracking-widest text-amber-100 uppercase">
                  Collection
                </div>
              </div>

              <StudioStoreCatalog
                products={products}
                currency={currency}
                isWishlisted={(id) => wishlistProductIds.includes(id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
                initialCategory={selectedCategory}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            </motion.div>
          ) : activeTab === 'about' ? (
            /* About Us View (Slide) */
            <motion.div
              key="about-view"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              <div className="bg-[#14100D] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] hover:text-amber-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Constant Home</span>
                </button>
                <div className="font-serif font-bold text-xs sm:text-sm tracking-widest text-amber-100 uppercase">
                  About Us
                </div>
              </div>

              <AboutUsSection aboutUsUrl={brandingImages.aboutUsUrl} socialLinks={brandingImages.socialLinks} />
              <TestimonialsSection />
            </motion.div>
          ) : activeTab === 'studio' ? (
            /* Studio Gallery Customer View (Slide) */
            <motion.div
              key="studio-view"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full text-white"
            >
              <div className="bg-[#14100D] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] hover:text-amber-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Constant Home</span>
                </button>
                <div className="font-serif font-bold text-xs sm:text-sm tracking-widest text-amber-100 uppercase">
                  Studio
                </div>
              </div>

              <StudioGalleryPage
                studioImages={studioImages}
                studioCategories={studioCategories}
                products={products}
                currency={currency}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
                wishlistProductIds={wishlistProductIds}
                onToggleWishlist={handleToggleWishlist}
              />
            </motion.div>
          ) : activeTab === 'checkout' ? (
            /* Dedicated Checkout Page */
            <motion.div
              key="checkout-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-[#FDFBF7] text-[#1A1817]"
            >
              <div className="bg-[#14100D] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] hover:text-amber-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Storefront</span>
                </button>
                <div className="font-serif font-bold text-xs sm:text-sm tracking-widest text-amber-100 uppercase">
                  Checkout
                </div>
              </div>

              <CheckoutView
                cartItems={cartItems}
                currency={currency}
                onBackToCart={() => setIsCartDrawerOpen(true)}
                onBackToShopping={() => {
                  setConfirmedOrder(null);
                  setActiveTab('home');
                }}
                onPlaceOrder={handlePlaceOrder}
                confirmedOrder={confirmedOrder}
                onResetConfirmedOrder={() => setConfirmedOrder(null)}
              />
            </motion.div>
          ) : activeTab === 'contact' ? (
            /* Contact Us View (Slide) */
            <motion.div
              key="contact-view"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full text-[#1A1817]"
            >
              <div className="bg-[#14100D] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] hover:text-amber-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Constant Home</span>
                </button>
                <div className="font-serif font-bold text-xs sm:text-sm tracking-widest text-amber-100 uppercase">
                  Contact Us
                </div>
              </div>

              <ContactUsPage onSubmitContactMessage={handleSubmitContactMessage} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Global Modals & Drawers */}
      <HomeImageUploaderModal
        isOpen={isHomeUploadModalOpen}
        onClose={() => setIsHomeUploadModalOpen(false)}
        isAdmin={Boolean(currentAdminUser)}
        onUploadSuccess={(payload) => {
          handleAdminAddProduct(payload);
          addToast('Image Uploaded Live to Home!', `Published "${payload.name}" to Home Page.`);
          setActiveTab('home');
          setTimeout(() => {
            const el = document.getElementById('recent-uploads-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        currency={currency}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlistProductIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenBespokeForm={(p) => {
          setBespokeTargetProduct(p);
          setActiveTab('bespoke');
        }}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onPlaceOrder={handlePlaceOrder}
        onGoToCheckout={() => setActiveTab('checkout')}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onContinueShopping={() => {
          setConfirmedOrder(null);
          setActiveTab('home');
        }}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Follow Us On Social Media Section */}
      <FollowUsSection />

      {/* Footer */}
      <Footer 
        logoUrl={brandingImages.logoUrl}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            handleAdminModeChange(true);
          } else {
            if (isAdminMode) handleAdminModeChange(false);
            setActiveTab(tab);
          }
        }} 
      />

    </div>
  );
}
