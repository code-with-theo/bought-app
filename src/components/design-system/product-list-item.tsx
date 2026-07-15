import type { ProductRecord } from "@/types/product";
import { ProductImage } from "./product-image";
import { RepurchaseBadge } from "./badges";
import { cn } from "@/components/ui/utils";

export function ProductListItem({ product, className, onClick }: { product: ProductRecord; className?: string; onClick?: () => void }) {
  const content = <><ProductImage image={product.image} name={product.name} category={product.category} className="size-20 shrink-0 rounded-[var(--radius-md)]" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="line-clamp-1 text-[15px] font-bold">{product.name}</h3><RepurchaseBadge decision={product.repurchaseDecision} className="shrink-0" /></div><p className="mt-1 text-xs text-muted-foreground">{product.brand || "已买过"}{product.rating ? ` · ${product.rating} 星` : " · 等你评价"}</p><p className="line-clamp-1 mt-2 text-sm text-muted-foreground">{product.review || "还没写感受"}</p></div></>;
  const classes = cn("flex w-full items-center gap-3 rounded-[var(--radius-md)] bg-surface p-2 text-left shadow-[0_3px_12px_rgb(71_48_35/5%)] hover:bg-[#fffcf9]", className);
  return onClick ? <button type="button" className={classes} onClick={onClick}>{content}</button> : <article className={classes}>{content}</article>;
}
