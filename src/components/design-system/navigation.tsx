import Link from "next/link";
import { cn } from "@/components/ui/utils";

type NavKey = "home" | "library" | "repurchase" | "me";
const items: Array<{ key: NavKey; href: string; label: string; icon: string }> = [
  { key: "home", href: "/", label: "首页", icon: "⌂" },
  { key: "library", href: "/library", label: "物品库", icon: "□" },
  { key: "repurchase", href: "/repurchase", label: "复购", icon: "↻" },
  { key: "me", href: "/me", label: "我的", icon: "☺" },
];

export function FloatingAddButton({ href = "/products/new", label = "记录商品", className }: { href?: string; label?: string; className?: string }) {
  return <Link href={href} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[var(--shadow-float)] hover:bg-[#ca5146] focus-visible:outline-primary active:translate-y-px", className)} aria-label={label}><span className="text-xl leading-none" aria-hidden="true">+</span>{label}</Link>;
}

export function BottomNavigation({ active }: { active?: NavKey }) {
  return <nav aria-label="主导航" className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-surface/95 px-3 pt-2 backdrop-blur-sm"><div className="safe-bottom mx-auto grid max-w-md grid-cols-5 items-end gap-1"><NavItem item={items[0]} active={active === "home"}/><NavItem item={items[1]} active={active === "library"}/><div className="flex justify-center"><FloatingAddButton label="添加" className="-mt-6 min-h-12 px-4" /></div><NavItem item={items[2]} active={active === "repurchase"}/><NavItem item={items[3]} active={active === "me"}/></div></nav>;
}

function NavItem({ item, active }: { item: (typeof items)[number]; active: boolean }) {
  return <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center rounded-[var(--radius-sm)] text-xs font-medium", active ? "text-primary" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground")}><span className="text-lg leading-5" aria-hidden="true">{item.icon}</span><span className="mt-0.5">{item.label}</span></Link>;
}
