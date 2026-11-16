import {
  BRAND_PRESETS,
  createDefaultProducts,
  createDefaultSettings,
} from './src/data/defaultStoreSeed.ts';
import { verifyFirebaseAdminBearer } from './server/firebaseAdminVerify.ts';
import {
  buildLogoCandidateUrls,
  buildWhatsappOrderUrl,
  formatCurrency,
  maskApiKey,
  normalizeDomainInput,
  parseApiEndpointLines,
  parseKeyList,
  PRODUCT_CATEGORIES,
  resolveBrandKeyFromName,
  sanitizeWhatsappPhone,
  validateOrderInput,
  validateProductInput,
} from './src/utils/storeLogic.ts';
import type {
  GatewayId,
  Order,
  OrderStatus,
  PaymentGatewayConfig,
  Product,
  ProductCategory,
  StoreSettings,
} from './src/types.ts';

interface AssetsFetcher {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

interface KvNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface Env {
  ASSETS: AssetsFetcher;
  STORE_KV?: KvNamespaceLike;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  GEMINI_API_KEY?: string;
  GEMINI_API_KEYS?: string;
  FIREBASE_WEB_API_KEY?: string;
  ADMIN_EMAIL?: string;
}

interface WorkerAdminCredentials {
  username: string;
  passwordHash?: string;
  customized?: boolean;
  updatedAt: string;
}

interface WorkerDatabase {
  admin: WorkerAdminCredentials;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
}

const SESSION_COOKIE_NAME = 'toolcraft_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const KV_KEY = 'toolcraft_store_v2';
const VALID_ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'delivered', 'cancelled'];

let runtimeFallbackSecret: string | null = null;
let memoryDb: WorkerDatabase | null = null;

function getSigningSecret(env: Env): string {
  if (env.SESSION_SECRET) {
    return env.SESSION_SECRET;
  }
  if (!runtimeFallbackSecret) {
    runtimeFallbackSecret = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  }
  return runtimeFallbackSecret;
}

function createInitialDb(env: Env): WorkerDatabase {
  const now = new Date().toISOString();
  return {
    admin: {
      username: (env.ADMIN_USERNAME || 'admin').trim() || 'admin',
      customized: false,
      updatedAt: now,
    },
    settings: createDefaultSettings(),
    products: createDefaultProducts(now),
    orders: [],
  };
}

async function loadDb(env: Env): Promise<WorkerDatabase> {
  if (env.STORE_KV) {
    try {
      const raw = await env.STORE_KV.get(KV_KEY);
      if (raw) {
        return JSON.parse(raw) as WorkerDatabase;
      }
      const initial = createInitialDb(env);
      await env.STORE_KV.put(KV_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      // Fallback to isolate memory if KV read fails
    }
  }
  if (!memoryDb) {
    memoryDb = createInitialDb(env);
  }
  return memoryDb;
}

async function saveDb(env: Env, db: WorkerDatabase): Promise<void> {
  memoryDb = db;
  if (env.STORE_KV) {
    try {
      await env.STORE_KV.put(KV_KEY, JSON.stringify(db));
    } catch {
      // Ignore KV write error and keep isolate memory updated
    }
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signSessionToken(username: string, env: Env): Promise<string> {
  const payload = { username, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey(getSigningSecret(env));
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(sigBuf))}`;
}

async function verifySessionToken(
  token: string | undefined,
  env: Env
): Promise<{ username: string; exp: number } | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getHmacKey(getSigningSecret(env));
    const sigBytes = fromBase64Url(sigB64);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(payloadB64)
    );
    if (!ok) return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as {
      username?: string;
      exp?: number;
    };
    if (!parsed.username || typeof parsed.exp !== 'number') return null;
    if (Date.now() > parsed.exp) return null;
    return { username: parsed.username, exp: parsed.exp };
  } catch {
    return null;
  }
}

async function hashPasswordWeb(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `${toBase64Url(salt)}:${toBase64Url(new Uint8Array(derived))}`;
}

async function verifyPasswordWeb(password: string, storedHash?: string): Promise<boolean> {
  if (!storedHash) return false;
  const [saltStr, hashStr] = storedHash.split(':');
  if (!saltStr || !hashStr) return false;
  try {
    const salt = fromBase64Url(saltStr);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const expected = fromBase64Url(hashStr);
    const actual = new Uint8Array(derived);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i += 1) {
      diff |= actual[i] ^ expected[i];
    }
    return diff === 0;
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

async function getSessionFromRequest(
  request: Request,
  env: Env
): Promise<{ username: string; exp: number } | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = await verifySessionToken(authHeader.slice(7).trim(), env);
    if (bearer) return bearer;
  }
  const cookies = parseCookies(request.headers.get('cookie'));
  return verifySessionToken(cookies[SESSION_COOKIE_NAME], env);
}

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...extraHeaders,
    },
  });
}

function buildCookieHeader(token: string, request: Request): string {
  const url = new URL(request.url);
  const isHttps = url.protocol === 'https:';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

function buildClearCookieHeader(request: Request): string {
  const url = new URL(request.url);
  const isHttps = url.protocol === 'https:';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

function generateOrderCode(existingOrders: Order[]): string {
  const used = new Set(existingOrders.map((o) => o.orderCode));
  let num = 1042 + existingOrders.length;
  while (used.has(`TC-${num}`)) {
    num += 1;
  }
  return `TC-${num}`;
}

function getServerGeminiKeys(env: Env): string[] {
  return [...parseKeyList(env.GEMINI_API_KEYS), ...parseKeyList(env.GEMINI_API_KEY)].filter(
    (key, idx, arr) => arr.indexOf(key) === idx
  );
}

async function pickFirstReachableLogoUrl(domain: string): Promise<string> {
  const candidates = buildLogoCandidateUrls(domain);
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { method: 'GET' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && (contentType.startsWith('image/') || candidate.endsWith('.ico'))) {
        return candidate;
      }
    } catch {
      // Try next candidate
    }
  }
  return candidates[0] || '';
}

async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (!pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    if (pathname === '/api/health' && request.method === 'GET') {
      return jsonResponse({ ok: true, timestamp: new Date().toISOString() });
    }

    if (pathname === '/api/storefront' && request.method === 'GET') {
      const db = await loadDb(env);
      return jsonResponse({
        settings: db.settings,
        products: db.products.filter((p) => p.active),
      });
    }

    if (pathname === '/api/orders' && request.method === 'POST') {
      const body = await readJsonBody<{
        productId?: string;
        customerName?: string;
        customerWhatsapp?: string;
        customerEmail?: string;
        paymentMethod?: GatewayId;
        transactionRef?: string;
        screenshotDataUrl?: string;
      }>(request);
      if (!body) return jsonResponse({ error: 'Invalid JSON request body.' }, 400);

      const db = await loadDb(env);
      const product = db.products.find((p) => p.id === body.productId);
      if (!product) return jsonResponse({ error: 'Selected tool was not found.' }, 404);

      const gateway = db.settings.gateways.find((g) => g.id === body.paymentMethod);
      if (!gateway) return jsonResponse({ error: 'Please choose an active payment method.' }, 400);

      const effectiveGateway =
        Array.isArray(product.allowedGateways) && product.allowedGateways.includes(gateway.id)
          ? { ...gateway, enabled: true }
          : gateway;

      const screenshotDataUrl = String(body.screenshotDataUrl || '').trim();
      if (screenshotDataUrl.length > 5 * 1024 * 1024) {
        return jsonResponse({ error: 'Payment screenshot image must be smaller than 4MB.' }, 400);
      }

      const validation = validateOrderInput({
        customerName: String(body.customerName || ''),
        customerWhatsapp: String(body.customerWhatsapp || ''),
        paymentMethod: gateway.id,
        transactionRef: String(body.transactionRef || ''),
        screenshotDataUrl,
        gateway: effectiveGateway,
        product,
      });

      if (!validation.valid) {
        return jsonResponse({ error: validation.error }, 400);
      }

      const cleanWhatsapp = sanitizeWhatsappPhone(String(body.customerWhatsapp || ''));
      const txRef = String(body.transactionRef || '').trim() || 'Screenshot Attached';
      const orderCode = generateOrderCode(db.orders);
      const newOrder: Order = {
        id: crypto.randomUUID(),
        orderCode,
        productId: product.id,
        productName: product.name,
        planLabel: product.planLabel,
        amount: product.price,
        currencySymbol: db.settings.currencySymbol,
        customerName: String(body.customerName || '').trim(),
        customerWhatsapp: cleanWhatsapp,
        customerEmail: body.customerEmail ? String(body.customerEmail).trim() : undefined,
        paymentMethod: gateway.id,
        paymentMethodLabel: gateway.label,
        transactionRef: txRef,
        screenshotDataUrl,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      db.orders.unshift(newOrder);
      await saveDb(env, db);

      const priceText = formatCurrency(newOrder.amount, db.settings.currencySymbol);
      const whatsappUrl = buildWhatsappOrderUrl({
        storeWhatsapp: db.settings.whatsappNumber,
        productName: newOrder.productName,
        planLabel: newOrder.planLabel,
        priceText,
        orderCode: newOrder.orderCode,
        paymentMethodLabel: newOrder.paymentMethodLabel,
        transactionRef: newOrder.transactionRef,
        customerName: newOrder.customerName,
      });

      return jsonResponse({ order: newOrder, whatsappUrl }, 201);
    }

    if (pathname === '/api/orders/lookup' && request.method === 'GET') {
      const code = String(url.searchParams.get('code') || '').trim().toUpperCase();
      if (!code || code.length < 4) {
        return jsonResponse({ error: 'Enter your Order Code (e.g. TC-1042).' }, 400);
      }
      const db = await loadDb(env);
      const order = db.orders.find((o) => o.orderCode.toUpperCase() === code);
      if (!order) {
        return jsonResponse({ error: `No order found with code ${code}.` }, 404);
      }
      return jsonResponse({
        orderCode: order.orderCode,
        productName: order.productName,
        planLabel: order.planLabel,
        amount: order.amount,
        currencySymbol: order.currencySymbol,
        paymentMethodLabel: order.paymentMethodLabel,
        status: order.status,
        createdAt: order.createdAt,
      });
    }

    if (pathname === '/api/admin/session' && request.method === 'GET') {
      const session = await getSessionFromRequest(request, env);
      if (!session) return jsonResponse({ authenticated: false });
      return jsonResponse({ authenticated: true, username: session.username });
    }

    if (pathname === '/api/admin/login' && request.method === 'POST') {
      const body = await readJsonBody<{ username?: string; password?: string }>(request);
      if (!body) return jsonResponse({ error: 'Invalid login payload.' }, 400);

      const db = await loadDb(env);
      const cleanUser = String(body.username || '').trim();
      const cleanPass = String(body.password || '');

      let matched = false;
      if (db.admin.customized) {
        matched =
          cleanUser === db.admin.username &&
          (await verifyPasswordWeb(cleanPass, db.admin.passwordHash));
      } else {
        const envUser = (env.ADMIN_USERNAME || '').trim();
        const envPass = env.ADMIN_PASSWORD || '';
        const validDefaultUser =
          cleanUser.toLowerCase() === 'admin' ||
          cleanUser.toLowerCase() === db.admin.username.toLowerCase() ||
          (Boolean(envUser) && cleanUser.toLowerCase() === envUser.toLowerCase());
        const expectedPass = envPass || 'ToolCraft@2026';
        matched = validDefaultUser && cleanPass === expectedPass;
      }

      if (!matched) {
        return jsonResponse({ error: 'Invalid username or password.' }, 401);
      }

      const activeUsername = cleanUser || db.admin.username;
      const token = await signSessionToken(activeUsername, env);
      return jsonResponse(
        { authenticated: true, username: activeUsername, token },
        200,
        { 'Set-Cookie': buildCookieHeader(token, request) }
      );
    }

    if (pathname === '/api/admin/logout' && request.method === 'POST') {
      return jsonResponse({ ok: true }, 200, { 'Set-Cookie': buildClearCookieHeader(request) });
    }

    // All remaining /api/admin/* endpoints require authentication
    const session = await getSessionFromRequest(request, env);
    const firebaseAllowedRoute =
      pathname === '/api/admin/ai-status' || pathname === '/api/admin/auto-tool-info';
    const firebaseAdminEmail =
      !session && firebaseAllowedRoute
        ? await verifyFirebaseAdminBearer(
            request.headers.get('authorization'),
            env.FIREBASE_WEB_API_KEY,
            env.ADMIN_EMAIL
          )
        : null;

    if (!session && !firebaseAdminEmail) {
      return jsonResponse({ error: 'Admin authentication required.' }, 401);
    }

    if (pathname === '/api/admin/ai-status' && request.method === 'GET') {
      const keys = getServerGeminiKeys(env);
      return jsonResponse({
        serverGeminiKeyCount: keys.length,
        maskedKeys: keys.map(maskApiKey),
        brandPresetCount: Object.keys(BRAND_PRESETS).length,
      });
    }

    if (pathname === '/api/admin/dashboard' && request.method === 'GET') {
      const db = await loadDb(env);
      const keys = getServerGeminiKeys(env);
      return jsonResponse({
        username: db.admin.username,
        settings: db.settings,
        products: db.products,
        orders: db.orders,
        aiStatus: {
          serverGeminiKeyCount: keys.length,
          maskedKeys: keys.map(maskApiKey),
          brandPresetCount: Object.keys(BRAND_PRESETS).length,
        },
      });
    }

    if (pathname === '/api/admin/auto-tool-info' && request.method === 'POST') {
      const body =
        (await readJsonBody<{
          name?: string;
          domain?: string;
          endpoints?: string[] | string;
        }>(request)) || {};
      const rawName = String(body.name || '').trim();
      const explicitDomain = normalizeDomainInput(String(body.domain || ''));
      if (rawName.length < 2) {
        return jsonResponse(
          { error: 'Enter a tool name first (e.g. Video Pro Suite, AI Studio).' },
          400
        );
      }

      const db = await loadDb(env);
      let customEndpoints: string[] = Array.isArray(db.settings.autoFetchEndpoints)
        ? db.settings.autoFetchEndpoints
        : [];
      if (body.endpoints !== undefined) {
        customEndpoints = Array.isArray(body.endpoints)
          ? parseApiEndpointLines(body.endpoints.join('\n'))
          : parseApiEndpointLines(String(body.endpoints || ''));
      }

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

          const domain = normalizeDomainInput(String(data.officialDomain || data.domain || ''));
          const logoUrl = data.logoUrl?.trim() || (domain ? await pickFirstReachableLogoUrl(domain) : '');
          const matchedCat = PRODUCT_CATEGORIES.includes(data.category as ProductCategory)
            ? (data.category as ProductCategory)
            : 'Productivity';

          return jsonResponse({
            logoKey: data.logoKey || resolveBrandKeyFromName(rawName),
            logoUrl,
            category: matchedCat,
            planLabel: data.planLabel || '1 Month · Pro Access',
            description:
              data.description ||
              `Verified ${rawName} subscription with instant WhatsApp activation.`,
            features:
              Array.isArray(data.features) && data.features.length > 0
                ? data.features.slice(0, 3)
                : ['Instant WhatsApp delivery', 'Full term warranty', 'Verified pro access'],
            source: `custom-endpoint-${i + 1}`,
          });
        } catch {
          // Try next endpoint
        }
      }

      const logoKey = resolveBrandKeyFromName(rawName);
      const preset = BRAND_PRESETS[logoKey];
      if (preset) {
        const explicitLogoUrl = explicitDomain ? await pickFirstReachableLogoUrl(explicitDomain) : '';
        return jsonResponse({
          logoKey,
          logoUrl: explicitLogoUrl,
          category: preset.category,
          planLabel: preset.planLabel,
          description: preset.description,
          features: preset.features,
          source: 'verified-brand-registry',
        });
      }

      const geminiKeys = getServerGeminiKeys(env);
      for (let i = 0; i < geminiKeys.length; i += 1) {
        const apiKey = geminiKeys[i];
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
              apiKey
            )}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'aistudio-build',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Provide concise storefront product details for the digital subscription tool named "${rawName}". Choose the closest category from: ${PRODUCT_CATEGORIES.join(
                          ', '
                        )}. Include the official website domain (e.g. runwayml.com) so we can fetch its logo.`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: 'OBJECT',
                    properties: {
                      category: { type: 'STRING' },
                      planLabel: { type: 'STRING' },
                      description: { type: 'STRING' },
                      features: { type: 'ARRAY', items: { type: 'STRING' } },
                      officialDomain: { type: 'STRING' },
                    },
                    required: ['category', 'planLabel', 'description', 'features', 'officialDomain'],
                  },
                },
              }),
            }
          );
          if (!geminiRes.ok) continue;
          const payload = (await geminiRes.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(rawText) as {
            category?: string;
            planLabel?: string;
            description?: string;
            features?: string[];
            officialDomain?: string;
          };
          const matchedCat = PRODUCT_CATEGORIES.includes(parsed.category as ProductCategory)
            ? (parsed.category as ProductCategory)
            : 'Productivity';
          const domain = explicitDomain || normalizeDomainInput(parsed.officialDomain || '');
          const resolvedLogoUrl = domain ? await pickFirstReachableLogoUrl(domain) : '';

          return jsonResponse({
            logoKey: 'generic',
            logoUrl: resolvedLogoUrl,
            category: matchedCat,
            planLabel: parsed.planLabel || '1 Month · Pro Access',
            description:
              parsed.description ||
              `Verified ${rawName} pro subscription with instant WhatsApp activation.`,
            features:
              Array.isArray(parsed.features) && parsed.features.length > 0
                ? parsed.features.slice(0, 3)
                : ['Instant WhatsApp delivery', 'Full term warranty', 'Verified pro access'],
            source: `server-ai-key-${i + 1}`,
          });
        } catch {
          // Try next Gemini key
        }
      }

      const guessedSlug = rawName
        .toLowerCase()
        .replace(/\b(pro|plus|ai|premium|team|seat|1\s*month|1\s*year)\b/g, '')
        .replace(/[^a-z0-9]/g, '');
      const guessedDomain = explicitDomain || (guessedSlug ? `${guessedSlug}.com` : '');
      const fallbackLogoUrl = guessedDomain ? await pickFirstReachableLogoUrl(guessedDomain) : '';

      return jsonResponse({
        logoKey: 'generic',
        logoUrl: fallbackLogoUrl,
        category: 'Productivity' as ProductCategory,
        planLabel: '1 Month · Pro Access',
        description: `Verified ${rawName} subscription with instant WhatsApp delivery and full-term warranty.`,
        features: [
          'Instant WhatsApp activation',
          'Full subscription warranty',
          'Dedicated support desk',
        ],
        source: 'smart-domain-lookup',
      });
    }

    if (pathname === '/api/admin/products' && request.method === 'POST') {
      const body =
        (await readJsonBody<{
          name?: string;
          category?: ProductCategory;
          planLabel?: string;
          price?: number;
          originalPrice?: number;
          offerLabel?: string;
          topSelling?: boolean;
          inStock?: boolean;
          stock?: number;
          logoKey?: string;
          logoUrl?: string;
          description?: string;
          features?: string[];
          allowedGateways?: GatewayId[];
          featuredInHero?: boolean;
          active?: boolean;
        }>(request)) || {};

      const parsedPrice = Number(body.price);
      const parsedOriginal =
        body.originalPrice !== undefined &&
        body.originalPrice !== null &&
        String(body.originalPrice) !== ''
          ? Number(body.originalPrice)
          : undefined;
      const parsedStock =
        body.stock !== undefined && String(body.stock) !== ''
          ? Math.floor(Number(body.stock))
          : 25;
      const features = Array.isArray(body.features)
        ? body.features.map((f) => String(f).trim()).filter(Boolean)
        : [];
      const allowedGateways = Array.isArray(body.allowedGateways)
        ? body.allowedGateways.filter(
            (g): g is GatewayId => g === 'jazzcash' || g === 'easypaisa' || g === 'binance'
          )
        : undefined;

      const validation = validateProductInput({
        name: String(body.name || ''),
        category: body.category as ProductCategory,
        planLabel: String(body.planLabel || ''),
        price: parsedPrice,
        originalPrice: parsedOriginal,
        stock: parsedStock,
        description: String(body.description || ''),
        features,
      });
      if (!validation.valid) return jsonResponse({ error: validation.error }, 400);

      const db = await loadDb(env);
      const cleanName = String(body.name || '').trim();
      const logoKey = (body.logoKey || '').trim() || resolveBrandKeyFromName(cleanName);
      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 32);

      const newProduct: Product = {
        id: `${slug || 'tool'}-${crypto.randomUUID().slice(0, 6)}`,
        name: cleanName,
        category: body.category as ProductCategory,
        planLabel: String(body.planLabel || '').trim(),
        price: parsedPrice,
        originalPrice: parsedOriginal,
        offerLabel: body.offerLabel ? String(body.offerLabel).trim() : undefined,
        topSelling: Boolean(body.topSelling),
        inStock: body.inStock !== undefined ? Boolean(body.inStock) : parsedStock > 0,
        stock: parsedStock,
        logoKey,
        logoUrl: body.logoUrl ? String(body.logoUrl).trim() : undefined,
        description: String(body.description || '').trim(),
        features,
        allowedGateways:
          allowedGateways && allowedGateways.length > 0 ? allowedGateways : undefined,
        featuredInHero: body.featuredInHero !== undefined ? Boolean(body.featuredInHero) : true,
        active: body.active !== undefined ? Boolean(body.active) : true,
        createdAt: new Date().toISOString(),
      };

      db.products.unshift(newProduct);
      await saveDb(env, db);
      return jsonResponse({ product: newProduct }, 201);
    }

    if (pathname.startsWith('/api/admin/products/')) {
      const productId = pathname.slice('/api/admin/products/'.length);
      const db = await loadDb(env);

      if (request.method === 'PATCH') {
        const idx = db.products.findIndex((p) => p.id === productId);
        if (idx === -1) return jsonResponse({ error: 'Product not found.' }, 404);
        const current = db.products[idx];
        const body = (await readJsonBody<Partial<Product>>(request)) || {};
        const nextName = body.name !== undefined ? String(body.name).trim() : current.name;

        const next: Product = {
          ...current,
          name: nextName,
          category: body.category !== undefined ? body.category : current.category,
          planLabel:
            body.planLabel !== undefined ? String(body.planLabel).trim() : current.planLabel,
          price: body.price !== undefined ? Number(body.price) : current.price,
          originalPrice:
            body.originalPrice !== undefined
              ? body.originalPrice === null || String(body.originalPrice) === ''
                ? undefined
                : Number(body.originalPrice)
              : current.originalPrice,
          offerLabel:
            body.offerLabel !== undefined
              ? String(body.offerLabel || '').trim() || undefined
              : current.offerLabel,
          topSelling: body.topSelling !== undefined ? Boolean(body.topSelling) : current.topSelling,
          inStock: body.inStock !== undefined ? Boolean(body.inStock) : current.inStock,
          stock:
            body.stock !== undefined
              ? Math.max(0, Math.floor(Number(body.stock)))
              : current.stock,
          logoKey:
            body.logoKey !== undefined
              ? String(body.logoKey).trim() || resolveBrandKeyFromName(nextName)
              : current.logoKey,
          logoUrl:
            body.logoUrl !== undefined
              ? String(body.logoUrl || '').trim() || undefined
              : current.logoUrl,
          description:
            body.description !== undefined
              ? String(body.description).trim()
              : current.description,
          features: Array.isArray(body.features)
            ? body.features.map((f) => String(f).trim()).filter(Boolean)
            : current.features,
          allowedGateways:
            body.allowedGateways !== undefined
              ? Array.isArray(body.allowedGateways) && body.allowedGateways.length > 0
                ? body.allowedGateways.filter(
                    (g): g is GatewayId =>
                      g === 'jazzcash' || g === 'easypaisa' || g === 'binance'
                  )
                : undefined
              : current.allowedGateways,
          featuredInHero:
            body.featuredInHero !== undefined
              ? Boolean(body.featuredInHero)
              : current.featuredInHero,
          active: body.active !== undefined ? Boolean(body.active) : current.active,
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
        if (!validation.valid) return jsonResponse({ error: validation.error }, 400);

        db.products[idx] = next;
        await saveDb(env, db);
        return jsonResponse({ product: next });
      }

      if (request.method === 'DELETE') {
        const nextProducts = db.products.filter((p) => p.id !== productId);
        if (nextProducts.length === db.products.length) {
          return jsonResponse({ error: 'Product not found.' }, 404);
        }
        db.products = nextProducts;
        await saveDb(env, db);
        return jsonResponse({ ok: true });
      }
    }

    if (pathname.startsWith('/api/admin/orders/')) {
      const orderId = pathname.slice('/api/admin/orders/'.length);
      const db = await loadDb(env);

      if (request.method === 'PATCH') {
        const order = db.orders.find((o) => o.id === orderId);
        if (!order) return jsonResponse({ error: 'Order not found.' }, 404);
        const body =
          (await readJsonBody<{ status?: OrderStatus; notes?: string }>(request)) || {};
        if (body.status !== undefined) {
          if (!VALID_ORDER_STATUSES.includes(body.status)) {
            return jsonResponse({ error: 'Invalid order status.' }, 400);
          }
          order.status = body.status;
        }
        if (body.notes !== undefined) order.notes = String(body.notes).trim();
        await saveDb(env, db);
        return jsonResponse({ order });
      }

      if (request.method === 'DELETE') {
        const nextOrders = db.orders.filter((o) => o.id !== orderId);
        if (nextOrders.length === db.orders.length) {
          return jsonResponse({ error: 'Order not found.' }, 404);
        }
        db.orders = nextOrders;
        await saveDb(env, db);
        return jsonResponse({ ok: true });
      }
    }

    if (pathname === '/api/admin/settings' && request.method === 'PATCH') {
      const db = await loadDb(env);
      const body =
        (await readJsonBody<
          Partial<{
            storeName: string;
            tagline: string;
            whatsappNumber: string;
            whatsappDisplay: string;
            supportHours: string;
            currencySymbol: string;
            deliverySla: string;
            autoFetchEndpoints: string[] | string;
            gateways: PaymentGatewayConfig[];
          }>
        >(request)) || {};

      if (body.whatsappNumber !== undefined) {
        const clean = sanitizeWhatsappPhone(String(body.whatsappNumber));
        if (clean.length < 10) {
          return jsonResponse(
            { error: 'WhatsApp number must have at least 10 digits with country code.' },
            400
          );
        }
        db.settings.whatsappNumber = clean;
      }
      if (body.whatsappDisplay !== undefined) {
        db.settings.whatsappDisplay =
          String(body.whatsappDisplay).trim() || `+${db.settings.whatsappNumber}`;
      }
      if (body.supportHours !== undefined) {
        db.settings.supportHours = String(body.supportHours).trim() || 'Support 24/7';
      }
      if (body.storeName !== undefined && body.storeName.trim()) {
        db.settings.storeName = body.storeName.trim();
      }
      if (body.tagline !== undefined) db.settings.tagline = body.tagline.trim();
      if (body.currencySymbol !== undefined && body.currencySymbol.trim()) {
        db.settings.currencySymbol = body.currencySymbol.trim().slice(0, 6);
      }
      if (body.deliverySla !== undefined) db.settings.deliverySla = body.deliverySla.trim();
      if (body.autoFetchEndpoints !== undefined) {
        if (Array.isArray(body.autoFetchEndpoints)) {
          db.settings.autoFetchEndpoints = parseApiEndpointLines(
            body.autoFetchEndpoints.join('\n')
          );
        } else if (typeof body.autoFetchEndpoints === 'string') {
          db.settings.autoFetchEndpoints = parseApiEndpointLines(body.autoFetchEndpoints);
        }
      }
      if (Array.isArray(body.gateways)) {
        db.settings.gateways = db.settings.gateways.map((existing) => {
          const updated = body.gateways?.find((g) => g.id === existing.id);
          if (!updated) return existing;
          return {
            ...existing,
            enabled: Boolean(updated.enabled),
            label: String(updated.label || existing.label).trim(),
            accountTitle: String(updated.accountTitle || '').trim(),
            accountNumber: String(updated.accountNumber || '').trim(),
            instructions: String(updated.instructions || '').trim(),
          };
        });
      }

      await saveDb(env, db);
      return jsonResponse({ settings: db.settings });
    }

    if (pathname === '/api/admin/change-password' && request.method === 'POST') {
      const body =
        (await readJsonBody<{
          currentPassword?: string;
          newUsername?: string;
          newPassword?: string;
        }>(request)) || {};
      const db = await loadDb(env);
      const curPass = String(body.currentPassword || '');
      const envPass = env.ADMIN_PASSWORD || '';
      const curValid = db.admin.customized
        ? await verifyPasswordWeb(curPass, db.admin.passwordHash)
        : curPass === 'ToolCraft@2026' || (Boolean(envPass) && curPass === envPass);

      if (!curValid) return jsonResponse({ error: 'Current password is incorrect.' }, 401);
      const cleanNewPass = String(body.newPassword || '');
      if (cleanNewPass.length < 8) {
        return jsonResponse({ error: 'New password must be at least 8 characters.' }, 400);
      }
      const cleanUser = String(body.newUsername || db.admin.username).trim();
      if (cleanUser.length < 3) {
        return jsonResponse({ error: 'Username must be at least 3 characters.' }, 400);
      }

      db.admin.username = cleanUser;
      db.admin.passwordHash = await hashPasswordWeb(cleanNewPass);
      db.admin.customized = true;
      db.admin.updatedAt = new Date().toISOString();
      await saveDb(env, db);

      const token = await signSessionToken(db.admin.username, env);
      return jsonResponse(
        { ok: true, username: db.admin.username, token },
        200,
        { 'Set-Cookie': buildCookieHeader(token, request) }
      );
    }

    return jsonResponse({ error: 'API route not found.' }, 404);
  },
};
