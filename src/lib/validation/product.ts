import type { Category, ProductImage, ProductRecord, RepurchaseDecision, UsageStatus } from "@/types/product";

const categories: readonly Category[] = ["food", "clothing", "beauty", "household", "digital", "other"];
const usageStatuses: readonly UsageStatus[] = ["unused", "using", "finished"];
const decisions: readonly RepurchaseDecision[] = ["repurchase", "avoid", "undecided"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.trim() : fallback;

const enumValue = <T extends string>(value: unknown, values: readonly T[], fallback: T): T =>
  typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;

const isoDate = (value: unknown): string | null => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : value;
};

const timestamp = (value: unknown, fallback: string): string => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return fallback;
  return value;
};

export const normalizeRating = (value: unknown): number | null =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;

export const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((tag) => text(tag)).filter(Boolean))];
};

export const isProductImage = (value: unknown): value is ProductImage => {
  if (!isRecord(value)) return false;
  return (
    typeof value.dataUrl === "string" &&
    /^data:image\/(jpeg|png|webp|svg\+xml);base64,/i.test(value.dataUrl) &&
    (value.mimeType === "image/jpeg" || value.mimeType === "image/png" || value.mimeType === "image/webp" || value.mimeType === "image/svg+xml") &&
    typeof value.width === "number" && value.width > 0 &&
    typeof value.height === "number" && value.height > 0
  );
};

/** Normalizes historic and partially corrupt persisted values without throwing. */
export const normalizeProduct = (value: unknown): ProductRecord | null => {
  if (!isRecord(value) || !isProductImage(value.image)) return null;
  const now = new Date().toISOString();
  const id = text(value.id);
  const name = text(value.name);
  if (!id || !name) return null;

  const price = typeof value.price === "number" && Number.isFinite(value.price) && value.price >= 0 ? value.price : null;
  return {
    id,
    name,
    brand: text(value.brand),
    image: value.image,
    category: enumValue(value.category, categories, "other"),
    price,
    purchaseDate: isoDate(value.purchaseDate),
    purchaseChannel: text(value.purchaseChannel),
    usageStatus: enumValue(value.usageStatus, usageStatuses, "unused"),
    rating: normalizeRating(value.rating),
    repurchaseDecision: enumValue(value.repurchaseDecision, decisions, "undecided"),
    review: text(value.review),
    tags: normalizeTags(value.tags),
    isDemo: value.isDemo === true,
    createdAt: timestamp(value.createdAt, now),
    updatedAt: timestamp(value.updatedAt, now),
  };
};

export const isAwaitingReview = (product: Pick<ProductRecord, "rating" | "repurchaseDecision">): boolean =>
  product.rating === null || product.repurchaseDecision === "undecided";
