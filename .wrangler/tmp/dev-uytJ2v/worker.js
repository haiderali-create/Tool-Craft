var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/data/defaultStoreSeed.ts
var BRAND_PRESETS = {
  capcut: {
    category: "Video & Editing",
    planLabel: "1 Month \xB7 Private Access",
    description: "Full CapCut Pro unlock with AI auto-captions, 4K 60fps export, background removal, and commercial effects.",
    features: [
      "Works on PC, Mac, iOS & Android",
      "No watermark + 4K Ultra HD exports",
      "AI auto-captions & smart cutout tools"
    ],
    domain: "capcut.com"
  },
  gemini: {
    category: "AI Assistants",
    planLabel: "1 Month \xB7 Personal Gmail Upgrade",
    description: "Upgrade your own Google account with Gemini Advanced models, 2TB Google One cloud storage, and Workspace AI.",
    features: [
      "Activated on your personal Gmail",
      "Includes 2TB Google Drive & Photos storage",
      "Deep Research & priority model access"
    ],
    domain: "gemini.google.com"
  },
  canva: {
    category: "Design & Image",
    planLabel: "1 Year \xB7 Private Email Invite",
    description: "Design social posts, decks, and brand kits with Magic Studio AI, background remover, and 100M+ Pro assets.",
    features: [
      "Invite directly to your own email",
      "100M+ stock photos, fonts & templates",
      "Magic Resize & 1-click background remover"
    ],
    domain: "canva.com"
  },
  elevenlabs: {
    category: "Audio & Voice",
    planLabel: "1 Month \xB7 100k Credits",
    description: "Studio-grade AI voiceovers, instant voice cloning, and multilingual dubbing for YouTube & reels.",
    features: [
      "100,000 monthly character credits",
      "Professional voice cloning included",
      "Commercial usage rights"
    ],
    domain: "elevenlabs.io"
  },
  midjourney: {
    category: "Design & Image",
    planLabel: "1 Month \xB7 Fast GPU Hours",
    description: "Photorealistic concept art, product mockups, and brand illustrations with fast generation priority.",
    features: [
      "Fast GPU mode & Relax mode",
      "Web studio + Discord workflow",
      "Commercial license included"
    ],
    domain: "midjourney.com"
  },
  perplexity: {
    category: "Productivity",
    planLabel: "1 Year \xB7 Private Voucher",
    description: "Citation-backed AI research engine with switchable frontier models, Pro Search, and unlimited file uploads.",
    features: [
      "Switch between top reasoning models",
      "Live web citations & academic search",
      "12-month uninterrupted access"
    ],
    domain: "perplexity.ai"
  },
  adobe: {
    category: "Video & Editing",
    planLabel: "1 Month \xB7 Genuine Email Seat",
    description: "Premiere Pro, After Effects, Photoshop, and Firefly generative AI credits activated on your email.",
    features: [
      "Official Creative Cloud desktop app",
      "100GB cloud storage + Firefly AI",
      "Supports Windows & macOS"
    ],
    domain: "adobe.com"
  },
  cursor: {
    category: "Productivity",
    planLabel: "1 Month \xB7 Pro Subscription",
    description: "AI-powered code editor with fast multi-file edits, smart tab autocomplete, and frontier coding models.",
    features: [
      "Fast premium model requests included",
      "Multi-file codebase composer",
      "Works on Windows, macOS & Linux"
    ],
    domain: "cursor.com"
  },
  runway: {
    category: "Video & Editing",
    planLabel: "1 Month \xB7 Pro Credits",
    description: "Generate cinematic AI videos from text or images with Gen-3 Alpha, motion brush, and studio upscaling.",
    features: [
      "Gen-3 Alpha video generation",
      "Camera control & motion brush",
      "Watermark-free HD exports"
    ],
    domain: "runwayml.com"
  },
  suno: {
    category: "Audio & Voice",
    planLabel: "1 Month \xB7 Pro Plan",
    description: "Create full studio-quality AI songs, vocals, and instrumentals with commercial ownership rights.",
    features: [
      "2,500 monthly song generation credits",
      "Commercial rights for YouTube & social",
      "Custom lyrics & vocal styles"
    ],
    domain: "suno.com"
  },
  notion: {
    category: "Productivity",
    planLabel: "1 Year \xB7 Plus + AI",
    description: "All-in-one workspace for docs, databases, and Notion AI writing and summary automation.",
    features: [
      "Unlimited blocks & file uploads",
      "Notion AI Q&A and autofill",
      "Private workspace upgrade"
    ],
    domain: "notion.so"
  },
  figma: {
    category: "Design & Image",
    planLabel: "1 Year \xB7 Professional Seat",
    description: "Collaborative UI/UX design, prototyping, dev mode, and shared team component libraries.",
    features: [
      "Unlimited Figma files & projects",
      "Dev Mode & variable libraries",
      "Activated on your email"
    ],
    domain: "figma.com"
  },
  grammarly: {
    category: "Productivity",
    planLabel: "1 Year \xB7 Premium Access",
    description: "Advanced grammar, tone rewriting, plagiarism detection, and AI writing assistance across apps.",
    features: [
      "Works in Chrome, Docs & Word",
      "Full tone & clarity rewrite",
      "Plagiarism checker included"
    ],
    domain: "grammarly.com"
  },
  claude: {
    category: "AI Assistants",
    planLabel: "1 Month \xB7 Pro Access",
    description: "High-context reasoning, coding, and writing assistant with Artifacts and priority access.",
    features: [
      "Priority access & higher usage limits",
      "Projects & interactive Artifacts",
      "Full month warranty"
    ],
    domain: "claude.ai"
  },
  spotify: {
    category: "Audio & Voice",
    planLabel: "1 Year \xB7 Individual Premium",
    description: "Ad-free high-bitrate music streaming, offline downloads, and unlimited skips on your own account.",
    features: [
      "Activated on your own account",
      "Offline downloads & lossless clarity",
      "Zero ads across all devices"
    ],
    domain: "spotify.com"
  },
  youtube: {
    category: "Video & Editing",
    planLabel: "1 Year \xB7 Premium Family Invite",
    description: "Ad-free YouTube, background playback, offline downloads, and YouTube Music Premium included.",
    features: [
      "Works on your existing Gmail",
      "Includes YouTube Music Premium",
      "TV, mobile & desktop support"
    ],
    domain: "youtube.com"
  },
  netflix: {
    category: "Video & Editing",
    planLabel: "1 Month \xB7 4K UHD Private Screen",
    description: "Dedicated PIN-locked 4K Ultra HD streaming screen with smooth multi-device support.",
    features: [
      "4K Ultra HD + HDR quality",
      "Private PIN-protected profile",
      "Full 30-day warranty"
    ],
    domain: "netflix.com"
  }
};
function createDefaultSettings() {
  return {
    storeName: "ToolCraft",
    tagline: "Official AI & Creative Pro Subscriptions",
    whatsappNumber: "923234319689",
    whatsappDisplay: "+92 3234319689",
    supportHours: "Support 24/7",
    currencySymbol: "Rs.",
    deliverySla: "Send payment screenshot on WhatsApp within 15 minutes for activation",
    autoFetchEndpoints: [],
    gateways: [
      {
        id: "jazzcash",
        label: "JazzCash",
        enabled: false,
        accountTitle: "ToolCraft Digital Store",
        accountNumber: "",
        instructions: "Send total amount to this JazzCash account, take a screenshot, upload it below, and also send it on WhatsApp within 15 minutes."
      },
      {
        id: "easypaisa",
        label: "Easypaisa",
        enabled: true,
        accountTitle: "Naveed Akhtar",
        accountNumber: "03488657017",
        instructions: "Transfer to Easypaisa (Naveed Akhtar \xB7 03488657017), upload your payment screenshot below, and send it on WhatsApp within 15 minutes."
      },
      {
        id: "binance",
        label: "Binance (Pay ID / USDT)",
        enabled: true,
        accountTitle: "Mr Boss 1",
        accountNumber: "1009240724",
        instructions: "Send USDT via Binance Pay ID (Mr Boss 1 \xB7 1009240724), upload the transfer screenshot below, and share it on WhatsApp within 15 minutes."
      }
    ]
  };
}
__name(createDefaultSettings, "createDefaultSettings");
function createDefaultProducts(now = (/* @__PURE__ */ new Date()).toISOString()) {
  return [
    {
      id: "capcut-pro-1m",
      name: "CapCut Pro",
      category: "Video & Editing",
      planLabel: "1 Month \xB7 Private Access",
      price: 1150,
      originalPrice: 2400,
      offerLabel: "Hot Offer",
      topSelling: true,
      inStock: true,
      stock: 50,
      logoKey: "capcut",
      description: "Full Pro timeline unlock with AI auto-captions, 4K 60fps export, background removal, and commercial effects.",
      features: [
        "Works on PC, Mac, iOS & Android",
        "No watermark + 4K Ultra HD exports",
        "AI auto-captions & smart cutout tools"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    },
    {
      id: "gemini-pro-1m",
      name: "Gemini Pro (Google AI Premium)",
      category: "AI Assistants",
      planLabel: "1 Month \xB7 Personal Gmail Upgrade",
      price: 1850,
      originalPrice: 5600,
      offerLabel: "Best Value",
      topSelling: true,
      inStock: true,
      stock: 40,
      logoKey: "gemini",
      description: "Upgrade your own Google account with Gemini Advanced, 2TB Google One cloud storage, and Workspace AI.",
      features: [
        "Activated on your personal Gmail",
        "Includes 2TB Google Drive & Photos storage",
        "Deep Research & priority model access"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    },
    {
      id: "canva-pro-1y",
      name: "Canva Pro Team Seat",
      category: "Design & Image",
      planLabel: "1 Year \xB7 Private Email Invite",
      price: 950,
      originalPrice: 3500,
      offerLabel: "Flash Deal",
      topSelling: true,
      inStock: true,
      stock: 60,
      logoKey: "canva",
      description: "Design social posts, decks, and brand kits with Magic Studio AI, background remover, and 100M+ Pro assets.",
      features: [
        "Invite directly to your own email",
        "100M+ stock photos, fonts & templates",
        "Magic Resize & 1-click background remover"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    },
    {
      id: "elevenlabs-creator-1m",
      name: "ElevenLabs Creator",
      category: "Audio & Voice",
      planLabel: "1 Month \xB7 100k Credits",
      price: 2950,
      originalPrice: 6200,
      topSelling: false,
      inStock: true,
      stock: 25,
      logoKey: "elevenlabs",
      description: "Studio-grade AI voiceovers, instant voice cloning, and multilingual dubbing for YouTube & faceless reels.",
      features: [
        "100,000 monthly character credits",
        "Professional voice cloning included",
        "Commercial usage rights"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    },
    {
      id: "midjourney-pro-1m",
      name: "Midjourney Pro",
      category: "Design & Image",
      planLabel: "1 Month \xB7 Fast GPU Hours",
      price: 3100,
      originalPrice: 8400,
      offerLabel: "Studio Pick",
      topSelling: false,
      inStock: true,
      stock: 20,
      logoKey: "midjourney",
      description: "Photorealistic concept art, product mockups, and brand illustrations with fast generation priority.",
      features: [
        "Fast GPU mode & Relax mode",
        "Web studio + Discord workflow",
        "Commercial license included"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    },
    {
      id: "perplexity-pro-1y",
      name: "Perplexity Pro",
      category: "Productivity",
      planLabel: "1 Year \xB7 Private Voucher",
      price: 3400,
      originalPrice: 12e3,
      offerLabel: "Yearly Save",
      topSelling: false,
      inStock: true,
      stock: 30,
      logoKey: "perplexity",
      description: "Citation-backed AI research engine with switchable frontier models, Pro Search, and unlimited file uploads.",
      features: [
        "Switch between top reasoning models",
        "Live web citations & academic search",
        "12-month uninterrupted access"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    },
    {
      id: "adobe-cc-1m",
      name: "Adobe Creative Cloud All Apps",
      category: "Video & Editing",
      planLabel: "1 Month \xB7 Genuine Email Seat",
      price: 3600,
      originalPrice: 14500,
      topSelling: false,
      inStock: true,
      stock: 20,
      logoKey: "adobe",
      description: "Premiere Pro, After Effects, Photoshop, and Firefly generative AI credits activated directly on your email.",
      features: [
        "Official Creative Cloud desktop app",
        "100GB cloud storage + Firefly AI",
        "Supports Windows & macOS"
      ],
      featuredInHero: true,
      active: true,
      createdAt: now
    }
  ];
}
__name(createDefaultProducts, "createDefaultProducts");

// src/utils/storeLogic.ts
var PRODUCT_CATEGORIES = [
  "Video & Editing",
  "AI Assistants",
  "Design & Image",
  "Audio & Voice",
  "Productivity"
];
function formatCurrency(amount, currencySymbol = "Rs.") {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(safeAmount);
  return `${currencySymbol} ${formatted}`;
}
__name(formatCurrency, "formatCurrency");
function resolveBrandKeyFromName(name) {
  const lower = name.toLowerCase();
  if (lower.includes("capcut")) return "capcut";
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("canva")) return "canva";
  if (lower.includes("eleven")) return "elevenlabs";
  if (lower.includes("midjourney")) return "midjourney";
  if (lower.includes("perplexity")) return "perplexity";
  if (lower.includes("adobe") || lower.includes("premiere") || lower.includes("photoshop")) {
    return "adobe";
  }
  if (lower.includes("cursor")) return "cursor";
  if (lower.includes("runway")) return "runway";
  if (lower.includes("suno")) return "suno";
  if (lower.includes("notion")) return "notion";
  if (lower.includes("figma")) return "figma";
  if (lower.includes("grammarly")) return "grammarly";
  if (lower.includes("claude")) return "claude";
  if (lower.includes("spotify")) return "spotify";
  if (lower.includes("youtube")) return "youtube";
  if (lower.includes("netflix")) return "netflix";
  return "generic";
}
__name(resolveBrandKeyFromName, "resolveBrandKeyFromName");
function sanitizeWhatsappPhone(phone) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  return digits;
}
__name(sanitizeWhatsappPhone, "sanitizeWhatsappPhone");
function buildWhatsappOrderUrl(params) {
  const cleanPhone = sanitizeWhatsappPhone(params.storeWhatsapp);
  const lines = [
    `Assalam o Alaikum! I placed an order for *${params.productName}* (${params.planLabel}) \u2014 ${params.priceText}.`
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
  lines.push("Sending my payment screenshot within 15 minutes for activation.");
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
__name(buildWhatsappOrderUrl, "buildWhatsappOrderUrl");
function validateOrderInput(input) {
  const name = input.customerName.trim();
  if (name.length < 2) {
    return { valid: false, error: "Please enter your full name (at least 2 characters)." };
  }
  if (name.length > 80) {
    return { valid: false, error: "Customer name must be 80 characters or fewer." };
  }
  const digits = sanitizeWhatsappPhone(input.customerWhatsapp);
  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      error: "Please enter a valid WhatsApp number (10 to 15 digits with country code)."
    };
  }
  if (input.product) {
    if (!input.product.active) {
      return { valid: false, error: "This tool is currently unavailable." };
    }
    if (!input.product.inStock) {
      return { valid: false, error: "This tool is currently out of stock." };
    }
  }
  if (input.gateway && !input.gateway.enabled) {
    return { valid: false, error: "Selected payment gateway is not currently enabled." };
  }
  const screenshot = (input.screenshotDataUrl || "").trim();
  if (!screenshot.startsWith("data:image/") || screenshot.length < 64) {
    return {
      valid: false,
      error: "Please upload your payment screenshot before submitting."
    };
  }
  return { valid: true };
}
__name(validateOrderInput, "validateOrderInput");
function validateProductInput(input) {
  if (!input.name || input.name.trim().length < 2) {
    return { valid: false, error: "Tool name must be at least 2 characters." };
  }
  if (!PRODUCT_CATEGORIES.includes(input.category)) {
    return { valid: false, error: "Please choose a valid category." };
  }
  if (!input.planLabel || input.planLabel.trim().length < 2) {
    return { valid: false, error: "Plan label is required (e.g. 1 Month \xB7 Private)." };
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    return { valid: false, error: "Price must be greater than 0." };
  }
  if (input.originalPrice !== void 0 && input.originalPrice !== null && (!Number.isFinite(input.originalPrice) || input.originalPrice < 0)) {
    return { valid: false, error: "Last price cannot be negative." };
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return { valid: false, error: "Stock must be a whole number (0 or higher)." };
  }
  if (!input.description || input.description.trim().length < 8) {
    return { valid: false, error: "Please provide a short description (min 8 chars)." };
  }
  return { valid: true };
}
__name(validateProductInput, "validateProductInput");
function parseApiEndpointLines(rawText) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const rawLine of rawText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (!/^https?:\/\/\S+$/i.test(line)) continue;
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result;
}
__name(parseApiEndpointLines, "parseApiEndpointLines");
function parseKeyList(raw) {
  if (!raw) return [];
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const part of raw.split(/[\r\n,]+/)) {
    const key = part.trim();
    if (!key || key === "MY_GEMINI_API_KEY") continue;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}
__name(parseKeyList, "parseKeyList");
function normalizeDomainInput(raw) {
  const cleaned = raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/?#].*$/, "");
  if (!cleaned || !cleaned.includes(".") || /\s/.test(cleaned)) {
    return "";
  }
  return cleaned;
}
__name(normalizeDomainInput, "normalizeDomainInput");
function buildLogoCandidateUrls(domain) {
  const clean = normalizeDomainInput(domain);
  if (!clean) return [];
  return [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(clean)}.ico`
  ];
}
__name(buildLogoCandidateUrls, "buildLogoCandidateUrls");

// worker.ts
var SESSION_COOKIE_NAME = "toolcraft_admin_session";
var SESSION_TTL_MS = 24 * 60 * 60 * 1e3;
var KV_KEY = "toolcraft_store_v2";
var VALID_ORDER_STATUSES = ["pending", "paid", "delivered", "cancelled"];
var runtimeFallbackSecret = null;
var memoryDb = null;
function getSigningSecret(env) {
  if (env.SESSION_SECRET) {
    return env.SESSION_SECRET;
  }
  if (!runtimeFallbackSecret) {
    runtimeFallbackSecret = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  }
  return runtimeFallbackSecret;
}
__name(getSigningSecret, "getSigningSecret");
function createInitialDb(env) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    admin: {
      username: (env.ADMIN_USERNAME || "admin").trim() || "admin",
      customized: false,
      updatedAt: now
    },
    settings: createDefaultSettings(),
    products: createDefaultProducts(now),
    orders: []
  };
}
__name(createInitialDb, "createInitialDb");
async function loadDb(env) {
  if (env.STORE_KV) {
    try {
      const raw = await env.STORE_KV.get(KV_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      const initial = createInitialDb(env);
      await env.STORE_KV.put(KV_KEY, JSON.stringify(initial));
      return initial;
    } catch {
    }
  }
  if (!memoryDb) {
    memoryDb = createInitialDb(env);
  }
  return memoryDb;
}
__name(loadDb, "loadDb");
async function saveDb(env, db) {
  memoryDb = db;
  if (env.STORE_KV) {
    try {
      await env.STORE_KV.put(KV_KEY, JSON.stringify(db));
    } catch {
    }
  }
}
__name(saveDb, "saveDb");
function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(toBase64Url, "toBase64Url");
function fromBase64Url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(fromBase64Url, "fromBase64Url");
async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
__name(getHmacKey, "getHmacKey");
async function signSessionToken(username, env) {
  const payload = { username, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey(getSigningSecret(env));
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(sigBuf))}`;
}
__name(signSessionToken, "signSessionToken");
async function verifySessionToken(token, env) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;
  try {
    const key = await getHmacKey(getSigningSecret(env));
    const sigBytes = fromBase64Url(sigB64);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payloadB64)
    );
    if (!ok) return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (!parsed.username || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;
    return { username: parsed.username, exp: parsed.exp };
  } catch {
    return null;
  }
}
__name(verifySessionToken, "verifySessionToken");
async function hashPasswordWeb(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `${toBase64Url(salt)}:${toBase64Url(new Uint8Array(derived))}`;
}
__name(hashPasswordWeb, "hashPasswordWeb");
async function verifyPasswordWeb(password, storedHash) {
  if (!storedHash) return false;
  const [saltStr, hashStr] = storedHash.split(":");
  if (!saltStr || !hashStr) return false;
  try {
    const salt = fromBase64Url(saltStr);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const derived = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
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
__name(verifyPasswordWeb, "verifyPasswordWeb");
function parseCookies(cookieHeader) {
  const result = {};
  if (!cookieHeader) return result;
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
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
__name(parseCookies, "parseCookies");
async function getSessionFromRequest(request, env) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearer = await verifySessionToken(authHeader.slice(7).trim(), env);
    if (bearer) return bearer;
  }
  const cookies = parseCookies(request.headers.get("cookie"));
  return verifySessionToken(cookies[SESSION_COOKIE_NAME], env);
}
__name(getSessionFromRequest, "getSessionFromRequest");
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...extraHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");
function buildCookieHeader(token, request) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1e3)}`,
    isHttps ? "SameSite=None" : "SameSite=Lax"
  ];
  if (isHttps) parts.push("Secure");
  return parts.join("; ");
}
__name(buildCookieHeader, "buildCookieHeader");
function buildClearCookieHeader(request) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    isHttps ? "SameSite=None" : "SameSite=Lax"
  ];
  if (isHttps) parts.push("Secure");
  return parts.join("; ");
}
__name(buildClearCookieHeader, "buildClearCookieHeader");
function generateOrderCode(existingOrders) {
  const used = new Set(existingOrders.map((o) => o.orderCode));
  let num = 1042 + existingOrders.length;
  while (used.has(`TC-${num}`)) {
    num += 1;
  }
  return `TC-${num}`;
}
__name(generateOrderCode, "generateOrderCode");
function getServerGeminiKeys(env) {
  return [...parseKeyList(env.GEMINI_API_KEYS), ...parseKeyList(env.GEMINI_API_KEY)].filter(
    (key, idx, arr) => arr.indexOf(key) === idx
  );
}
__name(getServerGeminiKeys, "getServerGeminiKeys");
async function pickFirstReachableLogoUrl(domain) {
  const candidates = buildLogoCandidateUrls(domain);
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { method: "GET" });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && (contentType.startsWith("image/") || candidate.endsWith(".ico"))) {
        return candidate;
      }
    } catch {
    }
  }
  return candidates[0] || "";
}
__name(pickFirstReachableLogoUrl, "pickFirstReachableLogoUrl");
async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJsonBody, "readJsonBody");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    if (!pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }
    if (pathname === "/api/health" && request.method === "GET") {
      return jsonResponse({ ok: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
    if (pathname === "/api/storefront" && request.method === "GET") {
      const db = await loadDb(env);
      return jsonResponse({
        settings: db.settings,
        products: db.products.filter((p) => p.active)
      });
    }
    if (pathname === "/api/orders" && request.method === "POST") {
      const body = await readJsonBody(request);
      if (!body) return jsonResponse({ error: "Invalid JSON request body." }, 400);
      const db = await loadDb(env);
      const product = db.products.find((p) => p.id === body.productId);
      if (!product) return jsonResponse({ error: "Selected tool was not found." }, 404);
      const gateway = db.settings.gateways.find((g) => g.id === body.paymentMethod);
      if (!gateway) return jsonResponse({ error: "Please choose an active payment method." }, 400);
      const effectiveGateway = Array.isArray(product.allowedGateways) && product.allowedGateways.includes(gateway.id) ? { ...gateway, enabled: true } : gateway;
      const screenshotDataUrl = String(body.screenshotDataUrl || "").trim();
      if (screenshotDataUrl.length > 5 * 1024 * 1024) {
        return jsonResponse({ error: "Payment screenshot image must be smaller than 4MB." }, 400);
      }
      const validation = validateOrderInput({
        customerName: String(body.customerName || ""),
        customerWhatsapp: String(body.customerWhatsapp || ""),
        paymentMethod: gateway.id,
        transactionRef: String(body.transactionRef || ""),
        screenshotDataUrl,
        gateway: effectiveGateway,
        product
      });
      if (!validation.valid) {
        return jsonResponse({ error: validation.error }, 400);
      }
      const cleanWhatsapp = sanitizeWhatsappPhone(String(body.customerWhatsapp || ""));
      const txRef = String(body.transactionRef || "").trim() || "Screenshot Attached";
      const orderCode = generateOrderCode(db.orders);
      const newOrder = {
        id: crypto.randomUUID(),
        orderCode,
        productId: product.id,
        productName: product.name,
        planLabel: product.planLabel,
        amount: product.price,
        currencySymbol: db.settings.currencySymbol,
        customerName: String(body.customerName || "").trim(),
        customerWhatsapp: cleanWhatsapp,
        customerEmail: body.customerEmail ? String(body.customerEmail).trim() : void 0,
        paymentMethod: gateway.id,
        paymentMethodLabel: gateway.label,
        transactionRef: txRef,
        screenshotDataUrl,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
        customerName: newOrder.customerName
      });
      return jsonResponse({ order: newOrder, whatsappUrl }, 201);
    }
    if (pathname === "/api/orders/lookup" && request.method === "GET") {
      const code = String(url.searchParams.get("code") || "").trim().toUpperCase();
      if (!code || code.length < 4) {
        return jsonResponse({ error: "Enter your Order Code (e.g. TC-1042)." }, 400);
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
        createdAt: order.createdAt
      });
    }
    if (pathname === "/api/admin/session" && request.method === "GET") {
      const session2 = await getSessionFromRequest(request, env);
      if (!session2) return jsonResponse({ authenticated: false });
      return jsonResponse({ authenticated: true, username: session2.username });
    }
    if (pathname === "/api/admin/login" && request.method === "POST") {
      const body = await readJsonBody(request);
      if (!body) return jsonResponse({ error: "Invalid login payload." }, 400);
      const db = await loadDb(env);
      const cleanUser = String(body.username || "").trim();
      const cleanPass = String(body.password || "");
      let matched = false;
      if (db.admin.customized) {
        matched = cleanUser === db.admin.username && await verifyPasswordWeb(cleanPass, db.admin.passwordHash);
      } else {
        const envUser = (env.ADMIN_USERNAME || "").trim();
        const envPass = env.ADMIN_PASSWORD || "";
        const validDefaultUser = cleanUser.toLowerCase() === "admin" || cleanUser.toLowerCase() === db.admin.username.toLowerCase() || Boolean(envUser) && cleanUser.toLowerCase() === envUser.toLowerCase();
        const expectedPass = envPass || "ToolCraft@2026";
        matched = validDefaultUser && cleanPass === expectedPass;
      }
      if (!matched) {
        return jsonResponse({ error: "Invalid username or password." }, 401);
      }
      const activeUsername = cleanUser || db.admin.username;
      const token = await signSessionToken(activeUsername, env);
      return jsonResponse(
        { authenticated: true, username: activeUsername, token },
        200,
        { "Set-Cookie": buildCookieHeader(token, request) }
      );
    }
    if (pathname === "/api/admin/logout" && request.method === "POST") {
      return jsonResponse({ ok: true }, 200, { "Set-Cookie": buildClearCookieHeader(request) });
    }
    const session = await getSessionFromRequest(request, env);
    if (!session) {
      return jsonResponse({ error: "Admin authentication required." }, 401);
    }
    if (pathname === "/api/admin/dashboard" && request.method === "GET") {
      const db = await loadDb(env);
      return jsonResponse({
        username: db.admin.username,
        settings: db.settings,
        products: db.products,
        orders: db.orders,
        aiStatus: {
          serverGeminiKeyCount: getServerGeminiKeys(env).length,
          brandPresetCount: Object.keys(BRAND_PRESETS).length
        }
      });
    }
    if (pathname === "/api/admin/auto-tool-info" && request.method === "POST") {
      const body = await readJsonBody(request) || {};
      const rawName = String(body.name || "").trim();
      const explicitDomain = normalizeDomainInput(String(body.domain || ""));
      if (rawName.length < 2) {
        return jsonResponse(
          { error: "Enter a tool name first (e.g. Video Pro Suite, AI Studio)." },
          400
        );
      }
      const db = await loadDb(env);
      let customEndpoints = Array.isArray(db.settings.autoFetchEndpoints) ? db.settings.autoFetchEndpoints : [];
      if (body.endpoints !== void 0) {
        customEndpoints = Array.isArray(body.endpoints) ? parseApiEndpointLines(body.endpoints.join("\n")) : parseApiEndpointLines(String(body.endpoints || ""));
      }
      for (let i = 0; i < customEndpoints.length; i += 1) {
        const endpointTemplate = customEndpoints[i];
        try {
          const hasPlaceholder = /\{name\}/i.test(endpointTemplate);
          const targetUrl = hasPlaceholder ? endpointTemplate.replace(/\{name\}/gi, encodeURIComponent(rawName)) : endpointTemplate;
          const apiRes = await fetch(targetUrl, {
            method: hasPlaceholder ? "GET" : "POST",
            headers: hasPlaceholder ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
            body: hasPlaceholder ? void 0 : JSON.stringify({ name: rawName })
          });
          if (!apiRes.ok) continue;
          const data = await apiRes.json();
          const hasUsefulData = Boolean(
            data && (data.description || data.logoUrl || data.officialDomain || data.domain || data.planLabel)
          );
          if (!hasUsefulData) continue;
          const domain = normalizeDomainInput(String(data.officialDomain || data.domain || ""));
          const logoUrl = data.logoUrl?.trim() || (domain ? await pickFirstReachableLogoUrl(domain) : "");
          const matchedCat = PRODUCT_CATEGORIES.includes(data.category) ? data.category : "Productivity";
          return jsonResponse({
            logoKey: data.logoKey || resolveBrandKeyFromName(rawName),
            logoUrl,
            category: matchedCat,
            planLabel: data.planLabel || "1 Month \xB7 Pro Access",
            description: data.description || `Verified ${rawName} subscription with instant WhatsApp activation.`,
            features: Array.isArray(data.features) && data.features.length > 0 ? data.features.slice(0, 3) : ["Instant WhatsApp delivery", "Full term warranty", "Verified pro access"],
            source: `custom-endpoint-${i + 1}`
          });
        } catch {
        }
      }
      const logoKey = resolveBrandKeyFromName(rawName);
      const preset = BRAND_PRESETS[logoKey];
      if (preset) {
        const explicitLogoUrl = explicitDomain ? await pickFirstReachableLogoUrl(explicitDomain) : "";
        return jsonResponse({
          logoKey,
          logoUrl: explicitLogoUrl,
          category: preset.category,
          planLabel: preset.planLabel,
          description: preset.description,
          features: preset.features,
          source: "verified-brand-registry"
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
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Provide concise storefront product details for the digital subscription tool named "${rawName}". Choose the closest category from: ${PRODUCT_CATEGORIES.join(
                          ", "
                        )}. Include the official website domain (e.g. runwayml.com) so we can fetch its logo.`
                      }
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: "OBJECT",
                    properties: {
                      category: { type: "STRING" },
                      planLabel: { type: "STRING" },
                      description: { type: "STRING" },
                      features: { type: "ARRAY", items: { type: "STRING" } },
                      officialDomain: { type: "STRING" }
                    },
                    required: ["category", "planLabel", "description", "features", "officialDomain"]
                  }
                }
              })
            }
          );
          if (!geminiRes.ok) continue;
          const payload = await geminiRes.json();
          const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const parsed = JSON.parse(rawText);
          const matchedCat = PRODUCT_CATEGORIES.includes(parsed.category) ? parsed.category : "Productivity";
          const domain = explicitDomain || normalizeDomainInput(parsed.officialDomain || "");
          const resolvedLogoUrl = domain ? await pickFirstReachableLogoUrl(domain) : "";
          return jsonResponse({
            logoKey: "generic",
            logoUrl: resolvedLogoUrl,
            category: matchedCat,
            planLabel: parsed.planLabel || "1 Month \xB7 Pro Access",
            description: parsed.description || `Verified ${rawName} pro subscription with instant WhatsApp activation.`,
            features: Array.isArray(parsed.features) && parsed.features.length > 0 ? parsed.features.slice(0, 3) : ["Instant WhatsApp delivery", "Full term warranty", "Verified pro access"],
            source: `server-ai-key-${i + 1}`
          });
        } catch {
        }
      }
      const guessedSlug = rawName.toLowerCase().replace(/\b(pro|plus|ai|premium|team|seat|1\s*month|1\s*year)\b/g, "").replace(/[^a-z0-9]/g, "");
      const guessedDomain = explicitDomain || (guessedSlug ? `${guessedSlug}.com` : "");
      const fallbackLogoUrl = guessedDomain ? await pickFirstReachableLogoUrl(guessedDomain) : "";
      return jsonResponse({
        logoKey: "generic",
        logoUrl: fallbackLogoUrl,
        category: "Productivity",
        planLabel: "1 Month \xB7 Pro Access",
        description: `Verified ${rawName} subscription with instant WhatsApp delivery and full-term warranty.`,
        features: [
          "Instant WhatsApp activation",
          "Full subscription warranty",
          "Dedicated support desk"
        ],
        source: "smart-domain-lookup"
      });
    }
    if (pathname === "/api/admin/products" && request.method === "POST") {
      const body = await readJsonBody(request) || {};
      const parsedPrice = Number(body.price);
      const parsedOriginal = body.originalPrice !== void 0 && body.originalPrice !== null && String(body.originalPrice) !== "" ? Number(body.originalPrice) : void 0;
      const parsedStock = body.stock !== void 0 && String(body.stock) !== "" ? Math.floor(Number(body.stock)) : 25;
      const features = Array.isArray(body.features) ? body.features.map((f) => String(f).trim()).filter(Boolean) : [];
      const allowedGateways = Array.isArray(body.allowedGateways) ? body.allowedGateways.filter(
        (g) => g === "jazzcash" || g === "easypaisa" || g === "binance"
      ) : void 0;
      const validation = validateProductInput({
        name: String(body.name || ""),
        category: body.category,
        planLabel: String(body.planLabel || ""),
        price: parsedPrice,
        originalPrice: parsedOriginal,
        stock: parsedStock,
        description: String(body.description || ""),
        features
      });
      if (!validation.valid) return jsonResponse({ error: validation.error }, 400);
      const db = await loadDb(env);
      const cleanName = String(body.name || "").trim();
      const logoKey = (body.logoKey || "").trim() || resolveBrandKeyFromName(cleanName);
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32);
      const newProduct = {
        id: `${slug || "tool"}-${crypto.randomUUID().slice(0, 6)}`,
        name: cleanName,
        category: body.category,
        planLabel: String(body.planLabel || "").trim(),
        price: parsedPrice,
        originalPrice: parsedOriginal,
        offerLabel: body.offerLabel ? String(body.offerLabel).trim() : void 0,
        topSelling: Boolean(body.topSelling),
        inStock: body.inStock !== void 0 ? Boolean(body.inStock) : parsedStock > 0,
        stock: parsedStock,
        logoKey,
        logoUrl: body.logoUrl ? String(body.logoUrl).trim() : void 0,
        description: String(body.description || "").trim(),
        features,
        allowedGateways: allowedGateways && allowedGateways.length > 0 ? allowedGateways : void 0,
        featuredInHero: body.featuredInHero !== void 0 ? Boolean(body.featuredInHero) : true,
        active: body.active !== void 0 ? Boolean(body.active) : true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.products.unshift(newProduct);
      await saveDb(env, db);
      return jsonResponse({ product: newProduct }, 201);
    }
    if (pathname.startsWith("/api/admin/products/")) {
      const productId = pathname.slice("/api/admin/products/".length);
      const db = await loadDb(env);
      if (request.method === "PATCH") {
        const idx = db.products.findIndex((p) => p.id === productId);
        if (idx === -1) return jsonResponse({ error: "Product not found." }, 404);
        const current = db.products[idx];
        const body = await readJsonBody(request) || {};
        const nextName = body.name !== void 0 ? String(body.name).trim() : current.name;
        const next = {
          ...current,
          name: nextName,
          category: body.category !== void 0 ? body.category : current.category,
          planLabel: body.planLabel !== void 0 ? String(body.planLabel).trim() : current.planLabel,
          price: body.price !== void 0 ? Number(body.price) : current.price,
          originalPrice: body.originalPrice !== void 0 ? body.originalPrice === null || String(body.originalPrice) === "" ? void 0 : Number(body.originalPrice) : current.originalPrice,
          offerLabel: body.offerLabel !== void 0 ? String(body.offerLabel || "").trim() || void 0 : current.offerLabel,
          topSelling: body.topSelling !== void 0 ? Boolean(body.topSelling) : current.topSelling,
          inStock: body.inStock !== void 0 ? Boolean(body.inStock) : current.inStock,
          stock: body.stock !== void 0 ? Math.max(0, Math.floor(Number(body.stock))) : current.stock,
          logoKey: body.logoKey !== void 0 ? String(body.logoKey).trim() || resolveBrandKeyFromName(nextName) : current.logoKey,
          logoUrl: body.logoUrl !== void 0 ? String(body.logoUrl || "").trim() || void 0 : current.logoUrl,
          description: body.description !== void 0 ? String(body.description).trim() : current.description,
          features: Array.isArray(body.features) ? body.features.map((f) => String(f).trim()).filter(Boolean) : current.features,
          allowedGateways: body.allowedGateways !== void 0 ? Array.isArray(body.allowedGateways) && body.allowedGateways.length > 0 ? body.allowedGateways.filter(
            (g) => g === "jazzcash" || g === "easypaisa" || g === "binance"
          ) : void 0 : current.allowedGateways,
          featuredInHero: body.featuredInHero !== void 0 ? Boolean(body.featuredInHero) : current.featuredInHero,
          active: body.active !== void 0 ? Boolean(body.active) : current.active
        };
        const validation = validateProductInput({
          name: next.name,
          category: next.category,
          planLabel: next.planLabel,
          price: next.price,
          originalPrice: next.originalPrice,
          stock: next.stock,
          description: next.description,
          features: next.features
        });
        if (!validation.valid) return jsonResponse({ error: validation.error }, 400);
        db.products[idx] = next;
        await saveDb(env, db);
        return jsonResponse({ product: next });
      }
      if (request.method === "DELETE") {
        const nextProducts = db.products.filter((p) => p.id !== productId);
        if (nextProducts.length === db.products.length) {
          return jsonResponse({ error: "Product not found." }, 404);
        }
        db.products = nextProducts;
        await saveDb(env, db);
        return jsonResponse({ ok: true });
      }
    }
    if (pathname.startsWith("/api/admin/orders/")) {
      const orderId = pathname.slice("/api/admin/orders/".length);
      const db = await loadDb(env);
      if (request.method === "PATCH") {
        const order = db.orders.find((o) => o.id === orderId);
        if (!order) return jsonResponse({ error: "Order not found." }, 404);
        const body = await readJsonBody(request) || {};
        if (body.status !== void 0) {
          if (!VALID_ORDER_STATUSES.includes(body.status)) {
            return jsonResponse({ error: "Invalid order status." }, 400);
          }
          order.status = body.status;
        }
        if (body.notes !== void 0) order.notes = String(body.notes).trim();
        await saveDb(env, db);
        return jsonResponse({ order });
      }
      if (request.method === "DELETE") {
        const nextOrders = db.orders.filter((o) => o.id !== orderId);
        if (nextOrders.length === db.orders.length) {
          return jsonResponse({ error: "Order not found." }, 404);
        }
        db.orders = nextOrders;
        await saveDb(env, db);
        return jsonResponse({ ok: true });
      }
    }
    if (pathname === "/api/admin/settings" && request.method === "PATCH") {
      const db = await loadDb(env);
      const body = await readJsonBody(request) || {};
      if (body.whatsappNumber !== void 0) {
        const clean = sanitizeWhatsappPhone(String(body.whatsappNumber));
        if (clean.length < 10) {
          return jsonResponse(
            { error: "WhatsApp number must have at least 10 digits with country code." },
            400
          );
        }
        db.settings.whatsappNumber = clean;
      }
      if (body.whatsappDisplay !== void 0) {
        db.settings.whatsappDisplay = String(body.whatsappDisplay).trim() || `+${db.settings.whatsappNumber}`;
      }
      if (body.supportHours !== void 0) {
        db.settings.supportHours = String(body.supportHours).trim() || "Support 24/7";
      }
      if (body.storeName !== void 0 && body.storeName.trim()) {
        db.settings.storeName = body.storeName.trim();
      }
      if (body.tagline !== void 0) db.settings.tagline = body.tagline.trim();
      if (body.currencySymbol !== void 0 && body.currencySymbol.trim()) {
        db.settings.currencySymbol = body.currencySymbol.trim().slice(0, 6);
      }
      if (body.deliverySla !== void 0) db.settings.deliverySla = body.deliverySla.trim();
      if (body.autoFetchEndpoints !== void 0) {
        if (Array.isArray(body.autoFetchEndpoints)) {
          db.settings.autoFetchEndpoints = parseApiEndpointLines(
            body.autoFetchEndpoints.join("\n")
          );
        } else if (typeof body.autoFetchEndpoints === "string") {
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
            accountTitle: String(updated.accountTitle || "").trim(),
            accountNumber: String(updated.accountNumber || "").trim(),
            instructions: String(updated.instructions || "").trim()
          };
        });
      }
      await saveDb(env, db);
      return jsonResponse({ settings: db.settings });
    }
    if (pathname === "/api/admin/change-password" && request.method === "POST") {
      const body = await readJsonBody(request) || {};
      const db = await loadDb(env);
      const curPass = String(body.currentPassword || "");
      const envPass = env.ADMIN_PASSWORD || "";
      const curValid = db.admin.customized ? await verifyPasswordWeb(curPass, db.admin.passwordHash) : curPass === "ToolCraft@2026" || Boolean(envPass) && curPass === envPass;
      if (!curValid) return jsonResponse({ error: "Current password is incorrect." }, 401);
      const cleanNewPass = String(body.newPassword || "");
      if (cleanNewPass.length < 8) {
        return jsonResponse({ error: "New password must be at least 8 characters." }, 400);
      }
      const cleanUser = String(body.newUsername || db.admin.username).trim();
      if (cleanUser.length < 3) {
        return jsonResponse({ error: "Username must be at least 3 characters." }, 400);
      }
      db.admin.username = cleanUser;
      db.admin.passwordHash = await hashPasswordWeb(cleanNewPass);
      db.admin.customized = true;
      db.admin.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await saveDb(env, db);
      const token = await signSessionToken(db.admin.username, env);
      return jsonResponse(
        { ok: true, username: db.admin.username, token },
        200,
        { "Set-Cookie": buildCookieHeader(token, request) }
      );
    }
    return jsonResponse({ error: "API route not found." }, 404);
  }
};

// ../../root/.npm/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../root/.npm/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-7ufEAH/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../root/.npm/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-7ufEAH/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
