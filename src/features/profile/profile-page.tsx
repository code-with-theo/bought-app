"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/design-system/app-shell";
import { BottomNavigation } from "@/components/design-system/navigation";
import { LoadingState } from "@/components/design-system/empty-state";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { ThemeSwitcher } from "@/components/design-system/theme-switcher";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { productRepository } from "@/lib/db/product-repository";
import type { ProductRecord } from "@/types/product";

type Action = "demo" | "all" | null;
export function ProfilePage() {
  const { showToast } = useToast(); const [products, setProducts] = useState<ProductRecord[]>([]); const [loading, setLoading] = useState(true); const [action, setAction] = useState<Action>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { await productRepository.initializeDemoData(); setProducts(await productRepository.list()); } catch { showToast("数据暂时没加载出来。", "error"); } finally { setLoading(false); } }, [showToast]); useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const exportData = async () => { try { const payload = await productRepository.export(); const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `买过记录-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); showToast("已导出你的记录。 "); } catch { showToast("导出失败，请重试。", "error"); } };
  const total = products.length, repurchase = products.filter((product) => product.repurchaseDecision === "repurchase").length, avoid = products.filter((product) => product.repurchaseDecision === "avoid").length, demos = products.filter((product) => product.isDemo).length;
  return <><AppShell><PageHeader eyebrow="我的" title="这份购物记忆" description="所有记录只保存在这台设备里。" /><section className="mt-7 grid grid-cols-3 gap-3">{loading ? <><LoadingState className="h-24"/><LoadingState className="h-24"/><LoadingState className="h-24"/></> : <><StatCard label="买过" value={total} /><StatCard label="会复购" value={repurchase} tone="success" /><StatCard label="避雷" value={avoid} tone="danger" /></>}</section>
    <ThemeSwitcher className="mt-8" /><section className="mt-8 space-y-3"><Button className="w-full" variant="secondary" onClick={() => void exportData()} disabled={!total}>{total ? "导出我的记录" : "还没有可导出的记录"}</Button>{demos ? <Button className="w-full" variant="secondary" onClick={() => setAction("demo")}>清除演示数据</Button> : null}</section><section className="mt-10 rounded-[var(--radius-lg)] bg-danger-soft p-5"><h2 className="font-bold">谨慎操作</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">清空会删除所有记录、照片和评价，且无法恢复。</p><Button className="mt-4 w-full" variant="danger" onClick={() => setAction("all")}>清空全部数据</Button></section><section className="mt-8 rounded-[var(--radius-lg)] bg-surface p-5 shadow-[var(--shadow-soft)]"><h2 className="font-bold">关于「买过」</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">这是你的私人购物记忆库。记下感受，让下一次购买更值得。</p></section>
  </AppShell><BottomNavigation active="me" /><ConfirmDialog open={action !== null} onOpenChange={(open) => !open && setAction(null)} title={action === "all" ? "清空全部数据？" : "清除演示数据？"} description={action === "all" ? "所有记录、照片和评价都会被清空，无法恢复。" : "只会删除应用自带的演示记录，不会动你自己记下的内容。"} confirmLabel={action === "all" ? "确认清空" : "清除演示数据"} cancelLabel="再想想" destructive={action === "all"} isConfirming={busy} onConfirm={async () => { setBusy(true); try { const count = action === "all" ? (await productRepository.clear(), total) : await productRepository.clearDemo(); showToast(action === "all" ? "已清空全部数据。" : `已清除 ${count} 条演示数据。`); setAction(null); await load(); } catch { showToast("操作失败，请重试。", "error"); } finally { setBusy(false); } }} /></>;
}
