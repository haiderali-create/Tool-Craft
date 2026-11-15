import type { Product, ProductCategory, StoreSettings } from '../types.ts';

export const BRAND_PRESETS: Record<
  string,
  {
    category: ProductCategory;
    planLabel: string;
    description: string;
    features: string[];
    domain: string;
  }
> = {
  capcut: {
    category: 'Video & Editing',
    planLabel: '1 Month · Private Access',
    description:
      'Full CapCut Pro unlock with AI auto-captions, 4K 60fps export, background removal, and commercial effects.',
    features: [
      'Works on PC, Mac, iOS & Android',
      'No watermark + 4K Ultra HD exports',
      'AI auto-captions & smart cutout tools',
    ],
    domain: 'capcut.com',
  },
  gemini: {
    category: 'AI Assistants',
    planLabel: '1 Month · Personal Gmail Upgrade',
    description:
      'Upgrade your own Google account with Gemini Advanced models, 2TB Google One cloud storage, and Workspace AI.',
    features: [
      'Activated on your personal Gmail',
      'Includes 2TB Google Drive & Photos storage',
      'Deep Research & priority model access',
    ],
    domain: 'gemini.google.com',
  },
  canva: {
    category: 'Design & Image',
    planLabel: '1 Year · Private Email Invite',
    description:
      'Design social posts, decks, and brand kits with Magic Studio AI, background remover, and 100M+ Pro assets.',
    features: [
      'Invite directly to your own email',
      '100M+ stock photos, fonts & templates',
      'Magic Resize & 1-click background remover',
    ],
    domain: 'canva.com',
  },
  elevenlabs: {
    category: 'Audio & Voice',
    planLabel: '1 Month · 100k Credits',
    description:
      'Studio-grade AI voiceovers, instant voice cloning, and multilingual dubbing for YouTube & reels.',
    features: [
      '100,000 monthly character credits',
      'Professional voice cloning included',
      'Commercial usage rights',
    ],
    domain: 'elevenlabs.io',
  },
  midjourney: {
    category: 'Design & Image',
    planLabel: '1 Month · Fast GPU Hours',
    description:
      'Photorealistic concept art, product mockups, and brand illustrations with fast generation priority.',
    features: [
      'Fast GPU mode & Relax mode',
      'Web studio + Discord workflow',
      'Commercial license included',
    ],
    domain: 'midjourney.com',
  },
  perplexity: {
    category: 'Productivity',
    planLabel: '1 Year · Private Voucher',
    description:
      'Citation-backed AI research engine with switchable frontier models, Pro Search, and unlimited file uploads.',
    features: [
      'Switch between top reasoning models',
      'Live web citations & academic search',
      '12-month uninterrupted access',
    ],
    domain: 'perplexity.ai',
  },
  adobe: {
    category: 'Video & Editing',
    planLabel: '1 Month · Genuine Email Seat',
    description:
      'Premiere Pro, After Effects, Photoshop, and Firefly generative AI credits activated on your email.',
    features: [
      'Official Creative Cloud desktop app',
      '100GB cloud storage + Firefly AI',
      'Supports Windows & macOS',
    ],
    domain: 'adobe.com',
  },
  cursor: {
    category: 'Productivity',
    planLabel: '1 Month · Pro Subscription',
    description:
      'AI-powered code editor with fast multi-file edits, smart tab autocomplete, and frontier coding models.',
    features: [
      'Fast premium model requests included',
      'Multi-file codebase composer',
      'Works on Windows, macOS & Linux',
    ],
    domain: 'cursor.com',
  },
  runway: {
    category: 'Video & Editing',
    planLabel: '1 Month · Pro Credits',
    description:
      'Generate cinematic AI videos from text or images with Gen-3 Alpha, motion brush, and studio upscaling.',
    features: [
      'Gen-3 Alpha video generation',
      'Camera control & motion brush',
      'Watermark-free HD exports',
    ],
    domain: 'runwayml.com',
  },
  suno: {
    category: 'Audio & Voice',
    planLabel: '1 Month · Pro Plan',
    description:
      'Create full studio-quality AI songs, vocals, and instrumentals with commercial ownership rights.',
    features: [
      '2,500 monthly song generation credits',
      'Commercial rights for YouTube & social',
      'Custom lyrics & vocal styles',
    ],
    domain: 'suno.com',
  },
  notion: {
    category: 'Productivity',
    planLabel: '1 Year · Plus + AI',
    description:
      'All-in-one workspace for docs, databases, and Notion AI writing and summary automation.',
    features: [
      'Unlimited blocks & file uploads',
      'Notion AI Q&A and autofill',
      'Private workspace upgrade',
    ],
    domain: 'notion.so',
  },
  figma: {
    category: 'Design & Image',
    planLabel: '1 Year · Professional Seat',
    description:
      'Collaborative UI/UX design, prototyping, dev mode, and shared team component libraries.',
    features: [
      'Unlimited Figma files & projects',
      'Dev Mode & variable libraries',
      'Activated on your email',
    ],
    domain: 'figma.com',
  },
  grammarly: {
    category: 'Productivity',
    planLabel: '1 Year · Premium Access',
    description:
      'Advanced grammar, tone rewriting, plagiarism detection, and AI writing assistance across apps.',
    features: [
      'Works in Chrome, Docs & Word',
      'Full tone & clarity rewrite',
      'Plagiarism checker included',
    ],
    domain: 'grammarly.com',
  },
  claude: {
    category: 'AI Assistants',
    planLabel: '1 Month · Pro Access',
    description:
      'High-context reasoning, coding, and writing assistant with Artifacts and priority access.',
    features: [
      'Priority access & higher usage limits',
      'Projects & interactive Artifacts',
      'Full month warranty',
    ],
    domain: 'claude.ai',
  },
  spotify: {
    category: 'Audio & Voice',
    planLabel: '1 Year · Individual Premium',
    description:
      'Ad-free high-bitrate music streaming, offline downloads, and unlimited skips on your own account.',
    features: [
      'Activated on your own account',
      'Offline downloads & lossless clarity',
      'Zero ads across all devices',
    ],
    domain: 'spotify.com',
  },
  youtube: {
    category: 'Video & Editing',
    planLabel: '1 Year · Premium Family Invite',
    description:
      'Ad-free YouTube, background playback, offline downloads, and YouTube Music Premium included.',
    features: [
      'Works on your existing Gmail',
      'Includes YouTube Music Premium',
      'TV, mobile & desktop support',
    ],
    domain: 'youtube.com',
  },
  netflix: {
    category: 'Video & Editing',
    planLabel: '1 Month · 4K UHD Private Screen',
    description:
      'Dedicated PIN-locked 4K Ultra HD streaming screen with smooth multi-device support.',
    features: [
      '4K Ultra HD + HDR quality',
      'Private PIN-protected profile',
      'Full 30-day warranty',
    ],
    domain: 'netflix.com',
  },
};

export function createDefaultSettings(): StoreSettings {
  return {
    storeName: 'ToolCraft',
    tagline: 'Official AI & Creative Pro Subscriptions',
    whatsappNumber: '923234319689',
    whatsappDisplay: '+92 3234319689',
    supportHours: 'Support 24/7',
    currencySymbol: 'Rs.',
    deliverySla: 'Send payment screenshot on WhatsApp within 15 minutes for activation',
    autoFetchEndpoints: [],
    gateways: [
      {
        id: 'jazzcash',
        label: 'JazzCash',
        enabled: false,
        accountTitle: 'ToolCraft Digital Store',
        accountNumber: '',
        instructions:
          'Send total amount to this JazzCash account, take a screenshot, upload it below, and also send it on WhatsApp within 15 minutes.',
      },
      {
        id: 'easypaisa',
        label: 'Easypaisa',
        enabled: true,
        accountTitle: 'Naveed Akhtar',
        accountNumber: '03488657017',
        instructions:
          'Transfer to Easypaisa (Naveed Akhtar · 03488657017), upload your payment screenshot below, and send it on WhatsApp within 15 minutes.',
      },
      {
        id: 'binance',
        label: 'Binance (Pay ID / USDT)',
        enabled: true,
        accountTitle: 'Mr Boss 1',
        accountNumber: '1009240724',
        instructions:
          'Send USDT via Binance Pay ID (Mr Boss 1 · 1009240724), upload the transfer screenshot below, and share it on WhatsApp within 15 minutes.',
      },
    ],
  };
}

export function createDefaultProducts(now = new Date().toISOString()): Product[] {
  return [
    {
      id: 'capcut-pro-1m',
      name: 'CapCut Pro',
      category: 'Video & Editing',
      planLabel: '1 Month · Private Access',
      price: 1150,
      originalPrice: 2400,
      offerLabel: 'Hot Offer',
      topSelling: true,
      inStock: true,
      stock: 50,
      logoKey: 'capcut',
      description:
        'Full Pro timeline unlock with AI auto-captions, 4K 60fps export, background removal, and commercial effects.',
      features: [
        'Works on PC, Mac, iOS & Android',
        'No watermark + 4K Ultra HD exports',
        'AI auto-captions & smart cutout tools',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
    {
      id: 'gemini-pro-1m',
      name: 'Gemini Pro (Google AI Premium)',
      category: 'AI Assistants',
      planLabel: '1 Month · Personal Gmail Upgrade',
      price: 1850,
      originalPrice: 5600,
      offerLabel: 'Best Value',
      topSelling: true,
      inStock: true,
      stock: 40,
      logoKey: 'gemini',
      description:
        'Upgrade your own Google account with Gemini Advanced, 2TB Google One cloud storage, and Workspace AI.',
      features: [
        'Activated on your personal Gmail',
        'Includes 2TB Google Drive & Photos storage',
        'Deep Research & priority model access',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
    {
      id: 'canva-pro-1y',
      name: 'Canva Pro Team Seat',
      category: 'Design & Image',
      planLabel: '1 Year · Private Email Invite',
      price: 950,
      originalPrice: 3500,
      offerLabel: 'Flash Deal',
      topSelling: true,
      inStock: true,
      stock: 60,
      logoKey: 'canva',
      description:
        'Design social posts, decks, and brand kits with Magic Studio AI, background remover, and 100M+ Pro assets.',
      features: [
        'Invite directly to your own email',
        '100M+ stock photos, fonts & templates',
        'Magic Resize & 1-click background remover',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
    {
      id: 'elevenlabs-creator-1m',
      name: 'ElevenLabs Creator',
      category: 'Audio & Voice',
      planLabel: '1 Month · 100k Credits',
      price: 2950,
      originalPrice: 6200,
      topSelling: false,
      inStock: true,
      stock: 25,
      logoKey: 'elevenlabs',
      description:
        'Studio-grade AI voiceovers, instant voice cloning, and multilingual dubbing for YouTube & faceless reels.',
      features: [
        '100,000 monthly character credits',
        'Professional voice cloning included',
        'Commercial usage rights',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
    {
      id: 'midjourney-pro-1m',
      name: 'Midjourney Pro',
      category: 'Design & Image',
      planLabel: '1 Month · Fast GPU Hours',
      price: 3100,
      originalPrice: 8400,
      offerLabel: 'Studio Pick',
      topSelling: false,
      inStock: true,
      stock: 20,
      logoKey: 'midjourney',
      description:
        'Photorealistic concept art, product mockups, and brand illustrations with fast generation priority.',
      features: [
        'Fast GPU mode & Relax mode',
        'Web studio + Discord workflow',
        'Commercial license included',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
    {
      id: 'perplexity-pro-1y',
      name: 'Perplexity Pro',
      category: 'Productivity',
      planLabel: '1 Year · Private Voucher',
      price: 3400,
      originalPrice: 12000,
      offerLabel: 'Yearly Save',
      topSelling: false,
      inStock: true,
      stock: 30,
      logoKey: 'perplexity',
      description:
        'Citation-backed AI research engine with switchable frontier models, Pro Search, and unlimited file uploads.',
      features: [
        'Switch between top reasoning models',
        'Live web citations & academic search',
        '12-month uninterrupted access',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
    {
      id: 'adobe-cc-1m',
      name: 'Adobe Creative Cloud All Apps',
      category: 'Video & Editing',
      planLabel: '1 Month · Genuine Email Seat',
      price: 3600,
      originalPrice: 14500,
      topSelling: false,
      inStock: true,
      stock: 20,
      logoKey: 'adobe',
      description:
        'Premiere Pro, After Effects, Photoshop, and Firefly generative AI credits activated directly on your email.',
      features: [
        'Official Creative Cloud desktop app',
        '100GB cloud storage + Firefly AI',
        'Supports Windows & macOS',
      ],
      featuredInHero: true,
      active: true,
      createdAt: now,
    },
  ];
}
