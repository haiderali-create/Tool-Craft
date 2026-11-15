import { useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { sanitizeWhatsappPhone } from '../utils/storeLogic';
import { StoreBrandLogo } from './StoreBrandLogo';

interface NavbarProps {
  storeName: string;
  whatsappNumber: string;
}

export function Navbar({ storeName, whatsappNumber }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const cleanWa = sanitizeWhatsappPhone(whatsappNumber);
  const whatsappUrl = `https://wa.me/${cleanWa}`;

  return (
    <header className="sticky top-0 z-30 bg-[#F8F9FA]/95 backdrop-blur-sm border-b border-[#E4E6EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Logo + Wordmark */}
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#111214] whitespace-nowrap shrink-0"
        >
          <StoreBrandLogo size="md" />
          <span>{storeName}</span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#525866]"
        >
          <a
            href="#catalog"
            className="hover:text-[#111214] transition-colors whitespace-nowrap shrink-0"
          >
            Catalog
          </a>
          <a
            href="#categories"
            className="hover:text-[#111214] transition-colors whitespace-nowrap shrink-0"
          >
            Categories
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#111214] transition-colors whitespace-nowrap shrink-0"
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
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#059669] rounded-lg hover:bg-[#047857] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E4E6EB] bg-white text-[#111214] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E4E6EB] bg-white px-4 py-4 space-y-2"
        >
          <a
            href="#catalog"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-2 text-sm font-medium text-[#111214] rounded-md hover:bg-[#F8F9FA]"
          >
            Catalog
          </a>
          <a
            href="#categories"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-2 text-sm font-medium text-[#111214] rounded-md hover:bg-[#F8F9FA]"
          >
            Categories
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-2 text-sm font-medium text-[#111214] rounded-md hover:bg-[#F8F9FA]"
          >
            How It Works
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="w-full mt-2 min-h-[44px] px-4 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
