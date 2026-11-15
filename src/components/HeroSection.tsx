import { ArrowRight, MessageCircle } from 'lucide-react';
import type { Product } from '../types';
import { ToolLogo } from './ToolLogo';

interface HeroSectionProps {
  tagline: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  toolCount: number;
  heroProducts: Product[];
  onSelectProduct: (product: Product) => void;
  gatewayNamesText?: string;
  gatewayStripText?: string;
}

export function HeroSection({
  tagline,
  whatsappDisplay,
  whatsappNumber,
  toolCount,
  heroProducts,
  onSelectProduct,
  gatewayNamesText = 'Easypaisa or Binance',
  gatewayStripText = 'Easypaisa · Binance',
}: HeroSectionProps) {
  const cleanWa = whatsappNumber.replace(/[^\d]/g, '');

  return (
    <section id="top" className="pt-8 pb-10 sm:pt-12 sm:pb-12 bg-white border-b border-[#E2E5EA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Copy Column */}
          <div className={heroProducts.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <p className="text-xs font-semibold text-[#059669] mb-2.5">
              {tagline} · {toolCount} active tools
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#0D0F12] leading-[1.08] text-balance">
              Pro Subscriptions &amp; Verified AI Tools.
            </h1>
            <p className="mt-4 text-base text-[#525866] leading-relaxed max-w-xl">
              Pay safely via {gatewayNamesText}, upload your payment screenshot, and get instant
              activation on WhatsApp within 15 minutes.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 text-sm font-semibold text-white bg-[#0D0F12] rounded-lg hover:bg-[#272A30] transition-colors whitespace-nowrap shrink-0"
              >
                Explore Tools
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 text-sm font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg hover:bg-[#D1FAE5] transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp {whatsappDisplay}
              </a>
            </div>
          </div>

          {/* Right Dynamic Tool Showcase Matrix (synced with active Admin inventory) */}
          {heroProducts.length > 0 && (
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {heroProducts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectProduct(item)}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E2E5EA] hover:border-[#0D0F12] transition-colors text-left cursor-pointer"
                  >
                    <ToolLogo
                      name={item.name}
                      logoKey={item.logoKey}
                      logoUrl={item.logoUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0D0F12] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#525866] truncate">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clean 3-Column Trust Strip */}
        <div className="mt-8 pt-6 border-t border-[#E2E5EA] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs text-[#525866]">
          <div>
            <span className="font-semibold text-[#0D0F12]">{gatewayStripText}</span>
            <p className="mt-0.5">Pay directly with instant gateway details on Buy Now.</p>
          </div>
          <div>
            <span className="font-semibold text-[#0D0F12]">15-Min WhatsApp Screenshot Rule</span>
            <p className="mt-0.5">
              Upload screenshot at checkout &amp; send on WhatsApp within 15 minutes.
            </p>
          </div>
          <div>
            <span className="font-semibold text-[#0D0F12]">Verified Full-Term Access</span>
            <p className="mt-0.5">Private upgrades and replacement warranty included.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
