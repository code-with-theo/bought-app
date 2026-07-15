import { demoProducts } from "@/data/demo-products";
import { isAwaitingReview, normalizeProduct, normalizeRating, normalizeTags } from "@/lib/validation/product";
import type { CreateProductInput, ExportPayload, ProductQuery, ProductRecord, ProductRepository, UpdateProductInput } from "@/types/product";

const DB_NAME = "bought";
const DB_VERSION = 1;
const PRODUCTS_STORE = "products";
const META_STORE = "meta";
const DEMO_INITIALIZED_KEY = "demo-initialized";

interface ProductStore {
  getAll(): Promise<unknown[]>;
  get(id: string): Promise<unknown | undefined>;
  put(product: ProductRecord): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  getMeta(key: string): Promise<unknown | undefined>;
  setMeta(key: string, value: unknown): Promise<void>;
}

class MemoryStore implements ProductStore {
  private products = new Map<string, ProductRecord>();
  private meta = new Map<string, unknown>();
  async getAll() { return [...this.products.values()]; }
  async get(id: string) { return this.products.get(id); }
  async put(product: ProductRecord) { this.products.set(product.id, product); }
  async delete(id: string) { this.products.delete(id); }
  async clear() { this.products.clear(); }
  async getMeta(key: string) { return this.meta.get(key); }
  async setMeta(key: string, value: unknown) { this.meta.set(key, value); }
}

class IndexedDbStore implements ProductStore {
  private readonly db: Promise<IDBDatabase>;
  constructor() { this.db = this.open(); }
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PRODUCTS_STORE)) db.createObjectStore(PRODUCTS_STORE, { keyPath: "id" });
        if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("无法初始化本地存储"));
    });
  }
  private async request<T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const request = operation(transaction.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("本地存储操作失败"));
    });
  }
  getAll() { return this.request(PRODUCTS_STORE, "readonly", (store) => store.getAll()); }
  get(id: string) { return this.request(PRODUCTS_STORE, "readonly", (store) => store.get(id)); }
  async put(product: ProductRecord) { await this.request(PRODUCTS_STORE, "readwrite", (store) => store.put(product)); }
  async delete(id: string) { await this.request(PRODUCTS_STORE, "readwrite", (store) => store.delete(id)); }
  async clear() { await this.request(PRODUCTS_STORE, "readwrite", (store) => store.clear()); }
  getMeta(key: string) { return this.request(META_STORE, "readonly", (store) => store.get(key)); }
  async setMeta(key: string, value: unknown) { await this.request(META_STORE, "readwrite", (store) => store.put(value, key)); }
}

const createId = (): string => globalThis.crypto?.randomUUID?.() ?? `product-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = (): string => new Date().toISOString();
const clean = (value: string | undefined): string => value?.trim() ?? "";

export class LocalProductRepository implements ProductRepository {
  constructor(private readonly store: ProductStore = typeof indexedDB === "undefined" ? new MemoryStore() : new IndexedDbStore()) {}

  private async products(): Promise<ProductRecord[]> {
    const raw = await this.store.getAll();
    const valid: ProductRecord[] = [];
    for (const value of raw) {
      const product = normalizeProduct(value);
      if (product) valid.push(product);
    }
    return valid;
  }

  async list(query: ProductQuery = {}): Promise<ProductRecord[]> {
    const term = query.search?.trim().toLocaleLowerCase();
    return (await this.products()).filter((product) => {
      const matchesTerm = !term || `${product.name} ${product.brand}`.toLocaleLowerCase().includes(term);
      return matchesTerm && (!query.category || product.category === query.category) && (!query.repurchaseDecision || product.repurchaseDecision === query.repurchaseDecision) && (query.rating === undefined || product.rating === query.rating) && (query.awaitingReview === undefined || isAwaitingReview(product) === query.awaitingReview);
    }).sort((a, b) => query.sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) || b.updatedAt.localeCompare(a.updatedAt) : b.updatedAt.localeCompare(a.updatedAt));
  }

  async getById(id: string): Promise<ProductRecord | null> { return normalizeProduct(await this.store.get(id)); }

  async create(input: CreateProductInput): Promise<ProductRecord> {
    if (!input.name.trim()) throw new Error("商品名称不能为空");
    if (!input.image) throw new Error("商品照片不能为空");
    const createdAt = now();
    const product = normalizeProduct({ ...input, id: createId(), brand: clean(input.brand), purchaseChannel: clean(input.purchaseChannel), review: clean(input.review), price: input.price ?? null, purchaseDate: input.purchaseDate ?? null, usageStatus: input.usageStatus ?? "unused", rating: normalizeRating(input.rating), repurchaseDecision: input.repurchaseDecision ?? "undecided", tags: normalizeTags(input.tags), isDemo: false, createdAt, updatedAt: createdAt });
    if (!product) throw new Error("商品图片无效");
    await this.store.put(product);
    return product;
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductRecord> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("商品不存在");
    const merged = normalizeProduct({ ...existing, ...input, name: input.name === undefined ? existing.name : input.name.trim(), brand: input.brand === undefined ? existing.brand : clean(input.brand), purchaseChannel: input.purchaseChannel === undefined ? existing.purchaseChannel : clean(input.purchaseChannel), review: input.review === undefined ? existing.review : clean(input.review), tags: input.tags === undefined ? existing.tags : normalizeTags(input.tags), rating: input.rating === undefined ? existing.rating : normalizeRating(input.rating), updatedAt: now() });
    if (!merged || !merged.name) throw new Error("商品名称不能为空");
    await this.store.put(merged);
    return merged;
  }

  async remove(id: string): Promise<void> { await this.store.delete(id); }
  async clear(): Promise<void> { await this.store.clear(); await this.store.setMeta(DEMO_INITIALIZED_KEY, true); }
  async clearDemo(): Promise<number> { const products = await this.products(); const demos = products.filter((product) => product.isDemo); await Promise.all(demos.map((product) => this.store.delete(product.id))); return demos.length; }
  async initializeDemoData(): Promise<number> {
    if (await this.store.getMeta(DEMO_INITIALIZED_KEY)) return 0;
    const existing = await this.products();
    if (existing.length === 0) await Promise.all(demoProducts.map((product) => this.store.put(product)));
    await this.store.setMeta(DEMO_INITIALIZED_KEY, true);
    return existing.length === 0 ? demoProducts.length : 0;
  }
  async export(): Promise<ExportPayload> { return { schemaVersion: DB_VERSION, exportedAt: now(), products: await this.list() }; }
}

export const productRepository = new LocalProductRepository();
