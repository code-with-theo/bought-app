"use client";
import { useParams } from "next/navigation";
import { ProductForm } from "./product-form";
export function ProductEditPage() { const { id } = useParams<{ id: string }>(); return <ProductForm productId={id} />; }
