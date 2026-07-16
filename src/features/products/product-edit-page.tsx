"use client";
import { useSearchParams } from "next/navigation";
import { ProductForm } from "./product-form";
export function ProductEditPage() { const searchParams = useSearchParams(); return <ProductForm productId={searchParams.get("id") ?? undefined} />; }
