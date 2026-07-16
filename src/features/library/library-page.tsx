"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/design-system/app-shell";
import { BottomNavigation } from "@/components/design-system/navigation";
import { EmptyState, LoadingState } from "@/components/design-system/empty-state";
import { PageHeader } from "@/components/design-system/page-header";
import { ProductCard } from "@/components/design-system/product-card";
import { ProductListItem } from "@/components/design-system/product-list-item";
import { Input } from "@/components/ui/input";
import { productRepository } from "@/lib/db/product-repository";
import type { Category, ProductQuery, ProductRecord } from "@/types/product";

const choices: Array<[Category | "", string]> = [["", "全部分类"], ["food", "吃的"], ["clothing", "穿的"], ["beauty", "护肤美妆"], ["household", "家居日用"], ["digital", "数码电器"], ["other", "其他"]];
type Quick = "all" | "repurchase" | "avoid" | "waiting";
export function LibraryPage({ repurchaseOnly = false }: { repurchaseOnly?: boolean }) {
  const router = useRouter(); const params = useSearchParams(); const [products, setProducts] = useState<ProductRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const [search, setSearch] = useState(params.get("q") ?? ""); const [quick, setQuick] = useState<Quick>(repurchaseOnly ? "repurchase" : "all"); const [category, setCategory] = useState<Category | "">(""); const [rating, setRating] = useState<number | "">(""); const [sort, setSort] = useState<"recent" | "rating">("recent"); const [grid, setGrid] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(false); try { await productRepository.initializeDemoData(); const query: ProductQuery = { search, category: category || undefined, rating: rating === "" ? undefined : rating, sort, repurchaseDecision: quick === "repurchase" ? "repurchase" : quick === "avoid" ? "avoid" : undefined, awaitingReview: quick === "waiting" ? true : undefined }; setProducts(await productRepository.list(query)); } catch { setError(true); } finally { setLoading(false); } }, [category, quick, rating, search, sort]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(timer); }, [load]);
  const clear = () => { setSearch(""); setQuick(repurchaseOnly ? "repurchase" : "all"); setCategory(""); setRating(""); setSort("recent"); };
  const active = Boolean(search || category || rating !== "" || sort !== "recent" || (!repurchaseOnly && quick !== "all"));
  const title = repurchaseOnly ? "复购清单" : "我的物品库"; const description = repurchaseOnly ? "这些是你明确愿意再买的。" : "每一件买过的，都有它的答案。";
  return <><AppShell><PageHeader eyebrow={repurchaseOnly ? "买过" : "物品库"} title={title} description={description} />
    {!repurchaseOnly ? <><Input className="mt-6" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜商品名或品牌" aria-label="搜索商品" /><div className="mt-4 flex gap-5 overflow-x-auto border-b border-border">{([ ["all", "全部"], ["repurchase", "会复购"], ["avoid", "不会复购"], ["waiting", "等待评价"] ] as Array<[Quick, string]>).map(([value, label]) => <button type="button" key={value} onClick={() => setQuick(value)} className={`min-h-10 shrink-0 border-b-2 px-0 text-sm font-medium ${quick === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</button>)}</div>
      <div className="mt-4 grid grid-cols-2 gap-2"><select value={category} onChange={(event) => setCategory(event.target.value as Category | "")} className="min-h-11 rounded-[var(--radius-sm)] border bg-surface px-3 text-sm">{choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={rating} onChange={(event) => setRating(event.target.value === "" ? "" : Number(event.target.value))} className="min-h-11 rounded-[var(--radius-sm)] border bg-surface px-3 text-sm"><option value="">所有评分</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} 星</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value as "recent" | "rating")} className="min-h-11 rounded-[var(--radius-sm)] border bg-surface px-3 text-sm"><option value="recent">最近记录</option><option value="rating">评分最高</option></select><button type="button" onClick={() => setGrid((value) => !value)} className="min-h-11 rounded-[var(--radius-sm)] border bg-surface px-3 text-sm font-semibold">{grid ? "切换列表" : "切换网格"}</button></div>{active ? <button type="button" className="mt-3 text-sm font-bold text-primary" onClick={clear}>清除筛选</button> : null}</> : null}
    <section className="mt-6">{loading ? <div className="grid grid-cols-2 gap-3"><LoadingState /><LoadingState /></div> : error ? <EmptyState title={repurchaseOnly ? "复购清单暂时没打开" : "物品库暂时没加载出来"} description="试着重新加载。" actionLabel="重新加载" onAction={() => void load()} /> : !products.length ? <EmptyState title={active ? "没找到这件" : repurchaseOnly ? "还没有认定会回购的" : "从第一件开始"} description={active ? "换个词试试，或清除筛选。" : repurchaseOnly ? "用过几次，再来做决定。" : "给购买留个记号。"} actionLabel={active ? "清除筛选" : repurchaseOnly ? "查看物品库" : "记录商品"} onAction={() => active ? clear() : router.push(repurchaseOnly ? "/library" : "/products/new")} /> : grid ? <div className="grid grid-cols-2 gap-3">{products.map((product) => <ProductCard key={product.id} product={product} onClick={() => router.push(`/product?id=${encodeURIComponent(product.id)}`)} />)}</div> : <div className="space-y-3">{products.map((product) => <ProductListItem key={product.id} product={product} onClick={() => router.push(`/product?id=${encodeURIComponent(product.id)}`)} />)}</div>}</section>
  </AppShell><BottomNavigation active={repurchaseOnly ? "repurchase" : "library"} /></>;
}
