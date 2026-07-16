import type { ProductRecord } from "@/types/product";
import { ProductImage } from "./product-image";
import { RepurchaseBadge } from "./badges";
import { cn } from "@/components/ui/utils";

const categories = { food: "吃的", clothing: "穿的", beauty: "护肤美妆", household: "家居日用", digital: "数码电器", other: "其他" } satisfies Record<ProductRecord["category"], string>;

export function ProductCard({ product, className, onClick }: { product: ProductRecord; className?: string; onClick?: () => void }) {
  const content = <><ProductImage image={product.image} name={product.name} category={product.category} className="w-full rounded-[var(--radius-sm)]" /><div className="pt-3"><div className="flex items-start justify-between gap-2"><h3 className="line-clamp-2 min-w-0 text-sm font-semibold leading-5">{product.name}</h3><RepurchaseBadge decision={product.repurchaseDecision} className="shrink-0" /></div><p className="mt-1 text-xs text-muted-foreground">{categories[product.category]}{product.rating ? ` · ${product.rating} 星` : " · 未评分"}</p>{product.review ? <p className="line-clamp-1 mt-2 text-xs text-muted-foreground">{product.review}</p> : null}</div></>;
  const classes = cn("overflow-hidden bg-transparent text-left transition-opacity hover:opacity-70", className);
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <article className={classes}>{content}</article>;
}
