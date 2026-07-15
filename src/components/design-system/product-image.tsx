"use client";

/* eslint-disable @next/next/no-img-element -- IndexedDB data URLs cannot use the optimizer's remote pipeline. */

import { useState } from "react";
import type { Category, ProductImage as ProductImageValue } from "@/types/product";
import { cn } from "@/components/ui/utils";

const categoryLabel: Record<Category, string> = { food: "吃", clothing: "穿", beauty: "美", household: "家", digital: "数", other: "物" };
const categoryColor: Record<Category, string> = { food: "bg-[#f1c9a7]", clothing: "bg-[#dcbdb6]", beauty: "bg-[#ddb9cb]", household: "bg-[#bcd1c1]", digital: "bg-[#b9c5d5]", other: "bg-[#d8cabc]" };

export function ProductImage({ image, name, category = "other", className, priority = false }: { image?: ProductImageValue | null; name: string; category?: Category; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const fallback = !image || failed;
  if (fallback) return <div className={cn("flex aspect-square items-center justify-center overflow-hidden rounded-[inherit]", categoryColor[category], className)} aria-label={`${name}的图片暂不可用`} role="img"><span className="flex size-12 items-center justify-center rounded-full bg-white/55 text-lg font-bold text-foreground/70" aria-hidden="true">{name.trim().slice(0, 1) || categoryLabel[category]}</span></div>;
  return <img src={image.dataUrl} alt={name} width={image.width} height={image.height} onError={() => setFailed(true)} loading={priority ? "eager" : "lazy"} className={cn("aspect-square object-cover", className)} />;
}
