import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BRAND_PRESETS,
  createDefaultProducts,
  createDefaultSettings,
} from '../data/defaultStoreSeed';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import type {
  GatewayId,
  Order,
  OrderStatus,
  PaymentGatewayConfig,
  Product,
  ProductCategory,
  StoreSettings,
} from '../types';
import {
  buildLogoCandidateUrls,
  buildWhatsappOrderUrl,
  formatCurrency,
  normalizeDomainInput,
  parseApiEndpointLines,
  parseStorefrontSnapshot,
  PRODUCT_CATEGORIES,
  resolveBrandKeyFromName,
  sanitizeWhatsappPhone,
  validateOrderInput,
  validateProductInput,
} from '../utils/storeLogic';

export const BOOTSTRAPPED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'ha933123456789@gmail.com'
)
  .trim()
  .toLowerCase();
const STOREFRONT_COLLECTION = 'storefront';
const STOREFRONT_DOC_ID = 'config';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const ADMINS_COLLECTION = 'admins';
const STOREFRONT_CACHE_KEY = 'toolcraft_storefront_snapshot_v1';

export function readCachedStorefront(): { settings: StoreSettings; products: Product[] } | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return parseStorefrontSnapshot(window.localStorage.getItem(STOREFRONT_CACHE_KEY));
  } catch {
    return null;
  }
}

export function writeCachedStorefront(settings: StoreSettings, products: Product[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(
      STOREFRONT_CACHE_KEY,
      JSON.stringify({
        settings,
        products,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // Ignore storage quota / private mode errors
  }
}

function toIsoDate(value: unknown, fallback = new Date().toISOString()): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return fallback;
}

function normalizeProductDoc(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: String(data.name || ''),
    category: (data.category as ProductCategory) || 'Productivity',
    planLabel: String(data.planLabel || ''),
    price: Number(data.price) || 0,
    originalPrice:
      typeof data.originalPrice === 'number' && data.originalPrice > 0
        ? data.originalPrice
        : undefined,
    offerLabel: typeof data.offerLabel === 'string' && data.offerLabel ? data.offerLabel : undefined,
    topSelling: Boolean(data.topSelling),
    inStock: data.inStock !== false,
    stock: typeof data.stock === 'number' ? data.stock : 25,
    logoKey: String(data.logoKey || 'generic'),
    logoUrl: typeof data.logoUrl === 'string' && data.logoUrl ? data.logoUrl : undefined,
    description: String(data.description || ''),
    features: Array.isArray(data.features) ? data.features.map((f) => String(f)) : [],
    allowedGateways: Array.isArray(data.allowedGateways)
      ? (data.allowedGateways.filter(
          (g) => g === 'jazzcash' || g === 'easypaisa' || g === 'binance'
        ) as GatewayId[])
      : undefined,
    featuredInHero: data.featuredInHero !== false,
    active: data.active !== false,
    createdAt: toIsoDate(data.createdAt),
  };
}

function normalizeOrderDoc(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    orderCode: String(data.orderCode || id),
    productId: String(data.productId || ''),
    productName: String(data.productName || ''),
    planLabel: String(data.planLabel || ''),
    amount: Number(data.amount) || 0,
    currencySymbol: String(data.currencySymbol || 'Rs.'),
    customerName: String(data.customerName || ''),
    customerWhatsapp: String(data.customerWhatsapp || ''),
    customerEmail:
      typeof data.customerEmail === 'string' && data.customerEmail ? data.customerEmail : undefined,
    paymentMethod: (data.paymentMethod as GatewayId) || 'easypaisa',
    paymentMethodLabel: String(data.paymentMethodLabel || 'Easypaisa'),
    transactionRef: String(data.transactionRef || 'Screenshot Attached'),
    screenshotDataUrl:
      typeof data.screenshotDataUrl === 'string' ? data.screenshotDataUrl : undefined,
    status: (data.status as OrderStatus) || 'pending',
    notes: typeof data.notes === 'string' && data.notes ? data.notes : undefined,
    createdAt: toIsoDate(data.createdAt),
  };
}

function normalizeSettingsDoc(data: Record<string, unknown>): StoreSettings {
  const defaults = createDefaultSettings();
  return {
    storeName: String(data.storeName || defaults.storeName),
    tagline: String(data.tagline ?? defaults.tagline),
    whatsappNumber: String(data.whatsappNumber || defaults.whatsappNumber),
    whatsappDisplay: String(data.whatsappDisplay || defaults.whatsappDisplay),
    supportHours: String(data.supportHours || defaults.supportHours || 'Support 24/7'),
    currencySymbol: String(data.currencySymbol || defaults.currencySymbol),
    deliverySla: String(data.deliverySla ?? defaults.deliverySla),
    autoFetchEndpoints: Array.isArray(data.autoFetchEndpoints)
      ? data.autoFetchEndpoints.map((u) => String(u))
      : [],
    gateways: Array.isArray(data.gateways)
      ? (data.gateways as PaymentGatewayConfig[])
      : defaults.gateways,
  };
}

function buildFirestoreProductRecord(product: Product, isNew: boolean): Record<string, unknown> {
  const record: Record<string, unknown> = {
    id: product.id,
    name: product.name.trim().slice(0, 120),
    category: product.category,
    planLabel: product.planLabel.trim().slice(0, 100),
    price: Number(product.price),
    topSelling: Boolean(product.topSelling),
    inStock: Boolean(product.inStock),
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
    logoKey: (product.logoKey || 'generic').trim().slice(0, 60),
    description: product.description.trim().slice(0, 1000),
    features: product.features.map((f) => f.trim().slice(0, 200)).filter(Boolean).slice(0, 20),
    featuredInHero: product.featuredInHero !== false,
    active: product.active !== false,
  };

  if (product.originalPrice !== undefined && product.originalPrice > 0) {
    record.originalPrice = Number(product.originalPrice);
  }
  if (product.offerLabel && product.offerLabel.trim()) {
    record.offerLabel = product.offerLabel.trim().slice(0, 60);
  }
  if (product.logoUrl && product.logoUrl.trim()) {
    record.logoUrl = product.logoUrl.trim().slice(0, 1024);
  }
  if (Array.isArray(product.allowedGateways) && product.allowedGateways.length > 0) {
    record.allowedGateways = product.allowedGateways.slice(0, 3);
  }
  if (isNew) {
    record.createdAt = serverTimestamp();
  } else {
    record.updatedAt = serverTimestamp();
  }
  return record;
}

export async function isAuthorizedAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (
    user.email &&
    user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL &&
    user.emailVerified
  ) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, ADMINS_COLLECTION, user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export async function seedFirestoreIfEmpty(): Promise<void> {
  const configRef = doc(db, STOREFRONT_COLLECTION, STOREFRONT_DOC_ID);
  try {
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      const defaults = createDefaultSettings();
      await setDoc(configRef, {
        ...defaults,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STOREFRONT_COLLECTION}/${STOREFRONT_DOC_ID}`);
  }

  try {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (productsSnap.empty) {
      const defaults = createDefaultProducts();
      for (const item of defaults) {
        const ref = doc(db, PRODUCTS_COLLECTION, item.id);
        await setDoc(ref, buildFirestoreProductRecord(item, true));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}

export async function signInAdminWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: User; username: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== BOOTSTRAPPED_ADMIN_EMAIL) {
    throw new Error('Access denied. Only the authorized Admin email can sign in.');
  }

  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const user = credential.user;

  if (!user.emailVerified) {
    let isListedAdmin = false;
    try {
      const adminSnap = await getDoc(doc(db, ADMINS_COLLECTION, user.uid));
      isListedAdmin = adminSnap.exists();
    } catch {
      isListedAdmin = false;
    }

    if (!isListedAdmin) {
      try {
        await sendEmailVerification(user);
      } catch {
        // Ignore rate-limiting errors if verification email was recently sent
      }
      await signOut(auth);
      throw new Error(
        `Verification email sent to ${user.email || 'your email'}. Verify via the inbox link once, then sign in again.`
      );
    }
  }

  const authorized = await isAuthorizedAdminUser(user);
  if (!authorized) {
    await signOut(auth);
    throw new Error(
      `Account (${user.email || 'unknown'}) is not authorized for Admin access.`
    );
  }

  await seedFirestoreIfEmpty();
  return {
    user,
    username: user.email || user.displayName || 'Admin',
  };
}

export async function signOutAdminFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Ignore sign-out errors
  }
}

export async function fetchStorefrontWithFallback(): Promise<{
  settings: StoreSettings;
  products: Product[];
  source: 'firestore' | 'api' | 'seed';
}> {
  let settings = createDefaultSettings();
  let hasFirestoreSettings = false;
  let products: Product[] = [];

  try {
    const firestoreRead = Promise.all([
      getDoc(doc(db, STOREFRONT_COLLECTION, STOREFRONT_DOC_ID)),
      getDocs(query(collection(db, PRODUCTS_COLLECTION), where('active', '==', true))),
    ]);
    const timeoutGuard = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('firestore-timeout')), 8500)
    );
    const [configSnap, productsSnap] = await Promise.race([firestoreRead, timeoutGuard]);

    if (configSnap.exists()) {
      settings = normalizeSettingsDoc(configSnap.data() as Record<string, unknown>);
      hasFirestoreSettings = true;
    }

    if (!productsSnap.empty) {
      products = productsSnap.docs.map((d) =>
        normalizeProductDoc(d.id, d.data() as Record<string, unknown>)
      );
      writeCachedStorefront(settings, products);
      return { settings, products, source: 'firestore' };
    }
  } catch {
    // Fall through to backend API or cached/default catalog if Firestore unavailable
  }

  try {
    const res = await fetch('/api/storefront', { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data?.settings && Array.isArray(data?.products)) {
        const resolvedSettings = hasFirestoreSettings
          ? settings
          : (data.settings as StoreSettings);
        const resolvedProducts = data.products as Product[];
        writeCachedStorefront(resolvedSettings, resolvedProducts);
        return {
          settings: resolvedSettings,
          products: resolvedProducts,
          source: 'api',
        };
      }
    }
  } catch {
    // Static hosts (Netlify / GitHub Pages) won't have /api/storefront
  }

  const cached = readCachedStorefront();
  if (cached && cached.products.length > 0) {
    return {
      settings: hasFirestoreSettings ? settings : cached.settings,
      products: cached.products,
      source: 'firestore',
    };
  }

  return {
    settings,
    products: createDefaultProducts(),
    source: 'seed',
  };
}

export function subscribeStorefrontRealtime(handlers: {
  onSettings: (settings: StoreSettings) => void;
  onProducts: (products: Product[]) => void;
}): () => void {
  const unsubSettings = onSnapshot(
    doc(db, STOREFRONT_COLLECTION, STOREFRONT_DOC_ID),
    (snap) => {
      if (!snap.exists()) return;
      const nextSettings = normalizeSettingsDoc(snap.data() as Record<string, unknown>);
      handlers.onSettings(nextSettings);
    },
    () => {
      // Ignore realtime permission/network hiccups; initial fetch handles fallback
    }
  );

  const unsubProducts = onSnapshot(
    query(collection(db, PRODUCTS_COLLECTION), where('active', '==', true)),
    (snap) => {
      if (snap.empty && snap.metadata.fromCache) return;
      const nextProducts = snap.docs.map((d) =>
        normalizeProductDoc(d.id, d.data() as Record<string, unknown>)
      );
      handlers.onProducts(nextProducts);
    },
    () => {
      // Ignore realtime permission/network hiccups; initial fetch handles fallback
    }
  );

  return () => {
    unsubSettings();
    unsubProducts();
  };
}

export async function fetchAdminDashboardFirestore(): Promise<{
  username: string;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
}> {
  await seedFirestoreIfEmpty();

  let settings = createDefaultSettings();
  try {
    const configSnap = await getDoc(doc(db, STOREFRONT_COLLECTION, STOREFRONT_DOC_ID));
    if (configSnap.exists()) {
      settings = normalizeSettingsDoc(configSnap.data() as Record<string, unknown>);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${STOREFRONT_COLLECTION}/${STOREFRONT_DOC_ID}`);
  }

  let products: Product[] = [];
  try {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    products = productsSnap.docs
      .map((d) => normalizeProductDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }

  let orders: Order[] = [];
  try {
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    orders = ordersSnap.docs
      .map((d) => normalizeOrderDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
  }

  return {
    username: auth.currentUser?.email || auth.currentUser?.displayName || 'Admin',
    settings,
    products,
    orders,
  };
}

export async function createProductFirestore(
  input: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  const validation = validateProductInput({
    name: input.name,
    category: input.category,
    planLabel: input.planLabel,
    price: input.price,
    originalPrice: input.originalPrice,
    stock: input.stock,
    description: input.description,
    features: input.features,
  });
  if (!validation.valid) {
    throw new Error(validation.error || 'Please check product fields.');
  }

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);
  const rand = crypto.randomUUID().replace(/[^a-z0-9]/g, '').slice(0, 6);
  const id = `${slug || 'tool'}-${rand}`;

  const product: Product = {
    ...input,
    id,
    logoKey: (input.logoKey || '').trim() || resolveBrandKeyFromName(input.name),
    featuredInHero: input.featuredInHero !== false,
    active: input.active !== false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, id), buildFirestoreProductRecord(product, true));
    return product;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

export async function updateProductFirestore(
  productId: string,
  patch: Partial<Product>
): Promise<Product> {
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  let current: Product;

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error('Product not found in Firestore.');
    }
    current = normalizeProductDoc(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found in Firestore.') {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, `${PRODUCTS_COLLECTION}/${productId}`);
  }

  const nextName = patch.name !== undefined ? patch.name.trim() : current.name;
  const next: Product = {
    ...current,
    ...patch,
    name: nextName,
    planLabel: patch.planLabel !== undefined ? patch.planLabel.trim() : current.planLabel,
    price: patch.price !== undefined ? Number(patch.price) : current.price,
    originalPrice:
      patch.originalPrice !== undefined
        ? patch.originalPrice === null || String(patch.originalPrice) === ''
          ? undefined
          : Number(patch.originalPrice)
        : current.originalPrice,
    offerLabel:
      patch.offerLabel !== undefined
        ? String(patch.offerLabel || '').trim() || undefined
        : current.offerLabel,
    logoKey:
      patch.logoKey !== undefined
        ? String(patch.logoKey || '').trim() || resolveBrandKeyFromName(nextName)
        : current.logoKey,
    logoUrl:
      patch.logoUrl !== undefined
        ? String(patch.logoUrl || '').trim() || undefined
        : current.logoUrl,
    description:
      patch.description !== undefined ? patch.description.trim() : current.description,
    features: Array.isArray(patch.features)
      ? patch.features.map((f) => String(f).trim()).filter(Boolean)
      : current.features,
    allowedGateways:
      patch.allowedGateways !== undefined
        ? Array.isArray(patch.allowedGateways) && patch.allowedGateways.length > 0
          ? patch.allowedGateways
          : undefined
        : current.allowedGateways,
    featuredInHero:
      patch.featuredInHero !== undefined ? Boolean(patch.featuredInHero) : current.featuredInHero,
    active: patch.active !== undefined ? Boolean(patch.active) : current.active,
  };

  const validation = validateProductInput({
    name: next.name,
    category: next.category,
    planLabel: next.planLabel,
    price: next.price,
    originalPrice: next.originalPrice,
    stock: next.stock,
    description: next.description,
    features: next.features,
  });
  if (!validation.valid) {
    throw new Error(validation.error || 'Please check product fields.');
  }

  const updatePayload: Record<string, unknown> = {
    name: next.name.slice(0, 120),
    category: next.category,
    planLabel: next.planLabel.slice(0, 100),
    price: Number(next.price),
    originalPrice:
      next.originalPrice !== undefined && next.originalPrice > 0
        ? Number(next.originalPrice)
        : deleteField(),
    offerLabel: next.offerLabel ? next.offerLabel.slice(0, 60) : deleteField(),
    topSelling: Boolean(next.topSelling),
    inStock: Boolean(next.inStock),
    stock: Math.max(0, Math.floor(Number(next.stock) || 0)),
    logoKey: next.logoKey.slice(0, 60),
    logoUrl: next.logoUrl ? next.logoUrl.slice(0, 1024) : deleteField(),
    description: next.description.slice(0, 1000),
    features: next.features.slice(0, 20),
    allowedGateways:
      Array.isArray(next.allowedGateways) && next.allowedGateways.length > 0
        ? next.allowedGateways.slice(0, 3)
        : deleteField(),
    featuredInHero: next.featuredInHero !== false,
    active: next.active !== false,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(ref, updatePayload);
    return next;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function deleteProductFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function updateSettingsFirestore(
  patch: Partial<StoreSettings> & { autoFetchEndpoints?: string[] | string }
): Promise<StoreSettings> {
  const ref = doc(db, STOREFRONT_COLLECTION, STOREFRONT_DOC_ID);
  let current = createDefaultSettings();
  let exists = false;

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      exists = true;
      current = normalizeSettingsDoc(snap.data() as Record<string, unknown>);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${STOREFRONT_COLLECTION}/${STOREFRONT_DOC_ID}`);
  }

  let nextWhatsapp = current.whatsappNumber;
  if (patch.whatsappNumber !== undefined) {
    const clean = sanitizeWhatsappPhone(String(patch.whatsappNumber));
    if (clean.length < 10) {
      throw new Error('WhatsApp number must have at least 10 digits with country code.');
    }
    nextWhatsapp = clean;
  }

  let nextEndpoints = current.autoFetchEndpoints || [];
  if (patch.autoFetchEndpoints !== undefined) {
    nextEndpoints = Array.isArray(patch.autoFetchEndpoints)
      ? parseApiEndpointLines(patch.autoFetchEndpoints.join('\n'))
      : parseApiEndpointLines(String(patch.autoFetchEndpoints));
  }

  const next: StoreSettings = {
    storeName:
      patch.storeName !== undefined && patch.storeName.trim()
        ? patch.storeName.trim().slice(0, 80)
        : current.storeName,
    tagline:
      patch.tagline !== undefined ? patch.tagline.trim().slice(0, 200) : current.tagline,
    whatsappNumber: nextWhatsapp.slice(0, 20),
    whatsappDisplay:
      patch.whatsappDisplay !== undefined
        ? (patch.whatsappDisplay.trim() || `+${nextWhatsapp}`).slice(0, 30)
        : current.whatsappDisplay,
    supportHours:
      patch.supportHours !== undefined
        ? (patch.supportHours.trim() || 'Support 24/7').slice(0, 80)
        : current.supportHours || 'Support 24/7',
    currencySymbol:
      patch.currencySymbol !== undefined && patch.currencySymbol.trim()
        ? patch.currencySymbol.trim().slice(0, 6)
        : current.currencySymbol,
    deliverySla:
      patch.deliverySla !== undefined
        ? patch.deliverySla.trim().slice(0, 300)
        : current.deliverySla,
    autoFetchEndpoints: nextEndpoints.slice(0, 20),
    gateways: Array.isArray(patch.gateways)
      ? current.gateways.map((existing) => {
          const updated = patch.gateways?.find((g) => g.id === existing.id);
          if (!updated) return existing;
          return {
            ...existing,
            enabled: Boolean(updated.enabled),
            label: String(updated.label || existing.label).trim(),
            accountTitle: String(updated.accountTitle || '').trim(),
            accountNumber: String(updated.accountNumber || '').trim(),
            instructions: String(updated.instructions || '').trim(),
          };
        })
      : current.gateways,
  };

  try {
    const payload = {
      ...next,
      updatedAt: serverTimestamp(),
    };
    if (exists) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, payload);
    }
    return next;
  } catch (error) {
    handleFirestoreError(
      error,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      `${STOREFRONT_COLLECTION}/${STOREFRONT_DOC_ID}`
    );
  }
}

export async function createOrderSmart(params: {
  product: Product;
  settings: StoreSettings;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  paymentMethod: GatewayId;
  transactionRef?: string;
  screenshotDataUrl: string;
}): Promise<{ order: Order; whatsappUrl: string }> {
  const gateway = params.settings.gateways.find((g) => g.id === params.paymentMethod);
  if (!gateway) {
    throw new Error('Please choose an active payment method.');
  }
  const effectiveGateway =
    Array.isArray(params.product.allowedGateways) &&
    params.product.allowedGateways.includes(gateway.id)
      ? { ...gateway, enabled: true }
      : gateway;

  const validation = validateOrderInput({
    customerName: params.customerName,
    customerWhatsapp: params.customerWhatsapp,
    paymentMethod: gateway.id,
    transactionRef: params.transactionRef,
    screenshotDataUrl: params.screenshotDataUrl,
    gateway: effectiveGateway,
    product: params.product,
  });
  if (!validation.valid) {
    throw new Error(validation.error || 'Please check your order details.');
  }

  const cleanWhatsapp = sanitizeWhatsappPhone(params.customerWhatsapp);
  const txRef = (params.transactionRef || '').trim() || 'Screenshot Attached';
  const orderId = `ord-${crypto.randomUUID().replace(/[^a-z0-9]/g, '').slice(0, 12)}`;
  const numericSuffix = String(Date.now()).slice(-4);
  const orderCode = `TC-${numericSuffix}`;

  const order: Order = {
    id: orderId,
    orderCode,
    productId: params.product.id,
    productName: params.product.name.slice(0, 120),
    planLabel: params.product.planLabel.slice(0, 100),
    amount: params.product.price,
    currencySymbol: params.settings.currencySymbol,
    customerName: params.customerName.trim().slice(0, 80),
    customerWhatsapp: cleanWhatsapp.slice(0, 20),
    customerEmail: params.customerEmail?.trim()
      ? params.customerEmail.trim().slice(0, 160)
      : undefined,
    paymentMethod: gateway.id,
    paymentMethodLabel: gateway.label.slice(0, 60),
    transactionRef: txRef.slice(0, 120),
    screenshotDataUrl: params.screenshotDataUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const priceText = formatCurrency(order.amount, params.settings.currencySymbol);
  const whatsappUrl = buildWhatsappOrderUrl({
    storeWhatsapp: params.settings.whatsappNumber,
    productName: order.productName,
    planLabel: order.planLabel,
    priceText,
    orderCode: order.orderCode,
    paymentMethodLabel: order.paymentMethodLabel,
    transactionRef: order.transactionRef,
    customerName: order.customerName,
  });

  // Check if product is seeded in Firestore before writing order document
  let productExistsInFirestore = false;
  try {
    const productSnap = await getDoc(doc(db, PRODUCTS_COLLECTION, params.product.id));
    productExistsInFirestore = productSnap.exists();
  } catch {
    productExistsInFirestore = false;
  }

  if (productExistsInFirestore) {
    const orderDoc: Record<string, unknown> = {
      id: order.id,
      orderCode: order.orderCode,
      productId: order.productId,
      productName: order.productName,
      planLabel: order.planLabel,
      amount: order.amount,
      currencySymbol: order.currencySymbol,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp,
      paymentMethod: order.paymentMethod,
      paymentMethodLabel: order.paymentMethodLabel,
      transactionRef: order.transactionRef,
      screenshotDataUrl: order.screenshotDataUrl,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    if (order.customerEmail) {
      orderDoc.customerEmail = order.customerEmail;
    }
    try {
      await setDoc(doc(db, ORDERS_COLLECTION, order.id), orderDoc);
      return { order, whatsappUrl };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COLLECTION}/${order.id}`);
    }
  }

  // Fallback to backend server (/api/orders) when running on Express/Worker before Firestore seed
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: params.product.id,
        customerName: order.customerName,
        customerWhatsapp: params.customerWhatsapp,
        customerEmail: order.customerEmail,
        paymentMethod: gateway.id,
        transactionRef: txRef,
        screenshotDataUrl: params.screenshotDataUrl,
      }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data?.order && data?.whatsappUrl) {
        return { order: data.order as Order, whatsappUrl: data.whatsappUrl as string };
      }
    }
  } catch {
    // Ignore if running pure static host before initial admin seed
  }

  return { order, whatsappUrl };
}

export async function updateOrderFirestore(
  orderId: string,
  patch: { status?: OrderStatus; notes?: string }
): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.notes !== undefined) payload.notes = patch.notes.trim().slice(0, 500);

  try {
    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

export async function deleteOrderFirestore(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

export async function autoFetchToolInfoClientFallback(params: {
  name: string;
  domain?: string;
  endpointsText?: string;
}): Promise<{
  logoKey: string;
  logoUrl: string;
  category: ProductCategory;
  planLabel: string;
  description: string;
  features: string[];
  source: string;
}> {
  const rawName = params.name.trim();
  const explicitDomain = normalizeDomainInput(params.domain || '');
  const customEndpoints = parseApiEndpointLines(params.endpointsText || '');

  for (let i = 0; i < customEndpoints.length; i += 1) {
    const endpointTemplate = customEndpoints[i];
    try {
      const hasPlaceholder = /\{name\}/i.test(endpointTemplate);
      const targetUrl = hasPlaceholder
        ? endpointTemplate.replace(/\{name\}/gi, encodeURIComponent(rawName))
        : endpointTemplate;
      const apiRes = await fetch(targetUrl, {
        method: hasPlaceholder ? 'GET' : 'POST',
        headers: hasPlaceholder
          ? { Accept: 'application/json' }
          : { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: hasPlaceholder ? undefined : JSON.stringify({ name: rawName }),
      });
      if (!apiRes.ok) continue;
      const data = (await apiRes.json()) as {
        logoKey?: string;
        logoUrl?: string;
        officialDomain?: string;
        domain?: string;
        category?: string;
        planLabel?: string;
        description?: string;
        features?: string[];
      };
      const hasUsefulData = Boolean(
        data &&
          (data.description || data.logoUrl || data.officialDomain || data.domain || data.planLabel)
      );
      if (!hasUsefulData) continue;

      const domain = explicitDomain || normalizeDomainInput(String(data.officialDomain || data.domain || ''));
      const candidates = domain ? buildLogoCandidateUrls(domain) : [];
      const matchedCat = PRODUCT_CATEGORIES.includes(data.category as ProductCategory)
        ? (data.category as ProductCategory)
        : 'Productivity';

      return {
        logoKey: data.logoKey || resolveBrandKeyFromName(rawName),
        logoUrl: data.logoUrl?.trim() || candidates[0] || '',
        category: matchedCat,
        planLabel: data.planLabel || '1 Month · Pro Access',
        description:
          data.description || `Verified ${rawName} subscription with instant WhatsApp activation.`,
        features:
          Array.isArray(data.features) && data.features.length > 0
            ? data.features.slice(0, 3)
            : ['Instant WhatsApp delivery', 'Full term warranty', 'Verified pro access'],
        source: `custom-endpoint-${i + 1}`,
      };
    } catch {
      // Try next configured endpoint
    }
  }

  const logoKey = resolveBrandKeyFromName(rawName);
  const preset = BRAND_PRESETS[logoKey];
  if (preset) {
    const explicitCandidates = explicitDomain ? buildLogoCandidateUrls(explicitDomain) : [];
    return {
      logoKey,
      logoUrl: explicitCandidates[0] || '',
      category: preset.category,
      planLabel: preset.planLabel,
      description: preset.description,
      features: preset.features,
      source: 'verified-brand-registry',
    };
  }

  const guessedSlug = rawName
    .toLowerCase()
    .replace(/\b(pro|plus|ai|premium|team|seat|1\s*month|1\s*year)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
  const guessedDomain = explicitDomain || (guessedSlug ? `${guessedSlug}.com` : '');
  const fallbackCandidates = guessedDomain ? buildLogoCandidateUrls(guessedDomain) : [];

  return {
    logoKey: 'generic',
    logoUrl: fallbackCandidates[0] || '',
    category: 'Productivity',
    planLabel: '1 Month · Pro Access',
    description: `Verified ${rawName} subscription with instant WhatsApp delivery and full-term warranty.`,
    features: [
      'Instant WhatsApp activation',
      'Full subscription warranty',
      'Dedicated support desk',
    ],
    source: 'smart-domain-lookup',
  };
}
