import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  signInAdminWithEmailPassword,
} from '../services/firestoreStore';
import { StoreBrandLogo } from './StoreBrandLogo';

export type AdminAuthMode = 'firebase' | 'server';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (username: string, token?: string, mode?: AdminAuthMode) => void;
}

export function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = username.trim().toLowerCase();
    if (!identifier || !password) return;

    if (identifier !== BOOTSTRAPPED_ADMIN_EMAIL) {
      setError('Access denied. Only the authorized Admin email can sign in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try backend /api/admin/login first when a server is active
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) {
            setUsername('');
            setPassword('');
            onSuccess(data.username, data.token, 'server');
            return;
          }
        }
      } catch {
        // Static hosts (Netlify / GitHub Pages) have no server endpoint; fall back to Firebase
      }

      const result = await signInAdminWithEmailPassword(identifier, password);
      setUsername('');
      setPassword('');
      onSuccess(result.username, undefined, 'firebase');
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      if (raw.includes('auth/configuration-not-found')) {
        setError(
          'Firebase Authentication is not enabled yet for this project. Open Firebase Console → Authentication → click "Get started" → enable Email/Password & add your Admin user.'
        );
      } else if (raw.includes('auth/operation-not-allowed')) {
        setError(
          'Enable Email/Password sign-in in Firebase Console (Authentication → Sign-in method).'
        );
      } else if (
        raw.includes('auth/invalid-credential') ||
        raw.includes('auth/wrong-password') ||
        raw.includes('auth/user-not-found')
      ) {
        setError('Invalid admin email or password.');
      } else if (raw.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please wait a moment and try again.');
      } else {
        setError(raw || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111214]/65 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="w-full max-w-sm bg-white rounded-xl border border-[#E4E6EB] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StoreBrandLogo size="sm" />
            <h2 id="admin-login-title" className="font-display text-base font-bold text-[#111214]">
              Admin Portal Sign In
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin login"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E4E6EB] text-[#525866] hover:text-[#111214] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-medium text-[#525866] mb-1.5"
            >
              Admin Email
            </label>
            <input
              id="admin-username"
              type="email"
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter authorized admin email"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-[#F8F9FA] border border-[#E4E6EB] rounded-lg text-[#111214] focus:outline-none focus:border-[#111214]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#525866] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-sm bg-[#F8F9FA] border border-[#E4E6EB] rounded-lg text-[#111214] focus:outline-none focus:border-[#111214]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-md text-[#525866] hover:text-[#111214] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#111214] rounded-lg hover:bg-[#272A30] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
}
