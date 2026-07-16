"use client";

/* eslint-disable @next/next/no-img-element -- IndexedDB data URLs cannot use the optimizer's remote pipeline. */

import { useState } from "react";
import type { Category, ProductImage as ProductImageValue } from "@/types/product";
import { cn } from "@/components/ui/utils";

const categoryLabel: Record<Category, string> = { food: "吃", clothing: "穿", beauty: "美", household: "家", digital: "数", other: "物" };

export function ProductImage({ image, name, category = "other", className, priority = false }: { image?: ProductImageValue | null; name: string; category?: Category; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const fallback = !image || failed;
  if (fallback) return <div className={cn("flex aspect-square items-center justify-center overflow-hidden rounded-[inherit] bg-surface-muted", className)} aria-label={`${name}的图片暂不可用`} role="img"><span className="text-lg font-medium text-muted-foreground" aria-hidden="true">{name.trim().slice(0, 1) || categoryLabel[category]}</span></div>;
  return <img src={image.dataUrl} alt={name} width={image.width} height={image.height} onError={() => setFailed(true)} loading={priority ? "eager" : "lazy"} className={cn("aspect-square object-cover", className)} />;
}
