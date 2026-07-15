export type Category = "food" | "clothing" | "beauty" | "household" | "digital" | "other";

export type UsageStatus = "unused" | "using" | "finished";

export type RepurchaseDecision = "repurchase" | "avoid" | "undecided";

/** A portable, offline-safe image representation. `dataUrl` is never an Object URL. */
export interface ProductImage {
  dataUrl: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml";
  width: number;
  height: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  image: ProductImage;
  category: Category;
  price: number | null;
  purchaseDate: string | null;
  purchaseChannel: string;
  usageStatus: UsageStatus;
  rating: number | null;
  repurchaseDecision: RepurchaseDecision;
  review: string;
  tags: string[];
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  image: ProductImage;
  category: Category;
  brand?: string;
  price?: number | null;
  purchaseDate?: string | null;
  purchaseChannel?: string;
  usageStatus?: UsageStatus;
  rating?: number | null;
  repurchaseDecision?: RepurchaseDecision;
  review?: string;
  tags?: string[];
}

export interface UpdateProductInput extends Partial<Omit<CreateProductInput, "image" | "category">> {
  image?: ProductImage;
  category?: Category;
}

export interface ProductQuery {
  search?: string;
  category?: Category;
  repurchaseDecision?: RepurchaseDecision;
  rating?: number;
  awaitingReview?: boolean;
  sort?: "recent" | "rating";
}

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  products: ProductRecord[];
}

export interface ProductRepository {
  list(query?: ProductQuery): Promise<ProductRecord[]>;
  getById(id: string): Promise<ProductRecord | null>;
  create(input: CreateProductInput): Promise<ProductRecord>;
  update(id: string, input: UpdateProductInput): Promise<ProductRecord>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  clearDemo(): Promise<number>;
  initializeDemoData(): Promise<number>;
  export(): Promise<ExportPayload>;
}
