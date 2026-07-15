"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/design-system/app-shell";
import { BottomNavigation } from "@/components/design-system/navigation";
import { PageHeader, SectionHeader } from "@/components/design-system/page-header";
import { ProductImage } from "@/components/design-system/product-image";
import { RatingInput } from "@/components/design-system/rating-input";
import { RepurchaseSelector } from "@/components/design-system/repurchase-selector";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { productRepository } from "@/lib/db/product-repository";
import type { ProductRecord, RepurchaseDecision } from "@/types/product";

const tags = ["性价比高", "颜值高", "好用", "不耐用", "不舒服", "太贵", "容易坏", "会回购", "踩雷"];
const categoryLabels = { food: "吃的", clothing: "穿的", beauty: "护肤美妆", household: "家居日用", digital: "数码电器", other: "其他" };
export function ProductDetail() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const { showToast } = useToast(); const [product, setProduct] = useState<ProductRecord | null>(null); const [loading, setLoading] = useState(true); const [failed, setFailed] = useState(false); const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { setProduct(await productRepository.getById(id)); setFailed(false); } catch { setFailed(true); } finally { setLoading(false); } }, [id]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const update = async (input: Partial<ProductRecord>) => { if (!product) return; const before = product; setProduct({ ...product, ...input }); try { const saved = await productRepository.update(product.id, input); setProduct(saved); showToast("已记下你的感受。 "); } catch { setProduct(before); showToast("这次没存上，再试一次。", "error"); } };
  if (loading) return <AppShell><p className="py-20 text-center text-muted-foreground">正在翻找你的记录…</p></AppShell>;
  if (failed) return <AppShell><p className="py-20 text-center text-danger">这页暂时没打开。</p><Button onClick={load}>重新加载</Button></AppShell>;
  if (!product) return <AppShell><div className="py-20 text-center"><p className="text-lg font-bold">这条记录可能已经被删除了。</p><Link className="mt-4 inline-block text-primary" href="/library">返回物品库</Link></div></AppShell>;
  const info = [["品牌", product.brand], ["购买日期", product.purchaseDate], ["购买渠道", product.purchaseChannel], ["价格", product.price === null ? "" : `¥${product.price}`], ["当前状态", { unused: "还没开始用", using: "使用中", finished: "已经用完" }[product.usageStatus]]];
  return <><AppShell><PageHeader eyebrow={categoryLabels[product.category]} title={product.name} action={<Link className="text-sm font-bold text-primary" href={`/products/${product.id}/edit`}>编辑</Link>} />
    <ProductImage priority image={product.image} name={product.name} category={product.category} className="mt-5 w-full rounded-[var(--radius-lg)]" />
    {product.rating === null && product.repurchaseDecision === "undecided" && !product.review ? <p className="mt-4 rounded-[var(--radius-md)] bg-warning-soft p-3 text-sm text-warning">用过以后，回来留一句感受吧。</p> : null}
    <section className="mt-7"><SectionHeader title="下次还会买吗？" /><RepurchaseSelector className="mt-3" value={product.repurchaseDecision} onChange={(repurchaseDecision: RepurchaseDecision) => update({ repurchaseDecision })} /></section>
    <section className="mt-7"><SectionHeader title="用下来怎么样？" /><RatingInput className="mt-3" value={product.rating} onChange={(rating) => update({ rating })} /></section>
    <section className="mt-7"><SectionHeader title="一句话评价" /><Textarea className="mt-3" value={product.review} onChange={(event) => setProduct({ ...product, review: event.target.value })} onBlur={() => update({ review: product.review })} placeholder="留一句真实感受吧" /><div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <button type="button" key={tag} onClick={() => update({ tags: product.tags.includes(tag) ? product.tags.filter((item) => item !== tag) : [...product.tags, tag] })} className={`min-h-9 rounded-full px-3 text-xs font-semibold ${product.tags.includes(tag) ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted-foreground"}`}>{tag}</button>)}</div></section>
    <section className="mt-7 rounded-[var(--radius-lg)] bg-surface p-4 shadow-[var(--shadow-soft)]"><SectionHeader title="购买信息" />{info.filter(([, value]) => value).map(([label, value]) => <div className="mt-3 flex justify-between gap-4 text-sm" key={label}><span className="text-muted-foreground">{label}</span><span>{value}</span></div>)}</section>
    <Button className="mt-7 w-full" variant="danger" onClick={() => setDeleting(true)}>删除这条记录</Button>
  </AppShell><BottomNavigation /><ConfirmDialog open={deleting} onOpenChange={setDeleting} title="删除这条记录？" description={`“${product.name}”会从你的买过记录里消失，无法恢复。`} confirmLabel="删除记录" cancelLabel="再想想" destructive isConfirming={false} onConfirm={async () => { setDeleting(true); try { await productRepository.remove(product.id); showToast("记录已删除。 "); router.replace("/library"); } catch { showToast("删除失败，请重试。", "error"); setDeleting(false); } }} /></>;
}
