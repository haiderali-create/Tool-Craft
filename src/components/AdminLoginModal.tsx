import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'motion/react';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D11]/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-login-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 440, damping: 32 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E8EE] shadow-[0_30px_70px_-20px_rgba(11,13,17,0.45)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#E5E8EE] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <StoreBrandLogo size="sm" />
            <h2 id="portal-login-title" className="font-display text-base font-bold text-[#0B0D11]">
              Portal Sign In
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portal sign in"
            className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-[#E5E8EE] bg-white text-[#4B5563] hover:text-[#0B0D11] hover:border-[#C5CCD6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Portal Email
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
              placeholder="Enter authorized email"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-[#F8F9FB] border border-[#E5E8EE] rounded-xl text-[#0B0D11] focus:outline-none focus:bg-white focus:border-[#0B0D11] focus:ring-2 focus:ring-[#0B0D11]/10 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
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
                className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-sm bg-[#F8F9FB] border border-[#E5E8EE] rounded-xl text-[#0B0D11] focus:outline-none focus:bg-white focus:border-[#0B0D11] focus:ring-2 focus:ring-[#0B0D11]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#0B0D11] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#0B0D11] rounded-xl shadow-[0_10px_24px_-10px_rgba(11,13,17,0.5)] hover:bg-[#1F242D] disabled:opacity-60 transition-all cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Continue to Portal'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
