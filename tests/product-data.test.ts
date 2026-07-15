import { demoProducts } from "@/data/demo-products";
import { LocalProductRepository } from "@/lib/db/product-repository";
import { isAwaitingReview, normalizeProduct } from "@/lib/validation/product";
import type { ProductImage } from "@/types/product";
import { describe, expect, it } from "vitest";

const image: ProductImage = { dataUrl: "data:image/png;base64,aGVsbG8=", mimeType: "image/png", width: 1, height: 1 };
const input = { name: "测试商品", image, category: "food" as const, brand: "品牌", rating: 4, repurchaseDecision: "repurchase" as const, tags: ["好用", "好用"] };

describe("Product 数据层", () => {
  it("创建、更新、筛选、排序与删除记录", async () => {
    const repository = new LocalProductRepository();
    const first = await repository.create(input);
    const second = await repository.create({ ...input, name: "另一件", rating: 2, repurchaseDecision: "avoid" });
    expect((await repository.list({ search: "品牌", sort: "rating" })).map((item) => item.id)).toEqual([first.id, second.id]);
    const updated = await repository.update(first.id, { tags: ["好用", "会回购"], review: "  很满意  " });
    expect(updated).toMatchObject({ review: "很满意", tags: ["好用", "会回购"] });
    await repository.remove(second.id);
    expect(await repository.getById(second.id)).toBeNull();
  });

  it("只初始化一次演示数据，且可单独清除", async () => {
    const repository = new LocalProductRepository();
    expect(await repository.initializeDemoData()).toBe(demoProducts.length);
    expect(await repository.initializeDemoData()).toBe(0);
    const user = await repository.create(input);
    expect(await repository.clearDemo()).toBe(demoProducts.length);
    expect(await repository.getById(user.id)).not.toBeNull();
  });

  it("兼容旧数据、跳过损坏记录，并正确判断等待评价", () => {
    const normal = normalizeProduct({ ...demoProducts[0], rating: 9, category: "unknown", tags: ["好用", "好用", ""] });
    expect(normal).toMatchObject({ rating: null, category: "other", tags: ["好用"] });
    expect(normal && isAwaitingReview(normal)).toBe(true);
    expect(normalizeProduct({ id: "bad", name: "坏数据" })).toBeNull();
    expect(isAwaitingReview({ rating: 5, repurchaseDecision: "undecided" })).toBe(true);
    expect(isAwaitingReview({ rating: 5, repurchaseDecision: "repurchase" })).toBe(false);
  });

  it("导出可恢复的结构与图片数据", async () => {
    const repository = new LocalProductRepository();
    await repository.create(input);
    const payload = await repository.export();
    expect(payload.schemaVersion).toBe(1);
    expect(payload.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(payload.products[0].image.dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
