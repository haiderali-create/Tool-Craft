import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Search } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { createDefaultSettings } from './data/defaultStoreSeed';
import { auth } from './firebase';
import {
  fetchStorefrontWithFallback,
  isAuthorizedAdminUser,
  readCachedStorefront,
  signOutAdminFirebase,
  subscribeStorefrontRealtime,
  writeCachedStorefront,
} from './services/firestoreStore';
import type { Product, ProductCategory, StoreSettings } from './types';
import {
  filterAndSortProducts,
  formatEnabledGatewayNames,
  PRODUCT_CATEGORIES,
  selectHeroShowcaseProducts,
  type SortOption,
} from './utils/storeLogic';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { HowItWorksSection } from './components/HowItWorksSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { type AdminAuthMode, AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';

const DEFAULT_SETTINGS: StoreSettings = createDefaultSettings();

export default function App() {
  const [initialSnapshot] = useState(() => readCachedStorefront());
  const [settings, setSettings] = useState<StoreSettings>(
    () => initialSnapshot?.settings || DEFAULT_SETTINGS
  );
  const [products, setProducts] = useState<Product[]>(() => initialSnapshot?.products || []);
  const [loading, setLoading] = useState<boolean>(() => !initialSnapshot);
  const [loadError, setLoadError] = useState('');
  const latestSettingsRef = useRef<StoreSettings>(settings);
  const latestProductsRef = useRef<Product[]>(products);
  latestSettingsRef.current = settings;
  latestProductsRef.current = products;

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem('toolcraft_admin_token');
    } catch {
      return null;
    }
  });
  const [adminAuthMode, setAdminAuthMode] = useState<AdminAuthMode>('server');
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');

  const fetchStorefront = useCallback(async () => {
    try {
      const data = await fetchStorefrontWithFallback();
      setSettings(data.settings);
      setProducts(data.products || []);
      latestSettingsRef.current = data.settings;
      latestProductsRef.current = data.products || [];
      setLoadError('');
    } catch {
      if (latestProductsRef.current.length === 0) {
        setLoadError('Unable to load products right now. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminSession = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }
      const res = await fetch('/api/admin/session', {
        credentials: 'include',
        headers,
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.authenticated && data.username) {
        setAdminUser((prev) => prev || data.username);
        setAdminAuthMode((prev) => (prev === 'firebase' ? 'firebase' : 'server'));
      } else {
        setAdminToken(null);
        try {
          window.sessionStorage.removeItem('toolcraft_admin_token');
        } catch {
          // Ignore storage error
        }
      }
    } catch {
      // Ignore silent session check errors
    }
  }, [adminToken]);

  useEffect(() => {
    fetchStorefront();
    checkAdminSession();
    const unsubscribeRealtime = subscribeStorefrontRealtime({
      onSettings: (nextSettings) => {
        setSettings(nextSettings);
        latestSettingsRef.current = nextSettings;
        if (latestProductsRef.current.length > 0) {
          writeCachedStorefront(nextSettings, latestProductsRef.current);
        }
      },
      onProducts: (nextProducts) => {
        setProducts(nextProducts);
        latestProductsRef.current = nextProducts;
        setLoading(false);
        setLoadError('');
        writeCachedStorefront(latestSettingsRef.current, nextProducts);
      },
    });
    return () => unsubscribeRealtime();
  }, [fetchStorefront, checkAdminSession]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const authorized = await isAuthorizedAdminUser(user);
      if (authorized) {
        setAdminUser(user.email || user.displayName || 'Admin');
        setAdminAuthMode('firebase');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (adminUser) {
          setViewMode('admin');
        } else {
          setAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [adminUser]);

  const handleOpenAdmin = () => {
    if (adminUser) {
      setViewMode('admin');
    } else {
      setAdminLoginOpen(true);
    }
  };

  const saveAdminSession = (username: string, token?: string, mode: AdminAuthMode = 'server') => {
    setAdminUser(username);
    setAdminAuthMode(mode);
    if (token) {
      setAdminToken(token);
      try {
        window.sessionStorage.setItem('toolcraft_admin_token', token);
      } catch {
        // Ignore storage error
      }
    }
  };

  const handleAdminLogout = async () => {
    await signOutAdminFirebase();
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore logout network error
    }
    setAdminUser(null);
    setAdminToken(null);
    setAdminAuthMode('server');
    try {
      window.sessionStorage.removeItem('toolcraft_admin_token');
    } catch {
      // Ignore storage error
    }
    setViewMode('store');
  };

  if (viewMode === 'admin' && adminUser) {
    return (
      <AdminDashboard
        username={adminUser}
        authToken={adminToken}
        authMode={adminAuthMode}
        onExitToStore={() => {
          fetchStorefront();
          setViewMode('store');
        }}
        onLogout={handleAdminLogout}
        onStoreDataChanged={fetchStorefront}
        onCredentialsUpdated={(nextUser, nextToken) => saveAdminSession(nextUser, nextToken, 'server')}
      />
    );
  }

  const visibleProducts = filterAndSortProducts(products, {
    category: selectedCategory,
    search: searchQuery,
    sortBy,
  });

  const heroProducts = selectHeroShowcaseProducts(products, 6);
  const activeGatewayNames = formatEnabledGatewayNames(settings.gateways, 'or');
  const activeGatewayStrip =
    settings.gateways
      .filter((g) => g.enabled)
      .map((g) => g.label.replace(/\s*\(.*\)$/, '').trim())
      .join(' · ') || 'Easypaisa · Binance';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#0D0F12]">
      {loading && !initialSnapshot ? (
        <>
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E2E5EA]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
              <div className="h-7 w-32 rounded-md bg-[#E2E5EA] animate-pulse" />
              <div className="h-9 w-28 rounded-lg bg-[#E2E5EA] animate-pulse" />
            </div>
          </header>

          <main className="flex-1">
            <section className="pt-8 pb-10 sm:pt-12 sm:pb-12 bg-white border-b border-[#E2E5EA]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-4 w-48 rounded bg-[#E2E5EA] animate-pulse" />
                  <div className="h-12 w-3/4 rounded-lg bg-[#E2E5EA] animate-pulse" />
                  <div className="h-5 w-2/3 rounded bg-[#F4F5F7] animate-pulse" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-11 w-36 rounded-lg bg-[#E2E5EA] animate-pulse" />
                    <div className="h-11 w-44 rounded-lg bg-[#F4F5F7] animate-pulse" />
                  </div>
                </div>
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-16 rounded-xl bg-[#F4F5F7] border border-[#E2E5EA] animate-pulse" />
                  ))}
                </div>
              </div>
            </section>
            <section className="py-10 sm:py-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-72 bg-white border border-[#E2E5EA] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </section>
          </main>
        </>
      ) : (
        <>
          <Navbar
            storeName={settings.storeName}
            whatsappNumber={settings.whatsappNumber}
          />

          <main className="flex-1">
            <HeroSection
              tagline={settings.tagline}
              whatsappDisplay={settings.whatsappDisplay}
              whatsappNumber={settings.whatsappNumber}
              toolCount={products.length}
              heroProducts={heroProducts}
              onSelectProduct={(p) => setCheckoutProduct(p)}
              gatewayNamesText={activeGatewayNames}
              gatewayStripText={activeGatewayStrip}
            />

        {/* Catalog & Categories Section */}
        <section id="catalog" className="py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0F12]">
                  AI &amp; Creative Tool Catalog
                </h2>
                <p className="mt-1 text-sm text-[#525866]">
                  Click Buy Now on any tool for {activeGatewayNames} &amp; WhatsApp checkout.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#8A92A0] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    aria-label="Search AI tools"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Pro Subscriptions..."
                    className="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] focus:outline-none focus:border-[#0D0F12]"
                  />
                </div>

                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="min-h-[42px] px-3 py-2 text-sm bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] cursor-pointer"
                >
                  <option value="featured">Top Selling First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div
              id="categories"
              role="tablist"
              aria-label="Tool categories"
              className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')}
                className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#0D0F12] text-white'
                    : 'bg-white text-[#525866] border border-[#E2E5EA] hover:text-[#0D0F12]'
                }`}
              >
                All Tools
              </button>

              {PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-[#0D0F12] text-white'
                      : 'bg-white text-[#525866] border border-[#E2E5EA] hover:text-[#0D0F12]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <MotionConfig reducedMotion="user">
              {loading ? (
                <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-72 bg-white border border-[#E2E5EA] rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : loadError ? (
                <div className="mt-7 p-8 bg-white border border-[#E2E5EA] rounded-xl text-center space-y-3">
                  <p className="text-sm text-[#DC2626]">{loadError}</p>
                  <button
                    type="button"
                    onClick={fetchStorefront}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0D0F12] rounded-lg cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : visibleProducts.length === 0 ? (
                <motion.div
                  key="empty-catalog"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-7 p-10 bg-white border border-[#E2E5EA] rounded-xl text-center space-y-3"
                >
                  <p className="text-sm text-[#525866]">
                    No AI tools found matching your filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0D0F12] rounded-lg cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  data-testid="product-grid"
                  className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  <AnimatePresence initial={false}>
                    {visibleProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout="position"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
                        transition={{
                          layout: { type: 'spring', stiffness: 420, damping: 32 },
                          opacity: { duration: 0.18 },
                          scale: { duration: 0.18 },
                          y: { duration: 0.18 },
                        }}
                        className="flex"
                      >
                        <ProductCard
                          product={product}
                          currencySymbol={settings.currencySymbol}
                          onBuyNow={(p) => setCheckoutProduct(p)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </MotionConfig>
          </div>
        </section>

        <HowItWorksSection gatewayNamesText={activeGatewayNames} />
          </main>

          <Footer
            storeName={settings.storeName}
            tagline={settings.tagline}
            whatsappDisplay={settings.whatsappDisplay}
            whatsappNumber={settings.whatsappNumber}
            supportHours={settings.supportHours}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onOpenAdmin={handleOpenAdmin}
          />
        </>
      )}

      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          settings={settings}
          onClose={() => setCheckoutProduct(null)}
        />
      )}

      <AdminLoginModal
        open={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={(username, token, mode) => {
          saveAdminSession(username, token, mode);
          setAdminLoginOpen(false);
          setViewMode('admin');
        }}
      />
    </div>
  );
}
