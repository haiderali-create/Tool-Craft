import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import {
  checkLoginRateLimit,
  clearSessionCookie,
  getSessionFromRequest,
  hashPassword,
  requireAdmin,
  resetLoginRateLimit,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
} from './server/auth.ts';
import { generateOrderCode, readDb, writeDb } from './server/storeDb.ts';
import {
  buildLogoCandidateUrls,
  buildWhatsappOrderUrl,
  formatCurrency,
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
} from './src/types.ts';

const PORT = Number(process.env.PORT) || 3000;
const VALID_ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'delivered', 'cancelled'];

const BRAND_PRESETS: Record<
  string,
  {
    category: ProductCategory;
    planLabel: string;
    description: string;
    features: string[];
    domain: string;
  }
> = {
  capcut: {
    category: 'Video & Editing',
    planLabel: '1 Month · Private Access',
    description:
      'Full CapCut Pro unlock with AI auto-captions, 4K 60fps export, background removal, and commercial effects.',
    features: [
      'Works on PC, Mac, iOS & Android',
      'No watermark + 4K Ultra HD exports',
      'AI auto-captions & smart cutout tools',
    ],
    domain: 'capcut.com',
  },
  gemini: {
    category: 'AI Assistants',
    planLabel: '1 Month · Personal Gmail Upgrade',
    description:
      'Upgrade your own Google account with Gemini Advanced models, 2TB Google One cloud storage, and Workspace AI.',
    features: [
      'Activated on your personal Gmail',
      'Includes 2TB Google Drive & Photos storage',
      'Deep Research & priority model access',
    ],
    domain: 'gemini.google.com',
  },
  canva: {
    category: 'Design & Image',
    planLabel: '1 Year · Private Email Invite',
    description:
      'Design social posts, decks, and brand kits with Magic Studio AI, background remover, and 100M+ Pro assets.',
    features: [
      'Invite directly to your own email',
      '100M+ stock photos, fonts & templates',
      'Magic Resize & 1-click background remover',
    ],
    domain: 'canva.com',
  },
  elevenlabs: {
    category: 'Audio & Voice',
    planLabel: '1 Month · 100k Credits',
    description:
      'Studio-grade AI voiceovers, instant voice cloning, and multilingual dubbing for YouTube & reels.',
    features: [
      '100,000 monthly character credits',
      'Professional voice cloning included',
      'Commercial usage rights',
    ],
    domain: 'elevenlabs.io',
  },
  midjourney: {
    category: 'Design & Image',
    planLabel: '1 Month · Fast GPU Hours',
    description:
      'Photorealistic concept art, product mockups, and brand illustrations with fast generation priority.',
    features: [
      'Fast GPU mode & Relax mode',
      'Web studio + Discord workflow',
      'Commercial license included',
    ],
    domain: 'midjourney.com',
  },
  perplexity: {
    category: 'Productivity',
    planLabel: '1 Year · Private Voucher',
    description:
      'Citation-backed AI research engine with switchable frontier models, Pro Search, and unlimited file uploads.',
    features: [
      'Switch between top reasoning models',
      'Live web citations & academic search',
      '12-month uninterrupted access',
    ],
    domain: 'perplexity.ai',
  },
  adobe: {
    category: 'Video & Editing',
    planLabel: '1 Month · Genuine Email Seat',
    description:
      'Premiere Pro, After Effects, Photoshop, and Firefly generative AI credits activated on your email.',
    features: [
      'Official Creative Cloud desktop app',
      '100GB cloud storage + Firefly AI',
      'Supports Windows & macOS',
    ],
    domain: 'adobe.com',
  },
  cursor: {
    category: 'Productivity',
    planLabel: '1 Month · Pro Subscription',
    description:
      'AI-powered code editor with fast multi-file edits, smart tab autocomplete, and frontier coding models.',
    features: [
      'Fast premium model requests included',
      'Multi-file codebase composer',
      'Works on Windows, macOS & Linux',
    ],
    domain: 'cursor.com',
  },
  runway: {
    category: 'Video & Editing',
    planLabel: '1 Month · Pro Credits',
    description:
      'Generate cinematic AI videos from text or images with Gen-3 Alpha, motion brush, and studio upscaling.',
    features: [
      'Gen-3 Alpha video generation',
      'Camera control & motion brush',
      'Watermark-free HD exports',
    ],
    domain: 'runwayml.com',
  },
  suno: {
    category: 'Audio & Voice',
    planLabel: '1 Month · Pro Plan',
    description:
      'Create full studio-quality AI songs, vocals, and instrumentals with commercial ownership rights.',
    features: [
      '2,500 monthly song generation credits',
      'Commercial rights for YouTube & social',
      'Custom lyrics & vocal styles',
    ],
    domain: 'suno.com',
  },
  notion: {
    category: 'Productivity',
    planLabel: '1 Year · Plus + AI',
    description:
      'All-in-one workspace for docs, databases, and Notion AI writing and summary automation.',
    features: [
      'Unlimited blocks & file uploads',
      'Notion AI Q&A and autofill',
      'Private workspace upgrade',
    ],
    domain: 'notion.so',
  },
  figma: {
    category: 'Design & Image',
    planLabel: '1 Year · Professional Seat',
    description:
      'Collaborative UI/UX design, prototyping, dev mode, and shared team component libraries.',
    features: [
      'Unlimited Figma files & projects',
      'Dev Mode & variable libraries',
      'Activated on your email',
    ],
    domain: 'figma.com',
  },
  grammarly: {
    category: 'Productivity',
    planLabel: '1 Year · Premium Access',
    description:
      'Advanced grammar, tone rewriting, plagiarism detection, and AI writing assistance across apps.',
    features: [
      'Works in Chrome, Docs & Word',
      'Full tone & clarity rewrite',
      'Plagiarism checker included',
    ],
    domain: 'grammarly.com',
  },
  claude: {
    category: 'AI Assistants',
    planLabel: '1 Month · Pro Access',
    description:
      'High-context reasoning, coding, and writing assistant with Artifacts and priority access.',
    features: [
      'Priority access & higher usage limits',
      'Projects & interactive Artifacts',
      'Full month warranty',
    ],
    domain: 'claude.ai',
  },
  spotify: {
    category: 'Audio & Voice',
    planLabel: '1 Year · Individual Premium',
    description:
      'Ad-free high-bitrate music streaming, offline downloads, and unlimited skips on your own account.',
    features: [
      'Activated on your own account',
      'Offline downloads & lossless clarity',
      'Zero ads across all devices',
    ],
    domain: 'spotify.com',
  },
  youtube: {
    category: 'Video & Editing',
    planLabel: '1 Year · Premium Family Invite',
    description:
      'Ad-free YouTube, background playback, offline downloads, and YouTube Music Premium included.',
    features: [
      'Works on your existing Gmail',
      'Includes YouTube Music Premium',
      'TV, mobile & desktop support',
    ],
    domain: 'youtube.com',
  },
  netflix: {
    category: 'Video & Editing',
    planLabel: '1 Month · 4K UHD Private Screen',
    description:
      'Dedicated PIN-locked 4K Ultra HD streaming screen with smooth multi-device support.',
    features: [
      '4K Ultra HD + HDR quality',
      'Private PIN-protected profile',
      'Full 30-day warranty',
    ],
    domain: 'netflix.com',
  },
};

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  // Allow up to 6mb JSON payload for customer payment screenshot uploads
  app.use(express.json({ limit: '6mb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Public storefront
  app.get('/api/storefront', (_req, res) => {
    const db = readDb();
    const activeProducts = db.products.filter((p) => p.active);
    res.json({
      settings: db.settings,
      products: activeProducts,
    });
  });

  // Public order creation (Requires Payment Screenshot + Customer Details)
  app.post('/api/orders', (req, res) => {
    const body = req.body as {
      productId?: string;
      customerName?: string;
      customerWhatsapp?: string;
      customerEmail?: string;
      paymentMethod?: GatewayId;
      transactionRef?: string;
      screenshotDataUrl?: string;
    };

    const db = readDb();
    const product = db.products.find((p) => p.id === body.productId);
    if (!product) {
      res.status(404).json({ error: 'Selected tool was not found.' });
      return;
    }

    const gateway = db.settings.gateways.find((g) => g.id === body.paymentMethod);
    if (!gateway) {
      res.status(400).json({ error: 'Please choose an active payment method.' });
      return;
    }

    const effectiveGateway =
      Array.isArray(product.allowedGateways) && product.allowedGateways.includes(gateway.id)
        ? { ...gateway, enabled: true }
        : gateway;

    const screenshotDataUrl = String(body.screenshotDataUrl || '').trim();
    if (screenshotDataUrl.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Payment screenshot image must be smaller than 4MB.' });
      return;
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
      res.status(400).json({ error: validation.error });
      return;
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
    writeDb(db);

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

    res.status(201).json({
      order: newOrder,
      whatsappUrl,
    });
  });

  // Public single-order lookup
  app.get('/api/orders/lookup', (req, res) => {
    const code = String(req.query.code || '').trim().toUpperCase();
    if (!code || code.length < 4) {
      res.status(400).json({ error: 'Enter your Order Code (e.g. TC-1042).' });
      return;
    }
    const db = readDb();
    const order = db.orders.find((o) => o.orderCode.toUpperCase() === code);
    if (!order) {
      res.status(404).json({ error: `No order found with code ${code}.` });
      return;
    }
    res.json({
      orderCode: order.orderCode,
      productName: order.productName,
      planLabel: order.planLabel,
      amount: order.amount,
      currencySymbol: order.currencySymbol,
      paymentMethodLabel: order.paymentMethodLabel,
      status: order.status,
      createdAt: order.createdAt,
    });
  });

  // Admin session
  app.get('/api/admin/session', (req, res) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, username: session.username });
  });

  app.post('/api/admin/login', (req, res) => {
    const ip = req.ip || 'unknown';
    const limit = checkLoginRateLimit(ip);
    if (!limit.allowed) {
      res.status(429).json({
        error: `Too many login attempts. Please wait ${limit.retryAfterSec}s before trying again.`,
      });
      return;
    }

    const { username, password } = (req.body || {}) as {
      username?: string;
      password?: string;
    };

    const db = readDb();
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '');

    let matched = false;

    if (db.admin.customized) {
      matched =
        cleanUser === db.admin.username &&
        verifyPassword(cleanPass, db.admin.passwordHash);
    } else {
      const envUser = (process.env.ADMIN_USERNAME || '').trim();
      const envPass = process.env.ADMIN_PASSWORD || '';
      const validDefaultUser =
        cleanUser.toLowerCase() === 'admin' ||
        cleanUser.toLowerCase() === db.admin.username.toLowerCase() ||
        (Boolean(envUser) && cleanUser.toLowerCase() === envUser.toLowerCase());

      if (envPass) {
        matched =
          validDefaultUser &&
          (cleanPass === envPass || verifyPassword(cleanPass, db.admin.passwordHash));
      } else {
        matched =
          validDefaultUser &&
          (cleanPass === 'ToolCraft@2026' || verifyPassword(cleanPass, db.admin.passwordHash));
      }
    }

    if (!matched) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    resetLoginRateLimit(ip);
    const activeUsername = cleanUser || db.admin.username;
    const token = signSessionToken(activeUsername);
    setSessionCookie(res, token);
    res.json({ authenticated: true, username: activeUsername, token });
  });

  app.post('/api/admin/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  async function pickFirstReachableLogoUrl(domain: string): Promise<string> {
    const candidates = buildLogoCandidateUrls(domain);
    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate, {
          method: 'GET',
          signal: AbortSignal.timeout(2500),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && (contentType.startsWith('image/') || candidate.endsWith('.ico'))) {
          return candidate;
        }
      } catch {
        // Try next logo provider
      }
    }
    return candidates[0] || '';
  }

  function getServerGeminiKeys(): string[] {
    return [
      ...parseKeyList(process.env.GEMINI_API_KEYS),
      ...parseKeyList(process.env.GEMINI_API_KEY),
    ].filter((key, idx, arr) => arr.indexOf(key) === idx);
  }

  // Server-side Auto-Fetch Official Tool Logo & Info with Multi-API Sequential Failover
  app.post('/api/admin/auto-tool-info', requireAdmin, async (req, res) => {
    const body = (req.body || {}) as {
      name?: string;
      domain?: string;
      endpoints?: string[] | string;
    };
    const rawName = String(body.name || '').trim();
    const explicitDomain = normalizeDomainInput(String(body.domain || ''));
    if (rawName.length < 2) {
      res.status(400).json({ error: 'Enter a tool name first (e.g. CapCut Pro, Gemini Pro).' });
      return;
    }

    const db = readDb();
    let customEndpoints: string[] = Array.isArray(db.settings.autoFetchEndpoints)
      ? db.settings.autoFetchEndpoints
      : [];
    if (body.endpoints !== undefined) {
      customEndpoints = Array.isArray(body.endpoints)
        ? parseApiEndpointLines(body.endpoints.join('\n'))
        : parseApiEndpointLines(String(body.endpoints || ''));
    }

    // 1. Try custom per-line API endpoints sequentially (if line 1 fails, try line 2, etc.)
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
          signal: AbortSignal.timeout(4000),
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

        const domain = String(data.officialDomain || data.domain || '')
          .replace(/^https?:\/\//i, '')
          .replace(/\/.*$/, '')
          .trim();
        const logoUrl = data.logoUrl?.trim() || (domain ? await pickFirstReachableLogoUrl(domain) : '');
        const matchedCat = PRODUCT_CATEGORIES.includes(data.category as ProductCategory)
          ? (data.category as ProductCategory)
          : 'Productivity';

        res.json({
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
        return;
      } catch {
        // Endpoint failed or timed out — automatically try the next line
      }
    }

    // 2. Verified Brand Registry (official built-in SVG brand marks)
    const logoKey = resolveBrandKeyFromName(rawName);
    const preset = BRAND_PRESETS[logoKey];
    if (preset) {
      const explicitLogoUrl = explicitDomain ? await pickFirstReachableLogoUrl(explicitDomain) : '';
      res.json({
        logoKey,
        logoUrl: explicitLogoUrl, // Built-in crisp official SVG mark renders automatically if empty
        category: preset.category,
        planLabel: preset.planLabel,
        description: preset.description,
        features: preset.features,
        source: 'verified-brand-registry',
      });
      return;
    }

    // 3. Server-side Gemini API Keys Sequential Failover (GEMINI_API_KEYS + GEMINI_API_KEY)
    const geminiKeys = getServerGeminiKeys();

    for (let i = 0; i < geminiKeys.length; i += 1) {
      const apiKey = geminiKeys[i];
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Provide concise storefront product details for the digital subscription tool named "${rawName}". Choose the closest category from: ${PRODUCT_CATEGORIES.join(', ')}. Include the official website domain (e.g. runwayml.com) so we can fetch its logo.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                planLabel: { type: Type.STRING },
                description: { type: Type.STRING },
                features: { type: Type.ARRAY, items: { type: Type.STRING } },
                officialDomain: { type: Type.STRING },
              },
              required: ['category', 'planLabel', 'description', 'features', 'officialDomain'],
            },
          },
        });
        const parsed = JSON.parse(response.text || '{}') as {
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

        res.json({
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
        return;
      } catch {
        // Key failed or rate-limited — automatically try the next key
      }
    }

    // 4. Deterministic Smart Domain + Multi-Provider Logo Resolver Fallback
    const guessedSlug = rawName
      .toLowerCase()
      .replace(/\b(pro|plus|ai|premium|team|seat|1\s*month|1\s*year)\b/g, '')
      .replace(/[^a-z0-9]/g, '');
    const guessedDomain = explicitDomain || (guessedSlug ? `${guessedSlug}.com` : '');
    const fallbackLogoUrl = guessedDomain ? await pickFirstReachableLogoUrl(guessedDomain) : '';

    res.json({
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
  });

  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    const db = readDb();
    res.json({
      username: db.admin.username,
      settings: db.settings,
      products: db.products,
      orders: db.orders,
      aiStatus: {
        serverGeminiKeyCount: getServerGeminiKeys().length,
        brandPresetCount: Object.keys(BRAND_PRESETS).length,
      },
    });
  });

  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = (req.body || {}) as {
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
    };

    const parsedPrice = Number(body.price);
    const parsedOriginal =
      body.originalPrice !== undefined &&
      body.originalPrice !== null &&
      String(body.originalPrice) !== ''
        ? Number(body.originalPrice)
        : undefined;
    const parsedStock =
      body.stock !== undefined && String(body.stock) !== '' ? Math.floor(Number(body.stock)) : 25;
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

    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const db = readDb();
    const cleanName = String(body.name || '').trim();
    const logoKey = (body.logoKey || '').trim() || resolveBrandKeyFromName(cleanName);
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 32);

    const newProduct: Product = {
      id: `${slug || 'tool'}-${crypto.randomBytes(3).toString('hex')}`,
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
      allowedGateways: allowedGateways && allowedGateways.length > 0 ? allowedGateways : undefined,
      featuredInHero: body.featuredInHero !== undefined ? Boolean(body.featuredInHero) : true,
      active: body.active !== undefined ? Boolean(body.active) : true,
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    writeDb(db);
    res.status(201).json({ product: newProduct });
  });

  app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const current = db.products[idx];
    const body = (req.body || {}) as Partial<Product>;

    const nextName = body.name !== undefined ? String(body.name).trim() : current.name;
    const next: Product = {
      ...current,
      name: nextName,
      category: body.category !== undefined ? body.category : current.category,
      planLabel: body.planLabel !== undefined ? String(body.planLabel).trim() : current.planLabel,
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
        body.description !== undefined ? String(body.description).trim() : current.description,
      features: Array.isArray(body.features)
        ? body.features.map((f) => String(f).trim()).filter(Boolean)
        : current.features,
      allowedGateways:
        body.allowedGateways !== undefined
          ? Array.isArray(body.allowedGateways) && body.allowedGateways.length > 0
            ? body.allowedGateways.filter(
                (g): g is GatewayId => g === 'jazzcash' || g === 'easypaisa' || g === 'binance'
              )
            : undefined
          : current.allowedGateways,
      featuredInHero:
        body.featuredInHero !== undefined ? Boolean(body.featuredInHero) : current.featuredInHero,
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

    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    db.products[idx] = next;
    writeDb(db);
    res.json({ product: next });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const nextProducts = db.products.filter((p) => p.id !== req.params.id);
    if (nextProducts.length === db.products.length) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    db.products = nextProducts;
    writeDb(db);
    res.json({ ok: true });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const { status, notes } = (req.body || {}) as { status?: OrderStatus; notes?: string };
    if (status !== undefined) {
      if (!VALID_ORDER_STATUSES.includes(status)) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }
      order.status = status;
    }
    if (notes !== undefined) {
      order.notes = String(notes).trim();
    }

    writeDb(db);
    res.json({ order });
  });

  app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const nextOrders = db.orders.filter((o) => o.id !== req.params.id);
    if (nextOrders.length === db.orders.length) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    db.orders = nextOrders;
    writeDb(db);
    res.json({ ok: true });
  });

  app.patch('/api/admin/settings', requireAdmin, (req, res) => {
    const db = readDb();
    const body = (req.body || {}) as Partial<{
      storeName: string;
      tagline: string;
      whatsappNumber: string;
      whatsappDisplay: string;
      supportHours: string;
      currencySymbol: string;
      deliverySla: string;
      autoFetchEndpoints: string[] | string;
      gateways: PaymentGatewayConfig[];
    }>;

    if (body.whatsappNumber !== undefined) {
      const clean = sanitizeWhatsappPhone(String(body.whatsappNumber));
      if (clean.length < 10) {
        res.status(400).json({
          error: 'WhatsApp number must have at least 10 digits with country code.',
        });
        return;
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
    if (body.tagline !== undefined) {
      db.settings.tagline = body.tagline.trim();
    }
    if (body.currencySymbol !== undefined && body.currencySymbol.trim()) {
      db.settings.currencySymbol = body.currencySymbol.trim().slice(0, 6);
    }
    if (body.deliverySla !== undefined) {
      db.settings.deliverySla = body.deliverySla.trim();
    }

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

    writeDb(db);
    res.json({ settings: db.settings });
  });

  app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    const { currentPassword, newUsername, newPassword } = (req.body || {}) as {
      currentPassword?: string;
      newUsername?: string;
      newPassword?: string;
    };

    const db = readDb();
    const curPass = String(currentPassword || '');
    const envPass = process.env.ADMIN_PASSWORD || '';
    const curValid = db.admin.customized
      ? verifyPassword(curPass, db.admin.passwordHash)
      : verifyPassword(curPass, db.admin.passwordHash) ||
        curPass === 'ToolCraft@2026' ||
        (Boolean(envPass) && curPass === envPass);

    if (!curValid) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    const cleanNewPass = String(newPassword || '');
    if (cleanNewPass.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }

    const cleanUser = String(newUsername || db.admin.username).trim();
    if (cleanUser.length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters.' });
      return;
    }

    db.admin.username = cleanUser;
    db.admin.passwordHash = hashPassword(cleanNewPass);
    db.admin.customized = true;
    db.admin.updatedAt = new Date().toISOString();
    writeDb(db);

    const token = signSessionToken(db.admin.username);
    setSessionCookie(res, token);
    res.json({ ok: true, username: db.admin.username, token });
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ToolCraft server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
