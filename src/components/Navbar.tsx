import { useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { sanitizeWhatsappPhone } from '../utils/storeLogic';
import { StoreBrandLogo } from './StoreBrandLogo';

interface NavbarProps {
  storeName: string;
  whatsappNumber: string;
  gatewayNamesText?: string;
  supportHours?: string;
  toolCount?: number;
}

export function Navbar({
  storeName,
  whatsappNumber,
  gatewayNamesText = 'Easypaisa or Binance',
  supportHours = 'Support 24/7',
  toolCount = 0,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const cleanWa = sanitizeWhatsappPhone(whatsappNumber);
  const whatsappUrl = `https://wa.me/${cleanWa}`;

  const announcementItems = [
    `${storeName} Official Pro Subscriptions`,
    'Instant 15-Minute WhatsApp Activation',
    `Safe Checkout via ${gatewayNamesText}`,
    'Verified Private Upgrades & Full-Term Warranty',
    toolCount > 0
      ? `${toolCount} Active AI & Creative Tool${toolCount === 1 ? '' : 's'} Ready Now`
      : 'Verified AI & Creative Tools Ready Now',
    supportHours,
  ];

  return (
    <header className="sticky top-0 z-30">
      {/* Continuous Announcement Marquee Bar */}
      <div
        aria-label="Store announcements"
        className="relative overflow-hidden bg-[#0B0D11] text-[#F3F4F6] border-b border-white/10 h-9 flex items-center select-none"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-[#0B0D11] to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-[#0B0D11] to-transparent z-10"
        />
        <div data-testid="header-marquee" className="tc-marquee-track">
          {[0, 1].map((dupIndex) => (
            <div
              key={dupIndex}
              aria-hidden={dupIndex === 1}
              className="flex items-center shrink-0"
            >
              {announcementItems.map((item, idx) => (
                <span
                  key={`${dupIndex}-${idx}`}
                  className="inline-flex items-center text-[11px] sm:text-xs font-medium tracking-[0.015em] text-[#E5E7EB] whitespace-nowrap"
                >
                  <span className="px-4 sm:px-6">{item}</span>
                  <span aria-hidden="true" className="text-[#10B981]/85 text-[10px]">
                    ✦
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main 3-Zone Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#E5E8EE] shadow-[0_1px_0_rgba(11,13,17,0.02)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Logo + Wordmark */}
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#0B0D11] whitespace-nowrap shrink-0"
          >
            <StoreBrandLogo size="md" />
            <span>{storeName}</span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4B5563]"
          >
            <a
              href="#catalog"
              className="relative py-1 hover:text-[#0B0D11] transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-[#0B0D11] hover:after:w-full after:transition-all after:duration-200"
            >
              Catalog
            </a>
            <a
              href="#categories"
              className="relative py-1 hover:text-[#0B0D11] transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-[#0B0D11] hover:after:w-full after:transition-all after:duration-200"
            >
              Categories
            </a>
            <a
              href="#how-it-works"
              className="relative py-1 hover:text-[#0B0D11] transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-[#0B0D11] hover:after:w-full after:transition-all after:duration-200"
            >
              How It Works
            </a>
          </nav>

          {/* Zone 3: Direct WhatsApp action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#059669] rounded-xl shadow-[0_6px_16px_-6px_rgba(5,150,105,0.55)] hover:bg-[#047857] hover:-translate-y-[1px] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[#E5E8EE] bg-white text-[#0B0D11] shadow-xs cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[#E5E8EE] bg-white px-4 py-4 space-y-1.5 shadow-lg"
          >
            <a
              href="#catalog"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 text-sm font-medium text-[#0B0D11] rounded-lg hover:bg-[#F3F4F6]"
            >
              Catalog
            </a>
            <a
              href="#categories"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 text-sm font-medium text-[#0B0D11] rounded-lg hover:bg-[#F3F4F6]"
            >
              Categories
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 text-sm font-medium text-[#0B0D11] rounded-lg hover:bg-[#F3F4F6]"
            >
              How It Works
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="w-full mt-2 min-h-[44px] px-4 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
