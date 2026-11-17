import type {
  GatewayId,
  Order,
  PaymentGatewayConfig,
  Product,
  ProductCategory,
  StoreSettings,
} from '../types.ts';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Video & Editing',
  'AI Assistants',
  'Design & Image',
  'Audio & Voice',
  'Productivity',
];

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface ProductFilterOptions {
  category?: ProductCategory | 'All';
  search?: string;
  sortBy?: SortOption;
  includeInactive?: boolean;
}

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions = {}
): Product[] {
  const {
    category = 'All',
    search = '',
    sortBy = 'featured',
    includeInactive = false,
  } = options;

  const query = search.trim().toLowerCase();

  const filtered = products.filter((item) => {
    if (!includeInactive && !item.active) return false;
    if (category !== 'All' && item.category !== category) return false;
    if (query) {
      const haystack = [
        item.name,
        item.category,
        item.planLabel,
        item.offerLabel || '',
        item.description,
        ...item.features,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    const topDiff = Number(Boolean(b.topSelling)) - Number(Boolean(a.topSelling));
    if (topDiff !== 0) return topDiff;
    const stockDiff = Number(b.inStock) - Number(a.inStock);
    if (stockDiff !== 0) return stockDiff;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return sorted;
}

export function formatCurrency(amount: number, currencySymbol = 'Rs.'): string {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(safeAmount);
  return `${currencySymbol} ${formatted}`;
}

export const PKR_PER_USDT = 285;

export function formatUsdtAmount(pkrAmount: number, rate = PKR_PER_USDT): string {
  const safeAmount = Number.isFinite(pkrAmount) ? Math.max(0, pkrAmount) : 0;
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : PKR_PER_USDT;
  return `${(safeAmount / safeRate).toFixed(2)} USDT`;
}

export function computeDiscountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price || price <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function resolveBrandKeyFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('capcut')) return 'capcut';
  if (lower.includes('gemini')) return 'gemini';
  if (lower.includes('canva')) return 'canva';
  if (lower.includes('eleven')) return 'elevenlabs';
  if (lower.includes('midjourney')) return 'midjourney';
  if (lower.includes('perplexity')) return 'perplexity';
  if (lower.includes('adobe') || lower.includes('premiere') || lower.includes('photoshop')) {
    return 'adobe';
  }
  if (lower.includes('cursor')) return 'cursor';
  if (lower.includes('runway')) return 'runway';
  if (lower.includes('suno')) return 'suno';
  if (lower.includes('notion')) return 'notion';
  if (lower.includes('figma')) return 'figma';
  if (lower.includes('grammarly')) return 'grammarly';
  if (lower.includes('claude')) return 'claude';
  if (lower.includes('spotify')) return 'spotify';
  if (lower.includes('youtube')) return 'youtube';
  if (lower.includes('netflix')) return 'netflix';
  return 'generic';
}

export function sanitizeWhatsappPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }
  return digits;
}

export interface WhatsappUrlParams {
  storeWhatsapp: string;
  productName: string;
  planLabel: string;
  priceText: string;
  orderCode?: string;
  paymentMethodLabel?: string;
  transactionRef?: string;
  customerName?: string;
}

export function buildWhatsappOrderUrl(params: WhatsappUrlParams): string {
  const cleanPhone = sanitizeWhatsappPhone(params.storeWhatsapp);
  const lines = [
    `Assalam o Alaikum! I placed an order for *${params.productName}* (${params.planLabel}) — ${params.priceText}.`,
  ];
  if (params.orderCode) {
    lines.push(`Order ID: ${params.orderCode}`);
  }
  if (params.customerName) {
    lines.push(`Name: ${params.customerName}`);
  }
  if (params.paymentMethodLabel) {
    lines.push(`Payment Method: ${params.paymentMethodLabel}`);
  }
  if (params.transactionRef) {
    lines.push(`Transaction Ref: ${params.transactionRef}`);
  }
  lines.push('Sending my payment screenshot within 15 minutes for activation.');

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export interface OrderValidationInput {
  customerName: string;
  customerWhatsapp: string;
  paymentMethod: GatewayId;
  transactionRef?: string;
  screenshotDataUrl?: string;
  gateway?: PaymentGatewayConfig;
  product?: Product;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateOrderInput(input: OrderValidationInput): ValidationResult {
  const name = input.customerName.trim();
  if (name.length < 2) {
    return { valid: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (name.length > 80) {
    return { valid: false, error: 'Customer name must be 80 characters or fewer.' };
  }

  const digits = sanitizeWhatsappPhone(input.customerWhatsapp);
  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      error: 'Please enter a valid WhatsApp number (10 to 15 digits with country code).',
    };
  }

  if (input.product) {
    if (!input.product.active) {
      return { valid: false, error: 'This tool is currently unavailable.' };
    }
    if (!input.product.inStock) {
      return { valid: false, error: 'This tool is currently out of stock.' };
    }
  }

  if (input.gateway && !input.gateway.enabled) {
    return { valid: false, error: 'Selected payment gateway is not currently enabled.' };
  }

  const screenshot = (input.screenshotDataUrl || '').trim();
  if (!screenshot.startsWith('data:image/') || screenshot.length < 64) {
    return {
      valid: false,
      error: 'Please upload your payment screenshot before submitting.',
    };
  }

  return { valid: true };
}

export interface ProductInput {
  name: string;
  category: ProductCategory;
  planLabel: string;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  features: string[];
}

export function validateProductInput(input: ProductInput): ValidationResult {
  if (!input.name || input.name.trim().length < 2) {
    return { valid: false, error: 'Tool name must be at least 2 characters.' };
  }
  if (!PRODUCT_CATEGORIES.includes(input.category)) {
    return { valid: false, error: 'Please choose a valid category.' };
  }
  if (!input.planLabel || input.planLabel.trim().length < 2) {
    return { valid: false, error: 'Plan label is required (e.g. 1 Month · Private).' };
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0.' };
  }
  if (
    input.originalPrice !== undefined &&
    input.originalPrice !== null &&
    (!Number.isFinite(input.originalPrice) || input.originalPrice < 0)
  ) {
    return { valid: false, error: 'Last price cannot be negative.' };
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return { valid: false, error: 'Stock must be a whole number (0 or higher).' };
  }
  if (!input.description || input.description.trim().length < 8) {
    return { valid: false, error: 'Please provide a short description (min 8 chars).' };
  }
  return { valid: true };
}

export interface InventorySummary {
  totalProducts: number;
  activeProducts: number;
  topSellingCount: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export function computeInventorySummary(
  products: Product[],
  orders: Order[]
): InventorySummary {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const topSellingCount = products.filter((p) => p.active && p.topSelling).length;
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stock <= 0).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.amount, 0);

  return {
    totalProducts,
    activeProducts,
    topSellingCount,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    totalRevenue,
  };
}

export function parseApiEndpointLines(rawText: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawLine of rawText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (!/^https?:\/\/\S+$/i.test(line)) continue;
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }

  return result;
}

export function parseKeyList(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(/[\r\n,]+/)) {
    const key = part.trim();
    if (!key || key === 'MY_GEMINI_API_KEY') continue;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }

  return result;
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 10) {
    return `${trimmed.slice(0, 3)}••••${trimmed.slice(-2)}`;
  }
  return `${trimmed.slice(0, 6)}••••••${trimmed.slice(-4)}`;
}

export function normalizeDomainInput(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#].*$/, '');
  if (!cleaned || !cleaned.includes('.') || /\s/.test(cleaned)) {
    return '';
  }
  return cleaned;
}

export function buildLogoCandidateUrls(domain: string): string[] {
  const clean = normalizeDomainInput(domain);
  if (!clean) return [];
  return [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(clean)}.ico`,
  ];
}

export function formatAutoFetchSourceLabel(source?: string): string {
  if (!source) return '';
  if (source.startsWith('custom-endpoint-')) {
    const idx = source.replace('custom-endpoint-', '');
    return `Lookup API Line #${idx}`;
  }
  if (source.startsWith('server-ai-key-')) {
    const idx = source.replace('server-ai-key-', '');
    return `Server Gemini Key #${idx}`;
  }
  if (source === 'verified-brand-registry') {
    return 'Verified Brand Registry';
  }
  if (source === 'smart-domain-lookup') {
    return 'Smart Domain Logo Lookup';
  }
  return source;
}

export function resolveCheckoutGateways(
  storeGateways: PaymentGatewayConfig[],
  productAllowedGateways?: GatewayId[]
): PaymentGatewayConfig[] {
  if (Array.isArray(productAllowedGateways) && productAllowedGateways.length > 0) {
    const matched = storeGateways.filter((g) => productAllowedGateways.includes(g.id));
    if (matched.length > 0) return matched;
  }
  return storeGateways.filter((g) => g.enabled);
}

export function formatEnabledGatewayNames(
  gateways: PaymentGatewayConfig[],
  conjunction: 'or' | 'and' = 'or'
): string {
  const active = gateways
    .filter((g) => g.enabled)
    .map((g) => g.label.replace(/\s*\(.*\)$/, '').trim());
  if (active.length === 0) return 'WhatsApp Direct';
  if (active.length === 1) return active[0];
  if (active.length === 2) return `${active[0]} ${conjunction} ${active[1]}`;
  return `${active.slice(0, -1).join(', ')}, ${conjunction} ${active[active.length - 1]}`;
}

export function selectHeroShowcaseProducts(products: Product[], limit = 6): Product[] {
  const eligible = products.filter((p) => p.active && p.featuredInHero !== false);
  const sorted = [...eligible].sort((a, b) => {
    const heroDiff = Number(b.featuredInHero === true) - Number(a.featuredInHero === true);
    if (heroDiff !== 0) return heroDiff;
    const topDiff = Number(Boolean(b.topSelling)) - Number(Boolean(a.topSelling));
    if (topDiff !== 0) return topDiff;
    const stockDiff = Number(b.inStock) - Number(a.inStock);
    if (stockDiff !== 0) return stockDiff;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return sorted.slice(0, Math.max(0, limit));
}

export function parseStorefrontSnapshot(
  raw: string | null | undefined
): { settings: StoreSettings; products: Product[] } | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as {
      settings?: Partial<StoreSettings>;
      products?: unknown[];
    };
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.settings ||
      typeof parsed.settings.storeName !== 'string' ||
      !Array.isArray(parsed.settings.gateways) ||
      !Array.isArray(parsed.products)
    ) {
      return null;
    }
    const validProducts = parsed.products.filter(
      (item): item is Product =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as Product).id === 'string' &&
        typeof (item as Product).name === 'string' &&
        typeof (item as Product).price === 'number'
    );
    return {
      settings: parsed.settings as StoreSettings,
      products: validProducts,
    };
  } catch {
    return null;
  }
}
