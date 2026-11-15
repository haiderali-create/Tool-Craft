import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashPassword } from './auth.ts';
import {
  createDefaultProducts,
  createDefaultSettings,
} from '../src/data/defaultStoreSeed.ts';
import type { Order, Product, StoreSettings } from '../src/types.ts';

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  customized?: boolean;
  updatedAt: string;
}

export interface StoreDatabase {
  admin: AdminCredentials;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'store-v2-db.json');

function createInitialDb(): StoreDatabase {
  const defaultUsername = (process.env.ADMIN_USERNAME || 'admin').trim() || 'admin';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'ToolCraft@2026';
  const now = new Date().toISOString();

  return {
    admin: {
      username: defaultUsername,
      passwordHash: hashPassword(defaultPassword),
      updatedAt: now,
    },
    settings: createDefaultSettings(),
    products: createDefaultProducts(now),
    orders: [],
  };
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDb(): StoreDatabase {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const initial = createInitialDb();
    writeDb(initial);
    return initial;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw) as StoreDatabase;
}

export function writeDb(db: StoreDatabase): void {
  ensureDataDir();
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

export function generateOrderCode(existingOrders: Order[]): string {
  const used = new Set(existingOrders.map((o) => o.orderCode));
  let num = 1042 + existingOrders.length;
  while (used.has(`TC-${num}`)) {
    num += 1;
  }
  return `TC-${num}`;
}
