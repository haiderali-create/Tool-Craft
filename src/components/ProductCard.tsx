import { ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../types';
import { computeDiscountPercent, formatCurrency, formatUsdAmount } from '../utils/storeLogic';
import { ToolLogo } from './ToolLogo';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onBuyNow: (product: Product) => void;
}

export function ProductCard({ product, currencySymbol, onBuyNow }: ProductCardProps) {
  const available = product.inStock;
  const discountPct = computeDiscountPercent(product.price, product.originalPrice);

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="group relative w-full flex flex-col bg-white border border-[#E5E8EE] rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(11,13,17,0.06)] transition-[border-color,box-shadow] duration-200 hover:border-[#B8C2CE] hover:shadow-[0_26px_52px_-22px_rgba(11,13,17,0.22)] overflow-hidden"
    >
      {/* Subtle top emerald highlight reveal on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#059669] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />

      {/* Top Row: Official Tool Logo + Clean Offer / Top Selling Kicker */}
      <div className="flex items-start justify-between gap-3">
        <div className="transition-transform duration-200 group-hover:scale-[1.05]">
          <ToolLogo
            name={product.name}
            logoKey={product.logoKey}
            logoUrl={product.logoUrl}
            size="lg"
          />
        </div>

        <div className="text-right min-w-0">
          {(product.topSelling || product.offerLabel || discountPct > 0) && (
            <p className="text-xs font-semibold text-[#059669] truncate">
              {[
                product.topSelling ? 'Top Selling' : null,
                product.offerLabel || null,
                discountPct > 0 ? `${discountPct}% Off` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          <p className="mt-0.5 text-xs font-medium text-[#6B7280] truncate">{product.category}</p>
        </div>
      </div>

      {/* Tool Title & Plan */}
      <div className="mt-5">
        <h3 className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#0B0D11] leading-snug group-hover:text-[#047857] transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#6B7280]">{product.planLabel}</p>
      </div>

      {/* Description */}
      <p
        className={`mt-3 text-sm text-[#4B5563] leading-relaxed line-clamp-2 ${
          product.features.length === 0 ? 'mb-5' : ''
        }`}
      >
        {product.description}
      </p>

      {/* Feature List with Crisp Checkmarks */}
      {product.features.length > 0 && (
        <ul className="mt-4 mb-5 pt-4 border-t border-[#F0F2F5] space-y-2.5 text-xs text-[#374151]">
          {product.features.slice(0, 3).map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2 min-w-0">
              <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" aria-hidden="true" />
              <span className="truncate">{feat}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Price (Current + Last Price) & Buy Now CTA */}
      <div className="mt-auto pt-5 border-t border-[#F0F2F5] flex items-end justify-between gap-4">
        <div className="min-w-0">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
              <span className="text-[#9CA3AF] line-through">
                {formatCurrency(product.originalPrice, currencySymbol)}
              </span>
              {discountPct > 0 && (
                <span className="text-[11px] font-semibold text-[#059669]">
                  -{discountPct}%
                </span>
              )}
            </div>
          )}
          <div className="font-mono tabular-nums text-[25px] leading-tight font-bold tracking-tight text-[#0B0D11]">
            {formatCurrency(product.price, currencySymbol)}
          </div>
          <div className="mt-0.5 font-mono tabular-nums text-xs font-semibold text-[#059669]">
            {formatUsdAmount(product.price)} USD
          </div>
        </div>

        <motion.button
          type="button"
          disabled={!available}
          whileTap={available ? { scale: 0.96 } : undefined}
          onClick={() => onBuyNow(product)}
          aria-label={`Buy ${product.name} now`}
          className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0D11] ${
            !available
              ? 'bg-[#E5E8EE] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#0B0D11] text-white shadow-[0_10px_22px_-8px_rgba(11,13,17,0.48)] hover:bg-[#059669] hover:shadow-[0_12px_24px_-8px_rgba(5,150,105,0.55)]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{available ? 'Buy Now' : 'Unavailable'}</span>
          {available && (
            <ArrowUpRight className="w-3.5 h-3.5 opacity-75 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}
