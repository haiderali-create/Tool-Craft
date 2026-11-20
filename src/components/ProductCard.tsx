import { MessageCircle } from 'lucide-react';
import type { Product } from '../types';
import { computeDiscountPercent, formatCurrency } from '../utils/storeLogic';
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
    <article className="group w-full flex flex-col bg-white border border-[#E5E8EE] rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(11,13,17,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#C5CCD6] hover:shadow-[0_22px_44px_-22px_rgba(11,13,17,0.18)]">
      {/* Top Row: Official Tool Logo + Clean Offer / Top Selling Kicker */}
      <div className="flex items-start justify-between gap-3">
        <div className="transition-transform duration-200 group-hover:scale-[1.03]">
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
          <p className="mt-0.5 text-xs text-[#6B7280] truncate">{product.category}</p>
        </div>
      </div>

      {/* Tool Title & Plan */}
      <div className="mt-5">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-[#0B0D11] leading-snug">
          {product.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#6B7280]">{product.planLabel}</p>
      </div>

      {/* Description */}
      <p className={`mt-3 text-sm text-[#4B5563] leading-relaxed line-clamp-2 ${product.features.length === 0 ? 'mb-5' : ''}`}>
        {product.description}
      </p>

      {/* Feature List */}
      {product.features.length > 0 && (
        <ul className="mt-4 mb-5 pt-4 border-t border-[#F0F2F5] space-y-2 text-xs text-[#4B5563]">
          {product.features.slice(0, 3).map((feat, idx) => (
            <li key={idx} className="truncate">
              <span aria-hidden="true" className="text-[#059669] mr-1.5 font-semibold">
                –
              </span>
              {feat}
            </li>
          ))}
        </ul>
      )}

      {/* Price (Current + Last Price) & Buy Now CTA */}
      <div className="mt-auto pt-5 border-t border-[#F0F2F5] flex items-end justify-between gap-4">
        <div className="min-w-0">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="font-mono tabular-nums text-xs text-[#9CA3AF] line-through">
              {formatCurrency(product.originalPrice, currencySymbol)}
            </div>
          )}
          <div className="font-mono tabular-nums text-2xl font-bold tracking-tight text-[#0B0D11]">
            {formatCurrency(product.price, currencySymbol)}
          </div>
        </div>

        <button
          type="button"
          disabled={!available}
          onClick={() => onBuyNow(product)}
          aria-label={`Buy ${product.name} now`}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0D11] ${
            !available
              ? 'bg-[#E5E8EE] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#0B0D11] text-white shadow-[0_8px_20px_-8px_rgba(11,13,17,0.45)] hover:bg-[#059669] hover:shadow-[0_10px_22px_-8px_rgba(5,150,105,0.5)]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {available ? 'Buy Now' : 'Unavailable'}
        </button>
      </div>
    </article>
  );
}
