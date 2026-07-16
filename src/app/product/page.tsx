import { Suspense } from "react";
import { ProductDetail } from "@/features/products/product-detail";

export default function ProductPage() {
  return <Suspense fallback={null}><ProductDetail /></Suspense>;
}
