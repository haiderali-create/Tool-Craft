import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { GatewayId, Product, StoreSettings } from '../types';
import {
  buildWhatsappOrderUrl,
  computeDiscountPercent,
  formatCurrency,
  formatUsdAmount,
  formatUsdtAmount,
  PKR_PER_USD,
  resolveCheckoutGateways,
} from '../utils/storeLogic';
import { ToolLogo } from './ToolLogo';

interface CheckoutModalProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
}

export function CheckoutModal({ product, settings, onClose }: CheckoutModalProps) {
  const enabledGateways = resolveCheckoutGateways(settings.gateways, product.allowedGateways);
  const [selectedGatewayId, setSelectedGatewayId] = useState<GatewayId>(
    enabledGateways[0]?.id || 'easypaisa'
  );
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const activeGateway =
    enabledGateways.find((g) => g.id === selectedGatewayId) || enabledGateways[0];

  const priceText = formatCurrency(product.price, settings.currencySymbol);
  const usdPriceText = formatUsdAmount(product.price);
  const usdtPriceText = formatUsdtAmount(product.price);
  const discountPct = computeDiscountPercent(product.price, product.originalPrice);
  const isBinance = activeGateway?.id === 'binance';

  const whatsappPriceText = isBinance
    ? `${usdPriceText} (${usdtPriceText} / ${priceText})`
    : `${priceText} (${usdPriceText})`;

  const directWhatsappUrl = buildWhatsappOrderUrl({
    storeWhatsapp: settings.whatsappNumber,
    productName: product.name,
    planLabel: product.planLabel,
    priceText: whatsappPriceText,
    paymentMethodLabel: activeGateway?.label,
  });

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(settings.whatsappDisplay);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleCopyAccount = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0D11]/70 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="w-full sm:max-w-lg max-h-[94vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-[#E5E8EE] shadow-[0_32px_80px_-20px_rgba(11,13,17,0.5)]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E5E8EE] px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <ToolLogo
              name={product.name}
              logoKey={product.logoKey}
              logoUrl={product.logoUrl}
              size="md"
            />
            <div className="min-w-0">
              <h2
                id="checkout-modal-title"
                className="font-display text-base sm:text-lg font-bold text-[#0B0D11] truncate"
              >
                {product.name}
              </h2>
              <p className="text-xs text-[#4B5563] truncate">
                {product.planLabel} ·{' '}
                <span className="font-mono tabular-nums font-bold text-[#059669]">
                  {isBinance ? `${usdPriceText} (${usdtPriceText})` : `${priceText} / ${usdPriceText}`}
                </span>
                {discountPct > 0 && (
                  <span className="ml-1.5 font-mono text-[11px] text-[#6B7280]">
                    ({discountPct}% Off)
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E5E8EE] text-[#4B5563] hover:text-[#0B0D11] hover:bg-[#F6F7F9] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 1. Payment Method & Account Card */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#0B0D11]">
                1. Send Payment via Gateway
              </p>
              <div
                data-testid="checkout-price-badge"
                className="inline-flex items-center gap-1.5 font-mono tabular-nums text-xs font-bold bg-[#F6F7F9] border border-[#E5E8EE] px-2.5 py-1 rounded-lg text-[#0B0D11]"
              >
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[#9CA3AF] line-through font-normal">
                    {isBinance
                      ? formatUsdAmount(product.originalPrice)
                      : formatCurrency(product.originalPrice, settings.currencySymbol)}
                  </span>
                )}
                <span>{isBinance ? `${usdPriceText} (${usdtPriceText})` : priceText}</span>
                <span className="text-[#059669] font-semibold">
                  {isBinance ? `· ${priceText}` : `· ${usdPriceText}`}
                </span>
              </div>
            </div>

            <div
              className={`grid gap-2 ${
                enabledGateways.length === 1
                  ? 'grid-cols-1'
                  : enabledGateways.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {enabledGateways.map((gw) => {
                const selected = gw.id === activeGateway?.id;
                return (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => {
                      setSelectedGatewayId(gw.id);
                      setCopiedAccount(false);
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                      selected
                        ? 'bg-[#0B0D11] text-white border-[#0B0D11] shadow-[0_8px_18px_-8px_rgba(11,13,17,0.45)]'
                        : 'bg-white text-[#0B0D11] border-[#E5E8EE] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="truncate">{gw.label}</span>
                  </button>
                );
              })}
            </div>

            {activeGateway && (
              <motion.div
                key={activeGateway.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E8EE] space-y-2.5"
              >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-[11px] font-medium text-[#6B7280]">
                        Account Title
                      </span>
                      <span className="text-sm font-bold text-[#0B0D11] block truncate">
                        {activeGateway.accountTitle}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-[11px] font-medium text-[#6B7280]">
                        {isBinance ? 'Amount to Pay (USD)' : 'Amount to Pay'}
                      </span>
                      <span
                        data-testid="checkout-payable-amount"
                        className="font-mono tabular-nums text-sm font-bold text-[#059669] block"
                      >
                        {isBinance ? `${usdPriceText} (${usdtPriceText})` : `${priceText} (${usdPriceText})`}
                      </span>
                      {isBinance && (
                        <span className="block font-mono tabular-nums text-[10px] text-[#6B7280]">
                          Rate: $1 = {settings.currencySymbol} {PKR_PER_USD}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#E5E8EE] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-[11px] font-medium text-[#6B7280]">
                        {isBinance ? 'Binance Pay ID' : 'Account Number'}
                      </span>
                      <span
                        data-testid="checkout-account-number"
                        className="font-mono tabular-nums text-base font-bold text-[#0B0D11] tracking-tight break-all"
                      >
                        {activeGateway.accountNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAccount(activeGateway.accountNumber)}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 text-xs font-semibold bg-white border border-[#E5E8EE] rounded-xl text-[#0B0D11] hover:bg-[#F6F7F9] hover:border-[#C5CCD6] transition-colors cursor-pointer shrink-0"
                    >
                      {copiedAccount ? (
                        <Check className="w-3.5 h-3.5 text-[#059669]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedAccount ? 'Copied' : isBinance ? 'Copy Pay ID' : 'Copy Number'}
                    </button>
                  </div>
                </motion.div>
            )}
          </div>

          {/* 2. Direct WhatsApp Order & Screenshot Step (No Form Required) */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#0B0D11]">
              2. Send Payment Screenshot Directly on WhatsApp
            </p>

            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#A7F3D0] inline-flex items-center justify-center text-[#059669] shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#047857] leading-tight">
                      Official WhatsApp Order Desk
                    </p>
                    <p
                      data-testid="checkout-whatsapp-number"
                      className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#064E3B] leading-tight"
                    >
                      {settings.whatsappDisplay}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-semibold text-[#065F46] bg-white border border-[#A7F3D0] rounded-lg hover:bg-[#F0FDF4] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedPhone ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedPhone ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="pt-2.5 border-t border-[#A7F3D0]/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#065F46]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>15-minute instant activation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Full-term replacement warranty</span>
                </div>
              </div>
            </div>

            <motion.a
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              data-testid="direct-whatsapp-submit"
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 min-h-[50px] px-5 py-3 text-sm font-semibold text-white bg-[#059669] rounded-xl shadow-[0_14px_28px_-10px_rgba(5,150,105,0.65)] hover:bg-[#047857] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order &amp; Send Screenshot on WhatsApp</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.a>

            <p className="text-center text-[11px] text-[#6B7280]">
              No form needed — your tool, price &amp; gateway details open pre-filled in WhatsApp.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
