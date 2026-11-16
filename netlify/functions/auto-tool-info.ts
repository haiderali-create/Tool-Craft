import { GoogleGenAI, Type } from '@google/genai';
import { BRAND_PRESETS } from '../../src/data/defaultStoreSeed.ts';
import {
  buildLogoCandidateUrls,
  normalizeDomainInput,
  parseKeyList,
  PRODUCT_CATEGORIES,
  resolveBrandKeyFromName,
} from '../../src/utils/storeLogic.ts';
import type { ProductCategory } from '../../src/types.ts';
import { verifyFirebaseAdminBearer } from '../../server/firebaseAdminVerify.ts';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

function getEnvGeminiKeys(): string[] {
  return [
    ...parseKeyList(process.env.GEMINI_API_KEYS),
    ...parseKeyList(process.env.GEMINI_API_KEY),
  ].filter((key, idx, arr) => arr.indexOf(key) === idx);
}

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const verifiedEmail = await verifyFirebaseAdminBearer(
    req.headers.get('Authorization'),
    process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL
  );

  if (!verifiedEmail) {
    return jsonResponse({ error: 'Unauthorized. Admin authentication required.' }, 401);
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string; domain?: string };
  const rawName = String(body.name || '').trim();
  const explicitDomain = normalizeDomainInput(String(body.domain || ''));
  if (rawName.length < 2) {
    return jsonResponse({ error: 'Enter a tool name first.' }, 400);
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

  const geminiKeys = getEnvGeminiKeys();
  for (let i = 0; i < geminiKeys.length; i += 1) {
    const apiKey = geminiKeys[i];
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide concise storefront product details for the digital subscription tool named "${rawName}". Choose the closest category from: ${PRODUCT_CATEGORIES.join(
          ', '
        )}. Include the official website domain (e.g. runwayml.com) so we can fetch its logo.`,
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
      // Key failed or rate-limited — try next key
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
