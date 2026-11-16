const DEFAULT_FIREBASE_WEB_API_KEY = 'AIzaSyDHz0lwtJH-ti1PGG6tFdKkSbSGDUrk8hw';
const DEFAULT_ADMIN_EMAIL = 'ha933123456789@gmail.com';

export async function verifyFirebaseAdminBearer(
  authHeader: string | null | undefined,
  envApiKey?: string,
  envAdminEmail?: string
): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.slice(7).trim();
  if (!idToken || idToken.split('.').length !== 3) return null;

  const firebaseApiKey = (envApiKey || DEFAULT_FIREBASE_WEB_API_KEY).trim();
  const allowedEmail = (envAdminEmail || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
        firebaseApiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user?.email || !user.emailVerified) return null;
    if (user.email.toLowerCase() !== allowedEmail) return null;
    return user.email.toLowerCase();
  } catch {
    return null;
  }
}
