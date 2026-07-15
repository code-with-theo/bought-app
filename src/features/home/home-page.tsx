"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/design-system/app-shell";
import { BottomNavigation, FloatingAddButton } from "@/components/design-system/navigation";
import { EmptyState, LoadingState } from "@/components/design-system/empty-state";
import { PageHeader, SectionHeader } from "@/components/design-system/page-header";
import { ProductCard } from "@/components/design-system/product-card";
import { ProductListItem } from "@/components/design-system/product-list-item";
import { Input } from "@/components/ui/input";
import { productRepository } from "@/lib/db/product-repository";
import type { ProductRecord } from "@/types/product";

export function HomePage() {
  const router = useRouter(); const [products, setProducts] = useState<ProductRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [search, setSearch] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(false); try { await productRepository.initializeDemoData(); setProducts(await productRepository.list()); } catch { setError(true); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const goSearch = (event: React.FormEvent) => { event.preventDefault(); router.push(`/library${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`); };
  if (loading) return <><AppShell><PageHeader eyebrow="买过" title="正在翻找你的记录" /><div className="mt-7 grid grid-cols-2 gap-3"><LoadingState /><LoadingState /></div></AppShell><BottomNavigation active="home" /></>;
  if (error) return <><AppShell><EmptyState title="这页暂时没打开" description="试着重新加载，记录不会丢失。" actionLabel="重新加载" onAction={() => void load()} /></AppShell><BottomNavigation active="home" /></>;
  if (!products.length) return <><AppShell><PageHeader eyebrow="买过" title="你的购物记忆" description="记下每一次选择，让下一次购买更值得。" /><div className="mt-8"><EmptyState title="还没有买过的记录" description="下次买到喜欢的，记在这里吧。" actionLabel="记录商品" onAction={() => router.push("/products/new")} /></div></AppShell><BottomNavigation active="home" /></>;
  const repurchase = products.filter((product) => product.repurchaseDecision === "repurchase"); const waiting = products.filter((product) => product.rating === null || product.repurchaseDecision === "undecided");
  return <><AppShell><PageHeader eyebrow="买过" title="你的购物记忆" description="记下每一次选择，让下一次购买更值得。" action={<FloatingAddButton className="hidden sm:inline-flex" />} />
    <form onSubmit={goSearch} className="mt-6"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜商品名或品牌" aria-label="搜索商品" /></form><p className="mt-3 text-sm text-muted-foreground">你已经记下 <strong className="text-foreground">{products.length}</strong> 件好东西</p>
    {repurchase.length ? <section className="mt-8"><SectionHeader title="值得复购" action={<button type="button" className="text-sm font-bold text-primary" onClick={() => router.push("/repurchase")}>查看全部</button>} /><div className="mt-3 flex gap-3 overflow-x-auto pb-2">{repurchase.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} onClick={() => router.push(`/products/${product.id}`)} className="w-40 shrink-0" />)}</div></section> : null}
    <section className="mt-8"><SectionHeader title="最近记录" action={<button type="button" className="text-sm font-bold text-primary" onClick={() => router.push("/library")}>物品库</button>} /><div className="mt-3 space-y-3">{products.slice(0, 4).map((product) => <ProductListItem key={product.id} product={product} onClick={() => router.push(`/products/${product.id}`)} />)}</div></section>
    {waiting.length ? <section className="mt-8"><SectionHeader title="等你来评价" /><div className="mt-3 space-y-3">{waiting.slice(0, 3).map((product) => <ProductListItem key={product.id} product={product} onClick={() => router.push(`/products/${product.id}`)} />)}</div></section> : null}
    <FloatingAddButton className="fixed bottom-[calc(5.4rem+var(--bottom-safe-area))] right-4 z-30 sm:hidden" />
  </AppShell><BottomNavigation active="home" /></>;
}
