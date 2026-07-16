"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/utils";

export type ThemeName = "terracotta" | "paper" | "ink";

const storageKey = "bought-theme";
const themes: Array<{ value: ThemeName; title: string; description: string; swatches: [string, string, string] }> = [
  { value: "terracotta", title: "雾瓷赤陶", description: "温暖、克制的生活感", swatches: ["#F5F4F0", "#FFFFFF", "#B94F3E"] },
  { value: "paper", title: "冷调纸感", description: "安静、现代的收藏感", swatches: ["#F4F5F3", "#FCFCFA", "#285C50"] },
  { value: "ink", title: "墨黑奶油", description: "鲜明、优雅的品牌感", swatches: ["#F8F1E8", "#FFFDF9", "#24211E"] },
];

function applyTheme(theme: ThemeName): void {
  const root = document.documentElement;
  if (theme === "terracotta") root.removeAttribute("data-theme");
  else root.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
}

/** Mount once in the root layout so a saved theme survives refreshes on every route. */
export function ThemeInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "paper" || saved === "ink" || saved === "terracotta") applyTheme(saved);
  }, []);
  return null;
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const [selected, setSelected] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "terracotta";
    const saved = localStorage.getItem(storageKey);
    return saved === "paper" || saved === "ink" || saved === "terracotta" ? saved : "terracotta";
  });
  useEffect(() => { applyTheme(selected); }, [selected]);
  const selectTheme = (theme: ThemeName) => setSelected(theme);
  return <section className={cn("rounded-[var(--radius-lg)] bg-surface p-4 shadow-[var(--shadow-soft)]", className)} aria-labelledby="theme-switcher-title"><h2 id="theme-switcher-title" className="text-base font-bold">外观主题</h2><p className="mt-1 text-sm text-muted-foreground">选择你喜欢的收藏夹配色</p><div className="mt-4 grid gap-2" role="radiogroup" aria-label="外观主题">
    {themes.map((theme) => <button key={theme.value} type="button" role="radio" aria-checked={selected === theme.value} onClick={() => selectTheme(theme.value)} className={cn("flex min-h-16 items-center gap-3 rounded-[var(--radius-sm)] border p-3 text-left", selected === theme.value ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-muted")}><span className="flex shrink-0 -space-x-1" aria-hidden="true">{theme.swatches.map((swatch) => <span key={swatch} className="size-6 rounded-full border-2 border-surface" style={{ backgroundColor: swatch }} />)}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{theme.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{theme.description}</span></span><span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", selected === theme.value ? "border-primary bg-primary text-white" : "border-muted-foreground")} aria-hidden="true">{selected === theme.value ? "✓" : null}</span></button>)}
  </div></section>;
}
