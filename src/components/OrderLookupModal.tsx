import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PublicOrderLookup } from '../types';
import { formatCurrency } from '../utils/storeLogic';

interface OrderLookupModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<PublicOrderLookup['status'], string> = {
  pending: 'Pending Verification',
  paid: 'Payment Verified',
  delivered: 'Delivered & Active',
  cancelled: 'Cancelled',
};

export function OrderLookupModal({ open, onClose }: OrderLookupModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PublicOrderLookup | null>(null);

  if (!open) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter your order code (for example, TC-1041).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/orders/lookup?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order not found.');
        return;
      }
      setResult(data as PublicOrderLookup);
    } catch {
      setError('Network error while checking order status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111214]/55 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lookup-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-xl border border-[#E4E6EB] shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E4E6EB] flex items-center justify-between">
          <h2 id="lookup-modal-title" className="font-display text-lg font-bold text-[#111214]">
            Track Your Order
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order tracker"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E4E6EB] text-[#525866] hover:text-[#111214] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleLookup} className="flex gap-2">
            <label htmlFor="order-lookup-code" className="sr-only">
              Order Code
            </label>
            <input
              id="order-lookup-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Order Code (e.g. TC-1041)"
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm font-mono uppercase bg-[#F8F9FA] border border-[#E4E6EB] rounded-lg text-[#111214] focus:outline-none focus:border-[#111214]"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-[#111214] rounded-lg hover:bg-[#272A30] cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {error && (
            <p role="alert" className="text-xs font-medium text-[#DC2626]">
              {error}
            </p>
          )}

          {result && (
            <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E4E6EB] space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#111214]">{result.orderCode}</span>
                <span className="font-medium text-[#059669]">
                  {STATUS_LABELS[result.status]}
                </span>
              </div>
              <p className="font-semibold text-[#111214]">{result.productName}</p>
              <p className="text-xs text-[#525866]">
                {result.planLabel} · {result.paymentMethodLabel}
              </p>
              <p className="font-mono tabular-nums font-semibold text-[#111214]">
                {formatCurrency(result.amount, result.currencySymbol)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
