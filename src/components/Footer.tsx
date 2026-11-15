import { Lock } from 'lucide-react';
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
    <footer className="bg-[#F8F9FA] border-t border-[#E4E6EB] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#E4E6EB]">
          <div>
            <div className="inline-flex items-center gap-2.5">
              <StoreBrandLogo size="sm" />
              <p className="font-display text-lg font-bold text-[#111214]">{storeName}</p>
            </div>
            <p className="mt-2 text-sm text-[#525866] max-w-xs leading-relaxed">{tagline}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#111214] mb-3">Categories</p>
            <ul className="space-y-2 text-sm text-[#525866]">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <a
                    href="#catalog"
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-[#111214] transition-colors"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#111214] mb-3">Direct Support</p>
            <p className="text-sm text-[#525866]">
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#111214] hover:text-[#059669] underline underline-offset-4"
              >
                {whatsappDisplay}
              </a>
            </p>
            <p className="mt-2 text-xs font-semibold text-[#059669]">{supportHours}</p>
          </div>
        </div>

        {/* Bottom Copyright & Discreet Hidden Admin Trigger */}
        <div className="pt-6 flex items-center justify-between gap-4 text-xs text-[#8A92A0]">
          <span>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </span>

          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label="Admin Portal"
            title="Admin Portal (Ctrl+Shift+A)"
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-[#B4BAC5] hover:text-[#525866] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#111214]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[11px]">Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
