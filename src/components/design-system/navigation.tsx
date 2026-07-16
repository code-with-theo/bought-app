import Link from "next/link";
import { cn } from "@/components/ui/utils";

type NavKey = "home" | "library" | "repurchase" | "me";
const items: Array<{ key: NavKey; href: string; label: string; icon: string }> = [
  { key: "home", href: "/", label: "首页", icon: "home" },
  { key: "library", href: "/library", label: "物品库", icon: "library" },
  { key: "repurchase", href: "/repurchase", label: "复购", icon: "repeat" },
  { key: "me", href: "/me", label: "我的", icon: "user" },
];

export function FloatingAddButton({ href = "/products/new", label = "记录商品", iconOnly = false, className }: { href?: string; label?: string; iconOnly?: boolean; className?: string }) {
  return <Link href={href} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[var(--shadow-float)] hover:brightness-95 focus-visible:outline-primary active:translate-y-px", className)} aria-label={label}><span className="text-xl leading-none" aria-hidden="true">+</span>{iconOnly ? null : label}</Link>;
}

export function BottomNavigation({ active }: { active?: NavKey }) {
  return <nav aria-label="主导航" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-2"><div className="safe-bottom mx-auto grid h-18 max-w-md grid-cols-5 items-end"><NavItem item={items[0]} active={active === "home"}/><NavItem item={items[1]} active={active === "library"}/><div className="relative flex h-16 min-w-0 items-center justify-center"><FloatingAddButton label="记录商品" iconOnly className="absolute -top-5 flex size-14 min-h-14 justify-center p-0" /></div><NavItem item={items[2]} active={active === "repurchase"}/><NavItem item={items[3]} active={active === "me"}/></div></nav>;
}

function NavItem({ item, active }: { item: (typeof items)[number]; active: boolean }) {
  return <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 min-w-0 flex-col items-center justify-center px-1 text-[11px] font-medium leading-4", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}><NavIcon name={item.icon} active={active} /><span className="mt-0.5 max-w-full truncate">{item.label}</span></Link>;
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const shared = { width: 20, height: 20, viewBox: "0 0 24 24", fill: active ? "currentColor" : "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-7h6v7" fill="none" /></svg>;
  if (name === "library") return <svg {...shared}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>;
  if (name === "repeat") return <svg {...shared}><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></svg>;
  return <svg {...shared}><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
}
