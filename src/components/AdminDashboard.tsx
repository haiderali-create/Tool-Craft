import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { auth } from '../firebase';
import type {
  AdminAiStatus,
  GatewayId,
  Order,
  OrderStatus,
  PaymentGatewayConfig,
  Product,
  ProductCategory,
  StoreSettings,
} from '../types';
import {
  autoFetchToolInfoClientFallback,
  BOOTSTRAPPED_ADMIN_EMAIL,
  createProductFirestore,
  deleteOrderFirestore,
  deleteProductFirestore,
  fetchAdminDashboardFirestore,
  updateOrderFirestore,
  updateProductFirestore,
  updateSettingsFirestore,
} from '../services/firestoreStore';
import {
  computeDiscountPercent,
  computeInventorySummary,
  filterAndSortProducts,
  formatAutoFetchSourceLabel,
  formatCurrency,
  PRODUCT_CATEGORIES,
  resolveBrandKeyFromName,
  validateProductInput,
} from '../utils/storeLogic';
import type { AdminAuthMode } from './AdminLoginModal';
import { StoreBrandLogo } from './StoreBrandLogo';
import { ToolLogo } from './ToolLogo';

interface AdminDashboardProps {
  username: string;
  authToken: string | null;
  authMode?: AdminAuthMode;
  onExitToStore: () => void;
  onLogout: () => void;
  onStoreDataChanged: () => void;
  onCredentialsUpdated?: (username: string, token?: string) => void;
}

type AdminTab = 'inventory' | 'orders' | 'settings' | 'security';

interface ProductFormState {
  id?: string;
  name: string;
  category: ProductCategory;
  planLabel: string;
  price: string;
  originalPrice: string;
  offerLabel: string;
  topSelling: boolean;
  inStock: boolean;
  logoKey: string;
  logoUrl: string;
  description: string;
  featuresText: string;
  allowedGateways: GatewayId[];
  featuredInHero: boolean;
  active: boolean;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  category: 'AI Assistants',
  planLabel: '1 Month · Private',
  price: '',
  originalPrice: '',
  offerLabel: '',
  topSelling: false,
  inStock: true,
  logoKey: 'generic',
  logoUrl: '',
  description: '',
  featuresText: 'Instant WhatsApp activation\nFull term warranty',
  allowedGateways: [],
  featuredInHero: true,
  active: true,
};

export function AdminDashboard({
  username,
  authToken,
  authMode = 'server',
  onExitToStore,
  onLogout,
  onStoreDataChanged,
  onCredentialsUpdated,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');

  const [editorOpen, setEditorOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);

  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  const [settingsDraft, setSettingsDraft] = useState<StoreSettings | null>(null);
  const [aiStatus, setAiStatus] = useState<AdminAiStatus>({
    serverGeminiKeyCount: 0,
    maskedKeys: [],
    brandPresetCount: 17,
  });
  const [toolApiPanelOpen, setToolApiPanelOpen] = useState(false);
  const [toolGatewayPanelOpen, setToolGatewayPanelOpen] = useState(false);
  const [refreshingAiStatus, setRefreshingAiStatus] = useState(false);
  const [autoFetchSource, setAutoFetchSource] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickOriginalPrice, setQuickOriginalPrice] = useState('');
  const [quickOfferLabel, setQuickOfferLabel] = useState('');
  const [savingQuickId, setSavingQuickId] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState('');
  const [savingSecurity, setSavingSecurity] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const adminFetch = (input: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    return fetch(input, {
      ...init,
      cache: 'no-store',
      credentials: 'include',
      headers,
    });
  };

  const buildProxyHeaders = async (extraHeaders: Record<string, string> = {}) => {
    const headers = new Headers(extraHeaders);
    if (authMode === 'firebase' && auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) {
          headers.set('Authorization', `Bearer ${idToken}`);
        }
      } catch {
        // Ignore token refresh errors; server will fall back to session cookie if present
      }
    } else if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    return headers;
  };

  const fetchAiStatus = async (): Promise<AdminAiStatus | null> => {
    try {
      const headers = await buildProxyHeaders();
      const res = await fetch('/api/admin/ai-status', {
        cache: 'no-store',
        credentials: 'include',
        headers,
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) return null;
      const data = (await res.json()) as AdminAiStatus;
      if (typeof data.serverGeminiKeyCount === 'number') {
        const normalized: AdminAiStatus = {
          serverGeminiKeyCount: data.serverGeminiKeyCount,
          maskedKeys: Array.isArray(data.maskedKeys) ? data.maskedKeys : [],
          brandPresetCount: typeof data.brandPresetCount === 'number' ? data.brandPresetCount : 17,
        };
        setAiStatus(normalized);
        return normalized;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleRefreshAiStatus = async () => {
    setRefreshingAiStatus(true);
    try {
      const status = await fetchAiStatus();
      if (status) {
        showToast(
          status.serverGeminiKeyCount === 1
            ? '1 Gemini API key active & live'
            : `${status.serverGeminiKeyCount} Gemini API keys active & live`
        );
      } else {
        showToast('Unable to reach server Gemini proxy');
      }
    } finally {
      setRefreshingAiStatus(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      if (authMode === 'firebase') {
        const [data] = await Promise.all([fetchAdminDashboardFirestore(), fetchAiStatus()]);
        setProducts(data.products);
        setOrders(data.orders);
        setSettings(data.settings);
        setSettingsDraft(data.settings);
        setNewUsername(data.username || username);
        return;
      }

      const res = await adminFetch('/api/admin/dashboard');
      if (res.status === 401) {
        onLogout();
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setError('Backend dashboard API is unavailable. Please sign in with your Firebase Admin email.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load admin workspace.');
        return;
      }
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setSettings(data.settings);
      setSettingsDraft(data.settings);
      if (data.aiStatus) {
        setAiStatus({
          serverGeminiKeyCount: Number(data.aiStatus.serverGeminiKeyCount) || 0,
          maskedKeys: Array.isArray(data.aiStatus.maskedKeys) ? data.aiStatus.maskedKeys : [],
          brandPresetCount: Number(data.aiStatus.brandPresetCount) || 17,
        });
      }
      setNewUsername(data.username || username);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = computeInventorySummary(products, orders);
  const currency = settings?.currencySymbol || 'Rs.';

  const filteredProducts = filterAndSortProducts(products, {
    category: categoryFilter,
    search,
    includeInactive: true,
  });

  const openAddProduct = () => {
    setFormState(EMPTY_FORM);
    setAutoFetchSource('');
    setFormError('');
    setEditorOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setFormState({
      id: product.id,
      name: product.name,
      category: product.category,
      planLabel: product.planLabel,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      offerLabel: product.offerLabel || '',
      topSelling: Boolean(product.topSelling),
      inStock: product.inStock,
      logoKey: product.logoKey,
      logoUrl: product.logoUrl || '',
      description: product.description,
      featuresText: product.features.join('\n'),
      allowedGateways: product.allowedGateways || [],
      featuredInHero: product.featuredInHero !== false,
      active: product.active,
    });
    setAutoFetchSource('');
    setFormError('');
    setEditorOpen(true);
  };

  const handleAutoFetchLogoAndInfo = async () => {
    const cleanName = formState.name.trim();
    if (cleanName.length < 2) {
      setFormError('Enter a tool name first (e.g. CapCut Pro, Runway, Suno) then click Auto-Fetch.');
      return;
    }

    setAutoFetching(true);
    setFormError('');
    try {
      let data: {
        logoKey?: string;
        logoUrl?: string;
        category?: ProductCategory;
        planLabel?: string;
        description?: string;
        features?: string[];
        source?: string;
      } | null = null;

      try {
        const headers = await buildProxyHeaders({ 'Content-Type': 'application/json' });
        const res = await fetch('/api/admin/auto-tool-info', {
          method: 'POST',
          cache: 'no-store',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            name: cleanName,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        }
      } catch {
        // Fall back to deterministic brand + domain lookup below
      }

      if (!data) {
        data = await autoFetchToolInfoClientFallback({
          name: cleanName,
        });
      }

      setFormState((prev) => ({
        ...prev,
        logoKey: data?.logoKey || resolveBrandKeyFromName(cleanName),
        logoUrl: data?.logoUrl || '',
        category: data?.category || prev.category,
        planLabel: data?.planLabel || prev.planLabel,
        description: data?.description || prev.description,
        featuresText: Array.isArray(data?.features)
          ? data.features.join('\n')
          : prev.featuresText,
      }));
      const sourceLabel = formatAutoFetchSourceLabel(data.source);
      setAutoFetchSource(sourceLabel);
      showToast(
        sourceLabel
          ? `Loaded ${cleanName} (${sourceLabel})`
          : `Logo & details loaded for ${cleanName}`
      );
    } catch {
      setFormError('Unable to auto-fetch tool details.');
    } finally {
      setAutoFetching(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = formState.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formState.name.trim(),
      category: formState.category,
      planLabel: formState.planLabel.trim(),
      price: Number(formState.price),
      originalPrice: formState.originalPrice ? Number(formState.originalPrice) : undefined,
      offerLabel: formState.offerLabel.trim() || undefined,
      topSelling: formState.topSelling,
      inStock: formState.inStock,
      stock: formState.inStock ? 25 : 0,
      logoKey: formState.logoKey || resolveBrandKeyFromName(formState.name),
      logoUrl: formState.logoUrl.trim() || undefined,
      description: formState.description.trim(),
      features,
      allowedGateways: formState.allowedGateways,
      featuredInHero: formState.featuredInHero,
      active: formState.active,
    };

    const validation = validateProductInput(payload);
    if (!validation.valid) {
      setFormError(validation.error || 'Please check product fields.');
      return;
    }

    setSavingProduct(true);
    setFormError('');
    try {
      const isEdit = Boolean(formState.id);
      if (authMode === 'firebase') {
        const saved = isEdit && formState.id
          ? await updateProductFirestore(formState.id, payload)
          : await createProductFirestore(payload);
        if (isEdit) {
          setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
          showToast(`Saved & live: ${saved.name}`);
        } else {
          setProducts((prev) => [saved, ...prev]);
          showToast(`Added & live: ${saved.name}`);
        }
        setEditorOpen(false);
        await Promise.resolve(onStoreDataChanged());
        return;
      }

      const url = isEdit ? `/api/admin/products/${formState.id}` : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Unable to save tool.');
        return;
      }

      if (isEdit) {
        setProducts((prev) => prev.map((p) => (p.id === data.product.id ? data.product : p)));
        showToast(`Saved & live: ${data.product.name}`);
      } else {
        setProducts((prev) => [data.product, ...prev]);
        showToast(`Added & live: ${data.product.name}`);
      }

      setEditorOpen(false);
      await Promise.resolve(onStoreDataChanged());
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : 'Network error saving tool.');
    } finally {
      setSavingProduct(false);
    }
  };

  const openQuickPriceEdit = (item: Product) => {
    setQuickEditId(item.id);
    setQuickPrice(String(item.price));
    setQuickOriginalPrice(item.originalPrice ? String(item.originalPrice) : '');
    setQuickOfferLabel(item.offerLabel || '');
    setError('');
  };

  const handleQuickPriceSave = async (item: Product) => {
    const parsedPrice = Number(quickPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Sale price must be greater than 0.');
      return;
    }
    const parsedOriginal =
      quickOriginalPrice.trim() === '' ? null : Number(quickOriginalPrice);
    if (parsedOriginal !== null && (!Number.isFinite(parsedOriginal) || parsedOriginal < 0)) {
      setError('Last price cannot be negative.');
      return;
    }

    setSavingQuickId(item.id);
    setError('');
    try {
      if (authMode === 'firebase') {
        const updated = await updateProductFirestore(item.id, {
          price: parsedPrice,
          originalPrice: parsedOriginal === null ? undefined : parsedOriginal,
          offerLabel: quickOfferLabel.trim() || undefined,
        });
        setProducts((prev) => prev.map((p) => (p.id === item.id ? updated : p)));
        setQuickEditId(null);
        showToast(`Price & offer saved for ${updated.name}`);
        await Promise.resolve(onStoreDataChanged());
        return;
      }

      const res = await adminFetch(`/api/admin/products/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parsedPrice,
          originalPrice: parsedOriginal,
          offerLabel: quickOfferLabel.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to update price/offer.');
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === item.id ? data.product : p)));
      setQuickEditId(null);
      showToast(`Price & offer saved for ${data.product.name}`);
      await Promise.resolve(onStoreDataChanged());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error updating price/offer.');
    } finally {
      setSavingQuickId(null);
    }
  };

  const handleQuickPatchProduct = async (
    product: Product,
    patch: Partial<Pick<Product, 'inStock' | 'active' | 'topSelling' | 'featuredInHero'>>
  ) => {
    try {
      if (authMode === 'firebase') {
        const updated = await updateProductFirestore(product.id, patch);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
        showToast(`Saved ${updated.name}`);
        await Promise.resolve(onStoreDataChanged());
        return;
      }

      const res = await adminFetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed.');
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === product.id ? data.product : p)));
      showToast(`Saved ${data.product.name}`);
      await Promise.resolve(onStoreDataChanged());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error updating tool.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      if (authMode === 'firebase') {
        await deleteProductFirestore(product.id);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast(`Removed ${product.name}`);
        await Promise.resolve(onStoreDataChanged());
        return;
      }

      const res = await adminFetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete tool.');
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Removed ${product.name}`);
      await Promise.resolve(onStoreDataChanged());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error deleting tool.');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      if (authMode === 'firebase') {
        await updateOrderFirestore(orderId, { status });
        let updatedCode = orderId;
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId) {
              updatedCode = o.orderCode;
              return { ...o, status };
            }
            return o;
          })
        );
        showToast(`Order ${updatedCode} marked ${status}`);
        return;
      }

      const res = await adminFetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update order status.');
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      showToast(`Order ${data.order.orderCode} marked ${status}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error updating order.');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    try {
      if (authMode === 'firebase') {
        await deleteOrderFirestore(order.id);
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        showToast(`Deleted order ${order.orderCode}`);
        return;
      }

      const res = await adminFetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete order.');
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast(`Deleted order ${order.orderCode}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error deleting order.');
    }
  };

  const handleQuickToggleStoreGateway = async (gatewayId: GatewayId) => {
    if (!settings) return;
    const nextGateways = settings.gateways.map((gw) =>
      gw.id === gatewayId ? { ...gw, enabled: !gw.enabled } : gw
    );
    setSavingSettings(true);
    setError('');
    try {
      if (authMode === 'firebase') {
        const updatedSettings = await updateSettingsFirestore({ gateways: nextGateways });
        setSettings(updatedSettings);
        setSettingsDraft(updatedSettings);
        const changed = updatedSettings.gateways.find((g) => g.id === gatewayId);
        showToast(
          changed
            ? `${changed.label} ${changed.enabled ? 'activated' : 'disabled'} live`
            : 'Gateway updated'
        );
        await Promise.resolve(onStoreDataChanged());
        return;
      }

      const res = await adminFetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateways: nextGateways }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update gateway.');
        return;
      }
      setSettings(data.settings);
      setSettingsDraft(data.settings);
      const changed = data.settings.gateways.find((g: PaymentGatewayConfig) => g.id === gatewayId);
      showToast(
        changed
          ? `${changed.label} ${changed.enabled ? 'activated' : 'disabled'} live`
          : 'Gateway updated'
      );
      await Promise.resolve(onStoreDataChanged());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error updating gateway.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsDraft) return;
    setSavingSettings(true);
    setError('');
    try {
      if (authMode === 'firebase') {
        const updatedSettings = await updateSettingsFirestore(settingsDraft);
        setSettings(updatedSettings);
        setSettingsDraft(updatedSettings);
        showToast('Settings & payment gateways saved live');
        await Promise.resolve(onStoreDataChanged());
        return;
      }

      const res = await adminFetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update settings.');
        return;
      }
      setSettings(data.settings);
      setSettingsDraft(data.settings);
      showToast('Settings & payment gateways saved live');
      await Promise.resolve(onStoreDataChanged());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Network error saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGatewayFieldChange = (
    id: PaymentGatewayConfig['id'],
    field: keyof PaymentGatewayConfig,
    value: string | boolean
  ) => {
    if (!settingsDraft) return;
    setSettingsDraft({
      ...settingsDraft,
      gateways: settingsDraft.gateways.map((gw) =>
        gw.id === id ? { ...gw, [field]: value } : gw
      ),
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'firebase') return;
    setSavingSecurity(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update credentials.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      onCredentialsUpdated?.(data.username, data.token);
      showToast('Admin credentials updated');
    } catch {
      setError('Network error updating password.');
    } finally {
      setSavingSecurity(false);
    }
  };

  const previewDiscount = computeDiscountPercent(
    Number(formState.price) || 0,
    formState.originalPrice ? Number(formState.originalPrice) : undefined
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#0D0F12] flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E5EA] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitToStore}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold text-[#0D0F12] bg-[#F4F5F7] border border-[#E2E5EA] rounded-lg hover:bg-[#E2E5EA] cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            View Storefront
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <StoreBrandLogo size="sm" />
            <span className="text-sm font-semibold text-[#0D0F12] truncate">
              Admin Portal · {username}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-[#DC2626] bg-white border border-[#E2E5EA] rounded-lg hover:bg-[#FEF2F2] cursor-pointer whitespace-nowrap shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-1.5">
          <nav aria-label="Admin sections" className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#0D0F12] text-white'
                  : 'bg-white border border-[#E2E5EA] text-[#525866] hover:text-[#0D0F12]'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Tools &amp; Offers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0D0F12] text-white'
                  : 'bg-white border border-[#E2E5EA] text-[#525866] hover:text-[#0D0F12]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Orders &amp; Screenshots</span>
              </span>
              <span className="font-mono tabular-nums text-xs opacity-80">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0D0F12] text-white'
                  : 'bg-white border border-[#E2E5EA] text-[#525866] hover:text-[#0D0F12]'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>WhatsApp &amp; Gateways</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#0D0F12] text-white'
                  : 'bg-white border border-[#E2E5EA] text-[#525866] hover:text-[#0D0F12]'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Security</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-6">
          {toast && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-sm font-medium text-[#065F46]"
            >
              {toast}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm font-medium text-[#B91C1C]"
            >
              {error}
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[#E2E5EA] rounded-xl">
              <p className="text-xs text-[#525866]">Active Listings</p>
              <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-[#0D0F12]">
                {summary.activeProducts} / {summary.totalProducts}
              </p>
            </div>
            <div className="p-4 bg-white border border-[#E2E5EA] rounded-xl">
              <p className="text-xs text-[#525866]">Top Selling</p>
              <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-[#0D0F12]">
                {summary.topSellingCount}
              </p>
            </div>
            <div className="p-4 bg-white border border-[#E2E5EA] rounded-xl">
              <p className="text-xs text-[#525866]">Pending Orders</p>
              <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-[#D97706]">
                {summary.pendingOrders}
              </p>
            </div>
            <div className="p-4 bg-white border border-[#E2E5EA] rounded-xl">
              <p className="text-xs text-[#525866]">Confirmed Sales</p>
              <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-[#059669]">
                {formatCurrency(summary.totalRevenue, currency)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 bg-white border border-[#E2E5EA] rounded-xl text-sm text-[#525866]">
              Loading store workspace...
            </div>
          ) : activeTab === 'inventory' ? (
            <section className="bg-white border border-[#E2E5EA] rounded-xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E2E5EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-1 flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 text-[#8A92A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      aria-label="Search inventory"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tools..."
                      className="w-full min-h-[40px] pl-9 pr-3 py-2 text-sm bg-[#F4F5F7] border border-[#E2E5EA] rounded-lg focus:outline-none focus:border-[#0D0F12]"
                    />
                  </div>

                  <select
                    aria-label="Filter inventory by category"
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(e.target.value as ProductCategory | 'All')
                    }
                    className="min-h-[40px] px-3 py-2 text-sm bg-[#F4F5F7] border border-[#E2E5EA] rounded-lg text-[#0D0F12]"
                  >
                    <option value="All">All Categories</option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-expanded={toolGatewayPanelOpen}
                    onClick={() => setToolGatewayPanelOpen((prev) => !prev)}
                    className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                      toolGatewayPanelOpen
                        ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                        : 'bg-white border-[#E2E5EA] text-[#0D0F12] hover:bg-[#F4F5F7]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Gateways ({(settings?.gateways || []).filter((g) => g.enabled).length}/
                    {(settings?.gateways || []).length})
                  </button>

                  <button
                    type="button"
                    aria-expanded={toolApiPanelOpen}
                    onClick={() => setToolApiPanelOpen((prev) => !prev)}
                    className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                      toolApiPanelOpen
                        ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                        : 'bg-white border-[#E2E5EA] text-[#0D0F12] hover:bg-[#F4F5F7]'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    Gemini API ({aiStatus.serverGeminiKeyCount} Live)
                  </button>

                  <button
                    type="button"
                    onClick={openAddProduct}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-[#0D0F12] rounded-lg hover:bg-[#059669] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
              </div>

              {toolGatewayPanelOpen && settings && (
                <div className="p-4 sm:p-5 bg-[#F4F5F7] border-b border-[#E2E5EA] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0D0F12]">
                        Quick Payment Gateways (Activate / Disable)
                      </h3>
                      <p className="text-xs text-[#525866]">
                        Toggle JazzCash, Easypaisa, or Binance instantly for the storefront, or
                        configure individual tools inside Edit Tool.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {settings.gateways.map((gw) => (
                      <div
                        key={gw.id}
                        className="p-3 bg-white border border-[#E2E5EA] rounded-lg flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0D0F12] truncate">{gw.label}</p>
                          <p className="text-[11px] font-mono text-[#525866] truncate">
                            {gw.accountNumber || 'Not set'}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={savingSettings}
                          onClick={() => handleQuickToggleStoreGateway(gw.id)}
                          className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-md cursor-pointer shrink-0 ${
                            gw.enabled
                              ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]'
                              : 'bg-[#F4F5F7] border border-[#E2E5EA] text-[#525866]'
                          }`}
                        >
                          {gw.enabled ? 'Active' : 'Off'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {toolApiPanelOpen && (
                <div className="p-4 sm:p-5 bg-[#F4F5F7] border-b border-[#E2E5EA] space-y-3">
                  {/* Live Gemini Keys Banner */}
                  <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          aiStatus.serverGeminiKeyCount > 0 ? 'bg-[#059669]' : 'bg-[#D97706]'
                        }`}
                      />
                      <span
                        data-testid="live-api-count"
                        className="text-sm font-bold text-[#065F46]"
                      >
                        Live: {aiStatus.serverGeminiKeyCount} Gemini Key
                        {aiStatus.serverGeminiKeyCount === 1 ? '' : 's'} Running
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-[#047857]">
                        {aiStatus.brandPresetCount} Built-in Brands Active
                      </span>
                      <button
                        type="button"
                        disabled={refreshingAiStatus}
                        onClick={handleRefreshAiStatus}
                        className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 text-xs font-semibold text-[#065F46] bg-white border border-[#A7F3D0] rounded-lg hover:bg-[#D1FAE5]/40 cursor-pointer shrink-0"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${refreshingAiStatus ? 'animate-spin' : ''}`}
                        />
                        {refreshingAiStatus ? 'Checking...' : 'Refresh'}
                      </button>
                    </div>
                  </div>

                  {/* Masked Active Server Keys */}
                  {aiStatus.maskedKeys && aiStatus.maskedKeys.length > 0 && (
                    <div className="space-y-2">
                      {aiStatus.maskedKeys.map((maskedKey, idx) => (
                        <div
                          key={`${maskedKey}-${idx}`}
                          className="p-2.5 bg-white border border-[#E2E5EA] rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[11px] font-mono font-bold text-[#525866] bg-[#F4F5F7] px-2 py-0.5 rounded shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-mono font-semibold text-[#0D0F12] truncate">
                              {maskedKey}
                            </span>
                            <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.5 rounded shrink-0">
                              Live
                            </span>
                          </div>
                          <span className="text-[11px] text-[#525866] shrink-0">
                            Server Secret
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!aiStatus.maskedKeys || aiStatus.maskedKeys.length === 0) && (
                    <p className="text-xs text-[#525866]">
                      No server Gemini key configured yet.
                    </p>
                  )}
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <p className="text-sm text-[#525866]">No tools match your current filter.</p>
                  <button
                    type="button"
                    onClick={openAddProduct}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D0F12] rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Tool
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E5EA] text-xs font-semibold text-[#525866] bg-[#F4F5F7]">
                        <th className="py-3 px-4">Tool &amp; Logo</th>
                        <th className="py-3 px-4">Offer / Tag</th>
                        <th className="py-3 px-4 text-right">Price / Last Price</th>
                        <th className="py-3 px-4">Top Selling</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5EA] text-sm">
                      {filteredProducts.map((item) => {
                        const isQuickEditing = quickEditId === item.id;
                        return (
                          <tr key={item.id} className="hover:bg-[#F4F5F7]/60">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <ToolLogo
                                  name={item.name}
                                  logoKey={item.logoKey}
                                  logoUrl={item.logoUrl}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#0D0F12] truncate">{item.name}</p>
                                  <p className="text-xs text-[#525866] truncate">
                                    {item.category} · {item.planLabel}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-[#059669] font-medium whitespace-nowrap">
                              {isQuickEditing ? (
                                <input
                                  type="text"
                                  aria-label={`Quick offer for ${item.name}`}
                                  value={quickOfferLabel}
                                  onChange={(e) => setQuickOfferLabel(e.target.value)}
                                  placeholder="Flash Offer"
                                  className="w-28 min-h-[34px] px-2 py-1 text-xs bg-white border border-[#E2E5EA] rounded-md text-[#0D0F12]"
                                />
                              ) : (
                                item.offerLabel || '—'
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                              {isQuickEditing ? (
                                <div className="flex flex-col items-end gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    aria-label={`Quick price for ${item.name}`}
                                    value={quickPrice}
                                    onChange={(e) => setQuickPrice(e.target.value)}
                                    placeholder="Sale"
                                    className="w-24 min-h-[34px] px-2 py-1 text-xs font-mono text-right bg-white border border-[#0D0F12] rounded-md text-[#0D0F12]"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    aria-label={`Quick last price for ${item.name}`}
                                    value={quickOriginalPrice}
                                    onChange={(e) => setQuickOriginalPrice(e.target.value)}
                                    placeholder="Last price"
                                    className="w-24 min-h-[30px] px-2 py-1 text-[11px] font-mono text-right bg-white border border-[#E2E5EA] rounded-md text-[#525866]"
                                  />
                                </div>
                              ) : (
                                <>
                                  <span className="font-semibold text-[#0D0F12]">
                                    {formatCurrency(item.price, currency)}
                                  </span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="block text-xs text-[#8A92A0] line-through">
                                      {formatCurrency(item.originalPrice, currency)}
                                    </span>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1 items-start">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickPatchProduct(item, { topSelling: !item.topSelling })
                                  }
                                  className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                                    item.topSelling ? 'text-[#D97706]' : 'text-[#8A92A0]'
                                  }`}
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  {item.topSelling ? 'Top Selling' : 'Standard'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickPatchProduct(item, {
                                      featuredInHero: item.featuredInHero === false,
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer ${
                                    item.featuredInHero !== false
                                      ? 'text-[#059669]'
                                      : 'text-[#8A92A0]'
                                  }`}
                                >
                                  {item.featuredInHero !== false ? 'In Hero' : 'Not in Hero'}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1 items-start">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickPatchProduct(item, { active: !item.active })
                                  }
                                  className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                                    item.active ? 'text-[#059669]' : 'text-[#8A92A0]'
                                  }`}
                                >
                                  {item.active ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      Listed
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5" />
                                      Hidden
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickPatchProduct(item, { inStock: !item.inStock })
                                  }
                                  className={`text-[11px] font-medium cursor-pointer ${
                                    item.inStock ? 'text-[#525866]' : 'text-[#DC2626]'
                                  }`}
                                >
                                  {item.inStock ? 'Available' : 'Marked Unavailable'}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {isQuickEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={savingQuickId === item.id}
                                      onClick={() => handleQuickPriceSave(item)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      {savingQuickId === item.id ? 'Saving' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setQuickEditId(null)}
                                      aria-label="Cancel quick edit"
                                      className="p-2 rounded-lg border border-[#E2E5EA] text-[#525866] hover:bg-white cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openQuickPriceEdit(item)}
                                      className="px-2.5 py-1.5 rounded-lg border border-[#E2E5EA] text-xs font-semibold text-[#0D0F12] bg-white hover:bg-[#F4F5F7] cursor-pointer"
                                    >
                                      Price / Offer
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Edit ${item.name}`}
                                      onClick={() => openEditProduct(item)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E5EA] text-xs font-semibold text-[#0D0F12] bg-white hover:bg-[#F4F5F7] cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Delete ${item.name}`}
                                      onClick={() => handleDeleteProduct(item)}
                                      className="p-2 rounded-lg border border-[#E2E5EA] text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : activeTab === 'orders' ? (
            <section className="bg-white border border-[#E2E5EA] rounded-xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E2E5EA]">
                <h2 className="font-display text-lg font-bold text-[#0D0F12]">
                  Orders &amp; Payment Screenshots
                </h2>
                <p className="text-xs text-[#525866] mt-0.5">
                  Inspect real customer payment screenshots and confirm orders after WhatsApp verification.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#525866]">
                  No orders received yet. Real customer orders will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E5EA] text-xs font-semibold text-[#525866] bg-[#F4F5F7]">
                        <th className="py-3 px-4">Order</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Tool</th>
                        <th className="py-3 px-4">Gateway</th>
                        <th className="py-3 px-4">Screenshot</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5EA] text-sm">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#F4F5F7]/60">
                          <td className="py-3 px-4 font-mono font-bold text-xs text-[#0D0F12] whitespace-nowrap">
                            {order.orderCode}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#0D0F12]">{order.customerName}</p>
                            <p className="font-mono text-xs text-[#525866]">
                              +{order.customerWhatsapp}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#0D0F12]">{order.productName}</p>
                            <p className="text-xs text-[#525866]">{order.planLabel}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-xs font-semibold text-[#0D0F12]">
                              {order.paymentMethodLabel}
                            </p>
                            <p className="font-mono text-xs text-[#525866]">
                              {order.transactionRef}
                            </p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {order.screenshotDataUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewOrder(order)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#0D0F12] bg-[#F4F5F7] border border-[#E2E5EA] rounded-lg hover:bg-[#E2E5EA] cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                View
                              </button>
                            ) : (
                              <span className="text-xs text-[#8A92A0]">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#0D0F12] whitespace-nowrap">
                            {formatCurrency(order.amount, order.currencySymbol)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              aria-label={`Status for order ${order.orderCode}`}
                              value={order.status}
                              onChange={(e) =>
                                handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="min-h-[36px] px-2.5 py-1 text-xs font-semibold bg-[#F4F5F7] border border-[#E2E5EA] rounded-lg text-[#0D0F12]"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              aria-label={`Delete order ${order.orderCode}`}
                              onClick={() => handleDeleteOrder(order)}
                              className="p-2 rounded-lg border border-[#E2E5EA] text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : activeTab === 'settings' && settingsDraft ? (
            <form
              onSubmit={handleSaveSettings}
              className="bg-white border border-[#E2E5EA] rounded-xl p-5 sm:p-6 space-y-6"
            >
              <div>
                <h2 className="font-display text-lg font-bold text-[#0D0F12]">
                  WhatsApp &amp; Payment Gateways
                </h2>
                <p className="text-xs text-[#525866] mt-0.5">
                  Update your WhatsApp number, support badge, and active payment accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="set-store-name"
                    className="block text-xs font-medium text-[#525866] mb-1.5"
                  >
                    Store Name
                  </label>
                  <input
                    id="set-store-name"
                    type="text"
                    value={settingsDraft.storeName}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, storeName: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="set-currency"
                    className="block text-xs font-medium text-[#525866] mb-1.5"
                  >
                    Currency Symbol
                  </label>
                  <input
                    id="set-currency"
                    type="text"
                    value={settingsDraft.currencySymbol}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, currencySymbol: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono border border-[#E2E5EA] rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="set-wa-number"
                    className="block text-xs font-medium text-[#525866] mb-1.5"
                  >
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    id="set-wa-number"
                    type="text"
                    value={settingsDraft.whatsappNumber}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, whatsappNumber: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono border border-[#E2E5EA] rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="set-wa-display"
                    className="block text-xs font-medium text-[#525866] mb-1.5"
                  >
                    WhatsApp Display Number
                  </label>
                  <input
                    id="set-wa-display"
                    type="text"
                    value={settingsDraft.whatsappDisplay}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, whatsappDisplay: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono border border-[#E2E5EA] rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="set-support-hours"
                    className="block text-xs font-medium text-[#525866] mb-1.5"
                  >
                    Support Availability Label
                  </label>
                  <input
                    id="set-support-hours"
                    type="text"
                    value={settingsDraft.supportHours || 'Support 24/7'}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, supportHours: e.target.value })
                    }
                    placeholder="Support 24/7"
                    className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E5EA] space-y-4">
                <h3 className="text-sm font-semibold text-[#0D0F12]">Active Payment Accounts</h3>
                {settingsDraft.gateways.map((gw) => (
                  <div
                    key={gw.id}
                    className="p-4 rounded-lg bg-[#F4F5F7] border border-[#E2E5EA] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-[#0D0F12]">{gw.label}</span>
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0D0F12] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gw.enabled}
                          onChange={(e) =>
                            handleGatewayFieldChange(gw.id, 'enabled', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#0D0F12]"
                        />
                        Enabled
                      </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        aria-label={`${gw.label} account title`}
                        value={gw.accountTitle}
                        onChange={(e) =>
                          handleGatewayFieldChange(gw.id, 'accountTitle', e.target.value)
                        }
                        placeholder="Account Title"
                        className="min-h-[40px] px-3 py-1.5 text-xs bg-white border border-[#E2E5EA] rounded-lg"
                      />
                      <input
                        type="text"
                        aria-label={`${gw.label} account number`}
                        value={gw.accountNumber}
                        onChange={(e) =>
                          handleGatewayFieldChange(gw.id, 'accountNumber', e.target.value)
                        }
                        placeholder="Account Number / Binance Pay ID"
                        className="min-h-[40px] px-3 py-1.5 text-xs font-mono bg-white border border-[#E2E5EA] rounded-lg"
                      />
                    </div>
                    <input
                      type="text"
                      aria-label={`${gw.label} instructions`}
                      value={gw.instructions}
                      onChange={(e) =>
                        handleGatewayFieldChange(gw.id, 'instructions', e.target.value)
                      }
                      placeholder="Customer payment instructions"
                      className="w-full min-h-[40px] px-3 py-1.5 text-xs bg-white border border-[#E2E5EA] rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="min-h-[44px] px-6 py-2.5 text-sm font-semibold text-white bg-[#0D0F12] rounded-lg hover:bg-[#059669] cursor-pointer"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          ) : authMode === 'firebase' ? (
            <div className="bg-white border border-[#E2E5EA] rounded-xl p-5 sm:p-6 space-y-4 max-w-lg">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0D0F12]">
                  Firebase Cloud Admin Security
                </h2>
                <p className="text-xs text-[#525866] mt-0.5">
                  Your storefront runs on Firebase Authentication &amp; Cloud Firestore, so Admin logins, tools, gateways, and orders persist across Netlify, Cloudflare, and Cloud Run.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] space-y-1 text-xs text-[#065F46]">
                <p className="font-semibold">Signed in with verified Firebase Admin account</p>
                <p className="font-mono break-all">{username || BOOTSTRAPPED_ADMIN_EMAIL}</p>
              </div>

              <p className="text-xs text-[#525866] leading-relaxed">
                Password updates and user management for Cloud Admin are handled directly in your Firebase Console (Authentication → Users).
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleChangePassword}
              className="bg-white border border-[#E2E5EA] rounded-xl p-5 sm:p-6 space-y-4 max-w-lg"
            >
              <div>
                <h2 className="font-display text-lg font-bold text-[#0D0F12]">
                  Admin Account Security
                </h2>
                <p className="text-xs text-[#525866] mt-0.5">
                  Update your admin username and password. Passwords use salted scrypt hashing.
                </p>
              </div>

              <div>
                <label
                  htmlFor="sec-cur-pass"
                  className="block text-xs font-medium text-[#525866] mb-1.5"
                >
                  Current Password
                </label>
                <input
                  id="sec-cur-pass"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="sec-new-user"
                  className="block text-xs font-medium text-[#525866] mb-1.5"
                >
                  Admin Username
                </label>
                <input
                  id="sec-new-user"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="sec-new-pass"
                  className="block text-xs font-medium text-[#525866] mb-1.5"
                >
                  New Password (min 8 characters)
                </label>
                <input
                  id="sec-new-pass"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={savingSecurity}
                className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-[#0D0F12] rounded-lg hover:bg-[#272A30] cursor-pointer"
              >
                {savingSecurity ? 'Updating...' : 'Update Credentials'}
              </button>
            </form>
          )}
        </main>
      </div>

      {/* Add / Edit Tool Modal with Auto-Fetch Official Logo & Info */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0F12]/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-editor-title"
        >
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-xl border border-[#E2E5EA] shadow-2xl">
            <div className="px-5 py-4 border-b border-[#E2E5EA] flex items-center justify-between">
              <h2
                id="product-editor-title"
                className="font-display text-lg font-bold text-[#0D0F12]"
              >
                {formState.id ? `Edit ${formState.name}` : 'Add New AI Tool'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close product form"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E2E5EA] text-[#525866] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              {/* Tool Name + Live Logo Preview + Auto-Fetch Button */}
              <div className="p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E2E5EA] space-y-3">
                <div className="flex items-center gap-3">
                  <ToolLogo
                    name={formState.name || 'AI'}
                    logoKey={formState.logoKey}
                    logoUrl={formState.logoUrl}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor="prod-name"
                      className="block text-xs font-semibold text-[#0D0F12] mb-1"
                    >
                      Tool Name *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="prod-name"
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => {
                          const nextName = e.target.value;
                          setFormState({
                            ...formState,
                            name: nextName,
                            logoKey: resolveBrandKeyFromName(nextName),
                          });
                        }}
                        placeholder="e.g. CapCut Pro, Runway, Suno..."
                        className="flex-1 min-h-[40px] px-3 py-2 text-sm bg-white border border-[#E2E5EA] rounded-lg"
                      />
                      <button
                        type="button"
                        disabled={autoFetching}
                        onClick={handleAutoFetchLogoAndInfo}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#059669] rounded-lg hover:bg-[#047857] cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {autoFetching ? 'Fetching...' : 'Auto-Add Logo & Info'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="prod-logo-url"
                    className="block text-[11px] font-medium text-[#525866] mb-1"
                  >
                    Custom Logo URL (auto-filled when available, or paste/upload icon)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="prod-logo-url"
                      type="text"
                      value={formState.logoUrl}
                      onChange={(e) => setFormState({ ...formState, logoUrl: e.target.value })}
                      placeholder="Auto-resolved from official brand logo"
                      className="flex-1 min-h-[38px] px-3 py-1.5 text-xs font-mono bg-white border border-[#E2E5EA] rounded-lg"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] hover:bg-[#E2E5EA]/50 cursor-pointer shrink-0">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setFormState((prev) => ({ ...prev, logoUrl: reader.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {autoFetchSource && (
                  <p className="text-[11px] font-medium text-[#065F46]">
                    Resolved via: {autoFetchSource}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="prod-category"
                    className="block text-xs font-medium text-[#525866] mb-1"
                  >
                    Category *
                  </label>
                  <select
                    id="prod-category"
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg bg-white"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="prod-plan"
                    className="block text-xs font-medium text-[#525866] mb-1"
                  >
                    Plan / Duration *
                  </label>
                  <input
                    id="prod-plan"
                    type="text"
                    required
                    value={formState.planLabel}
                    onChange={(e) => setFormState({ ...formState, planLabel: e.target.value })}
                    placeholder="1 Month · Private"
                    className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prod-price"
                    className="block text-xs font-medium text-[#525866] mb-1"
                  >
                    Your Sale Price ({currency}) *
                  </label>
                  <input
                    id="prod-price"
                    type="number"
                    required
                    min={1}
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    placeholder="1150"
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono border border-[#E2E5EA] rounded-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prod-last-price"
                    className="block text-xs font-medium text-[#525866] mb-1"
                  >
                    Last Price / Cut Price ({currency}) {previewDiscount > 0 ? `(${previewDiscount}% Off)` : ''}
                  </label>
                  <input
                    id="prod-last-price"
                    type="number"
                    min={0}
                    value={formState.originalPrice}
                    onChange={(e) => setFormState({ ...formState, originalPrice: e.target.value })}
                    placeholder="2400"
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono border border-[#E2E5EA] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="prod-offer"
                    className="block text-xs font-medium text-[#525866] mb-1"
                  >
                    Offer Label (optional, e.g. Flash Offer, Eid Deal, Best Value)
                  </label>
                  <input
                    id="prod-offer"
                    type="text"
                    value={formState.offerLabel}
                    onChange={(e) => setFormState({ ...formState, offerLabel: e.target.value })}
                    placeholder="Flash Offer"
                    className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="prod-desc"
                  className="block text-xs font-medium text-[#525866] mb-1"
                >
                  Short Description *
                </label>
                <textarea
                  id="prod-desc"
                  required
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Describe what is included..."
                  className="w-full px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-features"
                  className="block text-xs font-medium text-[#525866] mb-1"
                >
                  Features (one per line)
                </label>
                <textarea
                  id="prod-features"
                  rows={3}
                  value={formState.featuresText}
                  onChange={(e) => setFormState({ ...formState, featuresText: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E5EA] rounded-lg"
                />
              </div>

              {settings && settings.gateways.length > 0 && (
                <div className="p-3 rounded-lg bg-[#F4F5F7] border border-[#E2E5EA] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#0D0F12]">
                      Payment Methods for this Tool
                    </p>
                    <span className="text-[11px] text-[#525866]">
                      {formState.allowedGateways.length === 0
                        ? 'Using Store Default'
                        : 'Custom Selection'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {settings.gateways.map((gw) => {
                      const isCustom = formState.allowedGateways.length > 0;
                      const checked = isCustom
                        ? formState.allowedGateways.includes(gw.id)
                        : gw.enabled;
                      return (
                        <label
                          key={gw.id}
                          className="inline-flex items-center gap-2 text-xs font-medium text-[#0D0F12] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const currentActiveIds: GatewayId[] =
                                formState.allowedGateways.length > 0
                                  ? formState.allowedGateways
                                  : settings.gateways.filter((g) => g.enabled).map((g) => g.id);
                              const nextIds = e.target.checked
                                ? Array.from(new Set([...currentActiveIds, gw.id]))
                                : currentActiveIds.filter((id) => id !== gw.id);
                              setFormState({ ...formState, allowedGateways: nextIds });
                            }}
                            className="w-4 h-4 accent-[#0D0F12]"
                          />
                          {gw.label}
                        </label>
                      );
                    })}
                    {formState.allowedGateways.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, allowedGateways: [] })}
                        className="text-[11px] font-medium text-[#525866] underline cursor-pointer"
                      >
                        Reset to Store Default
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-5 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-[#0D0F12] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.topSelling}
                    onChange={(e) =>
                      setFormState({ ...formState, topSelling: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#0D0F12]"
                  />
                  Top Selling
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#0D0F12] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.inStock}
                    onChange={(e) => setFormState({ ...formState, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#0D0F12]"
                  />
                  Available for Buy Now
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#0D0F12] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.active}
                    onChange={(e) => setFormState({ ...formState, active: e.target.checked })}
                    className="w-4 h-4 accent-[#0D0F12]"
                  />
                  Visible on Storefront
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#0D0F12] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.featuredInHero}
                    onChange={(e) =>
                      setFormState({ ...formState, featuredInHero: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#0D0F12]"
                  />
                  Show in Hero Showcase
                </label>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C]"
                >
                  {formError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-sm font-medium text-[#525866] border border-[#E2E5EA] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="min-h-[44px] px-5 py-2 text-sm font-semibold text-white bg-[#0D0F12] rounded-lg hover:bg-[#059669] cursor-pointer"
                >
                  {savingProduct ? 'Saving...' : formState.id ? 'Update Tool' : 'Save & List Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Screenshot Lightbox Modal for Admin Order Verification */}
      {previewOrder && previewOrder.screenshotDataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0F12]/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Payment screenshot preview"
        >
          <div className="w-full max-w-lg bg-white rounded-xl border border-[#E2E5EA] overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-[#E2E5EA] flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-[#0D0F12]">
                  {previewOrder.orderCode} · {previewOrder.paymentMethodLabel}
                </p>
                <p className="text-xs text-[#525866]">
                  {previewOrder.customerName} (+{previewOrder.customerWhatsapp})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                aria-label="Close screenshot preview"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E2E5EA] text-[#525866] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-[#F4F5F7] flex items-center justify-center">
              <img
                src={previewOrder.screenshotDataUrl}
                alt={`Payment screenshot for ${previewOrder.orderCode}`}
                className="max-h-[70vh] w-auto rounded-lg border border-[#E2E5EA]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
