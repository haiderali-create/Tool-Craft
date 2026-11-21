import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ChevronDown, Search, X } from 'lucide-react';
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
  resolveStoreCategories,
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
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';

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

  const activeProducts = products.filter((p) => p.active);
  const storeCategories = resolveStoreCategories(settings.categories, activeProducts);
  const effectiveCategory =
    selectedCategory === 'All' || storeCategories.includes(selectedCategory)
      ? selectedCategory
      : 'All';

  const visibleProducts = filterAndSortProducts(products, {
    category: effectiveCategory,
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
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-[#0B0D11]">
      {loading && !initialSnapshot ? (
        <>
          <header className="sticky top-0 z-30">
            <div className="h-9 bg-[#0B0D11] border-b border-white/10" />
            <div className="bg-white/95 backdrop-blur-md border-b border-[#E5E8EE]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <div className="h-7 w-32 rounded-lg bg-[#E5E8EE] animate-pulse" />
                <div className="h-10 w-32 rounded-xl bg-[#E5E8EE] animate-pulse" />
              </div>
            </div>
          </header>

          <main className="flex-1">
            <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 bg-white border-b border-[#E5E8EE]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-4 w-52 rounded bg-[#E5E8EE] animate-pulse" />
                  <div className="h-14 w-3/4 rounded-xl bg-[#E5E8EE] animate-pulse" />
                  <div className="h-5 w-2/3 rounded bg-[#F6F7F9] animate-pulse" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-12 w-36 rounded-xl bg-[#E5E8EE] animate-pulse" />
                    <div className="h-12 w-44 rounded-xl bg-[#F6F7F9] animate-pulse" />
                  </div>
                </div>
                <div className="lg:col-span-5 h-60 rounded-2xl bg-[#0B0D11]/90 animate-pulse" />
              </div>
            </section>
            <section className="py-14 sm:py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-72 bg-white border border-[#E5E8EE] rounded-2xl animate-pulse"
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
            gatewayNamesText={activeGatewayNames}
            supportHours={settings.supportHours}
            toolCount={products.length}
          />

          <main className="flex-1">
            <HeroSection
              tagline={settings.tagline}
              whatsappDisplay={settings.whatsappDisplay}
              whatsappNumber={settings.whatsappNumber}
              currencySymbol={settings.currencySymbol}
              toolCount={products.length}
              heroProducts={heroProducts}
              onSelectProduct={(p) => setCheckoutProduct(p)}
              gatewayNamesText={activeGatewayNames}
              gatewayStripText={activeGatewayStrip}
            />

        {/* Catalog & Categories Section */}
        <section id="catalog" className="scroll-mt-28 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-5"
            >
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#059669]">
                  Verified Subscriptions
                  {products.length > 0 && (
                    <span className="ml-2 font-normal text-[#6B7280] normal-case tracking-normal tabular-nums">
                      · Showing {visibleProducts.length} of {products.length}
                    </span>
                  )}
                </p>
                <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0B0D11]">
                  AI &amp; Creative Tool Catalog
                </h2>
                <p className="mt-1.5 text-sm text-[#4B5563]">
                  Click Buy Now on any tool for {activeGatewayNames} &amp; direct WhatsApp checkout.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Search AI tools"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Pro Subscriptions..."
                    className="w-full min-h-[44px] pl-10 pr-9 py-2 text-sm bg-white border border-[#E5E8EE] rounded-xl text-[#0B0D11] shadow-[0_1px_2px_rgba(11,13,17,0.04)] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0B0D11] focus:ring-2 focus:ring-[#0B0D11]/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#0B0D11] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative shrink-0">
                  <select
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none min-h-[44px] pl-3.5 pr-9 py-2 text-sm font-medium bg-white border border-[#E5E8EE] rounded-xl text-[#0B0D11] shadow-[0_1px_2px_rgba(11,13,17,0.04)] hover:border-[#C5CCD6] focus:outline-none focus:border-[#0B0D11] focus:ring-2 focus:ring-[#0B0D11]/10 transition-all cursor-pointer"
                  >
                    <option value="featured">Top Selling First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="w-4 h-4 text-[#6B7280] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Category Tabs with Smooth Sliding Active Indicator */}
            <div className="mt-6 bg-white p-1.5 rounded-2xl border border-[#E5E8EE] shadow-[0_1px_2px_rgba(11,13,17,0.04)]">
              <div
                id="categories"
                role="tablist"
                aria-label="Tool categories"
                className="scroll-mt-28 flex items-center gap-1 overflow-x-auto tc-no-scrollbar"
              >
                {(['All', ...storeCategories] as const).map((category) => {
                  const isActive = effectiveCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(category)}
                      className={`relative min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'text-white'
                          : 'text-[#4B5563] hover:text-[#0B0D11] hover:bg-[#F6F7F9]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="active-category-pill"
                          transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                          className="absolute inset-0 rounded-xl bg-[#0B0D11] shadow-[0_6px_14px_-6px_rgba(11,13,17,0.45)]"
                        />
                      )}
                      <span className="relative z-10">
                        {category === 'All' ? 'All Tools' : category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Grid */}
            <>
              {loading ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-72 bg-white border border-[#E5E8EE] rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : loadError ? (
                <div className="mt-8 p-10 bg-white border border-[#E5E8EE] rounded-2xl text-center space-y-3 shadow-[0_2px_10px_-4px_rgba(11,13,17,0.05)]">
                  <p className="text-sm text-[#DC2626]">{loadError}</p>
                  <button
                    type="button"
                    onClick={fetchStorefront}
                    className="min-h-[40px] px-5 py-2 text-xs font-semibold text-white bg-[#0B0D11] rounded-xl hover:bg-[#1F242D] transition-colors cursor-pointer"
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
                  className="mt-8 p-12 bg-white border border-[#E5E8EE] rounded-2xl text-center space-y-3.5 shadow-[0_2px_10px_-4px_rgba(11,13,17,0.05)]"
                >
                  <p className="text-sm text-[#4B5563]">
                    No AI tools found matching your filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="min-h-[40px] px-5 py-2 text-xs font-semibold text-white bg-[#0B0D11] rounded-xl hover:bg-[#1F242D] transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  data-testid="product-grid"
                  className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
            </>
          </div>
        </section>

        <HowItWorksSection
          gatewayNamesText={activeGatewayNames}
          whatsappNumber={settings.whatsappNumber}
          whatsappDisplay={settings.whatsappDisplay}
          supportHours={settings.supportHours}
        />
          </main>

          <Footer
            storeName={settings.storeName}
            tagline={settings.tagline}
            whatsappDisplay={settings.whatsappDisplay}
            whatsappNumber={settings.whatsappNumber}
            supportHours={settings.supportHours}
            categories={storeCategories}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onOpenAdmin={handleOpenAdmin}
          />

          <FloatingWhatsAppButton
            whatsappNumber={settings.whatsappNumber}
            storeName={settings.storeName}
          />
        </>
      )}

      <AnimatePresence>
        {checkoutProduct && (
          <CheckoutModal
            key={checkoutProduct.id}
            product={checkoutProduct}
            settings={settings}
            onClose={() => setCheckoutProduct(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adminLoginOpen && (
          <AdminLoginModal
            key="portal-login-modal"
            open={adminLoginOpen}
            onClose={() => setAdminLoginOpen(false)}
            onSuccess={(username, token, mode) => {
              saveAdminSession(username, token, mode);
              setAdminLoginOpen(false);
              setViewMode('admin');
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
