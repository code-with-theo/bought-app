import { LibraryPage } from "@/features/library/library-page";
import { Suspense } from "react";
export default function LibraryRoute() { return <Suspense fallback={null}><LibraryPage /></Suspense>; }
