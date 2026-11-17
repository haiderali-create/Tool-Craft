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
    <article className="group w-full flex flex-col bg-white border border-[#E2E5EA] rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8BFC9] hover:shadow-sm">
      {/* Top Row: Official Tool Logo + Clean Offer / Top Selling Kicker */}
      <div className="flex items-start justify-between gap-3">
        <ToolLogo
          name={product.name}
          logoKey={product.logoKey}
          logoUrl={product.logoUrl}
          size="lg"
        />

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
          <p className="mt-0.5 text-xs text-[#525866] truncate">{product.category}</p>
        </div>
      </div>

      {/* Tool Title & Plan */}
      <div className="mt-4">
        <h3 className="font-display text-lg font-bold text-[#0D0F12] leading-snug">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-[#525866]">{product.planLabel}</p>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-sm text-[#525866] leading-relaxed line-clamp-2">
        {product.description}
      </p>

      {/* Feature List */}
      {product.features.length > 0 && (
        <ul className="mt-3.5 pt-3.5 border-t border-[#F1F3F5] space-y-1.5 text-xs text-[#525866]">
          {product.features.slice(0, 3).map((feat, idx) => (
            <li key={idx} className="truncate">
              – {feat}
            </li>
          ))}
        </ul>
      )}

      {/* Price (Current + Last Price) & Buy Now CTA */}
      <div className="mt-auto pt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="font-mono tabular-nums text-xs text-[#8A92A0] line-through">
              {formatCurrency(product.originalPrice, currencySymbol)}
            </div>
          )}
          <div className="font-mono tabular-nums text-xl font-bold text-[#0D0F12]">
            {formatCurrency(product.price, currencySymbol)}
          </div>
        </div>

        <button
          type="button"
          disabled={!available}
          onClick={() => onBuyNow(product)}
          aria-label={`Buy ${product.name} now`}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D0F12] ${
            !available
              ? 'bg-[#E2E5EA] text-[#8A92A0] cursor-not-allowed'
              : 'bg-[#0D0F12] text-white hover:bg-[#059669]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {available ? 'Buy Now' : 'Unavailable'}
        </button>
      </div>
    </article>
  );
}
