import { useEffect, useState } from 'react';
import { resolveBrandKeyFromName } from '../utils/storeLogic';

interface ToolLogoProps {
  name: string;
  logoKey?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 rounded-lg',
  md: 'w-12 h-12 rounded-xl',
  lg: 'w-14 h-14 rounded-xl',
};

const SVG_SIZES = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
};

function isUsableLogoUrl(url?: string): url is string {
  const cleanUrl = url?.trim();
  if (!cleanUrl) return false;
  if (
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('/')
  ) {
    return true;
  }
  if (cleanUrl.startsWith('data:image/')) {
    const commaIdx = cleanUrl.indexOf(',');
    if (commaIdx === -1) return false;
    const meta = cleanUrl.slice(0, commaIdx).toLowerCase();
    const payload = cleanUrl.slice(commaIdx + 1).trim();
    if (!payload) return false;
    if (meta.includes(';base64')) {
      // Firestore logoUrl cap (1024 chars) truncates oversized uploads; detect invalid/truncated base64 safely
      if (cleanUrl.length >= 1024 && !meta.includes('svg')) return false;
      try {
        atob(payload);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function ToolLogo({ name, logoKey, logoUrl, size = 'md' }: ToolLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [logoUrl]);

  const key = logoKey || resolveBrandKeyFromName(name);
  const boxClass = SIZE_CLASSES[size];
  const iconClass = SVG_SIZES[size];

  const cleanUrl = logoUrl?.trim();
  if (cleanUrl && !imgFailed && isUsableLogoUrl(cleanUrl)) {
    return (
      <div
        className={`${boxClass} bg-white border border-[#E2E5EA] flex items-center justify-center overflow-hidden p-1.5 shrink-0`}
      >
        <img
          src={cleanUrl}
          alt={`${name} logo`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain rounded"
        />
      </div>
    );
  }

  // Crisp official-style vector brand marks
  if (key === 'capcut') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#0D0F12] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M4 7.5L16.5 14.5L20 12.5V16.5L16.5 18.5L4 11.5V7.5Z"
            fill="currentColor"
          />
          <path
            d="M4 16.5L16.5 9.5L20 11.5V7.5L16.5 5.5L4 12.5V16.5Z"
            fill="currentColor"
            opacity="0.88"
          />
        </svg>
      </div>
    );
  }

  if (key === 'gemini') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" className={iconClass}>
          <defs>
            <linearGradient id="geminiGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="55%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path
            fill="url(#geminiGrad)"
            d="M12 2C12.3 7.2 16.8 11.7 22 12C16.8 12.3 12.3 16.8 12 22C11.7 16.8 7.2 12.3 2 12C7.2 11.7 11.7 7.2 12 2Z"
          />
        </svg>
      </div>
    );
  }

  if (key === 'canva') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#00C4CC] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M16.6 15.2C15.5 16.8 13.8 17.8 11.8 17.8C8.6 17.8 6.4 15.4 6.4 12C6.4 8.5 8.8 6.2 12 6.2C14.1 6.2 15.7 7.1 16.5 8.6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (key === 'elevenlabs') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#111214] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <rect x="7" y="5" width="3.5" height="14" rx="1" />
          <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
        </svg>
      </div>
    );
  }

  if (key === 'midjourney') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#181B20] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M6 16C9 10 12 6 12 6C12 6 13.5 11 16.5 15.5M4 17.5H20M9 15.5C10.5 12.5 14 9 16 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (key === 'perplexity') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#0F766E] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M12 3V21M5 8L12 12L19 8M5 16L12 12L19 16M7 4V11M17 4V11"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (key === 'adobe') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#DC2626] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M14.2 5H20V19L14.2 5ZM9.8 5H4V19L9.8 5ZM12 10.2L15.6 19H13.1L12 16.2H9.6L12 10.2Z" />
        </svg>
      </div>
    );
  }

  if (key === 'cursor') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#111214] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M12 3V12L20 16.5M12 12L4 16.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  if (key === 'suno' || key === 'spotify') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#059669] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M6 10C9.5 8.5 14.5 8.5 18 10.5M7 13.5C10 12.2 14 12.2 17 13.8M8.5 16.8C10.8 15.8 13.4 15.8 15.5 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (key === 'runway') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#0D0F12] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M5 17V7H12.5C15 7 16.5 8.4 16.5 10.5C16.5 12.2 15.4 13.5 13.6 13.8L17.5 17H14.2L10.8 14H7.8V17H5Z"
            fill="currentColor"
          />
          <circle cx="18" cy="7.5" r="2" fill="#10B981" />
        </svg>
      </div>
    );
  }

  if (key === 'claude') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#D97757] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M12 3.5V20.5M5 7L19 17M19 7L5 17M3.5 12H20.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (key === 'figma') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#1E1E1E] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <circle cx="14" cy="12" r="2.5" fill="#1ABCFE" />
          <path d="M9.5 4.5H12V9.5H9.5A2.5 2.5 0 0 1 9.5 4.5Z" fill="#F24E1E" />
          <path d="M12 4.5H14.5A2.5 2.5 0 0 1 14.5 9.5H12V4.5Z" fill="#FF7262" />
          <path d="M9.5 9.5H12V14.5H9.5A2.5 2.5 0 0 1 9.5 9.5Z" fill="#A259FF" />
          <path d="M9.5 14.5H12V17A2.5 2.5 0 1 1 9.5 14.5Z" fill="#0ACF83" />
        </svg>
      </div>
    );
  }

  if (key === 'notion') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-white border border-[#E2E5EA] text-[#0D0F12] flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.9" />
          <path d="M8.5 15.5V8.5L15.5 15.5V8.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (key === 'grammarly') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#15C39A] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M17.5 13.5A6 6 0 1 1 16 7.5M17.5 13.5H13M17.5 13.5V17.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (key === 'youtube' || key === 'netflix') {
    return (
      <div
        aria-hidden="true"
        className={`${boxClass} bg-[#DC2626] text-white flex items-center justify-center shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M9 7.5L17 12L9 16.5V7.5Z" />
        </svg>
      </div>
    );
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      aria-hidden="true"
      className={`${boxClass} bg-[#111214] text-white flex items-center justify-center shrink-0 font-display font-bold text-sm`}
    >
      {initials || 'AI'}
    </div>
  );
}
