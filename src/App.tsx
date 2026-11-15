import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
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
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'ToolCraft',
  tagline: 'Official AI & Creative Pro Subscriptions',
  whatsappNumber: '923234319689',
  whatsappDisplay: '+92 3234319689',
  supportHours: 'Support 24/7',
  currencySymbol: 'Rs.',
  deliverySla: 'Send payment screenshot on WhatsApp within 15 minutes for activation',
  autoFetchEndpoints: [],
  gateways: [],
};

export default function App() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

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
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');

  const fetchStorefront = useCallback(async () => {
    try {
      const res = await fetch('/api/storefront', { cache: 'no-store' });
      if (!res.ok) throw new Error('Unable to load store catalog.');
      const data = await res.json();
      setSettings(data.settings);
      setProducts(data.products || []);
      setLoadError('');
    } catch {
      setLoadError('Unable to load products right now. Please refresh.');
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
      if (!res.ok) return;
      const data = await res.json();
      if (data.authenticated && data.username) {
        setAdminUser(data.username);
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
  }, [fetchStorefront, checkAdminSession]);

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

  const saveAdminSession = (username: string, token?: string) => {
    setAdminUser(username);
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
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore logout network error
    }
    setAdminUser(null);
    setAdminToken(null);
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
        onExitToStore={() => {
          fetchStorefront();
          setViewMode('store');
        }}
        onLogout={handleAdminLogout}
        onStoreDataChanged={fetchStorefront}
        onCredentialsUpdated={(nextUser, nextToken) => saveAdminSession(nextUser, nextToken)}
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
              <div className="mt-7 p-10 bg-white border border-[#E2E5EA] rounded-xl text-center space-y-3">
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
              </div>
            ) : (
              <div
                data-testid="product-grid"
                className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currencySymbol={settings.currencySymbol}
                    onBuyNow={(p) => setCheckoutProduct(p)}
                  />
                ))}
              </div>
            )}
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
        onSuccess={(username, token) => {
          saveAdminSession(username, token);
          setAdminLoginOpen(false);
          setViewMode('admin');
        }}
      />
    </div>
  );
}
