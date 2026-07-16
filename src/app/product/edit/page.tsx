import { Suspense } from "react";
import { ProductEditPage } from "@/features/products/product-edit-page";

export default function ProductEditRoute() {
  return <Suspense fallback={null}><ProductEditPage /></Suspense>;
}
