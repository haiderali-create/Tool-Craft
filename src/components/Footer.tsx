import { BadgeCheck, Lock, MessageCircle } from 'lucide-react';
import type { ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../utils/storeLogic';
import { StoreBrandLogo } from './StoreBrandLogo';

interface FooterProps {
  storeName: string;
  tagline: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  supportHours?: string;
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  onOpenAdmin: () => void;
}

export function Footer({
  storeName,
  tagline,
  whatsappDisplay,
  whatsappNumber,
  supportHours = 'Support 24/7',
  onSelectCategory,
  onOpenAdmin,
}: FooterProps) {
  const cleanWa = whatsappNumber.replace(/[^\d]/g, '');

  return (
    <footer className="relative overflow-hidden bg-[#0B0D11] text-[#D1D5DB] border-t border-white/10 pt-14 pb-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[540px] h-48 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.12),transparent_70%)]"
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2.5">
              <span className="rounded-lg ring-1 ring-white/15 inline-flex">
                <StoreBrandLogo size="sm" />
              </span>
              <div className="flex flex-col leading-none">
                <p className="font-display text-lg font-bold tracking-tight text-white">
                  {storeName}
                </p>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-semibold tracking-[0.02em] text-[#34D399]">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#34D399] shrink-0" aria-hidden="true" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-[#9CA3AF] max-w-xs leading-relaxed">{tagline}</p>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] mb-3.5">
              Categories
            </p>
            <ul className="space-y-2.5 text-sm text-[#D1D5DB]">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <a
                    href="#catalog"
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] mb-3.5">
              Direct Support
            </p>
            <p className="text-sm text-[#D1D5DB]">
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono tabular-nums text-white hover:text-[#34D399] underline underline-offset-4 decoration-white/25 hover:decoration-[#34D399] transition-colors"
              >
                {whatsappDisplay}
              </a>
            </p>
            <p className="mt-2 text-xs font-semibold text-[#34D399]">{supportHours}</p>
            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-white/[0.06] border border-white/15 rounded-xl hover:bg-[#059669] hover:border-[#059669] transition-all whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7280]">
          <span>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </span>
          <span className="text-[11px] text-[#6B7280]">
            Verified Digital Subscriptions · Instant Delivery
          </span>
        </div>

        {/* Discreet Bottom-Most Portal Access (kept clear of bottom-right floating WhatsApp) */}
        <div className="pt-3 border-t border-white/[0.05] flex justify-start">
          <button
            type="button"
            data-testid="footer-portal-trigger"
            onClick={onOpenAdmin}
            aria-label="Portal"
            title="Portal"
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] tracking-wide text-white/20 hover:text-white/55 transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-white/40"
          >
            <Lock className="w-2.5 h-2.5" aria-hidden="true" />
            <span>Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
