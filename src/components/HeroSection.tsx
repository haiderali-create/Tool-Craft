import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import type { Product } from '../types';
import { computeDiscountPercent, formatCurrency } from '../utils/storeLogic';
import { ToolLogo } from './ToolLogo';

interface HeroSectionProps {
  tagline: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  currencySymbol?: string;
  toolCount: number;
  heroProducts: Product[];
  onSelectProduct: (product: Product) => void;
  gatewayNamesText?: string;
  gatewayStripText?: string;
  loading?: boolean;
}

export function HeroSection({
  tagline,
  whatsappDisplay,
  whatsappNumber,
  currencySymbol = 'Rs.',
  toolCount,
  heroProducts,
  onSelectProduct,
  gatewayNamesText = 'Easypaisa or Binance',
  gatewayStripText = 'Easypaisa · Binance',
  loading = false,
}: HeroSectionProps) {
  const cleanWa = whatsappNumber.replace(/[^\d]/g, '');

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16 bg-white border-b border-[#E5E8EE]"
    >
      {/* Subtle architectural grid & soft emerald ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 tc-hero-grid opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-0 w-[560px] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.10),transparent_68%)]"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Copy Column */}
          <div className={loading || heroProducts.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            {loading ? (
              <div className="h-4 w-56 rounded bg-[#E5E8EE]/70 animate-pulse mb-4" />
            ) : (
              <p className="text-xs sm:text-[13px] font-semibold text-[#059669] tracking-tight mb-3">
                {tagline}
                <span aria-hidden="true" className="mx-2 text-[#CBD2DC]">
                  ·
                </span>
                <span className="font-mono tabular-nums text-[#4B5563]">
                  {toolCount} active {toolCount === 1 ? 'tool' : 'tools'}
                </span>
              </p>
            )}

            <h1 className="font-display text-[clamp(2.25rem,4.4vw,3.65rem)] font-bold tracking-[-0.03em] text-[#0B0D11] leading-[1.05] text-balance max-w-2xl">
              Pro Subscriptions &amp; Verified AI Tools.
            </h1>

            <p className="mt-5 text-base sm:text-[17px] text-[#4B5563] leading-relaxed max-w-xl">
              Pay safely via <span className="font-medium text-[#0B0D11]">{gatewayNamesText}</span>
              , upload your payment screenshot, and get instant activation on WhatsApp within 15
              minutes.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 text-sm font-semibold text-white bg-[#0B0D11] rounded-xl shadow-[0_12px_28px_-10px_rgba(11,13,17,0.55)] hover:bg-[#059669] hover:shadow-[0_14px_30px_-10px_rgba(5,150,105,0.55)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0D11]"
              >
                Explore Tools
                <ArrowRight className="w-4 h-4" />
              </a>

              {loading ? (
                <div className="h-[48px] w-48 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] animate-pulse" />
              ) : (
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-semibold text-[#065F46] bg-white border border-[#D1FAE5] rounded-xl shadow-[0_4px_14px_-6px_rgba(5,150,105,0.22)] hover:bg-[#ECFDF5] hover:border-[#6EE7B7] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
                >
                  <MessageCircle className="w-4 h-4 text-[#059669]" />
                  WhatsApp {whatsappDisplay}
                </a>
              )}
            </div>
          </div>

          {/* Right Dynamic Obsidian Tool Showcase Stage */}
          {loading ? (
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-[#0B0D11] shadow-[0_24px_60px_-24px_rgba(11,13,17,0.45)] space-y-3">
                <div className="h-3.5 w-32 rounded bg-white/10 animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      className="h-[72px] rounded-xl bg-white/[0.05] border border-white/[0.08] animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            heroProducts.length > 0 && (
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl bg-[#0B0D11] text-white p-5 sm:p-6 shadow-[0_28px_64px_-24px_rgba(11,13,17,0.45)] border border-white/[0.08] overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#059669]/18 blur-3xl"
                  />

                  <div className="relative flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                    <p className="text-xs font-semibold text-white/85">Instant Access Lineup</p>
                    <span className="font-mono tabular-nums text-[11px] text-[#34D399]">
                      15-Min Delivery
                    </span>
                  </div>

                  {heroProducts.length === 1 ? (
                    (() => {
                      const item = heroProducts[0];
                      const discountPct = computeDiscountPercent(item.price, item.originalPrice);
                      return (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(item)}
                          className="group relative w-full text-left p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-[#10B981]/50 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <ToolLogo
                                name={item.name}
                                logoKey={item.logoKey}
                                logoUrl={item.logoUrl}
                                size="md"
                              />
                              <div className="min-w-0">
                                <p className="font-display text-base font-bold text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-white/60 truncate">
                                  {item.planLabel} · {item.category}
                                </p>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-white/45 group-hover:text-[#34D399] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                          </div>

                          <p className="mt-3 text-xs text-white/70 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>

                          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-end justify-between gap-3">
                            <div>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="block font-mono tabular-nums text-[11px] text-white/45 line-through">
                                  {formatCurrency(item.originalPrice, currencySymbol)}
                                </span>
                              )}
                              <span className="font-mono tabular-nums text-lg font-bold text-white">
                                {formatCurrency(item.price, currencySymbol)}
                              </span>
                              {discountPct > 0 && (
                                <span className="ml-2 font-mono text-[11px] font-semibold text-[#34D399]">
                                  {discountPct}% Off
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-[#34D399] group-hover:underline">
                              Quick Checkout
                            </span>
                          </div>
                        </button>
                      );
                    })()
                  ) : (
                    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {heroProducts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectProduct(item)}
                          className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] hover:border-[#10B981]/50 transition-all duration-150 text-left cursor-pointer"
                        >
                          <ToolLogo
                            name={item.name}
                            logoKey={item.logoKey}
                            logoUrl={item.logoUrl}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[11px] font-mono tabular-nums text-[#34D399] truncate">
                              {formatCurrency(item.price, currencySymbol)}
                            </p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/35 group-hover:text-[#34D399] transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Clean 3-Column Trust Strip */}
        <div className="mt-10 pt-7 border-t border-[#E5E8EE] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#4B5563]">
          <div>
            <p className="font-semibold text-[#0B0D11] text-[13px]">{gatewayStripText}</p>
            <p className="mt-1 leading-relaxed">
              Pay directly with instant gateway details on Buy Now.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#0B0D11] text-[13px]">
              15-Min WhatsApp Screenshot Rule
            </p>
            <p className="mt-1 leading-relaxed">
              Upload screenshot at checkout &amp; send on WhatsApp within 15 minutes.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#0B0D11] text-[13px]">Verified Full-Term Access</p>
            <p className="mt-1 leading-relaxed">
              Private upgrades and replacement warranty included.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
