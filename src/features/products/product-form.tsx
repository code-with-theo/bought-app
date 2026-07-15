"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/design-system/app-shell";
import { BottomNavigation } from "@/components/design-system/navigation";
import { PageHeader } from "@/components/design-system/page-header";
import { ProductImage } from "@/components/design-system/product-image";
import { Button } from "@/components/ui/button";
import { FieldHint, FieldLabel, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { compressProductImage } from "@/lib/storage/image";
import { productRepository } from "@/lib/db/product-repository";
import type { Category, CreateProductInput, ProductImage as ProductImageValue, UsageStatus } from "@/types/product";

const categories: Array<{ value: Category; label: string }> = [
  { value: "food", label: "吃的" }, { value: "clothing", label: "穿的" }, { value: "beauty", label: "护肤美妆" },
  { value: "household", label: "家居日用" }, { value: "digital", label: "数码电器" }, { value: "other", label: "其他" },
];
const statuses: Array<{ value: UsageStatus; label: string }> = [{ value: "unused", label: "还没开始用" }, { value: "using", label: "使用中" }, { value: "finished", label: "已经用完" }];

type Fields = Omit<CreateProductInput, "image"> & { image: ProductImageValue | null };
const baseFields: Fields = { name: "", image: null, category: "food", brand: "", price: null, purchaseDate: null, purchaseChannel: "", usageStatus: "unused", review: "", tags: [] };

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter(); const { showToast } = useToast(); const fileRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<Fields>(baseFields); const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false); const [advanced, setAdvanced] = useState(false); const [imageBusy, setImageBusy] = useState(false); const [error, setError] = useState<string>("");
  useEffect(() => { if (!productId) return; productRepository.getById(productId).then((product) => {
    if (!product) { showToast("这条记录可能已经被删除了。", "error"); router.replace("/library"); return; }
    setFields({ ...product }); setAdvanced(Boolean(product.brand || product.price || product.purchaseDate || product.purchaseChannel || product.review)); setLoading(false);
  }).catch(() => { showToast("这条记录暂时打不开。", "error"); router.replace("/library"); }); }, [productId, router, showToast]);
  const change = <K extends keyof Fields>(key: K, value: Fields[K]) => setFields((current) => ({ ...current, [key]: value }));
  const pickImage = async (file?: File) => { if (!file) return; setImageBusy(true); setError(""); try { change("image", await compressProductImage(file)); } catch (reason) { setError(reason instanceof Error ? reason.message : "这张图没读出来，换一张试试。"); } finally { setImageBusy(false); } };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault();
    if (!fields.name.trim() || !fields.image) { setError(!fields.name.trim() ? "先把商品名称补上吧。" : "请先添加一张商品照片。"); return; }
    setSaving(true); setError(""); try { const input: CreateProductInput = { ...fields, name: fields.name.trim(), image: fields.image, price: fields.price ?? null, purchaseDate: fields.purchaseDate || null };
      const saved = productId ? await productRepository.update(productId, input) : await productRepository.create(input);
      showToast(productId ? "已经改好了。" : "记好了，下次就不会忘。 "); router.push(`/products/${saved.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "这次没存上，再试一次。"); } finally { setSaving(false); } };
  if (loading) return <AppShell><p className="py-20 text-center text-muted-foreground">正在翻找这条记录…</p></AppShell>;
  return <><AppShell><PageHeader eyebrow={productId ? "编辑记录" : "新的记忆"} title={productId ? "改改这条记录" : "记一件买过的"} description="先留下最重要的三项，其余以后再补。" />
    <form className="mt-7 space-y-6" onSubmit={submit} noValidate>
      <div><FieldLabel>这是什么？</FieldLabel><Input value={fields.name} onChange={(event) => change("name", event.target.value)} placeholder="比如：桂花酒酿酸奶" aria-invalid={Boolean(error && !fields.name.trim())} /></div>
      <div><FieldLabel>拍张照，方便下次认出来</FieldLabel><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => pickImage(event.target.files?.[0])} />
        {fields.image ? <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-surface-muted"><ProductImage image={fields.image} name={fields.name || "商品"} category={fields.category} className="mx-auto max-h-72 w-full max-w-sm" /><div className="absolute inset-x-3 bottom-3 flex gap-2"><Button type="button" variant="secondary" size="small" onClick={() => fileRef.current?.click()} disabled={imageBusy}>换一张</Button><Button type="button" variant="secondary" size="small" onClick={() => change("image", null)} disabled={imageBusy}>删除</Button></div></div> : <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-muted text-muted-foreground hover:bg-primary-soft"><span className="text-2xl">＋</span><span className="mt-2 text-sm font-semibold">{imageBusy ? "图片处理中…" : "选择商品照片"}</span></button>}</div>
      <div><FieldLabel>它属于哪一类？</FieldLabel><div className="grid grid-cols-3 gap-2">{categories.map((category) => <button type="button" key={category.value} onClick={() => change("category", category.value)} className={`min-h-11 rounded-[var(--radius-sm)] border px-2 text-sm font-semibold ${fields.category === category.value ? "border-primary bg-primary-soft text-primary" : "bg-surface text-muted-foreground hover:bg-surface-muted"}`}>{category.label}</button>)}</div></div>
      <button type="button" className="text-sm font-bold text-primary" onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced}> {advanced ? "收起补充信息" : "补充一下（选填）"} </button>
      {advanced ? <div className="space-y-4 rounded-[var(--radius-lg)] bg-surface-muted p-4"><div><FieldLabel>品牌</FieldLabel><Input value={fields.brand} onChange={(event) => change("brand", event.target.value)} /></div><div className="grid grid-cols-2 gap-3"><div><FieldLabel>价格</FieldLabel><Input type="number" min="0" step="0.01" value={fields.price ?? ""} onChange={(event) => change("price", event.target.value === "" ? null : Number(event.target.value))} /></div><div><FieldLabel>购买日期</FieldLabel><Input type="date" value={fields.purchaseDate ?? ""} onChange={(event) => change("purchaseDate", event.target.value || null)} /></div></div><div><FieldLabel>购买渠道</FieldLabel><Input value={fields.purchaseChannel} onChange={(event) => change("purchaseChannel", event.target.value)} /></div><div><FieldLabel>当前状态</FieldLabel><select className="min-h-11 w-full rounded-[var(--radius-sm)] border bg-surface px-3" value={fields.usageStatus} onChange={(event) => change("usageStatus", event.target.value as UsageStatus)}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div><div><FieldLabel>一句话备注</FieldLabel><Textarea value={fields.review} onChange={(event) => change("review", event.target.value)} placeholder="留一句真实感受吧" /></div></div> : null}
      {error ? <FieldHint error>{error}</FieldHint> : null}<Button className="w-full" type="submit" disabled={saving || imageBusy}>{saving ? "正在保存…" : "保存这次购买"}</Button>
    </form></AppShell><BottomNavigation /></>;
}
