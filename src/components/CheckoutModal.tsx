import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  ImagePlus,
  MessageCircle,
  Trash2,
  X,
} from 'lucide-react';
import type { GatewayId, Order, Product, StoreSettings } from '../types';
import { createOrderSmart } from '../services/firestoreStore';
import {
  buildWhatsappOrderUrl,
  formatCurrency,
  resolveCheckoutGateways,
  validateOrderInput,
} from '../utils/storeLogic';
import { ToolLogo } from './ToolLogo';

interface CheckoutModalProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
}

async function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => {
      const rawUrl = String(reader.result || '');
      // Keep base64 screenshots comfortably below Firestore's 850KB field & 1MB document limit
      if (file.size <= 350 * 1024 && rawUrl.length <= 650_000) {
        resolve(rawUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 960;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let compressed = canvas.toDataURL('image/jpeg', 0.72);
        if (compressed.length > 780_000) {
          compressed = canvas.toDataURL('image/jpeg', 0.55);
        }
        resolve(compressed);
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function CheckoutModal({ product, settings, onClose }: CheckoutModalProps) {
  const enabledGateways = resolveCheckoutGateways(settings.gateways, product.allowedGateways);
  const [selectedGatewayId, setSelectedGatewayId] = useState<GatewayId>(
    enabledGateways[0]?.id || 'easypaisa'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    order: Order;
    whatsappUrl: string;
  } | null>(null);

  const activeGateway =
    enabledGateways.find((g) => g.id === selectedGatewayId) || enabledGateways[0];

  const priceText = formatCurrency(product.price, settings.currencySymbol);
  const isBinance = activeGateway?.id === 'binance';

  const directWhatsappUrl = buildWhatsappOrderUrl({
    storeWhatsapp: settings.whatsappNumber,
    productName: product.name,
    planLabel: product.planLabel,
    priceText,
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

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setScreenshotDataUrl(dataUrl);
      setScreenshotName(file.name);
      setError('');
    } catch {
      setError('Unable to process screenshot image. Please try another file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGateway) return;

    const check = validateOrderInput({
      customerName,
      customerWhatsapp,
      paymentMethod: activeGateway.id,
      transactionRef,
      screenshotDataUrl,
      gateway: activeGateway,
      product,
    });

    if (!check.valid) {
      setError(check.error || 'Please fill in your details and attach a screenshot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await createOrderSmart({
        product,
        settings,
        customerName: customerName.trim(),
        customerWhatsapp: customerWhatsapp.trim(),
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod: activeGateway.id,
        transactionRef: transactionRef.trim() || 'Screenshot Attached',
        screenshotDataUrl,
      });

      setConfirmedOrder({
        order: result.order,
        whatsappUrl: result.whatsappUrl,
      });
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Unable to submit order. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(screenshotDataUrl) && !submitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0D0F12]/60 backdrop-blur-[2px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="w-full sm:max-w-xl max-h-[94vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-xl border border-[#E2E5EA] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E2E5EA] px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <ToolLogo
              name={product.name}
              logoKey={product.logoKey}
              logoUrl={product.logoUrl}
              size="sm"
            />
            <div className="min-w-0">
              <h2
                id="checkout-modal-title"
                className="font-display text-base sm:text-lg font-bold text-[#0D0F12] truncate"
              >
                {confirmedOrder ? 'Order Confirmed' : `Buy ${product.name}`}
              </h2>
              <p className="text-xs text-[#525866] truncate">
                {product.planLabel} ·{' '}
                <span className="font-mono font-semibold text-[#0D0F12]">{priceText}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E2E5EA] text-[#525866] hover:text-[#0D0F12] hover:bg-[#F4F5F7] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Compact WhatsApp Bar */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-wrap items-center justify-between gap-2.5">
            <div className="min-w-0 flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-[#059669] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#047857] leading-tight">
                  WhatsApp Support
                </p>
                <p
                  data-testid="checkout-whatsapp-number"
                  className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#064E3B] leading-tight"
                >
                  {settings.whatsappDisplay}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-semibold text-[#065F46] bg-white border border-[#A7F3D0] rounded-lg hover:bg-[#F0FDF4] cursor-pointer whitespace-nowrap"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPhone ? 'Copied' : 'Copy'}
              </button>

              <a
                href={confirmedOrder ? confirmedOrder.whatsappUrl : directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-semibold text-white bg-[#059669] rounded-lg hover:bg-[#047857] whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {confirmedOrder ? (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-xl bg-[#F4F5F7] border border-[#E2E5EA] space-y-3">
                <div className="flex items-center gap-2 text-[#059669]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Order saved — send screenshot on WhatsApp within 15 minutes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1 text-sm">
                  <div>
                    <span className="block text-xs text-[#525866]">Order Code</span>
                    <span
                      data-testid="confirmed-order-code"
                      className="font-mono tabular-nums font-bold text-[#0D0F12]"
                    >
                      {confirmedOrder.order.orderCode}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#525866]">Amount</span>
                    <span className="font-mono tabular-nums font-semibold text-[#0D0F12]">
                      {formatCurrency(
                        confirmedOrder.order.amount,
                        confirmedOrder.order.currencySymbol
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#525866]">Method</span>
                    <span className="font-medium text-[#0D0F12]">
                      {confirmedOrder.order.paymentMethodLabel}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#525866]">Status</span>
                    <span className="font-medium text-[#059669]">Pending Verification</span>
                  </div>
                </div>
              </div>

              <a
                href={confirmedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#059669] rounded-lg hover:bg-[#047857]"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp Chat
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Payment Method + Send To Card */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#0D0F12]">
                    1. Send Payment
                  </p>
                  <div className="inline-flex items-center font-mono text-xs font-bold bg-[#F4F5F7] border border-[#E2E5EA] px-2.5 py-1 rounded-md text-[#0D0F12]">
                    {priceText}
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
                          setError('');
                        }}
                        className={`text-left px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer min-h-[42px] flex items-center gap-2 ${
                          selected
                            ? 'bg-[#0D0F12] text-white border-[#0D0F12]'
                            : 'bg-white text-[#0D0F12] border-[#E2E5EA] hover:border-[#8A92A0]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span className="truncate">{gw.label}</span>
                      </button>
                    );
                  })}
                </div>

                {activeGateway && (
                  <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-2.5">
                    <div className="min-w-0">
                      <span className="block text-[11px] font-medium text-[#525866]">
                        Name
                      </span>
                      <span className="text-sm font-bold text-[#0D0F12] block truncate">
                        {activeGateway.accountTitle}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E2E5EA] flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block text-[11px] font-medium text-[#525866]">
                          {isBinance ? 'Binance Pay ID' : 'Account Number'}
                        </span>
                        <span className="font-mono text-base font-bold text-[#0D0F12] tracking-tight break-all">
                          {activeGateway.accountNumber}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyAccount(activeGateway.accountNumber)}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 text-xs font-semibold bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] hover:bg-[#F4F5F7] cursor-pointer shrink-0"
                      >
                        {copiedAccount ? (
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedAccount ? 'Copied' : 'Copy Number'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Customer Info & Screenshot */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#0D0F12]">
                  2. Your Details &amp; Screenshot
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="block text-xs font-medium text-[#525866] mb-1"
                    >
                      Your Name *
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] focus:outline-none focus:border-[#0D0F12]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-whatsapp"
                      className="block text-xs font-medium text-[#525866] mb-1"
                    >
                      Your WhatsApp *
                    </label>
                    <input
                      id="checkout-whatsapp"
                      type="tel"
                      required
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                      placeholder="e.g. 923001234567"
                      className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] focus:outline-none focus:border-[#0D0F12]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="block text-xs font-medium text-[#525866] mb-1"
                    >
                      Gmail (optional)
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] focus:outline-none focus:border-[#0D0F12]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-txref"
                      className="block text-xs font-medium text-[#525866] mb-1"
                    >
                      TID / Ref (optional)
                    </label>
                    <input
                      id="checkout-txref"
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. TID12345678"
                      className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-white border border-[#E2E5EA] rounded-lg text-[#0D0F12] focus:outline-none focus:border-[#0D0F12]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-screenshot"
                    className="block text-xs font-semibold text-[#0D0F12] mb-1.5"
                  >
                    Payment Screenshot *
                  </label>

                  {!screenshotDataUrl ? (
                    <label
                      htmlFor="checkout-screenshot"
                      className="flex items-center justify-center gap-2 w-full min-h-[64px] p-3.5 rounded-xl border-2 border-dashed border-[#CBD2D9] bg-[#F4F5F7] hover:border-[#0D0F12] transition-colors cursor-pointer text-xs sm:text-sm text-[#525866]"
                    >
                      <ImagePlus className="w-4 h-4 text-[#0D0F12]" />
                      <span>Upload Payment Screenshot (JPG, PNG)</span>
                      <input
                        id="checkout-screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={screenshotDataUrl}
                          alt="Uploaded payment screenshot preview"
                          className="w-12 h-12 object-cover rounded-lg border border-[#A7F3D0] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#065F46] truncate">
                            {screenshotName || 'Screenshot attached'}
                          </p>
                          <p className="text-[11px] text-[#047857]">Ready to submit</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotDataUrl('');
                          setScreenshotName('');
                        }}
                        aria-label="Remove screenshot"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#DC2626] bg-white border border-[#FECACA] rounded-lg cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C]"
                >
                  {error}
                </div>
              )}

              <div className="pt-2 border-t border-[#E2E5EA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-xs text-[#525866]">
                  {screenshotDataUrl
                    ? 'Ready — click button to submit & send on WhatsApp.'
                    : 'Attach screenshot to enable Submit.'}
                </p>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap ${
                    canSubmit
                      ? 'bg-[#059669] text-white hover:bg-[#047857] cursor-pointer'
                      : 'bg-[#E2E5EA] text-[#8A92A0] cursor-not-allowed'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit & Send on WhatsApp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
