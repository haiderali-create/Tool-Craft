import { BRAND_PRESETS } from '../../src/data/defaultStoreSeed.ts';
import { maskApiKey, parseKeyList } from '../../src/utils/storeLogic.ts';
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
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

  const keys = getEnvGeminiKeys();
  return jsonResponse({
    serverGeminiKeyCount: keys.length,
    maskedKeys: keys.map(maskApiKey),
    brandPresetCount: Object.keys(BRAND_PRESETS).length,
  });
}
