import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  CreditCard,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
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

const HERO_EASE = [0.22, 1, 0.36, 1] as const;

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
      className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16 bg-gradient-to-b from-white via-white to-[#FAFBFD] border-b border-[#E5E8EE]"
    >
      {/* Subtle architectural grid & softly drifting emerald ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 tc-hero-grid opacity-90"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-60px] w-[620px] h-[460px] tc-ambient-glow bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.13),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[-120px] w-[420px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(11,13,17,0.04),transparent_70%)]"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Copy Column */}
          <div className={loading || heroProducts.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            {loading ? (
              <div className="h-4 w-56 rounded bg-[#E5E8EE]/70 animate-pulse mb-4" />
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: HERO_EASE }}
                className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#059669] mb-3.5"
              >
                {tagline}
                <span aria-hidden="true" className="mx-2 text-[#CBD2DC]">
                  ·
                </span>
                <span className="tabular-nums text-[#4B5563] normal-case tracking-normal">
                  {toolCount} active {toolCount === 1 ? 'tool' : 'tools'}
                </span>
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: HERO_EASE }}
              className="font-display text-[clamp(2.35rem,4.6vw,3.8rem)] font-bold tracking-[-0.035em] text-[#0B0D11] leading-[1.03] text-balance max-w-2xl"
            >
              Pro Subscriptions &amp;{' '}
              <span className="bg-gradient-to-r from-[#0B0D11] via-[#0F2F26] to-[#059669] bg-clip-text text-transparent">
                Verified AI Tools.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.13, ease: HERO_EASE }}
              className="mt-5 text-base sm:text-[17px] text-[#4B5563] leading-relaxed max-w-xl"
            >
              Pay safely via <span className="font-semibold text-[#0B0D11]">{gatewayNamesText}</span>{' '}
              and send your payment screenshot directly on WhatsApp for instant activation within 15
              minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: HERO_EASE }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#catalog"
                className="group inline-flex items-center justify-center gap-2 min-h-[50px] px-7 py-3 text-sm font-semibold text-white bg-[#0B0D11] rounded-xl shadow-[0_14px_30px_-10px_rgba(11,13,17,0.58)] hover:bg-[#059669] hover:shadow-[0_16px_32px_-10px_rgba(5,150,105,0.55)] transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0D11]"
              >
                Explore Tools
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.a>

              {loading ? (
                <div className="h-[50px] w-48 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] animate-pulse" />
              ) : (
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3 text-sm font-semibold text-[#065F46] bg-white border border-[#C6F6D5] rounded-xl shadow-[0_6px_18px_-8px_rgba(5,150,105,0.28)] hover:bg-[#ECFDF5] hover:border-[#6EE7B7] transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
                >
                  <MessageCircle className="w-4 h-4 text-[#059669]" />
                  WhatsApp {whatsappDisplay}
                </motion.a>
              )}
            </motion.div>
          </div>

          {/* Right Dynamic Obsidian Tool Showcase Stage */}
          {loading ? (
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-[#0B0D11] shadow-[0_24px_60px_-24px_rgba(11,13,17,0.45)] space-y-3">
                <div className="h-3.5 w-32 rounded bg-white/10 animate-pulse" />
                <div className="space-y-3">
                  {[1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="h-[78px] rounded-xl bg-white/[0.05] border border-white/[0.08] animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            heroProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.14, ease: HERO_EASE }}
                className="lg:col-span-5"
              >
                <div className="relative rounded-2xl bg-[#0B0D11] text-white p-5 sm:p-6 shadow-[0_32px_72px_-26px_rgba(11,13,17,0.52)] border border-white/[0.10] overflow-hidden">
                  {/* Subtle top emerald sheen & ambient drifting glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#10B981]/75 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#059669]/24 blur-3xl tc-ambient-glow"
                  />

                  <div className="relative flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                    <div>
                      <p className="text-xs font-semibold tracking-tight text-white">
                        Instant Access Lineup
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/50">
                        Click any tool for direct WhatsApp order
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-[11px] font-semibold text-[#34D399]">
                      15-Min Delivery
                    </span>
                  </div>

                  {heroProducts.length <= 2 ? (
                    <div className="relative space-y-3">
                      {heroProducts.map((item, idx) => {
                        const discountPct = computeDiscountPercent(item.price, item.originalPrice);
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.22 + idx * 0.08,
                              ease: HERO_EASE,
                            }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => onSelectProduct(item)}
                            className="group relative w-full text-left p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 hover:border-[#10B981]/55 transition-colors duration-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="transition-transform duration-200 group-hover:scale-105 shrink-0">
                                  <ToolLogo
                                    name={item.name}
                                    logoKey={item.logoKey}
                                    logoUrl={item.logoUrl}
                                    size="md"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-display text-[15px] font-bold text-white truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-white/55 truncate">
                                    {item.planLabel} · {item.category}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="block font-mono tabular-nums text-[10px] text-white/40 line-through">
                                    {formatCurrency(item.originalPrice, currencySymbol)}
                                  </span>
                                )}
                                <div className="flex items-center justify-end gap-1.5">
                                  <span className="font-mono tabular-nums text-base font-bold text-[#34D399]">
                                    {formatCurrency(item.price, currencySymbol)}
                                  </span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#34D399] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                                </div>
                                {discountPct > 0 && (
                                  <span className="block font-mono text-[10px] font-medium text-white/55">
                                    Save {discountPct}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {heroProducts.map((item, idx) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.2 + idx * 0.05,
                            ease: HERO_EASE,
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectProduct(item)}
                          className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] hover:border-[#10B981]/50 transition-colors duration-150 text-left cursor-pointer"
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
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Bottom Gateway & Guarantee Strip */}
                  <div className="relative mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3 text-[11px] text-white/55">
                    <span className="truncate font-medium text-white/70">{gatewayStripText}</span>
                    <span className="font-mono text-[#34D399] shrink-0">Full Warranty</span>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>

        {/* Refined 3-Column Trust Strip with Crisp Monochrome Icons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28, ease: HERO_EASE }}
          className="mt-12 pt-8 border-t border-[#E5E8EE] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#4B5563]"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3F5F8] border border-[#E5E8EE] inline-flex items-center justify-center text-[#0B0D11] shrink-0">
              <CreditCard className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B0D11] text-[13px]">{gatewayStripText}</p>
              <p className="mt-1 leading-relaxed">
                Copy payment details instantly inside Buy Now with zero forms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3F5F8] border border-[#E5E8EE] inline-flex items-center justify-center text-[#0B0D11] shrink-0">
              <Clock className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B0D11] text-[13px]">
                Direct 15-Min WhatsApp Activation
              </p>
              <p className="mt-1 leading-relaxed">
                Tap WhatsApp directly to share your payment screenshot for fast activation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3F5F8] border border-[#E5E8EE] inline-flex items-center justify-center text-[#0B0D11] shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B0D11] text-[13px]">Verified Full-Term Access</p>
              <p className="mt-1 leading-relaxed">
                Private upgrades and replacement warranty included.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
