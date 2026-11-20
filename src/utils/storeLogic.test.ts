import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLogoCandidateUrls,
  buildWhatsappOrderUrl,
  buildWhatsappSupportUrl,
  computeDiscountPercent,
  computeInventorySummary,
  convertPkrToUsd,
  filterAndSortProducts,
  formatAutoFetchSourceLabel,
  formatCurrency,
  formatEnabledGatewayNames,
  formatUsdAmount,
  formatUsdtAmount,
  PKR_PER_USD,
  maskApiKey,
  normalizeDomainInput,
  parseApiEndpointLines,
  parseKeyList,
  parseStorefrontSnapshot,
  resolveBrandKeyFromName,
  resolveCheckoutGateways,
  sanitizeWhatsappPhone,
  selectHeroShowcaseProducts,
  validateOrderInput,
  validateProductInput,
} from './storeLogic.ts';
import type { Order, PaymentGatewayConfig, Product, StoreSettings } from '../types.ts';

const sampleProducts: Product[] = [
  {
    id: 'p1',
    name: 'CapCut Pro',
    category: 'Video & Editing',
    planLabel: '1 Month · Private',
    price: 1150,
    originalPrice: 2400,
    offerLabel: 'Flash Offer',
    topSelling: true,
    inStock: true,
    stock: 15,
    logoKey: 'capcut',
    description: 'Full CapCut Pro unlock with AI captions and 4K export.',
    features: ['4K 60fps export', 'Auto captions'],
    active: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'p2',
    name: 'Gemini Pro',
    category: 'AI Assistants',
    planLabel: '1 Month · Google AI Premium',
    price: 1850,
    originalPrice: 5600,
    topSelling: false,
    inStock: true,
    stock: 10,
    logoKey: 'gemini',
    description: 'Gemini Advanced + 2TB Google One storage.',
    features: ['Gemini Advanced', '2TB Drive'],
    active: true,
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'p3',
    name: 'Hidden Draft Tool',
    category: 'Design & Image',
    planLabel: '1 Month',
    price: 900,
    inStock: false,
    stock: 0,
    logoKey: 'generic',
    description: 'Draft tool hidden from public storefront.',
    features: ['Draft'],
    active: false,
    createdAt: '2026-11-03T10:00:00Z',
  },
];

const validPngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

test('filterAndSortProducts prioritizes topSelling and filters by category and search', () => {
  const activeOnly = filterAndSortProducts(sampleProducts);
  assert.equal(activeOnly.length, 2);
  assert.equal(activeOnly[0].name, 'CapCut Pro');

  const searched = filterAndSortProducts(sampleProducts, { search: 'Flash Offer' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 'p1');
});

test('computeDiscountPercent calculates rounded discount from last price', () => {
  assert.equal(computeDiscountPercent(1200, 2400), 50);
  assert.equal(computeDiscountPercent(1000, 1000), 0);
  assert.equal(computeDiscountPercent(1000), 0);
});

test('resolveBrandKeyFromName matches official AI and creative tools', () => {
  assert.equal(resolveBrandKeyFromName('CapCut Pro 1 Month'), 'capcut');
  assert.equal(resolveBrandKeyFromName('Google Gemini Pro'), 'gemini');
  assert.equal(resolveBrandKeyFromName('Canva Pro Team'), 'canva');
  assert.equal(resolveBrandKeyFromName('ElevenLabs Creator'), 'elevenlabs');
  assert.equal(resolveBrandKeyFromName('Unknown Custom App'), 'generic');
});

test('formatCurrency, USD/USDT conversion at 270 PKR = $1, and sanitizeWhatsappPhone handle values cleanly', () => {
  assert.equal(PKR_PER_USD, 270);
  assert.equal(formatCurrency(1850, 'Rs.'), 'Rs. 1,850');
  assert.equal(convertPkrToUsd(300), 1.1);
  assert.equal(formatUsdAmount(300), '$1.1');
  assert.equal(formatUsdAmount(450), '$1.7');
  assert.equal(formatUsdAmount(270), '$1');
  assert.equal(formatUsdAmount(0), '$0');
  assert.equal(formatUsdtAmount(300), '1.1 USDT');
  assert.equal(formatUsdtAmount(270), '1 USDT');
  assert.equal(sanitizeWhatsappPhone('+92 323-4319689'), '923234319689');
});

test('buildWhatsappOrderUrl includes 15-minute screenshot reminder', () => {
  const url = buildWhatsappOrderUrl({
    storeWhatsapp: '+92 3234319689',
    productName: 'CapCut Pro',
    planLabel: '1 Month · Private',
    priceText: 'Rs. 1,150',
    orderCode: 'TC-1042',
    paymentMethodLabel: 'JazzCash',
  });
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.match(decoded, /CapCut Pro/);
  assert.match(decoded, /15 minutes/);
});

test('buildWhatsappSupportUrl sanitizes phone and always includes an encoded pre-filled message', () => {
  const customUrl = buildWhatsappSupportUrl(
    '+92 323-4319689',
    'Assalam-o-Alaikum Tool Craft! Mujhe CapCut Pro ki detail chahiye.'
  );
  assert.ok(customUrl.startsWith('https://wa.me/923234319689?text='));
  assert.equal(
    decodeURIComponent(customUrl.split('text=')[1]),
    'Assalam-o-Alaikum Tool Craft! Mujhe CapCut Pro ki detail chahiye.'
  );

  const fallbackUrl = buildWhatsappSupportUrl('+92 3234319689', '   ');
  assert.ok(fallbackUrl.startsWith('https://wa.me/923234319689?text='));
  const decodedFallback = decodeURIComponent(fallbackUrl.split('text=')[1]);
  assert.ok(decodedFallback.length > 10);
});

test('validateOrderInput requires uploaded payment screenshot before submit', () => {
  const jazzcash: PaymentGatewayConfig = {
    id: 'jazzcash',
    label: 'JazzCash',
    enabled: true,
    accountTitle: 'Store',
    accountNumber: '03234319689',
    instructions: 'Send payment',
  };

  assert.equal(
    validateOrderInput({
      customerName: 'Hamza Ali',
      customerWhatsapp: '923234319689',
      paymentMethod: 'jazzcash',
      screenshotDataUrl: '',
      gateway: jazzcash,
      product: sampleProducts[0],
    }).valid,
    false
  );

  assert.equal(
    validateOrderInput({
      customerName: 'Hamza Ali',
      customerWhatsapp: '923234319689',
      paymentMethod: 'jazzcash',
      screenshotDataUrl: validPngDataUrl,
      gateway: jazzcash,
      product: sampleProducts[0],
    }).valid,
    true
  );
});

test('validateProductInput rejects invalid price and accepts valid product', () => {
  assert.equal(
    validateProductInput({
      name: 'Cursor Pro',
      category: 'Productivity',
      planLabel: '1 Month',
      price: 0,
      stock: 5,
      description: 'AI code editor',
      features: [],
    }).valid,
    false
  );
  assert.equal(
    validateProductInput({
      name: 'Cursor Pro',
      category: 'Productivity',
      planLabel: '1 Month',
      price: 2500,
      originalPrice: 5000,
      stock: 5,
      description: 'AI code editor subscription',
      features: ['Fast autocomplete'],
    }).valid,
    true
  );
});

test('computeInventorySummary aggregates topSelling and revenue', () => {
  const orders: Order[] = [
    {
      id: 'o1',
      orderCode: 'TC-1001',
      productId: 'p1',
      productName: 'CapCut Pro',
      planLabel: '1 Month',
      amount: 1150,
      currencySymbol: 'Rs.',
      customerName: 'Zain',
      customerWhatsapp: '923001112233',
      paymentMethod: 'binance',
      paymentMethodLabel: 'Binance (USDT / Pay ID)',
      transactionRef: 'TX111',
      status: 'delivered',
      createdAt: '2026-11-10T10:00:00Z',
    },
  ];

  const summary = computeInventorySummary(sampleProducts, orders);
  assert.equal(summary.totalProducts, 3);
  assert.equal(summary.activeProducts, 2);
  assert.equal(summary.topSellingCount, 1);
  assert.equal(summary.totalRevenue, 1150);
});

test('parseApiEndpointLines, parseKeyList, normalizeDomainInput, and formatAutoFetchSourceLabel support multi-API failover', () => {
  const endpoints = parseApiEndpointLines(`
    # primary endpoint
    https://api-one.example.com/lookup?q={name}
    not-a-valid-url
    https://api-two.example.com/tool
    https://api-one.example.com/lookup?q={name}
  `);
  assert.deepEqual(endpoints, [
    'https://api-one.example.com/lookup?q={name}',
    'https://api-two.example.com/tool',
  ]);

  const keys = parseKeyList('keyA,\nkeyB\nMY_GEMINI_API_KEY\nkeyA');
  assert.deepEqual(keys, ['keyA', 'keyB']);

  assert.equal(maskApiKey('AIzaSyDHz0lwtJHti1PGG6tFdKkSb'), 'AIzaSy••••••KkSb');
  assert.equal(maskApiKey('shortkey'), 'sho••••ey');
  assert.equal(maskApiKey('   '), '');

  assert.equal(normalizeDomainInput('https://www.runwayml.com/studio?x=1'), 'runwayml.com');
  assert.equal(normalizeDomainInput('invalid domain'), '');

  const logos = buildLogoCandidateUrls('https://runwayml.com/studio');
  assert.equal(logos.length, 2);
  assert.match(logos[0], /runwayml\.com/);

  assert.equal(formatAutoFetchSourceLabel('custom-endpoint-2'), 'Lookup API Line #2');
  assert.equal(formatAutoFetchSourceLabel('server-ai-key-1'), 'Server Gemini Key #1');
  assert.equal(formatAutoFetchSourceLabel('verified-brand-registry'), 'Verified Brand Registry');
});

test('resolveCheckoutGateways and formatEnabledGatewayNames respect disabled JazzCash and per-tool overrides', () => {
  const gateways: PaymentGatewayConfig[] = [
    {
      id: 'jazzcash',
      label: 'JazzCash',
      enabled: false,
      accountTitle: 'Store',
      accountNumber: '',
      instructions: 'Send JazzCash',
    },
    {
      id: 'easypaisa',
      label: 'Easypaisa',
      enabled: true,
      accountTitle: 'Store',
      accountNumber: '03488657017',
      instructions: 'Send Easypaisa',
    },
    {
      id: 'binance',
      label: 'Binance (Pay ID / USDT)',
      enabled: true,
      accountTitle: 'Store Binance',
      accountNumber: '1009240724',
      instructions: 'Send Binance',
    },
  ];

  const defaultActive = resolveCheckoutGateways(gateways);
  assert.deepEqual(
    defaultActive.map((g) => g.id),
    ['easypaisa', 'binance']
  );
  assert.equal(formatEnabledGatewayNames(gateways), 'Easypaisa or Binance');

  const toolOverride = resolveCheckoutGateways(gateways, ['jazzcash', 'easypaisa']);
  assert.deepEqual(
    toolOverride.map((g) => g.id),
    ['jazzcash', 'easypaisa']
  );
});

test('selectHeroShowcaseProducts reflects deletions and featuredInHero toggles dynamically', () => {
  const catalog: Product[] = [
    ...sampleProducts,
    {
      id: 'p4',
      name: 'Runway Pro',
      category: 'Video & Editing',
      planLabel: '1 Month',
      price: 2800,
      inStock: true,
      stock: 10,
      logoKey: 'runway',
      description: 'Video AI generation tool.',
      features: ['Gen-3'],
      featuredInHero: true,
      active: true,
      createdAt: '2026-11-04T10:00:00Z',
    },
    {
      id: 'p5',
      name: 'Removed From Hero',
      category: 'Productivity',
      planLabel: '1 Month',
      price: 1500,
      inStock: true,
      stock: 10,
      logoKey: 'notion',
      description: 'Catalog only tool.',
      features: ['Docs'],
      featuredInHero: false,
      active: true,
      createdAt: '2026-11-05T10:00:00Z',
    },
  ];

  const hero = selectHeroShowcaseProducts(catalog, 6);
  // Inactive p3 and featuredInHero=false p5 are excluded; featuredInHero=true p4 is first
  assert.deepEqual(
    hero.map((p) => p.id),
    ['p4', 'p1', 'p2']
  );

  // Deleting p1 removes it from Hero immediately
  const afterDelete = selectHeroShowcaseProducts(
    catalog.filter((p) => p.id !== 'p1'),
    6
  );
  assert.deepEqual(
    afterDelete.map((p) => p.id),
    ['p4', 'p2']
  );
});

test('parseStorefrontSnapshot validates cached settings and products safely', () => {
  assert.equal(parseStorefrontSnapshot(null), null);
  assert.equal(parseStorefrontSnapshot('{bad json'), null);
  assert.equal(parseStorefrontSnapshot(JSON.stringify({ settings: {}, products: [] })), null);

  const validSettings: StoreSettings = {
    storeName: 'Haider Store',
    tagline: 'Custom tagline',
    whatsappNumber: '923001234567',
    whatsappDisplay: '+92 300 1234567',
    currencySymbol: 'Rs.',
    deliverySla: '10 min',
    gateways: [
      {
        id: 'easypaisa',
        label: 'Easypaisa',
        enabled: true,
        accountTitle: 'Haider Ali',
        accountNumber: '03001234567',
        instructions: 'Send Easypaisa',
      },
    ],
  };

  const parsed = parseStorefrontSnapshot(
    JSON.stringify({
      settings: validSettings,
      products: sampleProducts,
    })
  );
  assert.ok(parsed);
  assert.equal(parsed.settings.storeName, 'Haider Store');
  assert.equal(parsed.products.length, 3);
});
