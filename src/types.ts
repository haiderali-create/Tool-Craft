export type ProductCategory =
  | 'Video & Editing'
  | 'AI Assistants'
  | 'Design & Image'
  | 'Audio & Voice'
  | 'Productivity';

export type GatewayId = 'jazzcash' | 'easypaisa' | 'binance';

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  planLabel: string;
  price: number;
  originalPrice?: number; // Last / cut price
  offerLabel?: string;    // e.g. "Flash Offer", "Save 50%"
  topSelling?: boolean;
  inStock: boolean;
  stock: number;
  logoKey: string;        // e.g. 'capcut', 'gemini', 'canva', 'elevenlabs', etc.
  logoUrl?: string;       // Optional custom logo URL or auto-resolved logo
  description: string;
  features: string[];
  allowedGateways?: GatewayId[];
  featuredInHero?: boolean;
  active: boolean;
  createdAt: string;
}

export interface PaymentGatewayConfig {
  id: GatewayId;
  label: string;
  enabled: boolean;
  accountTitle: string;
  accountNumber: string;
  instructions: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  supportHours?: string;
  currencySymbol: string;
  deliverySla: string;
  autoFetchEndpoints?: string[];
  gateways: PaymentGatewayConfig[];
}

export interface Order {
  id: string;
  orderCode: string;
  productId: string;
  productName: string;
  planLabel: string;
  amount: number;
  currencySymbol: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  paymentMethod: GatewayId;
  paymentMethodLabel: string;
  transactionRef: string;
  screenshotDataUrl?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface PublicOrderLookup {
  orderCode: string;
  productName: string;
  planLabel: string;
  amount: number;
  currencySymbol: string;
  paymentMethodLabel: string;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminAiStatus {
  serverGeminiKeyCount: number;
  maskedKeys?: string[];
  brandPresetCount: number;
}
