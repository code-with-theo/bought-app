"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/utils";

export type ThemeName = "terracotta" | "paper" | "ink";

const storageKey = "bought-theme";
const themes: Array<{ value: ThemeName; title: string; description: string }> = [
  { value: "terracotta", title: "雾瓷赤陶", description: "温暖、中性的纸面" },
  { value: "paper", title: "冷调纸感", description: "清冷、安静的纸面" },
  { value: "ink", title: "墨黑奶油", description: "柔和、深色的纸面" },
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
  const selectTheme = (theme: ThemeName) => { setSelected(theme); applyTheme(theme); };
  return <section className={cn("border-y border-border py-4", className)} aria-labelledby="theme-switcher-title"><h2 id="theme-switcher-title" className="text-base font-semibold">外观主题</h2><p className="mt-1 text-sm text-muted-foreground">选择纸张的色温与强调色</p><div className="mt-4 border-y border-border" role="radiogroup" aria-label="外观主题">
    {themes.map((theme, index) => <button key={theme.value} type="button" role="radio" aria-checked={selected === theme.value} onClick={() => selectTheme(theme.value)} className={cn("flex min-h-14 w-full items-center gap-3 py-3 text-left", index > 0 && "border-t border-border", selected === theme.value ? "text-foreground" : "text-muted-foreground hover:text-foreground")}><span className={cn("size-2 shrink-0 rounded-full", selected === theme.value ? "bg-primary" : "bg-border")} aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{theme.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{theme.description}</span></span><span className="text-xs" aria-hidden="true">{selected === theme.value ? "已选" : ""}</span></button>)}
  </div></section>;
}
